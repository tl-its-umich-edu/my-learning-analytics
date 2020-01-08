from dashboard.common import db_util
from dashboard.common import utils

import logging
logger = logging.getLogger(__name__)

from django.http import HttpRequest, JsonResponse

def get_git_version_info(request: HttpRequest) -> JsonResponse:
    return {'git_version': utils.get_git_version_info()}


def get_myla_globals(request: HttpRequest) -> JsonResponse:
    return {'myla_globals': utils.get_myla_globals(request.user)}


def last_updated(request: HttpRequest) -> JsonResponse:
    return {'last_updated': db_util.get_canvas_data_date()}