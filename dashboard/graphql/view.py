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
            'assignment_weight_consideration_by_course_id_loader': AssignmentWeightConsiderationByCourseIdLoader(
                 get_cache_key=(lambda key: key)
            ),
            'assignment_by_course_id_and_id_loader': AssignmentByCourseIdAndIdLoader(
                get_cache_key=(lambda key: f"course_id:{key.get('course_id')}|id:{key.get('id')}")
            ),
            'assignments_by_course_id_loader': AssignmentsByCourseIdLoader(
                get_cache_key=(lambda key: key)
            ),
            'assignment_by_assignment_group_id_and_id_loader': AssignmentByAssignmentGroupIdAndIdLoader(
                get_cache_key=(lambda key: f"assignment_group_id:{key.get('assignment_group_id')}|id:{key.get('id')}")
            ),
            'assignments_by_assignment_group_id_loader': AssignmentsByAssignmentGroupIdLoader(
                get_cache_key=(lambda key: key)
            ),
            'submissions_by_assignment_id_loader': SubmissionsByAssignmentIdLoader(
                get_cache_key=(lambda key: key)
            ),
            'submission_by_assignment_id_and_user_id_loader': SubmissionByAssignmentIdAndUserIdLoader(
                get_cache_key=(lambda key: f"assignment_id:{key.get('assignment_id')}|user_id:{key.get('user_id')}")
            ),
            'assignment_groups_by_course_id_loader': AssignmentGroupsByCourseIdLoader(
                get_cache_key=(lambda key: key)
            ),
            'assignment_group_by_course_id_and_id_loader': AssignmentGroupByCourseIdAndIdLoader(
                get_cache_key=(lambda key: f"course_id:{key.get('course_id')}|id:{key.get('id')}")
            ),
            'user_default_selections_by_course_id_and_user_loader': UserDefaultSelectionsByCourseIdAndUserLoader(
                get_cache_key=(lambda key: f"course_id:{key.get('course_id')}|user_sis_name:{key.get('user_sis_name')}")
            ),
            'user_default_selection_by_course_id_and_user_and_view_type_loader': UserDefaultSelectionByCourseIdAndUserAndViewTypeLoader(
                get_cache_key=(lambda key: f"course_id:{key.get('course_id')}|user_sis_name:{key.get('user_sis_name')}|default_view_type:{key.get('default_view_type')}")
            ),
            'academic_term_by_id_loader': AcademicTermByIdLoader(
                get_cache_key=(lambda key: key)
            ),
        }
        for method_, instance in loaders.items():
            setattr(request, method_, instance)

        # get the user's canvas data id to make things easier
        setattr(request, 'canvas_user_id', None)
        if request.user and request.user.is_authenticated:
            username = request.user.get_username()
            result = User.objects.filter(
                sis_name=username
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