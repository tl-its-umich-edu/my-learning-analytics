from dashboard.common.util import *

import logging

logger = logging.getLogger(__name__)

def course_name(request):
    course_id = str(request.resolver_match.kwargs.get('course_id'))
    course_name = "Course Not Found"
    if (course_id): 
        course_name = get_course_name_from_id(course_id)

    return {'course_name': course_name}

def current_user_course_id(request):
    course_id = str(request.resolver_match.kwargs.get('course_id'))
    if not course_id:
        logger.info("Course ID could not be determined from request, attempting to look up for user {}".format(request.user.username))
        course_id = get_default_user_course_id(request.user.username)
    return {'current_user_course_id': course_id}

def last_updated(request):
    return {'last_updated' : get_last_cron_run()}