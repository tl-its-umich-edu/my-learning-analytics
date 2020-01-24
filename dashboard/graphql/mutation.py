import graphene
import json

from graphene_django import DjangoObjectType
from django.db.models import Q
from graphql import GraphQLError

from dashboard.graphql.objects import UserDefaultSelectionType
from dashboard.rules import is_admin_or_enrolled_in_course_id
from dashboard.models import UserDefaultSelection, Course
from pinax.eventlog.models import log as eventlog
from dashboard.event_logs_types.event_logs_types import EventLogTypes

import logging
logger = logging.getLogger(__name__)

class UserDefaultSelectionInput(graphene.InputObjectType):
    course_id = graphene.ID()
    canvas_course_id = graphene.ID()
    default_view_type = graphene.String(required=True)
    default_view_value = graphene.JSONString(required=True)

class UserDefaultSelectionMutation(graphene.Mutation):
    class Arguments:
        data = UserDefaultSelectionInput(required=True)

    # The class attributes define the response of the mutation
    user_default_selection = graphene.Field(UserDefaultSelectionType)

    def mutate(self, info, data=None):
        user = info.context.user
        # permissions checks
        if not user.is_authenticated:
            raise GraphQLError('You must be logged in to update this resource!')

        course_id = data.course_id
        canvas_course_id = data.canvas_course_id

        if not course_id and not canvas_course_id:
            raise GraphQLError('You must provide courseId or canvasCourseId')

        if not course_id:
            course = Course.objects.get(canvas_id=canvas_course_id)
            course_id = course.id

        if not is_admin_or_enrolled_in_course_id.test(user, course_id):
            raise GraphQLError('You do not have permission to update this resource!')

        # check if exists
        user_default_selection, created = UserDefaultSelection.objects.get_or_create(
            course_id = course_id,
            user_sis_name = user.get_username(),
            default_view_type = data.default_view_type,
        )
        user_default_selection.default_view_value = json.dumps(data.default_view_value)
        user_default_selection.save()
        event_log_data = {
            "course_id": course_id,
            "default_type": data.default_view_type,
            "default_value": data.default_view_value
        }
        eventlog(user, EventLogTypes.EVENT_VIEW_SET_DEFAULT.value, extra=event_log_data)


        # Notice we return an instance of this mutation
        return UserDefaultSelectionMutation(user_default_selection=user_default_selection)


class Mutation(graphene.ObjectType):
    setUserDefaultSelection = UserDefaultSelectionMutation.Field()