from graphene_django import DjangoObjectType
import graphene

from dashboard.models import Course
from dashboard.graphql.objects import CourseType
from dashboard.rules import is_admin_or_enrolled_in_course, is_admin
from graphql import GraphQLError

import logging
logger = logging.getLogger(__name__)

class Query(graphene.ObjectType):
    course = graphene.Field(CourseType, course_id=graphene.ID(), canvas_id=graphene.ID())
    courses = graphene.List(CourseType)

    @staticmethod
    def resolve_course(parent, info, course_id=None, canvas_id=None):
        user = info.context.user
        if not user.is_authenticated:
            raise GraphQLError('You must be logged in to access this resource!')

        course = None
        if canvas_id:
            course = Course.objects.get(canvas_id=canvas_id)
        elif course_id:
            course = Course.objects.get(id=course_id)

        if not course or not is_admin_or_enrolled_in_course.test(user, course):
            raise GraphQLError('You do not have permission to access this resource!')

        return course
