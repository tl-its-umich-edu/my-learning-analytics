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
wait-port ${MYSQL_HOST}:${MYSQL_PORT} -t 15000

echo Running python startups
python manage.py migrate

if [ -z "${IS_CRON_POD}" ]; then
    if [ -z "${PTVSD_DEBUG}" ]; then
        # Start Gunicorn processes
        echo Starting Gunicorn for production

        # application pod
        exec gunicorn dashboard.wsgi:application \
            --bind 0.0.0.0:${GUNICORN_PORT} \
            --workers="${GUNICORN_WORKERS}"
    else 
        # Currently ptvsd doesn't work with gunicorn
        # https://github.com/Microsoft/vscode-python/issues/2138
        echo Starting Runserver for development
        exec python manage.py runserver --noreload 0.0.0.0:${GUNICORN_PORT}

    fi
else
    if [ -z "${CRONTAB_SCHEDULE}" ]; then
        echo "CRONTAB_SCHEDULE environment variable not set, crontab cannot be started. Please set this to a crontab acceptable format."
    else
        # in cron pod
        echo Running cron job pod
        echo "CRONTAB_SCHEDULE is ${CRONTAB_SCHEDULE}, RUN_AT_TIMES is ${RUN_AT_TIMES}"

        # Make the log file available
        touch /var/log/cron.log

        # Get the environment from docker saved
        # https://ypereirareis.github.io/blog/2016/02/29/docker-crontab-environment-variables/
        printenv | sed "s/^\([a-zA-Z0-9_]*\)=\(.*\)$/export \1='\2'/g" >> $HOME/.profile

        echo "${CRONTAB_SCHEDULE} . $HOME/.profile; python /dashboard/manage.py runcrons >> /var/log/cron.log 2>&1" | crontab
        crontab -l && cron -L 15 && tail -f /var/log/cron.log
    fi
fi
