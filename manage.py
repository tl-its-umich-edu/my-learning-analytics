#!/usr/bin/env python
import os, sys, warnings, logging

from django.core.management import execute_from_command_line

logger = logging.getLogger(__name__)

if __name__ == "__main__":

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dashboard.settings")

    # Regex for which modules to ignore warnings from
    IGNORE_MODULES = 'djangosaml2'
    warnings.filterwarnings("ignore", module=IGNORE_MODULES, category=DeprecationWarning)

    execute_from_command_line(sys.argv)
