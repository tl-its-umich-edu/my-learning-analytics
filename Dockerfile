# FROM directive instructing base image to build upon
FROM amancevice/pandas:0.23.0-python3-alpine

COPY requirements.txt /

RUN apk --no-cache add --virtual build-dependencies postgresql-dev python3-dev build-base gcc libc-dev libffi-dev mariadb-dev  
RUN python3 -m pip install -r /requirements.txt 
RUN rm -rf .cache/pip 
RUN apk --no-cache add --virtual runtime-dependencies bash git wget nodejs-npm mariadb-client-libs postgresql-client xmlsec-dev 
RUN apk del build-dependencies

COPY . /dashboard/
WORKDIR /dashboard/

#https://github.com/jwilder/dockerize
ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

# COPY startup script into known file location in container
COPY start.sh /start.sh

# EXPOSE port 8000 to allow communication to/from server
EXPOSE 5000

RUN npm install -g bower
RUN bower install --allow-root

COPY manage.py /manage.py

COPY data/* /data/

RUN echo yes | python3 manage.py collectstatic

COPY mysql/init.sql /docker-entrypoint-initdb.d

CMD ["/start.sh"]
# done!
