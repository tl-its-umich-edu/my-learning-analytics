import graphene

from graphene_django import DjangoObjectType
from django.db.models import Q
from graphql import GraphQLError

from dashboard.graphql.objects import UserDefaultSelectionType
from dashboard.rules import is_admin_or_enrolled_in_course_id
from dashboard.models import UserDefaultSelection

import logging
logger = logging.getLogger(__name__)

class UserDefaultSelectionInput(graphene.InputObjectType):
    course_id = graphene.ID(required=True)
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
        if not user.is_authenticated():
            raise GraphQLError('You must be logged in to update this resource!')

        if not data.course_id or not is_admin_or_enrolled_in_course_id.test(user, data.course_id):
            raise GraphQLError('You do not have permission to update this resource!')

        # check if exists
        user_default_selection = UserDefaultSelection.objects.filter(
            course_id = data.course_id,
            user_sis_name = user.get_username(),
            default_view_type = data.default_view_type
        ).first()

        # if not exists, init a new one
        if not user_default_selection:
            user_default_selection = UserDefaultSelection(
                course_id = data.course_id,
                user_sis_name = user.get_username(),
                default_view_type = data.default_view_type
            )
        user_default_selection.default_view_value = data.default_view_value
        user_default_selection.save()

        # Notice we return an instance of this mutation
        return UserDefaultSelectionMutation(user_default_selection=user_default_selection)


class Mutation(graphene.ObjectType):
    setUserDefaultSelection = UserDefaultSelectionMutation.Field()