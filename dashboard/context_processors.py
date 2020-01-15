from django_hint import RequestType

from dashboard.common import db_util
from dashboard.common import utils

import logging
from typing import Dict

logger = logging.getLogger(__name__)

from django.http import HttpRequest, JsonResponse

def get_git_version_info(request: RequestType) -> Dict:
    return {'git_version': utils.get_git_version_info()}


def get_myla_globals(request: RequestType) -> Dict:
    return {'myla_globals': utils.get_myla_globals(request)}


def last_updated(request: RequestType) -> Dict:
    return {'last_updated': db_util.get_canvas_data_date()}