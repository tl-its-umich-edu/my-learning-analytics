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

if [ -z "${IS_CRON_POD}" ]; then
    # Start Gunicorn processes
    echo Starting Gunicorn.

    # application pod
    exec gunicorn dashboard.wsgi:application \
        --bind 0.0.0.0:${GUNICORN_PORT} \
        --workers="${GUNICORN_WORKERS}"
else
    # in cron pod
    echo Running cron job pod

    # Make the log file available
    touch /var/log/cron.log

    # Get the environment from docker saved
    # https://ypereirareis.github.io/blog/2016/02/29/docker-crontab-environment-variables/
    printenv | sed 's/^\([a-zA-Z0-9_]*\)=\(.*\)$/export \1="\2"/g' >> $HOME/.profile

    echo "*/5 * * * * . $HOME/.profile; python /dashboard/manage.py runcrons >> /var/log/cron.log 2>&1" | crontab

    crontab -l && cron -L 15 && tail -f /var/log/cron.log
fi