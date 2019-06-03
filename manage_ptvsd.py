#!/usr/bin/env python
import os, sys, warnings

if __name__ == "__main__":

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dashboard.settings")

    # Regex for which modules to ignore warnings from
    IGNORE_MODULES = 'djangosaml2'
    warnings.filterwarnings("ignore", module=IGNORE_MODULES, category=DeprecationWarning)

    from django.core.management import execute_from_command_line
    from django.conf import settings

    if getattr(settings, 'PTVSD_ENABLE', False):
        PTVSD_ADDRESS = getattr(settings, 'PTVSD_REMOTE_ADDRESS', '0.0.0.0')
        PTVSD_PORT = getattr(settings, 'PTVSD_REMOTE_PORT', '5678')

        import ptvsd
        ptvsd.enable_attach(address=(PTVSD_ADDRESS, PTVSD_PORT))
        print('PTVSD: Enabled Attach ({0}:{1})'.format(PTVSD_ADDRESS, PTVSD_PORT))
        if getattr(settings, 'PTVSD_WAIT_FOR_ATTACH', False):
            print('PTVSD: Waiting for attach...')
            ptvsd.wait_for_attach()
    execute_from_command_line(sys.argv)
