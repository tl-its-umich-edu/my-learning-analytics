# FROM directive instructing base image to build upon
FROM python:3.5

RUN pip install --upgrade pip
COPY requirements.txt /requirements.txt
RUN pip install -r /requirements.txt
#FROM python:2-onbuild
RUN apt-get install curl
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
# RUN apt-get update
RUN apt-get install -y nodejs python-dev xmlsec1 wget
#libmysqlclient-dev
RUN apt-get clean -y

#https://github.com/jwilder/dockerize
ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

# COPY startup script into known file location in container
COPY start.sh /start.sh

# EXPOSE port 8000 to allow communication to/from server
EXPOSE 5000
WORKDIR /dashboard/
COPY . /dashboard/

RUN npm install -g bower
RUN bower install --allow-root

COPY manage.py /manage.py

COPY data/* /data/

RUN echo yes | python manage.py collectstatic

COPY mysql/init.sql /docker-entrypoint-initdb.d

CMD ["/start.sh"]
# done!
