# student-dashboard-django
student dashboard based on django framework
## Environment configuration
There is some environment configuration and addtional files needed for this app to run. You can put this in a file called .env for testing. 

(Sample .env)
```
DJANGO_LOG_LEVEL=DEBUG

# MySQL Configuration
MYSQL_DATABASE=student_dashboard
MYSQL_USER=student_dashboard_user
MYSQL_PASSWORD=student_dashboard_pw
MYSQL_HOST=student-dashboard-django_mysql_1
MYSQL_PORT=3306
MYSQL_ROOT_PASSWORD=student_dashboard_root_pw

# UDW configuration
UDW_ENDPOINT=
UDW_USER=
UDW_PASSWORD=
UDW_PORT=
UDW_DATABASE=

# Canvas Configuration
CANVAS_COURSE_IDS=
CANVAS_SECTION_IDS=
CANVAS_USER=

# Paths to special login credentials (uses SAML)
GOOGLE_APPLICATION_CREDENTIALS=/secrets/bq_cred.json
SAML2_FILES_BASE=/secrets/

# Base for Django to your accounts path
DJANGO_SAML2_URL_BASE=http://localhost:5001/accounts/

# ACS Redirect
DJANGO_ACS_DEFAULT_REDIRECT=http://localhost:5001/

# Login Redirect
LOGIN_REDIRECT_URL=http://localhost:5001/
```

The bq_cred.json is service account for Big Query, it neesd to be supplied and put into the secrets directory and setup in the environment.

The dashboard/saml directory needs to contain 4 files for SAML configuration. These are currently hard-coded in settings.py though the path comes from the environment SAML2_FILES_BASE.

	remote-metadata.xml 
	student-dashboard-saml.key
	student-dashboard-saml.pem


## Docker commands for deploying the app
1. Tear down running application and db instances:
`docker-compose down`
2. Build the application:
`docker-compose build`
3. Run the application in a detached mode: `docker-compose up -d`
4. Initialize the MySQL database with mysql/init.sql: `http://localhost:5001/load_data`

## Load user, file, file access data into database
Use the following URL patterns to load data into databases:
1. update_with_udw_user: load user enrollment information from Unizin Data Warehouse
2. update_with_udw_file: load file info from Unizin Data Warehouse
3. update_with_udw_access: load file access information from Canvas Live Event records hosted on Unizin Data Platform
4. update_assignment: loading assignment info in a course
5. update_groups: groups that assignment belongs has weight/point information associated with assignment group
6. submission: assignment submission information of students in the course
7. weight_consideration: load information about weights (as boolean) considered in grading of an assignment.

## Query the MySQL database within the container:
`docker exec -t -i student-dashboard-django_mysql_1 /bin/bash`
1. login as `mysql -u <user> -p`
2. `use student_dashboard`

## Clean outdated docker images
The docker images will take up more disk spaces as time goes on, you can delete those outdated docker images by using the following command:

`docker rmi $(docker images -q -f "dangling=true")`
