from graphene_django import DjangoObjectType
import graphene

from django.db.models import Q
from dashboard.models import DiscussionFlattened, Course, User

import logging
logger = logging.getLogger(__name__)

class DiscussionUser(DjangoObjectType):
    user_id = graphene.ID()

    class Meta:
        model = User
        only_fields = ('user_id', 'name')

class DiscussionTopicType(DjangoObjectType):
    topic_id = graphene.ID()
    course_id = graphene.ID()
    #assignment_id = graphene.ID()
    #group_id = graphene.ID()
    user_id = graphene.ID()

    user = graphene.Field(DiscussionUser)

    class Meta:
        model = DiscussionFlattened
        only_fields = ('topic_id', 'course_id', 'user_id', 'title')

    def resolve_user(parent, info):
        try:
            user = User.objects.get(
                user_id=parent.user_id,
                course_id=parent.course_id
            )
            return user
        except User.DoesNotExist:
            return None

class DiscussionMessageType(DiscussionTopicType):
    entry_id = graphene.ID()

    class Meta:
        model = DiscussionFlattened
        only_fields = ('topic_id', 'entry_id', 'course_id', 'user_id', 'message')


class CourseType(DjangoObjectType):
    id = graphene.ID()
    name = graphene.String()

    discussion_topics = graphene.List(DiscussionTopicType)
    discussion_topic = graphene.Field(DiscussionTopicType,
        topic_id=graphene.ID())

    discussion_messages = graphene.List(DiscussionMessageType,
        topic_id=graphene.ID())
    discussion_message = graphene.Field(DiscussionMessageType,
        topic_id=graphene.ID(), entry_id=graphene.ID())

    def resolve_discussion_topics(parent, info):
        return DiscussionFlattened.objects.filter(
            Q(course_id=parent.id),
            Q(entry_id=None),
            Q(group_is_public=True) | Q(group_id=None)
        )

    def resolve_discussion_topic(parent, info, topic_id):
        return DiscussionFlattened.objects.get(
            Q(course_id=parent.id),
            Q(topic_id=topic_id),
            Q(entry_id=None),
            Q(group_is_public=True) | Q(group_id=None)
        )

    def resolve_discussion_messages(parent, info, **kwargs):
        logger.info(kwargs)
        results = DiscussionFlattened.objects.filter(
            Q(course_id=parent.id),
            Q(group_is_public=True) | Q(group_id=None)
        )
        if kwargs.get('topic_id'):
            results = results.filter(topic_id=kwargs.get('topic_id'))
        return results

    def resolve_discussion_message(parent, info, topic_id, entry_id):
        return DiscussionFlattened.objects.filter(
            Q(course_id=parent.id),
            Q(topic_id=topic_id),
            Q(entry_id=entry_id),
            Q(group_is_public=True) | Q(group_id=None)
        )

    class Meta:
        model = Course
        only_fields = ('id', 'name')
