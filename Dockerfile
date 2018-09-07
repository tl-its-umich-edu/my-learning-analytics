# FROM directive instructing base image to build upon
FROM python:3.5

RUN pip install --upgrade pip
COPY requirements.txt /requirements.txt
RUN pip install -r /requirements.txt
#FROM python:2-onbuild
RUN apt-get update && apt-get install -y curl --no-install-recommends

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update && apt-get install -y yarn python3-dev xmlsec1
#libmysqlclient-dev
RUN apt-get clean -y

#https://github.com/jwilder/dockerize
ENV DOCKERIZE_VERSION v0.6.1
RUN curl -sLO "https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz" \
    && tar -C /usr/local/bin -xzvf "dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz" \
    && rm "dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz"

# COPY startup script into known file location in container
COPY start.sh /start.sh

# EXPOSE port 8000 to allow communication to/from server
EXPOSE 5000
WORKDIR /dashboard/
COPY . /dashboard/

RUN yarn install

# This is needed to clean up the examples files as these cause collectstatic to fail (and take up extra space)
RUN find /usr/lib/node_modules /dashboard/node_modules -type d -name "examples" -print0 | xargs -0 rm -rf

COPY manage.py /manage.py

COPY data/* /data/

RUN echo yes | python manage.py collectstatic

COPY mysql/init.sql /docker-entrypoint-initdb.d

CMD ["/start.sh"]
# done!
