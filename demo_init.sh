#!/bin/bash

# Case insenstive match
shopt -s nocaseglob

# setup demo terms
./manage.py term --term_id=108 --name='SUMMER 2018' --date_start='2018-06-27 04:00:00' --date_end='2018-08-17 23:59:59'
./manage.py term --term_id=111 --name='FALL 2018' --date_start='2018-09-03 04:00:00' --date_end='2018-12-24 23:59:59'

# setup demo courses
./manage.py course --course_id=230745 --term_id=108 --name="STATS 250 SU 2018"
./manage.py course --course_id=252307 --term_id=111 --name="SI 110 001 FA 2018"
./manage.py course --course_id=245664 --term_id=111 --name="SI 664 002 FA 2018"
./manage.py course --course_id=283292 --term_id=111 --name="HMP 654 001 FA 2018"