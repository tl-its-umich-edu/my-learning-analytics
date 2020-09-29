import os, logging
from distutils.util import strtobool
from django.conf import settings

logger = logging.getLogger(__name__)
# Converts a str to bool, or just returns the bool
def forcebool(s):
    if isinstance (s, str):
        return strtobool(s)
    return s

def check_and_enable_ptvsd():
    # These could either come from settings or environment
    PTVSD_ENABLE = forcebool(os.getenv('PTVSD_ENABLE', getattr(settings, 'PTVSD_ENABLE', False)))
    PTVSD_WAIT_FOR_ATTACH = forcebool(os.getenv('PTVSD_WAIT_FOR_ATTACH', getattr(settings, 'PTVSD_WAIT_FOR_ATTACH', False)))
    PTVSD_ADDRESS = os.getenv('PTVSD_REMOTE_ADDRESS',getattr(settings, 'PTVSD_REMOTE_ADDRESS', '0.0.0.0'))
    PTVSD_PORT = os.getenv('PTVSD_REMOTE_PORT', getattr(settings, 'PTVSD_REMOTE_PORT', '5678'))

    if PTVSD_ENABLE:
        import ptvsd
        ptvsd.enable_attach(address=(PTVSD_ADDRESS, PTVSD_PORT))
        logger.info('PTVSD: Enabled Attach ({0}:{1})'.format(PTVSD_ADDRESS, PTVSD_PORT))
        if PTVSD_WAIT_FOR_ATTACH:
            logger.info('PTVSD: Waiting for attach...')
            ptvsd.wait_for_attach()