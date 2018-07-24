# student-dashboard-django
student dashboard based on django framework

## Docker commands for deploying the app
1. Tear down running application and db instances:
`docker-compose down`
2. Build the application:
`docker-compose build`
3. Run the application in a detached mode: `docker-compose up -d`
4. Initialize the MySQL database with mysql/init.sql: `http://localhost:5000/load_data`

## Query the MySQL database within the container:
`docker exec -t -i student-dashboard-django_mysql_1 /bin/bash`

`mysql -uroot -proot`
