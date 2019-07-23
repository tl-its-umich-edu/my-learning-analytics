# My Learning Analytics
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/0fd487531e244c0ebbfbc25e8753c484)](https://app.codacy.com/app/ITS_Teaching_And_Learning/student-dashboard-django?utm_source=github.com&utm_medium=referral&utm_content=tl-its-umich-edu/student-dashboard-django&utm_campaign=Badge_Grade_Settings)

My Learning Analytics (MyLA) is a [learning analytics](https://en.wikipedia.org/wiki/Learning_analytics) platform designed for students to view their own learning data generated in the [Canvas Learning Management System](https://www.instructure.com/canvas/?newhome=canvas). It currently has 3 views ([Files Accessed](https://sites.google.com/umich.edu/my-learning-analytics-help/home/files-accessed), [Assignment Planning](https://sites.google.com/umich.edu/my-learning-analytics-help/home/assignment-planning), and [Grade Distribution](https://sites.google.com/umich.edu/my-learning-analytics-help/home/grade-distribution)), with more views planned in the future.

## Getting Started
These instructions will get a copy of MyLA up and running on your local machine with anonymized/fake student data.

### Prerequisites
1. **Install [Docker](https://www.docker.com/)**.
1. **Install [Git](https://git-scm.com/downloads)**.
1. Create a new `.env` file and copy the values from `sample.env`, which has the suggested default environment variable settings.
1. Create a new `env.json` file under the `config` folder and copy the values from `env_sample.json`, which contains most of the suggested defaults for the application.

### Installation & Setup
1. Clone this repo. `git clone https://github.com/tl-its-umich-edu/my-learning-analytics.git`
1. Then cd into the repo. `cd my-learning-analytics`
1. Start the Docker build process (this will take some time). `docker-compose up -d --build`
1. Load database with data. `docker exec -i student_dashboard_mysql mysql -u student_dashboard_user --password=student_dashboard_pw student_dashboard < myla_test_data_07_02_19.sql` *Can we share the mysql file?*

#### Logging in as admininstrator
1. Navigate to http://localhost:5001/ and log in as:
    ```
    username: root
    password: root
    ```
1. As you are now logged in as `root`, there are no courses listed. Navigate to http://localhost:5001/courses/231768 or http://localhost:5001/courses/430174 to view a sample course as a superuser.
1. To get to the Django admin panel, click on the Avator in the top right, then click `Admin`, or go here: http://localhost:5001/admin.

#### Logging in as a student
1. Click on the top-right circle, then click `Logout`.
1. Connect to MySQL database.
    ```
    Host: 127.0.0.1
    Username: student_dashboard_user
    Password: student_dashboard_pw
    Database: student_dashboard
    Port: 5306
    ```
1. Navigate to `user` table and select a student `sis_name`, which will be used in the next step.
1. Create an authorized user. `docker exec -it student_dashboard python manage.py createuser --username={insert sis_name} --password={create password}`
    - Note: You can also make a user a superuser by connecting to the database, editing the record in `auth_user` and setting `is_staff=1` and `is_superuser=1`.
1. Login using username and password created.
1. The course(s) enrolled by the student with selected `sis_name` will be displayed. Click on a course to view as the student selected in step 3.

## Contributing to MyLA
* [Contribution Guide](CONTRIBUTING.md)

### MyLA Configuring Settings
- If you were using a prior version of MyLA, there is a utility "env_to_json.py" to help convert your configuration. Running `python env_to_json.py > config/env.json` should create your new config file from your .env file.

#### Secrets

The bq_cred.json is service account for Big Query, it needs to be supplied and put into the /secrets directory and setup in the environment.

(Openshift Only) The /secrets/saml directory needs to contain 4 files for SAML configuration. These are currently hard-coded in settings.py though the path comes from the environment SAML2_FILES_BASE.

	remote-metadata.xml
	student-dashboard-saml.key
	student-dashboard-saml.pem

#### Control course view options

View options can be controlled at the global and course level. If a view is disabled globally, it will be disabled for each course, even if previously enabled at the course level. If a view is not globally disabled, it can still be disabled at the course level.

`VIEWS_DISABLED` comma delimited list of views to disable (default empty). The expected name of the view is the same as the view's column name in the `course_view_option` table. Example value of `show_files_accessed,show_grade_distribution` will disable both the Files Accessed and Grade Distribution views.

Note that by default all views are enabled when a course is added.

##### LTI v1.1.1 Configuration

Only basic LTI launches are supported at the moment (automatic account creation and redirection to the correct course). New courses are not added nor are course view options modified.

The relative LTI launch url is `/lti/auth/` (ex: `https://example.com/lti/auth`).

Environment variables:

`STUDENT_DASHBOARD_LTI`: Set to True to enable LTI (default false).

`PYLTI_CONFIG_CONSUMERS`: JSON string of supported LTI Consumers (default none). Formated `{ "LTI_CONSUMER_KEY_1": { "secret": "LTI_CONSUMER_SECRET_1" } }`.

`LTI_PERSON_SOURCED_ID_FIELD`: LTI launch field containing the user's SIS ID (default: `lis_person_sourcedid`). Useful for retrieving SIS ID from custom LTI launch fields if `lis_person_sourcedid` is not available.

`LTI_EMAIL_FIELD`: LTI launch field containing the user's email address (default: `lis_person_contact_email_primary`). Useful for retrieving email from custom LTI launch fields if `lis_person_contact_email_primary` is not available.

`LTI_EMAIL_FIELD`: LTI launch field containing the user's email address (default: `lis_person_contact_email_primary`).

`LTI_CANVAS_COURSE_ID_FIELD`: LTI launch field containing the course's canvas id (default: `custom_canvas_course_id`).

#### Populate initial demo terms and courses

Before adding initial terms and courses, ensure that the `CANVAS_DATA_ID_INCREMENT` environment variable is set correctly

    docker exec -it student_dashboard /bin/bash ./demo_init.sh

If you have problems you can connect direct into a specific container with the command

    `docker-compose run web /bin/bash

#### Openshift process

You should login via Shibboleth into the application. Once you do that for the first admin you'll have to go into the database auth_user table and change is_staff and is_superuser to both be true. After doing this you can change future users with any admin via the GUI.

#### Load user, file, file access data into database
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

After about 30-60 seconds the crons should all run and you should have data! In the admin interface there is a table where you can check the status of the cron job runs.

## Populating Copyright information in footer
1. Since MyLA can be used by multiple institution, copyright information needs to be entitled to institutions needs.
2. Django Flatpages serves the purpose. The display of the copyright content can be controlled from the Django Admin view.
3. The url for configuring copyright info must be `/copyright/` since that is used in the `base.html` for pulling the info
[More info](https://simpleisbetterthancomplex.com/tutorial/2016/10/04/how-to-use-django-flatpages-app.html)

## License check

MyLA is licenced under Apache v2.0. There is a file myla_licence_compat.ini that can be used with [Python Licence Check](https://github.com/dhatim/python-license-check) to check any new dependencies and their licences.
