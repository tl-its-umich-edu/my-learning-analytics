#!/bin/bash

# Start Gunicorn processes
echo Starting Gunicorn.
exec gunicorn dashboard.wsgi:application \
    --bind 0.0.0.0:5000 \
    --workers 3
if [ -f /secrets/bq_cred.json ]
then
  ln -sf /secrets/bq_cred.json /dashboard/dashboard/static/json/bq_cred.json
fi
