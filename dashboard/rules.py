from __future__ import absolute_import

import rules, logging
from dashboard.models import User

logger = logging.getLogger(__name__)

@rules.predicate(bind=True)
def is_admin(self, user):
    # check cache
    if self.context.get(user.id):
        return self.context.get(user.id)

    result = user.is_superuser

    # set cache
    self.context[user.id] = result
    return result

@rules.predicate
def is_enrolled_in_course(user, course):
    return is_enrolled_in_course_id.test(user, course.id)

@rules.predicate(bind=True)
def is_enrolled_in_course_id(self, user, course_id):
    # check cache
    if self.context.get(f"{user.id}|{course_id}"):
        return self.context.get(f"{user.id}|{course_id}")

    try:
        result = User.objects.get_user_in_course_id(user, course_id).count() > 0
    except User.DoesNotExist:
        logger.error(f'Permissions is_enrolled_in_course_id: user {user.id} is not enrolled in course {course_id}')
        result = False

    # set cache
    self.context[f"{user.id}|{course_id}"] = result
    return result

@rules.predicate
def is_instructor_in_course(user, course):
    return is_instructor_in_course_id.test(user, course.id)

@rules.predicate(bind=True)
def is_instructor_in_course_id(self, user, course_id):
    # check cache
    if self.context.get(f"{user.id}|{course_id}"):
        return self.context.get(f"{user.id}|{course_id}")

    try:
        result = User.objects.get_user_in_course_id(user, course_id).filter(
            enrollment_type=User.ENROLLMENT_TYPES.TeacherEnrollment
        ).count() > 0
    except User.DoesNotExist:
        logger.error(f'Permission is_instructor_in_course_id: user {user.id} is not an instructor in course {course_id}')
        result = False

    # set cache
    self.context[f"{user.id}|{course_id}"] = result
    return result

is_admin_or_enrolled_in_course = is_admin | is_enrolled_in_course
is_admin_or_enrolled_in_course_id = is_admin | is_enrolled_in_course_id
is_admin_or_instructor_in_course = is_admin | is_instructor_in_course
is_admin_or_instructor_in_course_id = is_admin | is_instructor_in_course_id

# api
rules.add_perm('dashboard.get_course_info', is_admin_or_enrolled_in_course)
rules.add_perm('dashboard.update_course_info', is_admin_or_instructor_in_course)
rules.add_perm('dashboard.resource_access_within_week', is_admin_or_enrolled_in_course)
rules.add_perm('dashboard.grade_distribution', is_admin_or_enrolled_in_course)
rules.add_perm('dashboard.update_user_default_selection_for_views', is_admin_or_enrolled_in_course)
rules.add_perm('dashboard.get_user_default_selection', is_admin_or_enrolled_in_course)
rules.add_perm('dashboard.assignments', is_admin_or_enrolled_in_course)
