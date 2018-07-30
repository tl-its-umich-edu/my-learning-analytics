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

import pandas as pd
from sqlalchemy import create_engine
from pandas.io import sql
import pymysql
from django.conf import settings

logger = logging.getLogger(__name__)

db_name = settings.DATABASES['default']['NAME']
db_user = settings.DATABASES['default']['USER']
db_password = settings.DATABASES['default']['PASSWORD']
db_host = settings.DATABASES['default']['HOST']
db_port = 3306
    #int(settings.DATABASES['default']['PORT'])
db_engine = settings.DATABASES['default']['ENGINE']

#TODO: replace this with CoSign user
current_user="norrabp"

logger.info("host" + db_host)
##logger.info("port" + db_port)
logger.info("user" + db_user)
logger.info("password" + db_password)
logger.info("database" + db_name)
logger.info("current user " + current_user)


conn = MySQLdb.connect (db = db_name,  # your mysql database name
                        user = db_user, # your mysql user for the database
                        passwd = db_password, # password for user
                        host = db_host,
                        port = db_port)

def home(request):
    """
    home page
    """
    return render_to_response('home.html')

def files(request):
    return render_to_response("files.html")

def gpa_map(grade):
    grade_float = float(grade)
    if grade_float < 60:
        return 'F'
    elif grade_float < 70:
        return 'D'
    elif grade_float < 80:
        return 'C'
    elif grade_float < 90:
        return 'B'
    else:
        return 'A'

def file_access(request):
    # you must create a Cursor object. It will let
    #  you execute all the queries you need
    cur = conn.cursor()

    # Use all the SQL you like
    sqlString = "SELECT f.ID as FILE_ID, f.NAME as files, u.CURRENT_GRADE as current_grade, CEIL(HOUR(TIMEDIFF(a.ACCESS_TIME, t.START_DATE))/(24*7)) as week " \
                "FROM FILE f, FILE_ACCESS a, USER u, COURSE c, ACADEMIC_TERMS t " \
                "WHERE a.FILE_ID =f.ID " \
                "and a.USER_ID = u.ID " \
                "and a.COURSE_ID = c.ID " \
                "and c.TERM_ID = t.TERM_ID"
    df = pd.read_sql(sqlString, conn);
    logger.info(df)

    df['grade'] = df['current_grade'].map(gpa_map)

    df = df.groupby(['FILE_ID','files', 'week', 'grade']).size().reset_index(name='interactions')
    logger.info(df)

    # now insert person's own viewing records: what files the user has viewed, and the last access timestamp
    selfSqlString = "select a.FILE_ID as FILE_ID, count(*) as SELF_ACCESS_COUNT, max(a.ACCESS_TIME) as SELF_ACCESS_LAST_TIME " \
                    "from FILE_ACCESS a, USER u " \
                    "where a.USER_ID = u.id " \
                    "and u.SIS_NAME='" + current_user + "' " \
                    "group by a.FILE_ID;"
    selfDf= pd.read_sql(selfSqlString, conn);
    df = df.join(selfDf.set_index('FILE_ID'), on='FILE_ID')
    logger.info(df)

    return HttpResponse(df.to_json(orient='records'))
    ##return HttpResponse(outputString)

def grades(request):
    return render_to_response("grades.html")

def small_multiples_files_bar_chart(request):
    return render_to_response("small_multiples_files_bar_chart.html")

def load_data(request):
    ## create the database connection engine
    engine = create_engine("mysql+pymysql://{user}:{password}@{host}:{port}/{db}"
                           .format(db = db_name,  # your mysql database name
                                   user = db_user, # your mysql user for the database
                                   password = db_password, # password for user
                                   host = db_host,
                                   port = db_port))
    df_file = pd.read_csv('../data/file.csv', header=0)
    #df_file.to_sql(con=engine, name='FILE', if_exists='append')

    ## file access data
    df_file_access = pd.read_json('../data/file_access.json')
    df_file_access.rename(columns={'OBJECT_ID': 'FILE_ID', 'MEMBER_ID': 'USER_ID', 'EVENT_TIME':'ACCESS_TIME', 'GROUP_ID':'COURSE_ID'}, inplace=True)
    df_file_access.to_sql(con=engine, name='FILE_ACCESS', if_exists='append', index=False)



    return HttpResponse("finished")