#!/bin/bash

# Case insenstive match
shopt -s nocaseglob

if [ -z "${ENV_FILE}" ]; then
    ENV_FILE="/code/config/env.json"
fi

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

if [ "${GUNICORN_RELOAD}" ]; then
    GUNICORN_RELOAD="--reload"
else
    GUNICORN_RELOAD=""
fi

MYSQL_HOST=$(jq -r -c ".MYSQL_HOST | values" ${ENV_FILE})
MYSQL_PORT=$(jq -r -c ".MYSQL_PORT | values" ${ENV_FILE})
IS_CRON_POD=$(jq -r -c ".IS_CRON_POD | values" ${ENV_FILE})
PTVSD_ENABLE=$(jq -r -c ".PTVSD_ENABLE | values" ${ENV_FILE})
CRONTAB_SCHEDULE=$(jq -r -c ".CRONTAB_SCHEDULE | values" ${ENV_FILE})
RUN_AT_TIMES=$(jq -r -c ".RUN_AT_TIMES | values" ${ENV_FILE})

echo "Waiting for DB"
wait-port ${MYSQL_HOST}:${MYSQL_PORT} -t 30000

echo Running python startups
python manage.py migrate


# If these values aren't set or they're set to false
# This syntax substitutes False if null or unset
if [ "${IS_CRON_POD:-"False"}" == "False" ]; then
    if [ "${PTVSD_ENABLE:-"False"}" == "False" ]; then
        # Start Gunicorn processes
        echo Starting Gunicorn for production

        # application pod
        exec gunicorn dashboard.wsgi:application \
            --bind 0.0.0.0:${GUNICORN_PORT} \
            --workers="${GUNICORN_WORKERS}" \
            ${GUNICORN_RELOAD}
    else
        # Currently ptvsd doesn't work with gunicorn
        # https://github.com/Microsoft/vscode-python/issues/2138
        echo Starting Runserver for development
        export PYTHONPATH="/code:$PYTHONPATH"
        export DJANGO_SETTINGS_MODULE=dashboard.settings
        exec django-admin runserver --ptvsd 0.0.0.0:${GUNICORN_PORT}

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

        echo "${CRONTAB_SCHEDULE} . $HOME/.profile; python /code/manage.py runcrons >> /var/log/cron.log 2>&1" | crontab
        crontab -l && cron -L 15 && tail -f /var/log/cron.log
    fi
fi
