from graphene_django.views import GraphQLView
import json
from dashboard.common.db_util import canvas_id_to_incremented_id
from dashboard.graphql.loaders import AssignmentsByCourseIdLoader, \
    SubmissionsByAssignmentIdLoader, SubmissionByAssignmentIdAndUserIdLoader, \
    AssignmentByCourseIdAndIdLoader, AssignmentsByAssignmentGroupIdLoader, \
    AssignmentByAssignmentGroupIdAndIdLoader, AssignmentGroupsByCourseIdLoader, \
    AssignmentGroupByCourseIdAndIdLoader, AssignmentWeightConsiderationByCourseIdLoader, \
    UserDefaultSelectionsByCourseIdAndUserLoader, UserDefaultSelectionByCourseIdAndUserAndViewTypeLoader, \
    AcademicTermByIdLoader

from django.db.models import Q
from dashboard.models import User
from pinax.eventlog.models import log as eventlog
from dashboard.event_logs_types.event_logs_types import EventLogTypes
import logging
logger = logging.getLogger(__name__)


class DashboardGraphQLView(GraphQLView):
    def get_context(self, request):
        loaders = {
            'assignment_weight_consideration_by_course_id_loader': AssignmentWeightConsiderationByCourseIdLoader(),
            'assignment_by_course_id_and_id_loader': AssignmentByCourseIdAndIdLoader(),
            'assignments_by_course_id_loader': AssignmentsByCourseIdLoader(),
            'assignment_by_assignment_group_id_and_id_loader': AssignmentByAssignmentGroupIdAndIdLoader(),
            'assignments_by_assignment_group_id_loader': AssignmentsByAssignmentGroupIdLoader(),
            'submissions_by_assignment_id_loader': SubmissionsByAssignmentIdLoader(),
            'submission_by_assignment_id_and_user_id_loader': SubmissionByAssignmentIdAndUserIdLoader(),
            'assignment_groups_by_course_id_loader': AssignmentGroupsByCourseIdLoader(),
            'assignment_group_by_course_id_and_id_loader': AssignmentGroupByCourseIdAndIdLoader(),
            'user_default_selections_by_course_id_and_user_loader': UserDefaultSelectionsByCourseIdAndUserLoader(),
            'user_default_selection_by_course_id_and_user_and_view_type_loader': UserDefaultSelectionByCourseIdAndUserAndViewTypeLoader(),
            'academic_term_by_id_loader': AcademicTermByIdLoader(),
        }
        for method_, instance in loaders.items():
            setattr(request, method_, instance)

        # get the user's canvas data id to make things easier
        setattr(request, 'canvas_user_id', None)
        if request.user and request.user.is_authenticated:
            username = request.user.get_username()
            result = User.objects.filter(
                Q(sis_name=username) | Q(sis_id=username)
            ).first()
            if result:
                setattr(request, 'canvas_user_id', result.user_id)

        return request

    def execute_graphql_request(self, request, data, query, variables, operation_name, show_graphiql=False):
        if operation_name == 'Assignment':
            event_data = {
                "course_id": canvas_id_to_incremented_id(variables['courseId']),
            }
            eventlog(request.user, EventLogTypes.EVENT_VIEW_ASSIGNMENT_PLANNING_WITH_GOAL_SETTING.value, extra=event_data)


        return super(DashboardGraphQLView, self).execute_graphql_request(
            request, data, query, variables, operation_name, show_graphiql
        )