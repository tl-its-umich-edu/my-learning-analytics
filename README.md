# student-dashboard-django
student dashboard based on django framework

## Docker commands for deploying the app
1. Tear down running application and db instances:
`docker-compose down`
2. Build the application:
`docker-compose build`
3. Run the application in a detached mode: `docker-compose up -d`
4. Initialize the MySQL database with mysql/init.sql: `http://localhost:5000/load_data`

## Load user, file, file access data into database
Use the following URL patterns to load data into databases:
1. update_with_udw_user: load user enrollment information from Unizin Data Warehouse
2. update_with_udw_file: load file info from Unizin Data Warehouse
3. update_with_udw_access: load file access information from Canvas Live Event records hosted on Unizin Data Platform

## Query the MySQL database within the container:
`docker exec -t -i student-dashboard-django_mysql_1 /bin/bash`
`mysql -u <user> -p`

## Clean outdated docker images
The docker images will take up more disk spaces as time goes on, you can delete those outdated docker images by using the following command:

`docker rmi $(docker images -q -f "dangling=true")`
