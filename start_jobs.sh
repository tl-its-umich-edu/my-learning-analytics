#!/bin/bash

echo $DJANGO_SETTINGS_MODULE

echo Running python startups
python manage.py migrate django_cron; python manage.py migrate

python manage.py runcrons