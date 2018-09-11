#!/bin/bash
# This builds the Dockerfile.build
# Pandas take a long time to build :)

# To release a new version bump this number
VERSION=1.0

docker build -t tlitsumichedu/student-dashboard-django-base:latest -t tlitsumichedu/student-dashboard-django-base:${VERSION} . -f Dockerfile.build
