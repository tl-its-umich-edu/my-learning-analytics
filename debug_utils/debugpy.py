import os
import logging
from typing import Union

from distutils.util import strtobool
from django.conf import settings

logger = logging.getLogger(__name__)
# Converts a str to bool, or just returns the bool


def forcebool(bool_str: str) -> Union[bool, str]:
    if isinstance(bool_str, str):
        return strtobool(bool_str)
    return bool_str


def check_and_enable_debugpy():
    # These could either come from settings or environment
    debugpy_enable = forcebool(os.getenv('DEBUGPY_ENABLE', getattr(settings, 'DEBUGPY_ENABLE', False)))
    debugpy_wait_for_attach = forcebool(os.getenv('DEBUGPY_WAIT_FOR_ATTACH',
                                                  getattr(settings, 'DEBUGPY_WAIT_FOR_ATTACH', False)))
    debugpy_address = os.getenv('DEBUGPY_REMOTE_ADDRESS', getattr(settings, 'DEBUGPY_REMOTE_ADDRESS', '0.0.0.0'))
    debugpy_port = os.getenv('DEBUGPY_REMOTE_PORT', getattr(settings, 'DEBUGPY_REMOTE_PORT', '5678'))

    if debugpy_enable:
        import debugpy
        debugpy.listen((debugpy_address, int(debugpy_port)))
        logger.info('DEBUGPY: Enabled Listen ({0}:{1})'.format(debugpy_address, debugpy_port))
        if debugpy_wait_for_attach:
            logger.info('DEBUGPY: Waiting for attach...')
            debugpy.wait_for_client()
