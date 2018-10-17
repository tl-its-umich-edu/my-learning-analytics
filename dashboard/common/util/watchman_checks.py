# Custom watchman checks
import django, logging
from datetime import datetime
from watchman.decorators import check

from dashboard.common.util.db_util import get_last_cron_run

logger = logging.getLogger(__name__)

@check
def check_crontab():
    """[Get the last crontab run status]
    
    :return: [Watchman array for whether or not this passes]
    :rtype: [str]
    """
    ok = True
    last_run = get_last_cron_run()
    # If we get a datetime.min or None back then there's an error
    if last_run == None or last_run == datetime.min:
        ok = False
    return {"cron": {"ok": ok}}
