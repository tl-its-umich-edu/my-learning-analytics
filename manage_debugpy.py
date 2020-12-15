#!/usr/bin/env python
import os, sys, warnings
from debug_utils.debugpy import check_and_enable_debugpy
from django.core.management import execute_from_command_line

if __name__ == "__main__":

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dashboard.settings")

    # Regex for which modules to ignore warnings from
    IGNORE_MODULES = 'djangosaml2'
    warnings.filterwarnings("ignore", module=IGNORE_MODULES, category=DeprecationWarning)

    check_and_enable_debugpy()
    execute_from_command_line(sys.argv)
