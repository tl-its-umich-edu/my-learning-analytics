#!/bin/bash

# Start Gunicorn processes
echo Starting Gunicorn.
exec gunicorn dashboard.wsgi:application \
    --bind 0.0.0.0:5000 \
    --workers 3
