# Some utility functions used by other classes in this project
from datetime import datetime
import logging
from typing import Dict, List, Union

from dateutil.parser import parse
import django
from django.conf import settings
from django_cron.models import CronJobLog



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


def get_user_courses_info(username: str) -> List[Dict[str, Union[str, int, List[str]]]]:
    logger.info(get_user_courses_info.__name__)
    user_courses_info: List[Dict[str, Union[str, int, List[str]]]] = []
    with django.db.connection.cursor() as cursor:
        cursor.execute('''
            SELECT c.canvas_id, c.name, u.enrollment_type
            FROM user u
            JOIN course c
                ON u.course_id=c.id
            WHERE u.sis_name= %s;
        ''', [username])
        courses = cursor.fetchall()
        if courses is not None:
            course_enrollments: Dict[int, Dict[str, Union[int, str, List[str]]]] = {}
            for course in courses:
                course_id, course_name, enrollment_type = course
                if course_id not in course_enrollments.keys():
                    course_enrollments[course_id] = {
                        'course_id': course_id,
                        'course_name': course_name,
                        'enrollment_types': []
                    }
                course_enrollments[course_id]['enrollment_types'].append(enrollment_type)
            user_courses_info = list(course_enrollments.values())
    logger.info(f'User {username} is enrolled in these courses: {user_courses_info}')
    return user_courses_info


def get_last_cron_run():
    try:
        c = CronJobLog.objects.filter(is_success=1).latest('end_time')
        end_time = c.end_time
        return end_time
    except CronJobLog.DoesNotExist:
        logger.info("CronJobLog did not exist", exc_info = True)
    return datetime.min


def get_canvas_data_date():
    if not settings.DATA_WAREHOUSE_IS_UNIZIN:
        return get_last_cron_run()

    try:
        with django.db.connection.cursor() as cursor:
            cursor.execute("SELECT pvalue from unizin_metadata where pkey = 'canvasdatadate'")
            row = cursor.fetchone()
            if (row != None):
                date = parse(row[0])
                return date
    except Exception:
        logger.info("Value could not be found from metadata", exc_info = True)
    return datetime.min
