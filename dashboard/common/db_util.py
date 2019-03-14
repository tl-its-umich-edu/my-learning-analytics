# Some utility functions used by other classes in this project

import django
import logging
from datetime import datetime
from dateutil.parser import parse

from django_cron.models import CronJobLog
from dashboard.models import Course

from django.conf import settings

logger = logging.getLogger(__name__)

def get_course_name_from_id(course_id):
    """[Get the long course name from the id]

    :param course_id: [Canvas course ID without DATA_WAREHOUSE PREFIX]
    :type course_id: [str]
    :return: [Course Name of course or blank not found]
    :rtype: [str]
    """
    logger.info(get_course_name_from_id.__name__)
    course_id = settings.DATA_WAREHOUSE_ID_PREFIX + str(course_id)
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
    course_id = settings.DATA_WAREHOUSE_ID_PREFIX + str(course_id)
    logger.debug("course_id=" + str(course_id))
    course_view_option = ""
    if (course_id):
        with django.db.connection.cursor() as cursor:
            cursor.execute("SELECT show_files_accessed, show_assignment_planning, show_grade_distribution FROM course_view_option WHERE course_id = %s", [course_id])
            row = cursor.fetchone()
            if (row != None):
                course_view_option = {}
                course_view_option['show_files_accessed'] = row[0] and 'show_files_accessed' not in settings.VIEWS_DISABLED
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
            #Remove the DATA_WAREHOUSE_ID_PREFIX and just return the course_id
            course_id = str(row[0]).replace(settings.DATA_WAREHOUSE_ID_PREFIX, "")
    return course_id

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