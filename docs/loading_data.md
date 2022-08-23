### Load user, file, file access data into database
Users and files are loaded now with the cron job. This is run on a separate pod in Openshift when the environment variable `IS_CRON_POD=true`.

Crons are configured in this project with django-cron. Django-cron is executed whenever `python manage.py runcrons` is run but it is limited via a few environment variables.

The installation notes recommends that you have a Unix crontab scheduled to run every 5 minutes to run this command. https://django-cron.readthedocs.io/en/latest/installation.html

This is configured with these values
***(Django Cron) Run only at 2AM***

RUN_AT_TIMES=2:00

***(Unix Cron) - Run every 5 minutes***

CRONTAB_SCHEDULE=*/5 * * * *

For local testing, make sure your secrets are added and your VPN is active. Then run this command on a running container to execute the cronjob

`docker exec -it student_dashboard /bin/bash -c "python manage.py migrate django_cron && python manage.py runcrons --force"`

After about 30-60 seconds the crons should have completed and you should have data! In the admin interface there is a table where you can check the status of the cron job runs.
