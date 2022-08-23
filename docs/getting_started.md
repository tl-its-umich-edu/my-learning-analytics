## Getting Started
These instructions will get a copy of MyLA up and running on your local machine with anonymized/fake student data.

### Prerequisites
1. **Install [Docker](https://www.docker.com/)**.
1. **Install [Git](https://git-scm.com/downloads)**.

### Installation and Setup
1. Clone this repo. `git clone https://github.com/tl-its-umich-edu/my-learning-analytics.git`
1. Then cd into the repo. `cd my-learning-analytics`
1. Create a directory in your home directory called "mylasecrets". `mkdir ~/mylasecrets`. This directory is mapped by docker-compose.yml into the container as /secrets/
1. Copy the config/env_sample.hjson into mylasecrets as env.hjson. `cp config/env_sample.hjson ~/mylasecrets/env.hjson`
1. Copy the config/cron.hjson file into mylasecrets. `cp config/cron.hjson ~/mylasecrets/cron.hjson`
1. Examine the `env.hjson` file, you may need to change some of the configuration values for different environments, e.g. localhost vs production deployment. There are comments to help the configuration.
1. Create a new `.env` file and copy the values from `.env.sample`, which has the suggested default environment variable settings.
1. Examine the `.env` file. It mostly just has the MySQL information as well as locations of the environment files.
1. Start the Docker build process (this will take some time). `docker-compose up -d --build`
1. Download the latest SQL file from this link: https://drive.google.com/drive/u/0/folders/1Pj7roNjRPGyumKKal8-h5E6ukUiXTDI9.
1. Load database with data. `docker exec -i student_dashboard_mysql mysql -u student_dashboard_user --password=student_dashboard_pw student_dashboard < {name of sql file}`

You may also optionally place the json settings directly into the `ENV_JSON` environment variable if your deployment environment doesn't easily support mounting the `env.hjson` file into container. When using `ENV_JSON` put the entire contents of `env.hjson` into it as single line string.

#### Logging in as admininstrator
1. Navigate to http://localhost:5001/ and log in as:
    ```
    username: root
    password: root
    ```

1. As you are now logged in as `root`, there are no courses listed. Next 3 steps will help you view a sample course.

1. Connect to MySQL database.
    ```
    Host: 127.0.0.1
    Username: student_dashboard_user
    Password: student_dashboard_pw
    Database: student_dashboard
    Port: 5306
    ```
    
1. Navigate to `course` table and select a `canvas_id` value, which will be used in the next step.

    ```mysql
    SELECT canvas_id FROM course
    ```

1. Go to http://localhost:5001/courses/***`canvas_id`*** with the `canvas_id` you found. (For example, with SQL file `myla_test_data_2019_10_16.sql` loaded, Go to http://localhost:5001/courses/235420 or http://localhost:5001/courses/362855 and view the course page as an admin.) 

1. To get to the Django admin panel, click the avatar in the top right, then click `Admin`, or go here: http://localhost:5001/admin.

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
    
1. Pick a student `sis_name` from the`user` table to be used in the next step.

    ```sql
    SELECT sis_name FROM `user` WHERE enrollment_type = 'StudentEnrollment'
    ```

    

1. Create an authorized user.
    ```sh
    docker exec -it student_dashboard python manage.py createuser --username={insert sis_name} --password={create password} --email=test@test.com
    ```
    
    Note: To make a user a superuser, edit the record in `auth_user` to set `is_staff=1` and `is_superuser=1`.
    
1. Login using the username and password created.

1. The course(s) enrolled by the student with selected `sis_name` will be displayed. Click on a course to view as the student selected in step 3.