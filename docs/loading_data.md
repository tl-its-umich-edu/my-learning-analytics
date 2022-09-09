[Back to README](../README.md)

## Loading data

Context and event data are loaded into the MySQL database using a job defined in [dashboard/cron.py](../dashboard/cron.py).
The job approach leverages the [`django-cron`](https://django-cron.readthedocs.io/en/latest/) library.

### Local development

For local testing, make sure your connection secrets are added (see [Configuration](configuration.md)) and
your VPN is active. Then, with the application running, run this command in a separate terminal.

```sh
docker exec -it student_dashboard /bin/bash -c \
    "python manage.py migrate django_cron && python manage.py runcrons --force"
```

After about 30 to 60 seconds, the cron job should have completed and you should have data!
In the admin interface, there is a table where you can check the status of the cron job runs.

### Cron scheduling for deployment

> **Note:** Cron scheduling functionality settings may be removed in the future,
since this responsibility is often handed off to other infrastructure, like an automation server.

By setting a few configuration variables in `env.hjson`,
the application can be started up in a separate container with a Unix crontab schedule.
To do this, set `IS_CRON_POD` to `true`,and then configure `CRONTAB_SCHEDULE` and `RUN_AT_TIMES`.
For `CRONTAB_SCHEDULE`, `django-cron` recommends running `python manage.py runcrons` every five minutes,
which is the default (`*/5 * * * *`) in `env.hjson`.
`RUN_AT_TIMES` sets when the job will actually kick off.
See [`start.sh`](../start.sh) and `cron.py` to see the logic.
