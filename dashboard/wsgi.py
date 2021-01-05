"""
WSGI config for dashboard project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.9/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application
from debug_utils.debugpy import check_and_enable_debugpy

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dashboard.settings")

check_and_enable_debugpy()

application = get_wsgi_application()
