### Global build arguments for version control
# Version for MariaDB database package. LTS version is currently being preferred
ARG MARIADB_VERSION=11.8
# Named version of Debian to use
ARG DEBIAN_VERSION=bookworm
# Version of Node.js
ARG NODE_VERSION=20
# Version of Python
ARG PYTHON_VERSION=3.13

# build react components for production mode
FROM node:${NODE_VERSION}-${DEBIAN_VERSION}-slim AS node-webpack
WORKDIR /usr/src/app

# NOTE: package.json and webpack.config.js not likely to change between dev builds
COPY package.json webpack.config.js package-lock.json /usr/src/app/
RUN npm install

# NOTE: assets/ likely to change between dev builds
COPY assets /usr/src/app/assets
RUN npm run prod

# This is to find and remove symlinks that break some Docker builds.
# We need these later we'll just uncompress them
# Put them in node_modules as this directory isn't masked by docker-compose
# Also remove src and the symlinks afterward
RUN apt-get update && \
    apt-get install -y --no-install-recommends tar && \
    find node_modules -type l -print0 | tar -zcvf node_modules/all_symlinks.tgz --remove-files --null -T - && \
    rm -rf /usr/src/app/assets/src

# build node libraries for production mode
FROM node:${NODE_VERSION}-${DEBIAN_VERSION}-slim AS node-prod-deps

WORKDIR /usr/src/app
COPY --from=node-webpack /usr/src/app /usr/src/app
RUN npm prune --production && \
    # This is needed to clean up the examples files as these cause collectstatic to fail (and take up extra space)
    find node_modules -type d -name "examples" -print0 | xargs -0 rm -rf

# FROM directive instructing base image to build upon
FROM python:${PYTHON_VERSION}-slim-${DEBIAN_VERSION} AS app

# Re-declare build argument for this stage
ARG MARIADB_VERSION

# EXPOSE port 5000 to allow communication to/from server
EXPOSE 5000
WORKDIR /code

# NOTE: requirements.txt not likely to change between dev builds
COPY requirements.txt .
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential curl apt-transport-https libpq-dev netcat-traditional default-libmysqlclient-dev pkg-config jq python3-dev xmlsec1 cron git && \
    apt-get upgrade -y

# Install MariaDB from the mariadb repository rather than using Debians 
# https://mariadb.com/kb/en/mariadb-package-repository-setup-and-usage/
RUN curl -LsS https://r.mariadb.com/downloads/mariadb_repo_setup | \
    bash -s -- --mariadb-server-version=${MARIADB_VERSION} && \
    apt install -y --no-install-recommends libmariadb-dev

RUN pip install --no-cache-dir -r requirements.txt

# copy built react and node libraries for production mode
COPY --from=node-prod-deps /usr/src/app/package-lock.json package-lock.json
COPY --from=node-prod-deps /usr/src/app/webpack-stats.json webpack-stats.json
COPY --from=node-prod-deps /usr/src/app/assets assets
COPY --from=node-prod-deps /usr/src/app/node_modules node_modules

# NOTE: project files likely to change between dev builds
COPY . .

# Generate git version information
RUN /code/scripts/git_version_info.sh

# Clean up anything we don't need anymore.
# Some of these can be purged completely, some of these just remove the package
RUN apt-get purge -y git curl libcurl4 libcurl3-gnutls && \
    apt-get remove -y linux-libc-dev && \
# Keep these packages
    apt-mark manual libmariadb3 mariadb-common && \
    apt autoremove -y && \
    apt-get clean -y && \
    rm -rf /var/lib/apt/lists/*

RUN python manage.py collectstatic --verbosity 0 --noinput

# Sets the local timezone of the docker image
ARG TZ
ENV TZ ${TZ:-America/Detroit}
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

CMD ["/code/start.sh"]
# done!
