# Some utility functions used by other classes in this project
import logging
from datetime import datetime
from typing import Dict, List, TypedDict, Union

from dateutil.parser import parse
import django
from django.conf import settings
from django_cron.models import CronJobLog

from dashboard.models import Course, User

from django.contrib.auth.models import User as DjangoUser

logger = logging.getLogger(__name__)


def canvas_id_to_incremented_id(canvas_id):
    try:
        int(canvas_id)
    except ValueError:
        return None

    return int(canvas_id) + settings.CANVAS_DATA_ID_INCREMENT


def incremented_id_to_canvas_id(incremented_id):
    try:
        int(incremented_id)
    except ValueError:
        return None

    return str(int(incremented_id) - settings.CANVAS_DATA_ID_INCREMENT)


def get_course_name_from_id(course_id):
    """[Get the long course name from the id]

    :param course_id: [Canvas course ID without the Canvas Data increment]
    :type course_id: [str]
    :return: [Course Name of course or blank not found]
    :rtype: [str]
    """
    logger.debug(get_course_name_from_id.__name__)
    course_id = canvas_id_to_incremented_id(course_id)
    course_name = ""
    if (course_id):
        with django.db.connection.cursor() as cursor:
            cursor.execute("SELECT name FROM course WHERE id = %s", [course_id])
            row = cursor.fetchone()
            if (row != None):
                course_name = row[0]
    return course_name


def get_course_view_options (course_id):
    logger.info(get_course_view_options.__name__)
    course_id = canvas_id_to_incremented_id(course_id)
    logger.debug("course_id=" + str(course_id))
    course_view_option = ""
    if (course_id):
        with django.db.connection.cursor() as cursor:
            cursor.execute("SELECT show_resources_accessed, show_assignment_planning_v1, show_assignment_planning, show_grade_distribution FROM course_view_option WHERE course_id = %s", [course_id])
            row = cursor.fetchone()
            if (row != None):
                course_view_option = {}
                course_view_option['show_resources_accessed'] = row[0] and 'show_resources_accessed' not in settings.VIEWS_DISABLED
                course_view_option['show_assignment_planning_v1'] = row[1] and 'show_assignment_planning' not in settings.VIEWS_DISABLED
                course_view_option['show_assignment_planning'] = row[1] and 'show_assignment_planning' not in settings.VIEWS_DISABLED
                course_view_option['show_grade_distribution'] = row[2] and 'show_grade_distribution' not in settings.VIEWS_DISABLED
    return course_view_option


def get_default_user_course_id(user_id):
    """[Get the default course id for the user id from the user table]
    :param user_id: [SIS User ID of the user]
    :type user_id: [str]
    :return: [Canvas Course ID]
    :rtype: [str]
    """
    logger.info(get_default_user_course_id.__name__)
    course_id = ""
    with django.db.connection.cursor() as cursor:
        cursor.execute("SELECT course_id FROM user WHERE sis_name= %s ORDER BY course_id DESC LIMIT 1", [user_id])
        row = cursor.fetchone()
        if (row != None):
            course_id = canvas_id_to_incremented_id(row[0])
    return course_id


class CourseEnrollment(TypedDict):
    course_id: int
    course_name: str
    enrollment_types: List[str]

def is_superuser(user_name: str) -> bool:
    logger.debug(is_superuser.__name__+f' \'{user_name}\'')

    user = DjangoUser.objects.filter(username=user_name)
    if user.count() == 0:
        result = False
    else:
        result = user[0].is_superuser
    logger.debug(is_superuser.__name__+f' \'{user_name}\':{result}')
    return result

def get_user_courses_info(username: str, course_id: Union[int, None] = None) -> List[CourseEnrollment]:
    """
    Fetching the user courses enrollment info, for standalone it will return all the courses enrollment for LTI
    single course enrollment info
    http://za.github.io/2015/06/29/django-filter-query-exception/
    :param course_id: canvas short course id
    :param username: user sis_name
    :return: [{`course_id`: 1233, `course_name`: 'COURSES WN 2020', `enrollment_types`: ['StudentEnrollment'] }]
    """
    logger.info(get_user_courses_info.__name__)
    course_enrollments: Dict[int, CourseEnrollment] = {}
    if course_id:
        user_enrollments = User.objects.filter(course_id=canvas_id_to_incremented_id(course_id),
                                               sis_name=username)
    else:
        user_enrollments = User.objects.filter(sis_name=username)
    if user_enrollments.count() == 0:
        if not is_superuser(username):
            logger.warning(
                f'Couldn\'t find user {username} in enrollment info. Enrollment data has not been populated yet.')
        return []

    for enrollment in user_enrollments:
        enroll_type = enrollment.enrollment_type
        course_id = int(incremented_id_to_canvas_id(enrollment.course_id))
        if course_id not in course_enrollments.keys():
            course_enrollments[course_id] = {
                'course_id': course_id,
                'course_name': '',
                'enrollment_types': []
            }
        course_enrollments[course_id]['enrollment_types'].append(enroll_type)
    courses = Course.objects.filter(canvas_id__in=course_enrollments.keys())
    if courses.count() == 0:
        logger.error(f'Could not fetch courses info')
        return []
    for course in courses:
        course_enrollments[course.canvas_id]['course_name'] = course.name
    enrollments = list(course_enrollments.values())
    logger.info(f'User {username} is enrolled in these courses: {enrollments}')
    return enrollments


def get_last_cronjob_run() -> Union[datetime, None]:
    try:
        c = CronJobLog.objects.filter(is_success=1).latest('end_time')
        end_time = c.end_time
        return end_time
    except CronJobLog.DoesNotExist:
        logger.info("CronJobLog did not exist", exc_info = True)
    return None


def get_canvas_data_date() -> Union[datetime, None]:
    if not settings.DATABASES.get('DATA_WAREHOUSE', {}).get('IS_UNIZIN'):
        return get_last_cronjob_run()

    try:
        with django.db.connection.cursor() as cursor:
            cursor.execute("SELECT pvalue from unizin_metadata where pkey = 'canvasdatadate'")
            row = cursor.fetchone()
            if (row != None):
                date = parse(row[0])
                return date
    except Exception:
        logger.info("Value could not be found from metadata", exc_info = True)
    return None
