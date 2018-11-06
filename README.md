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

## Docker commands for deploying the app
1. Tear down running application and db instances:
`docker-compose down`
2. Build the application:
`docker-compose build`
3. Run the application in a detached mode: `docker-compose up -d`
4. Place all of your secrets in a directory and copy it into the docker with
(If your secrets are in ~/secrets use this)
`docker cp ~/secrets student_dashboard:/secrets`
5. Initialize the MySQL database by loading the users and files on the next step. You'll need to be on VPN for this to work.

## Load user, file, file access data into database (Local)
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

## Testing tips!

1. Create a super user to test login. Run this command below. The password will be printed unless you specify it with --password. You can run this multiple times to change a password but you need to delete/modify super users via the Admin login (appears when logged in as admin). You can also add new users in there.

`docker exec -it student_dashboard python manage.py createuser --superuser --username=root --email=root@example.edu`

You can create regular users to test with without the superuser flag via the command line without using the --superuser.

`docker exec -it student_dashboard python manage.py createuser --username=student --email=student@example.edu`

Note: You can also make a user a "super user" by connecting to the database, editing the record in auth_user and setting is_staff=1 and is_superuser=1.

2. Connect to the docker and edit some files!

`docker exec -it student_dashboard /bin/bash`
then install a text editor like vim
`apt-get -y install vim`

Then you can edit your files! (Probably in /dashboard/dashboard)

3. Restart the gunicorn to read the configuration. This is useful to avoid a redeploy.

`docker exec student_dashboard pkill -HUP gunicorn`

4. The django-debug-toolbar is available for debugging. For this to be displayed.
  - The environment needs to be DEBUG (set DJANGO_DEBUG=true in your .env)
  - You have to be authenticated and a "super user" account. See step #1
  - The method that controls this access is in show_debug_toolbar(request):
  - Configuration of the panels is in DEBUG_TOOLBAR_PANELS as described on https://django-debug-toolbar.readthedocs.io/en/latest/configuration.html#debug-toolbar-panels
