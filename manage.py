#!/usr/bin/env python
import os
import sys
import warnings

if __name__ == "__main__":

    if os.environ.get("PTVSD_DEBUG", False):
        import ptvsd
        try: 
            ptvsd.enable_attach(address = (os.environ.get("PTVSD_ADDRESS",'0.0.0.0'), os.environ.get("PTVSD_PORT", 3000)))
            # If the user wants to wait to start until it's attached call this
            if (os.environ.get("PTVSD_WAIT_FOR_ATTACH", False)):
                ptvsd.wait_for_attach()
        except Exception as e:
            pass

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dashboard.settings")

    # Regex for which modules to ignore warnings from
    IGNORE_MODULES = 'djangosaml2'
    warnings.filterwarnings("ignore", module=IGNORE_MODULES, category=DeprecationWarning)

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
