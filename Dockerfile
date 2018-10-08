# FROM directive instructing base image to build upon
FROM python:3.6

COPY requirements.txt /requirements.txt

RUN pip install -r /requirements.txt

# Yarn is not yet in the repo, need to add it
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

# apt-utils needs to be installed separately
RUN apt-get update && \ 
    apt-get install -y --no-install-recommends nodejs yarn python3-dev xmlsec1 cron && \
    apt-get clean -y

#https://github.com/jwilder/dockerize
ENV DOCKERIZE_VERSION v0.6.1
RUN curl -sLO "https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz" \
    && tar -C /usr/local/bin -xzvf "dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz" \
    && rm "dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz"

# COPY startup script into known file location in container
COPY start.sh /start.sh

# EXPOSE port 5000 to allow communication to/from server
EXPOSE 5000
WORKDIR /dashboard/
COPY . /dashboard/

COPY manage.py /manage.py

COPY data/* /data/

# This is needed to clean up the examples files as these cause collectstatic to fail (and take up extra space)
RUN yarn install && \ 
    find /usr/lib/node_modules /dashboard/node_modules -type d -name "examples" -print0 | xargs -0 rm -rf && \
# This DJANGO_SECRET_KEY is set here just so collectstatic runs with an empty key. It can be set to anything
    echo yes | DJANGO_SECRET_KEY="collectstatic" python manage.py collectstatic --verbosity 0

# This sets up some initial MySQL tables
COPY mysql/init.sql /docker-entrypoint-initdb.d

CMD ["/start.sh"]
# done!