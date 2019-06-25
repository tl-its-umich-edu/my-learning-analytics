from dashboard.common import db_util
from dashboard.common import utils

import logging
logger = logging.getLogger(__name__)


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


def last_updated(request):
    return {'last_updated': db_util.get_canvas_data_date()}


def get_build_info(request):
    return {'build': utils.get_build_info()}