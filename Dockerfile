# FROM directive instructing base image to build upon
FROM python:3.5
#FROM python:2-onbuild
RUN apt-get install curl
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
# RUN apt-get update
RUN apt-get install -y nodejs libmysqlclient-dev python-dev
RUN apt-get clean -y

RUN npm install -g bower

RUN pip install gunicorn whitenoise
RUN pip install django-bower
RUN pip install django-nvd3
RUN pip install django-registration
RUN pip install djangosaml2
RUN pip install mysql-connector mysqlclient

# COPY startup script into known file location in container
COPY start.sh /start.sh

# EXPOSE port 8000 to allow communication to/from server
EXPOSE 5000
WORKDIR /dashboard/
COPY . /dashboard/

# CMD specifcies the command to execute to start the server running.
RUN npm install -g bower

RUN bower install --allow-root

COPY manage.py /manage.py
#CMD echo yes | python manage.py bower install
RUN echo yes | python manage.py collectstatic

COPY mysql/init.sql /docker-entrypoint-initdb.d

#CMD ["/start.sh"]
# done!
