#!/bin/bash

# Case insensitive match
shopt -s nocaseglob

if [ -z "${ENV_FILE}" ]; then
    ENV_FILE="/secrets/env.hjson"
fi

echo "$DJANGO_SETTINGS_MODULE"

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
    GUNICORN_RELOAD=
fi

DOMAIN_JQ='.ALLOWED_HOSTS | . - ["127.0.0.1", "localhost", ".ngrok.io"] | if . | length == 0 then "localhost" else .[0] end'

if [ -z "${ENV_JSON}" ]; then
    MYSQL_HOST=$(hjson -j ${ENV_FILE} | jq -r -c ".MYSQL.HOST | values")
    MYSQL_PORT=$(hjson -j ${ENV_FILE} | jq -r -c ".MYSQL.PORT | values")
    IS_CRON_POD=$(hjson -j ${ENV_FILE} | jq -r -c ".IS_CRON_POD | values")
    DEBUGPY_ENABLE=$(hjson -j ${ENV_FILE} | jq -r -c ".DEBUGPY_ENABLE | values")
    CRONTAB_SCHEDULE=$(hjson -j ${ENV_FILE} | jq -r -c ".CRONTAB_SCHEDULE | values")
    RUN_AT_TIMES=$(hjson -j ${ENV_FILE} | jq -r -c ".RUN_AT_TIMES | values")
    DOMAIN=$(hjson -j ${ENV_FILE} | jq -r -c "${DOMAIN_JQ} | values")
else
    MYSQL_HOST=$(echo "${ENV_JSON}" | jq -r -c ".MYSQL.HOST | values")
    MYSQL_PORT=$(echo "${ENV_JSON}" | jq -r -c ".MYSQL.PORT | values")
    IS_CRON_POD=$(echo "${ENV_JSON}" | jq -r -c ".IS_CRON_POD | values")
    DEBUGPY_ENABLE=$(echo "${ENV_JSON}" | jq -r -c ".DEBUGPY_ENABLE | values")
    CRONTAB_SCHEDULE=$(echo "${ENV_JSON}" | jq -r -c ".CRONTAB_SCHEDULE | values")
    RUN_AT_TIMES=$(echo "${ENV_JSON}" | jq -r -c ".RUN_AT_TIMES | values")
    DOMAIN=$(echo "${ENV_JSON}" | jq -r -c "${DOMAIN_JQ} | values")
fi

echo "Waiting for DB"
while ! nc -z "${MYSQL_HOST}" "${MYSQL_PORT}"; do
  sleep 1 # wait 1 second before check again
done

if [ -d .git ]; then
  GIT_REPO="$(git config --local remote.origin.url)"
  export GIT_REPO
  GIT_COMMIT="$(git rev-parse HEAD)"
  export GIT_COMMIT
  GIT_BRANCH="$(git name-rev "$GIT_COMMIT" --name-only)"
  export GIT_BRANCH
fi;

echo Running python startups
python manage.py migrate

echo "Setting domain of default site record"
# The value for LOCALHOST_PORT is set in docker-compose.yml
if [ "${DOMAIN}" == "localhost" ]; then
  python manage.py site --domain="${DOMAIN}:${LOCALHOST_PORT}" --name="${DOMAIN}"
else
  python manage.py site --domain="${DOMAIN}" --name="${DOMAIN}"
fi

# If these values aren't set or they're set to false
# This syntax substitutes False if null or unset
if [ "${IS_CRON_POD:-"false"}" == "false" ]; then
    if [ "${DEBUGPY_ENABLE:-"false"}" == "false" ]; then
        echo "Starting Gunicorn for production"
    else
        echo "Starting Gunicorn for DEBUGPY debugging"
        # Workers need to be set to 1 for DEBUGPY
        GUNICORN_WORKERS=1
        GUNICORN_RELOAD="--reload"
        GUNICORN_TIMEOUT=0
    fi
    exec gunicorn dashboard.wsgi:application \
        --bind 0.0.0.0:${GUNICORN_PORT} \
        --workers="${GUNICORN_WORKERS}" \
        --timeout="${GUNICORN_TIMEOUT}" \
        ${GUNICORN_RELOAD}

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
        printenv | sed "s/^\([a-zA-Z0-9_]*\)=\(.*\)$/export \1='\2'/g" >> "$HOME/.profile"

        echo "${CRONTAB_SCHEDULE} . $HOME/.profile; python /code/manage.py runcrons >> /var/log/cron.log 2>&1" | crontab
        crontab -l && cron -L 15 && tail -f /var/log/cron.log
    fi
fi
