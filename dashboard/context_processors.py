from dashboard.common import db_util
from dashboard.common import utils

import logging
import json

logger = logging.getLogger(__name__)


def course_name(request):
    course_id = str(request.resolver_match.kwargs.get('course_id'))
    course_name = "Course Not Found"
    logger.info("course_id=" + course_id)

    if course_id:
        course_name = db_util.get_course_name_from_id(course_id)

    return {'course_name': course_name}


def current_user_course_id(request):
    logger.info(current_user_course_id.__name__)
    course_id = str(request.resolver_match.kwargs.get('course_id'))
    if not course_id:
        logger.info("Course ID could not be determined from request, attempting to look up for user {}".format(
            request.user.username))
        course_id = db_util.get_default_user_course_id(request.user.username)
    return {'current_user_course_id': course_id}


def current_user_courses_info(request):
    logger.info(current_user_courses_info.__name__)
    courses_info_by_user = db_util.get_user_courses_info(request.user.username)
    return {'current_user_courses_info': courses_info_by_user}


def course_view_option(request):
    course_id = str(request.resolver_match.kwargs.get('course_id'))
    logger.info("course_view_option=" + course_id)
    course_view_option = {}
    if (course_id):
        course_view_option = db_util.get_course_view_options(course_id)

    return {"course_view_option": json.dumps(course_view_option)}

def current_user_incremented_course_id(request):
    course_id = str(request.resolver_match.kwargs.get('course_id'))
    if not course_id:
        logger.info(f"Course ID could not be determined from request, attempting to look up for user {request.user.username}")
        course_id = db_util.get_default_user_course_id(request.user.username)
    incremented_course_id = db_util.canvas_id_to_incremented_id(course_id)
    return {'current_user_incremented_course_id': incremented_course_id}

def last_updated(request):
    return {'last_updated': db_util.get_canvas_data_date()}


def get_build_info(request):
    return {'build': utils.get_build_info()}
