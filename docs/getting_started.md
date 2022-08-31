[Back to README](../README.md)

## Getting Started

These instructions will get a copy of MyLA up and running on your local machine with anonymized/fake student data.

### Prerequisites

To follow the instructions below, you will at minimum need the following:
1. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**.
1. **[Git](https://git-scm.com/downloads)**.

### Installation and Setup

1. Clone this repo.
    ```
    git clone https://github.com/tl-its-umich-edu/my-learning-analytics.git
    ```

1. Then navigate into the repo.
    ```
    cd my-learning-analytics
    ```

1. Create a directory in your home directory called `mylasecrets`. This directory is mapped by `docker-compose.yml` into the container as `/secrets/`.
    ```
    mkdir ~/mylasecrets
    ```

1. Copy the `config/env_sample.hjson` file into `mylasecrets` as `env.hjson`.
    ```
    cp config/env_sample.hjson ~/mylasecrets/env.hjson
    ```

1. Copy the `config/cron.hjson` file into `mylasecrets`.
    ```
    cp config/cron.hjson ~/mylasecrets/cron.hjson
    ```

1. Examine the `env.hjson` file. You may need to change some of the configuration values for different environments,
e.g. localhost vs. a production deployment. There are comments to help the configuration.
See [Configuration](configuration.md) for some additional info.

    *Note*: You may also optionally place the json settings directly into the `ENV_JSON` environment variable
    if your deployment environment doesn't easily support mounting the `env.hjson` file into container.
    When using `ENV_JSON` put the entire contents of `env.hjson` into it as single line string.

1. Copy the `.env.sample` file as `.env`. 
    ```
    cp .env.sample .env
    ```

1. Examine the `.env` file. It has the suggested default environment variable settings,
mostly just MySQL information as well as locations of other configuration files.

1. Start the Docker build process (this will take some time).
    ```
    docker compose build
    ```

1. Start up the web servers and database containers.
    ```
    docker compose up
    ```

    Note: Use `docker compose down` and `^C` at any time to stop and unstage the running containers.

1. Download the latest SQL file from [this Google Drive link](https://drive.google.com/drive/u/0/folders/1Pj7roNjRPGyumKKal8-h5E6ukUiXTDI9), and move it into the repository.

1. Load the database with data.
    ```
    docker exec -i student_dashboard_mysql mysql \
        -u student_dashboard_user \
        --password=student_dashboard_pw student_dashboard \
        < {name of sql file}
    ```

#### Logging in as admininstrator

1. Navigate to http://localhost:5001/ and log in as:
    ```
    username: root
    password: root
    ```

As you are now logged in as `root`, there are no courses listed.
To view a course and the visualizations as an admin, do the following:

1. Go to the Django admin panel by clicking the avatar in the top right, then clicking "Admin",
or navigate to http://localhost:5001/admin.

2. Click on "Courses" under "Dashboard" in the right-hand panel.

3. Click on one of the "Link" links in the "Course Link" column for one of the three courses.

#### Logging in as a student

1. Click on the top-right circle, then click `Logout`.

1. Connect to the MySQL database.
    ```
    Host: 127.0.0.1
    Username: student_dashboard_user
    Password: student_dashboard_pw
    Database: student_dashboard
    Port: 5306
    ```
    
1. Pick a student `sis_name` from the `user` table to be used in the next step.

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
