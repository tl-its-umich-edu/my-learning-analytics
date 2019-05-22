# my-learning-analytics

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/0fd487531e244c0ebbfbc25e8753c484)](https://app.codacy.com/app/ITS_Teaching_And_Learning/student-dashboard-django?utm_source=github.com&utm_medium=referral&utm_content=tl-its-umich-edu/student-dashboard-django&utm_campaign=Badge_Grade_Settings)

My Learning Analytics based on django framework

## Environment configuration
There is some environment configuration and addtional files needed for this app to run. You can put this in a file called .env for testing. 

Configuration:

Copy the file `.env.sample` to `.env` and fill in with the values for local testing. You may also provide a .env file if you have one.

On OpenShift fill these in the appropriate places to provide the environment.

# Secrets

The bq_cred.json is service account for Big Query, it needs to be supplied and put into the /secrets directory and setup in the environment.

(Openshift Only) The /secrets/saml directory needs to contain 4 files for SAML configuration. These are currently hard-coded in settings.py though the path comes from the environment SAML2_FILES_BASE.

	remote-metadata.xml 
	student-dashboard-saml.key
	student-dashboard-saml.pem

# Control course view options

View options can be controlled at the global and course level. If a view is disabled globally, it will be disabled for each course, even if previously enabled at the course level. If a view is not globally disabled, it can still be disabled at the course level.

`VIEWS_DISABLED` comma delimited list of views to disable (default empty). The expected name of the view is the same as the view's column name in the `course_view_option` table. Example value of `show_files_accessed,show_grade_distribution` will disable both the Files Accessed and Grade Distribution views.

Note that by default all views are enabled when a course is added.

# LTI v1.1.1 Configuration

Only basic LTI launches are supported at the moment (automatic account creation and redirection to the correct course). New courses are not added nor are course view options modified.

The relative LTI launch url is `/lti/auth/` (ex: `https://example.com/lti/auth`).

Environment variables:

`STUDENT_DASHBOARD_LTI`: Set to True to enable LTI (default false).

`PYLTI_CONFIG_CONSUMERS`: JSON string of supported LTI Consumers (default none). Formated `{ "LTI_CONSUMER_KEY_1": { "secret": "LTI_CONSUMER_SECRET_1" } }`.

`LTI_PERSON_SOURCED_ID_FIELD`: LTI launch field containing the user's SIS ID (default: `lis_person_sourcedid`). Useful for retrieving SIS ID from custom LTI launch fields if `lis_person_sourcedid` is not available.

`LTI_EMAIL_FIELD`: LTI launch field containing the user's email address (default: `lis_person_contact_email_primary`). Useful for retrieving email from custom LTI launch fields if `lis_person_contact_email_primary` is not available.

`LTI_EMAIL_FIELD`: LTI launch field containing the user's email address (default: `lis_person_contact_email_primary`).

`LTI_CANVAS_COURSE_ID_FIELD`: LTI launch field containing the course's canvas id (default: `custom_canvas_course_id`).

# Docker commands for initialing the app for development
1. Build the application:
`docker-compose build`
2. Run the application in a detached mode: `docker-compose up -d`
3. Place all of your secrets in a directory and copy it into the docker with
(If your secrets are in ~/secrets use this)
`docker cp ~/secrets student_dashboard:/secrets`
4. Initialize the MySQL database tables: `docker exec -it student_dashboard ./manage.py migrate`

# Docker commands for running app

Start the app

    `docker-compose up -d`

Stop the app

    `docker-compose stop`

Tear down the app completely

    `docker-compose down`

If you have problems you can connect direct into a specific container with the command

    `docker-compose run web /bin/bash
    
# Populate initial demo terms and courses

Before adding adding initial terms and courses, ensure that the `CANVAS_DATA_ID_INCREMENT` environment variable is set correctly

    `docker exec -it student_dashboard bash ./demo_init.sh`

# Create a super user to test login.

On the both local dev and remote the users are stored in the local database. However on local the users have to be created via the command line, on Openshift they are created either manually in the database or when logged in via Shibboleth.

# Localhost (Dev) process

The password will be displayed to the scree unless you specify it with --password. You can run this multiple times to change a password but you need to delete/modify super users via the Admin login (appears when logged in as admin). You can also add new users in there.

`docker exec -it student_dashboard python manage.py createuser --superuser --username=root --email=root@example.edu`

You can create regular users to test with without the superuser flag via the command line without using the --superuser.

`docker exec -it student_dashboard python manage.py createuser --username=student --email=student@example.edu`

Note: You can also make a user a "super user" by connecting to the database, editing the record in auth_user and setting is_staff=1 and is_superuser=1.

# Openshift process

You should login via Shibboleth into the application. Once you do that for the first admin you'll have to go into the database auth_user table and change is_staff and is_superuser to both be true. After doing this you can change future users with any admin via the GUI.

## Load user, file, file access data into database
Users and files are loaded now with the cron job. This is run on a separate pod in Openshift when the environment variable `IS_CRON_POD=true`.

Crons are configured in this project with django-cron. Django-cron is executed whenever `python manage.py runcrons` is run but it is limited via a few environment variables.

The installation notes recommends that you have a Unix crontab scheduled to run every 5 minutes to run this command. https://django-cron.readthedocs.io/en/latest/installation.html

This is configured with these values
# (Django Cron) Run only at 2AM
RUN_AT_TIMES=2:00

# (Unix Cron) - Run every 5 minutes
CRONTAB_SCHEDULE=*/5 * * * * 

See the .env.sample for more information.
=======

For local testing, make sure your secrets are added and your VPN is active. Then run this command on a running container to execute the cronjob

`docker exec -it student_dashboard /bin/bash -c "python manage.py migrate django_cron && python manage.py runcrons --force"`

After about 30-60 seconds the crons should all run and you should have data! In the admin interface there is a table where you can check the status of the cron job runs.

## Query the MySQL database within the container:
`docker exec -t -i student_dashboard_mysql /bin/bash`
1. login as `mysql -u <user> -p`
2. `use student_dashboard`

    The MySQL container is exposed on port 5306. You can connect to it from your localhost.

## Clean outdated docker images
The docker artifacts will take up more disk spaces as time goes on, you can clean up docker containers, networks images and optionally volumes using the command below.

Remove the --volumes to leave volumes without at least one container associated. This will not remove anything running.

This will remove everything! (images, containers, volumes)
`docker system prune -a --volumes`

*Docker stores MySQL data locally in the directory `.data`. If you want to fully clean you'll have to remove this folder.*

## Testing tips!

1. Connect to the docker and edit some files!

    `docker exec -it student_dashboard /bin/bash`

    then install a text editor like vim
    `apt-get -y install vim`

Then you can edit your files! (Probably in /code/dashboard)

2. Restart the gunicorn to read the configuration. This is useful to avoid a redeploy.

    `docker exec student_dashboard pkill -HUP gunicorn`

3. The django-debug-toolbar is available for debugging. For this to be displayed.
  - The environment needs to be DEBUG (set DJANGO_DEBUG=true in your .env)
  - You have to be authenticated and a "super user" account. See step #1
  - The method that controls this access is in show_debug_toolbar(request):
  - Configuration of the panels is in DEBUG_TOOLBAR_PANELS as described on https://django-debug-toolbar.readthedocs.io/en/latest/configuration.html#debug-toolbar-panels

4. VsCode is supported via PTVSD for debugging the code running in Docker. See this information here for details https://code.visualstudio.com/docs/python/debugging#_remote-debugging

    A few variables are available to be defined in the .env file to enable this but minimally you have to set PTVSD_ENABLE=True. Currently docker-compose.yml opens 2 ports that can be used current, 3000 and 3001. If you need more you can open them. You can configure these with other variables. See the .env.sample for examples.

    If you want to connect to the cron job you'll have to use a different port as Django uses 3000 by default and also wait for attach.

    Set your breakpoints then run this command in the docker instance! Then connect to the cron configuration. The job will start when you attach the debugger.
    `PTVSD_WAIT_FOR_ATTACH=True PTVSD_ENABLE=TRUE PTVSD_REMOTE_PORT=3001 ./manage-ptvd.py runcrons --force`

## License check

MyLA is licenced under Apache v2.0. There is a file myla_licence_compat.ini that can be used with [Python Licence Check](https://github.com/dhatim/python-license-check) to check any new dependencies and their licences.
