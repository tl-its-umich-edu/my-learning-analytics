from dashboard.common import db_util
from dashboard.common import utils

import logging
import json
logger = logging.getLogger(__name__)


def current_user_courses_info(request):
    logger.info(current_user_courses_info.__name__)
    courses_info_by_user = db_util.get_user_courses_info(request.user.username)
    return {'current_user_courses_info': courses_info_by_user}


def last_updated(request):
    return {'last_updated': db_util.get_canvas_data_date()}


def get_build_info(request):
    return {'build': utils.get_build_info()}

def get_user_defaults(request):
    user_sis_name = request.user.get_username()
    defaults = db_util.get_user_defaults(user_sis_name, 0)
    return {'get_user_defaults': json.dumps(defaults)}