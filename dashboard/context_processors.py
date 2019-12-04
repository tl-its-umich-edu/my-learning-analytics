from dashboard.common import db_util
from dashboard.common import utils

import logging
logger = logging.getLogger(__name__)

from django.http import HttpRequest, JsonResponse


def last_updated(request: HttpRequest) -> JsonResponse:
    return {'last_updated': db_util.get_canvas_data_date()}


def get_git_version_info(request: HttpRequest) -> JsonResponse:
    return {'git_version': utils.get_git_version_info()}