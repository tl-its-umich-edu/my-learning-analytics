version: '2'

services:

  mysql:
    image: mysql:5.7.22
    restart: always
    environment:
      - MYSQL_HOST=${MYSQL_HOST}
      - MYSQL_DATABASE=${MYSQL_DATABASE}
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_USER=${MYSQL_USER}
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
      - MYSQL_PORT=${MYSQL_PORT}

      - UDW_ENDPOINT=${UDW_ENDPOINT}
      - UDW_USER=${UDW_USER}
      - UDW_PASSWORD=${UDW_PASSWORD}
      - UDW_PORT=${UDW_PORT}
      - UDW_DATABASE=${UDW_DATABASE}
    entrypoint: ['docker-entrypoint.sh', '--default-authentication-plugin=mysql_native_password']
    ports:
      - "3306"
    volumes:
      - ./mysql:/docker-entrypoint-initdb.d/:ro
    container_name: student_dashboard_mysql
  web:
    build: .
    command: bash -c "./start.sh"
    volumes:
      - .:/code
    ports:
      - "5001:5000"
    depends_on:
      - mysql
    env_file:
      - .env
    container_name: student_dashboard
