
from __future__ import print_function #python 3 support

from django.shortcuts import render_to_response
from django.http import HttpResponse

import os

import random
import datetime
import time
import nvd3
import MySQLdb
import json
import collections
import logging
import datetime
import csv

import pandas as pd
from pandas.io import sql
import MySQLdb

from sqlalchemy import create_engine
from sqlalchemy import VARCHAR
from pandas.io import sql
import pymysql
from django.conf import settings

import psycopg2

import pandas as pd
import os
import requests

from sqlalchemy import create_engine
from canvasapi import Canvas
import OpenSSL.SSL

logger = logging.getLogger(__name__)

# ## Connect to Student Dashboard's MySQL database
#
# ### Get enrolled users and files within site
db_name = settings.DATABASES['default']['NAME']
db_user = settings.DATABASES['default']['USER']
db_password = settings.DATABASES['default']['PASSWORD']
db_host = settings.DATABASES['default']['HOST']
db_port = settings.DATABASES['default']['PORT']

logger.info("host" + db_host);
##logger.info("port" + db_port);
logger.info("user" + db_user);
logger.info("password" + db_password);
logger.info("database" + db_name);

engine = create_engine("mysql+pymysql://{user}:{password}@{host}:{port}/{db}"
                       .format(db = db_name,  # your mysql database name
                               user = db_user, # your mysql user for the database
                               password = db_password, # password for user
                               host = db_host,
                               port = db_port))

# ## Connect to Unizin Data Warehouse
#
# ### Get enrolled users and files within site
UDW_ENDPOINT=settings.DATABASES['UDW']['UDW_ENDPOINT']
UDW_USER=settings.DATABASES['UDW']['UDW_USER']
UDW_PASSWORD=settings.DATABASES['UDW']['UDW_PASSWORD']
UDW_PORT=settings.DATABASES['UDW']['UDW_PORT']
UDW_DATABASE=settings.DATABASES['UDW']['UDW_DATABASE']
print(UDW_PORT)

CANVAS_COURSE_ID =os.environ.get('CANVAS_COURSE_IDS', '')
UDW_COURSE_ID = "17700000000" + CANVAS_COURSE_ID
CANVAS_SECTION_ID =os.environ.get('CANVAS_SECTION_IDS', '')
UDW_SECTION_ID = "17700000000" + CANVAS_SECTION_ID

# update FILE records from UDW
def update_with_udw_file(request):

    #select file record from UDW
    file_sql = "select canvas_id as ID, display_name as NAME, course_id as COURSE_ID from file_dim " \
               "where file_state ='available' " \
               "and course_id='"+ UDW_COURSE_ID + "'" \
               " order by canvas_id"

    # update FILE_ACCESS records
    util_function(file_sql, 'FILE')

    return HttpResponse("loaded file info")

# update FILE_ACCESS records from UDW
def update_with_udw_access(request):

    #select file record from UDW
    file_access_sql = "select rr.COURSE_ID, rr.FILE_ID, rr.ACCESS_TIME, u.global_canvas_id as USER_ID " \
                      "from (select r.course_id as COURSE_ID, " \
                      "split_part(r.url, '/', 5) as FILE_ID, " \
                      "r.timestamp as ACCESS_TIME, r.user_id AS user_id " \
                      "from requests r " \
                      "where r.course_id='" + UDW_COURSE_ID + "' " \
                      "and r.url like '/courses/" + CANVAS_COURSE_ID + "/files/%') as rr, " \
                      "user_dim u " \
                      "where rr.user_id = u.id"

    # update FILE_ACCESS records
    util_function(file_access_sql, 'FILE_ACCESS')

    return HttpResponse("loaded file access info")

# update USER records from UDW
def update_with_udw_user(request):

    # select all student registered for the course
    user_sql = "select u.name AS NAME, " \
          "p.sis_user_id AS SIS_ID, " \
          "p.unique_name AS SIS_NAME, " \
          "u.global_canvas_id AS ID, " \
          "c.current_score AS CURRENT_GRADE, " \
          "c.final_score AS FINAL_GRADE, " \
          "'"+ UDW_COURSE_ID + "' as COURSE_ID " \
          "from user_dim u, " \
          "pseudonym_dim p, " \
          "course_score_fact c, " \
          "(select e.user_id as user_id, e.id as enrollment_id from enrollment_dim e " \
          "where e.course_section_id = '" + UDW_SECTION_ID + "' " \
          "and e.type='StudentEnrollment' " \
          "and e.workflow_state='active' ) as e " \
          "where p.user_id=u.id " \
          "and u.id = e.user_id " \
          "and c.enrollment_id =  e.enrollment_id " \
          "and c.current_score is not null " \
          "and c.final_score is not null"

    # upate USER records
    util_function(user_sql, 'USER')

    return HttpResponse("loaded user info")

# the util function
def util_function(sql_string, mysql_table):

    # get UDW connection
    udw_conn = psycopg2.connect(
        host=UDW_ENDPOINT,
        user=UDW_USER,
        port=5439,#int(UDW_PORT),
        password=UDW_PASSWORD,
        dbname=UDW_DATABASE)

    df = pd.read_sql(sql_string, udw_conn)
    # close UDW connection
    udw_conn.close()

    # drop duplicates
    df.drop_duplicates(keep=False, inplace=True)

    # write to MySQL
    df.to_sql(con=engine, name=mysql_table, if_exists='append', index=False)