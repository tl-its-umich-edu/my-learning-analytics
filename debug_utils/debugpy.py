import os, logging
from distutils.util import strtobool
from django.conf import settings

logger = logging.getLogger(__name__)
# Converts a str to bool, or just returns the bool
def forcebool(s):
    if isinstance (s, str):
        return strtobool(s)
    return s

def check_and_enable_debugpy():
    # These could either come from settings or environment
    DEBUGPY_ENABLE = forcebool(os.getenv('DEBUGPY_ENABLE', getattr(settings, 'DEBUGPY_ENABLE', False)))
    DEBUGPY_WAIT_FOR_ATTACH = forcebool(os.getenv('DEBUGPY_WAIT_FOR_ATTACH', getattr(settings, 'DEBUGPY_WAIT_FOR_ATTACH', False)))
    DEBUGPY_ADDRESS = os.getenv('DEBUGPY_REMOTE_ADDRESS',getattr(settings, 'DEBUGPY_REMOTE_ADDRESS', '0.0.0.0'))
    DEBUGPY_PORT = os.getenv('DEBUGPY_REMOTE_PORT', getattr(settings, 'DEBUGPY_REMOTE_PORT', '5678'))

    if DEBUGPY_ENABLE:
        import debugpy
        debugpy.listen((DEBUGPY_ADDRESS, DEBUGPY_PORT))
        logger.info('DEBUGPY: Enabled Listen ({0}:{1})'.format(DEBUGPY_ADDRESS, DEBUGPY_PORT))
        if DEBUGPY_WAIT_FOR_ATTACH:
            logger.info('DEBUGPY: Waiting for attach...')
            debugpy.wait_for_client()