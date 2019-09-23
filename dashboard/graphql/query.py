from graphene_django import DjangoObjectType
import graphene

from dashboard.models import Course
from dashboard.graphql.objects import CourseType
from dashboard.rules import is_admin_or_enrolled_in_course, is_admin
from graphql import GraphQLError

class Query(graphene.ObjectType):
    course = graphene.Field(CourseType, course_id=graphene.ID())
    courses = graphene.List(CourseType)

    @staticmethod
    def resolve_course(parent, info, course_id):
        user = info.context.user
        if not user.is_authenticated():
            raise GraphQLError('You must be logged in to access this resource!')

        course = Course.objects.get(id=course_id)
        if not is_admin_or_enrolled_in_course.test(user, course):
            raise GraphQLError('You do not have permission to access this resource!')

        return course

    @staticmethod
    def resolve_courses(parent, info):
        user = info.context.user
        if not user.is_authenticated():
            raise GraphQLError('You must be logged in to access these resource!')

        if is_admin.test(user):
            return Course.objects.all()
        else:
            courses = Course.objects.raw(f"""
                SELECT course.*
                FROM course join user on course.id = user.course_id
                where user.sis_name = '{user.username}'
            """)
            return courses


schema = graphene.Schema(query=Query)