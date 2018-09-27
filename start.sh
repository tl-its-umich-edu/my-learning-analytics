#!/bin/bash

echo $DJANGO_SETTINGS_MODULE

if [ -z "${GUNICORN_WORKERS}" ]; then
    GUNICORN_WORKERS=4
fi

if [ -z "${GUNICORN_PORT}" ]; then
    GUNICORN_PORT=5000
fi

if [ -z "${GUNICORN_TIMEOUT}" ]; then
    GUNICORN_TIMEOUT=120
fi

echo "Waiting for DB"
dockerize -wait tcp://${MYSQL_HOST}:${MYSQL_PORT} -timeout 15s

echo Running python startups
python manage.py migrate

# Start Gunicorn processes
echo Starting Gunicorn.

exec gunicorn dashboard.wsgi:application \
    --bind 0.0.0.0:${GUNICORN_PORT} \
    --workers="${GUNICORN_WORKERS}"
