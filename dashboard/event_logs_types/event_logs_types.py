from enum import Enum, unique


@unique
class EventLogTypes(Enum):
    EVENT_VIEW_FILE_ACCESS = "VIEW_FILE_ACCESS"
    EVENT_VIEW_ASSIGNMENT_PLANNING = "VIEW_ASSIGNMENT_PLANNING"
    EVENT_VIEW_GRADE_DISTRIBUTION = "VIEW_GRADE_DISTRIBUTION"
    EVENT_VIEW_SET_DEFAULT = "VIEW_SET_DEFAULT"

    @classmethod
    def has_value(cls, value):
        return any(value == item.value for item in cls)
