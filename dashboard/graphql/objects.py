from graphene_django import DjangoObjectType
import graphene
import numpy as np

from dashboard.rules import is_admin_or_instructor_in_course_id
from dashboard.models import Course, User, Assignment, Submission, \
    AssignmentGroups, UserDefaultSelection, AcademicTerms

import logging
logger = logging.getLogger(__name__)


class AcademicTermType(DjangoObjectType):
    id = graphene.ID()
    name = graphene.String()
    date_start = graphene.types.datetime.DateTime()
    date_end = graphene.types.datetime.DateTime()

    class Meta:
        model = AcademicTerms
        only_fields = (
            'id', 'name', 'date_start', 'date_end'
        )

class UserDefaultSelectionType(DjangoObjectType):
    course_id = graphene.ID()
    default_view_type = graphene.String()
    default_view_value = graphene.JSONString()

    class Meta:
        model = UserDefaultSelection
        only_fields = (
            'course_id', 'default_view_type', 'default_view_value'
        )

# Note: only allow instructors to view all and students to view own
class SubmissionType(DjangoObjectType):
    id = graphene.ID()
    assignment_id = graphene.ID()
    course_id = graphene.ID()
    user_id = graphene.ID()
    score = graphene.Float()
    #avg_score = graphene.Float()
    graded_date = graphene.types.datetime.DateTime()

    class Meta:
        model = Submission
        only_fields = (
            'id', 'assignment_id', 'course_id', 'user_id',
            'score', 'graded_date'
        )

class AssignmentGroupType(DjangoObjectType):
    id = graphene.ID()
    course_id = graphene.ID()
    name = graphene.String()
    weight = graphene.Float()
    group_points = graphene.Float()
    drop_lowest = graphene.Int()
    drop_highest = graphene.Int()

    # init below
    #assignments = graphene.List(AssignmentType)
    #assignment = graphene.Field(AssignmentType, assignment_id=graphene.ID())

    def resolve_assignments(parent, info):
        return info.context.assignments_by_assignment_group_id_loader.load(parent.id)

    def resolve_assignment(parent, info, assignment_id):
        return info.context.assignment_by_assignment_group_id_and_id_loader.load({
            'assignment_group_id': parent.id,
            'id': assignment_id,
        })

    class Meta:
        model = AssignmentGroups
        only_fields = (
            'id', 'course_id', 'name', 'weight'
            'group_points', 'drop_lowest', 'drop_highest'
        )


class AssignmentType(DjangoObjectType):
    id = graphene.ID()
    name = graphene.String()
    due_date = graphene.types.datetime.DateTime()
    local_date = graphene.types.datetime.DateTime()
    points_possible = graphene.Float()
    course_id = graphene.ID()
    assignment_group_id = graphene.ID()
    average_grade = graphene.Float()
    median_grade = graphene.Float()

    submissions = graphene.List(SubmissionType)
    current_user_submission = graphene.Field(SubmissionType)

    assignment_group = graphene.Field(AssignmentGroupType)

    def resolve_submissions(parent, info):
        user = info.context.user
        if not is_admin_or_instructor_in_course_id.test(user, parent.course_id):
            raise GraphQLError('You do not have permission to access this resource!')

        return info.context.submissions_by_assignment_id_loader.load(parent.id)

    def resolve_current_user_submission(parent, info):
        canvas_user_id = info.context.canvas_user_id

        return info.context.submission_by_assignment_id_and_user_id_loader.load({
            'assignment_id': parent.id,
            'user_id': canvas_user_id,
        })

    def resolve_assignment_group(parent, info):
        return info.context.assignment_group_by_course_id_and_id_loader.load({
            'course_id': parent.course_id,
            'id': parent.assignment_group_id,
        })

    def _average_grade_lambda(parent, info, submissions):
        if len(submissions) > 0:
            return np.average([submission.score if submission.score else 0 for submission in submissions])
        return 0

    def resolve_average_grade(parent, info):
        return info.context.submissions_by_assignment_id_loader.load(parent.id).then(
            lambda submissions: AssignmentType._average_grade_lambda(parent, info, submissions)
        )

    def _median_grade_lambda(parent, info, submissions):
        if len(submissions) > 0:
            return np.median([submission.score if submission.score else 0 for submission in submissions])
        return 0

    def resolve_median_grade(parent, info):
        return info.context.submissions_by_assignment_id_loader.load(parent.id).then(
            lambda submissions: AssignmentType._median_grade_lambda(parent, info, submissions)
        )

    class Meta:
        model = Assignment
        only_fields = (
            'id', 'name', 'due_date', 'local_date', 'points_possible'
            'course_id', 'assignment_group_id', 'average_grade', 'median_grade'
        )
AssignmentGroupType.assignments = graphene.List(AssignmentType)
AssignmentGroupType.assignments = graphene.List(AssignmentType)


class CourseType(DjangoObjectType):
    id = graphene.ID()
    canvas_id = graphene.ID()
    name = graphene.String()
    assignment_weight_consideration = graphene.Boolean()
    date_start = graphene.types.datetime.DateTime()
    date_end = graphene.types.datetime.DateTime()
    term_id = graphene.ID()

    assignments = graphene.List(AssignmentType)
    assignment = graphene.Field(AssignmentType, assignment_id=graphene.ID())

    assignment_groups = graphene.List(AssignmentGroupType)
    assignment_group = graphene.Field(AssignmentGroupType, assignment_group_id=graphene.ID())

    current_user_default_selections = graphene.List(UserDefaultSelectionType)
    current_user_default_selection = graphene.Field(UserDefaultSelectionType, default_view_type=graphene.String())

    term = graphene.Field(AcademicTermType)

    def resolve_assignments(parent, info):
        return info.context.assignments_by_course_id_loader.load(parent.id)

    def resolve_assignment(parent, info, assignment_id):
        return info.context.assignment_by_course_id_and_id_loader.load({
            'course_id': parent.id,
            'id': assignment_id,
        })

    def resolve_assignment_groups(parent, info):
        return info.context.assignment_groups_by_course_id_loader.load(parent.id)

    def resolve_assignment_group(parent, info, assignment_group_id):
        return info.context.assignment_group_by_course_id_and_id_loader.load({
            'course_id': parent.id,
            'id': assignment_group_id,
        })

    def resolve_assignment_weight_consideration(parent, info):
        return info.context.assignment_weight_consideration_by_course_id_loader.load(parent.id).then(
            lambda awc: awc.consider_weight if awc else False
        )

    def resolve_current_user_default_selections(parent, info):
        user_sis_name = info.context.user.get_username()

        return info.context.user_default_selections_by_course_id_and_user_loader.load({
            'course_id': parent.id,
            'user_sis_name': user_sis_name,
        })

    def resolve_current_user_default_selection(parent, info, default_view_type):
        user_sis_name = info.context.user.get_username()

        return info.context.user_default_selection_by_course_id_and_user_and_view_type_loader.load({
            'course_id': parent.id,
            'user_sis_name': user_sis_name,
            'default_view_type': default_view_type,
        })

    def resolve_term(parent, info):
        return info.context.academic_term_by_id_loader.load(parent.term_id) if parent.term_id else None

    class Meta:
        model = Course
        only_fields = (
            'id', 'canvas_id', 'name', 'assignment_weight_consideration'
            'date_start', 'date_end', 'term_id'
        )
