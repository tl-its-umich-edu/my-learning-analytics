#!/bin/bash

echo $DJANGO_SETTINGS_MODULE

echo "Waiting for DB"
dockerize -wait tcp://${MYSQL_HOST}:${MYSQL_PORT} -timeout 15s

echo Running python startups
python manage.py migrate django_cron

python manage.py runcrons