# student-dashboard-django
student dashboard based on django framework
## Environment configuration
There is some environment configuration and addtional files needed for this app to run. You can put this in a file called .env for testing. 

Configuration:

Copy the file `.env.sample` to `.env` and fill in with the values for local testing.

On OpenShift fill these in the appropriate places.

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
4. Place all of your secrets in a directory and copy it into the docker with
`docker cp ~/secrets student_dashboard:/secrets`


4. Initialize the MySQL database with mysql/init.sql: `http://localhost:5001/load_data`

## Load user, file, file access data into database
Use the following URL patterns to load data into databases:

** For testing now just use /testloader, this has all the URL's ready to load **

1. update_with_udw_user: load user enrollment information from Unizin Data Warehouse
2. update_with_udw_file: load file info from Unizin Data Warehouse
3. update_with_udw_access: load file access information from Canvas Live Event records hosted on Unizin Data Platform
4. update_assignment: loading assignment info in a course
5. update_groups: groups that assignment belongs has weight/point information associated with assignment group
6. submission: assignment submission information of students in the course
7. weight_consideration: load information about weights (as boolean) considered in grading of an assignment.


## Query the MySQL database within the container:
`docker exec -t -i student_dashboard_mysql /bin/bash`
1. login as `mysql -u <user> -p`
2. `use student_dashboard`

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

2. Connect to the docker and edit some files!

`docker exec -it student_dashboard /bin/bash`
then install a text editor like vim
`apt-get -y install vim`

Then you can edit your files! (Probably in /dashboard/dashboard)

3. Restart the gunicorn to read the configuration. This is useful to avoid a redeploy.

`docker exec student_dashboard pkill -HUP gunicorn`
