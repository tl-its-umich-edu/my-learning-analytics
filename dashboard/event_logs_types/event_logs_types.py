from enum import Enum, unique


@unique
class EventLogTypes(Enum):
    """
    This holds the list of all the Event Logs that get logged when user perform certain type of action like load of
    resource/assignment/grade viz and setting defaults for resource/assignment view
    """
    EVENT_VIEW_RESOURCE_ACCESS = "VIEW_RESOURCE_ACCESS"
    EVENT_VIEW_ASSIGNMENT_PLANNING_WITH_GOAL_SETTING = "VIEW_ASSIGNMENT_PLANNING_WITH_GOAL_SETTING"
    EVENT_VIEW_GRADE_DISTRIBUTION = "VIEW_GRADE_DISTRIBUTION"
    EVENT_VIEW_SET_DEFAULT = "VIEW_SET_DEFAULT"

    @classmethod
    def has_value(cls, value):
        """
        helper method to check if the Enum value is in the Enum list
        :param value: value sent to see if part of Enum
        :return: Boolean
        """
        return any(value == item.value for item in cls)
