# Some utility functions used by other classes in this project

import django
import logging
from datetime import datetime
from dateutil.parser import parse

from django_cron.models import CronJobLog
from dashboard.models import UserDefaultSelection

import pandas as pd
from django.conf import settings

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
            cursor.execute("SELECT show_resources_accessed, show_assignment_planning, show_grade_distribution FROM course_view_option WHERE course_id = %s", [course_id])
            row = cursor.fetchone()
            if (row != None):
                course_view_option = {}
                course_view_option['show_resources_accessed'] = row[0] and 'show_resources_accessed' not in settings.VIEWS_DISABLED
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


def get_user_courses_info(user_id):
    logger.info(get_user_courses_info.__name__)
    course_list = []
    course_info={}
    with django.db.connection.cursor() as cursor:
        cursor.execute("SELECT course_id FROM user WHERE sis_name= %s", [user_id])
        courses = cursor.fetchall()
        if courses is not None:
            for course in courses:
                course_id = incremented_id_to_canvas_id(course[0])
                course_list.append(int(course_id))
    if course_list:
        course_tuple = tuple(course_list)
        with django.db.connection.cursor() as cursor:
            cursor.execute("select canvas_id, name from course where canvas_id in %s",[course_tuple])
            course_names = cursor.fetchall()
            df = pd.DataFrame(list(course_names))
            df.columns=["course_id", "course_name"]
            course_info=df.to_json(orient='records')
            logger.info(f"User {user_id} is enrolled in courses {course_info}")
    return course_info


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

def get_user_defaults(user_sis_name: str, course_id: int = 0, default_view_type: str = None) -> dict:
    """ Get user defaults from the database
    
    :param user_sis_name: User SIS name
    :type user_sis_name: str
    :param course_id: Course ID 0 will return defaults, defaults to 0
    :type course_id: int, optional
    :param default_view_type: A specific view or None for all for user, defaults to None
    :type default_view_type: str, optional
    :return: A dict with the users values or an empty dict if none found
    :rtype: dict
    """
    args = {'course_id': int(course_id), 'user_sis_name': user_sis_name}
    if default_view_type:
        args.update(default_view_type = default_view_type)
    defaults = UserDefaultSelection.objects.filter(**args)

    default_values = {default.default_view_type:default.default_view_value for default in defaults}
    
    logger.info(f"""default option check returned from DB for user: {user_sis_name} course {course_id} and type: {default_view_type} is {default_values}""")
    if (default_values):
        return default_values
    else:
        return {}