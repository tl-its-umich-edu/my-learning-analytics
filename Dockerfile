# FROM directive instructing base image to build upon
FROM tlitsumichedu/student-dashboard-django-base:1.1

# If you change any python dependencies you should create a new image in Dockerfile.build

# COPY startup script into known file location in container
COPY start.sh /start.sh

# This is needed for some local python dependencies
COPY requirements.txt /
RUN pip3 install -r /requirements.txt && rm -rf .cache/pip

# EXPOSE port 8000 to allow communication to/from server
EXPOSE 5000
WORKDIR /dashboard/
COPY . /dashboard/

RUN yarn install

# This is needed to clean up the examples files as these cause collectstatic to fail (and take up extra space)
RUN find /usr/lib/node_modules /dashboard/node_modules -type d -name "examples" -print0 | xargs -0 rm -rf

COPY manage.py /manage.py

COPY data/* /data/

# This DJANGO_SECRET_KEY is set here just so collectstatic runs with an empty key. It can be set to anything
RUN echo yes | DJANGO_SECRET_KEY="collectstatic" python3 manage.py collectstatic

COPY mysql/init.sql /docker-entrypoint-initdb.d

CMD ["/start.sh"]
# done!
