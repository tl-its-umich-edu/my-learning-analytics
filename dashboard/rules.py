from __future__ import absolute_import

import rules, logging
from dashboard.models import User

logger = logging.getLogger(__name__)

@rules.predicate
def is_admin(user):
    return user.is_superuser

@rules.predicate
def is_enrolled_in_course(user, course):
    try:
        return User.objects.get_user_in_course(user, course).count()
    except User.DoesNotExist:
        logger.error(f'Permissions is_enrolled_in_course: user {user.id} is not enrolled in course {course.id}')
        return False

@rules.predicate
def is_instructor_in_course(user, course):
    try:
        return User.objects.get_user_in_course(user, course).filter(
            enrollment_type=User.ENROLLMENT_TYPES.TeacherEnrollment).count()
    except User.DoesNotExist:
        logger.error(f'Permission is_instructor_in_course: user {user.id} is not an instructor in course {course.id}')
        return False

is_admin_or_enrolled_in_course = is_admin | is_enrolled_in_course

# api
rules.add_perm('dashboard.get_course_info', is_admin_or_enrolled_in_course)
rules.add_perm('dashboard.resource_access_within_week', is_admin_or_enrolled_in_course)
rules.add_perm('dashboard.grade_distribution', is_admin_or_enrolled_in_course)
rules.add_perm('dashboard.update_user_default_selection_for_views', is_admin_or_enrolled_in_course)
rules.add_perm('dashboard.get_user_default_selection', is_admin_or_enrolled_in_course)
rules.add_perm('dashboard.assignments', is_admin_or_enrolled_in_course)
rules.add_perm('dashboard.courses_enabled', is_admin)

# templates
rules.add_perm('dashboard.get_course_template', is_admin_or_enrolled_in_course)


