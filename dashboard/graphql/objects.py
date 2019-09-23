from graphene_django import DjangoObjectType
import graphene

from dashboard.rules import is_admin_or_instructor_in_course_id
from django.db.models import Q
from dashboard.models import Course, User, Assignment, Submission

import logging
logger = logging.getLogger(__name__)


class PartialSubmissionType(DjangoObjectType):
    assignment_id = graphene.ID()
    course_id = graphene.ID()

    class Meta:
        model = Submission
        only_fields = ('assignment_id', 'course_id', 'score', 'avg_score')

class FullSubmissionType(PartialSubmissionType):
    id = graphene.ID()
    user_id = graphene.ID()
    graded_date = graphene.types.datetime.DateTime()

    class Meta:
        model = Submission
        only_fields = ('id', 'assignment_id', 'course_id', 'user_id', 'score', 'avg_score', 'graded_date')


class AssignmentType(DjangoObjectType):
    id = graphene.ID()
    due_date = graphene.types.datetime.DateTime()
    local_date = graphene.types.datetime.DateTime()
    course_id = graphene.ID()
    assignment_group_id = graphene.ID()

    submissions = graphene.List(PartialSubmissionType)
    instructor_submissions = graphene.List(FullSubmissionType)

    current_user_submission = graphene.Field(FullSubmissionType)

    def resolve_submissions(parent, info):
        return info.context.submissions_by_assignment_id_loader.load(parent.id)

    def resolve_instructor_submissions(parent, info):
        user = info.context.user
        if not is_admin_or_instructor_in_course_id.test(user, parent.course_id):
            raise GraphQLError('You do not have permission to access this resource!')

        return info.context.submissions_by_assignment_id_loader.load(parent.id)

    def resolve_current_user_submission(parent, info):
        user = info.context.user

        result = Submission.objects.filter(
            Q(course_id=parent.course_id),
            Q(assignment_id=parent.id),
            Q(user_id=user.id),
        )
        return result if result else None

    class Meta:
        model = Assignment
        only_fields = ('id', 'name', 'due_date', 'local_date', 'points_possible', 'course_id', 'assignment_group_id')


class CourseType(DjangoObjectType):
    id = graphene.ID()
    name = graphene.String()

    assignments = graphene.List(AssignmentType)
    assignment = graphene.Field(AssignmentType, assignment_id=graphene.ID())

    def resolve_assignments(parent, info):
        return info.context.assignments_by_course_id_loader.load(parent.id)

    def resolve_assignment(parent, info, assignment_id):
        return Assignment.objects.filter(
            Q(id=assignment_id),
            Q(course_id=parent.id),
        )

    class Meta:
        model = Course
        only_fields = ('id', 'name')
