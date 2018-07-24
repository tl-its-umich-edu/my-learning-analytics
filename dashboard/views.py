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

logger = logging.getLogger(__name__)


logger.info("host" + os.environ.get("MYSQL_HOST"));
logger.info("port" + os.environ.get("MYSQL_PORT"));
logger.info("user" + os.environ.get("MYSQL_USER"));
logger.info("password" + os.environ.get("MYSQL_PASSWORD"));
logger.info("database" + os.environ.get("MYSQL_DATABASE"));

conn = MySQLdb.connect (db = os.environ.get('MYSQL_DATABASE', 'student_dashboard'),  # your mysql database name
                        user = os.environ.get('MYSQL_USER', 'student_dashboard_user'), # your mysql user for the database
                        passwd = os.environ.get('MYSQL_PASSWORD', 'student_dashboard_password'), # password for user
                        host = os.environ.get('MYSQL_HOST', '127.0.0.1'),
                        port = int(os.environ.get('MYSQL_PORT', '3306')))

def home(request):
    """
    home page
    """
    return render_to_response('home.html')

def files(request):
    return render_to_response("files.html")

def file_access(request):
    # you must create a Cursor object. It will let
    #  you execute all the queries you need
    cur = conn.cursor()

    # Use all the SQL you like
    cur.execute(
        "SELECT FILE_ID, NAME, COUNT FROM FILE, (SELECT FILE_ID, COUNT(*) AS COUNT FROM FILE_ACCESS GROUP BY FILE_ID) AS FILE_COUNT WHERE FILE.ID = FILE_COUNT.FILE_ID order by count desc limit 5")
    data = cur.fetchall()

    #Converting data into json
    file_access_list = []
    for row in data :
        d = collections.OrderedDict()
        d['week'] = 1
        d['grade'] = 'A'
        d['files'] = row[1]
        d['interactions'] = row[2]
        #d['FILE_ID']    = row[0] #name
        #d['USER_ID']    = row[1] #lname
        #d['ACCESS_TIME']= time.strftime("%b %d %Y %H:%M:%S", time.gmtime(row[2])) #email
        #d['COURSE_ID']= row[3] #email

        file_access_list.append(d)

    return HttpResponse(json.dumps(file_access_list))
    ##return HttpResponse(outputString)

def grades(request):
    return render_to_response("grades.html")

def small_multiples_files_bar_chart(request):
    return render_to_response("small_multiples_files_bar_chart.html")

def load_data(request):
    ## create the database connection engine
    engine = create_engine("mysql+pymysql://{user}:{password}@{host}:{port}/{db}"
                           .format(host = os.environ["MYSQL_HOST"],
                                   port = int(os.environ["MYSQL_PORT"]),
                                   user = os.environ["MYSQL_USER"],
                                   password =os.environ["MYSQL_PASSWORD"],
                                   db = os.environ["MYSQL_DATABASE"]))
    df_file = pd.read_csv('../data/file.csv', header=0)
    df_file.to_sql(con=engine, name='FILE', if_exists='replace')

    ## file access data
    df_file_access = pd.read_json('../data/file_access.json')
    df_file_access.rename(columns={'OBJECT_ID': 'FILE_ID', 'MEMBER_ID': 'USER_ID', 'EVENT_TIME':'ACCESS_TIME', 'GROUP_ID':'COURSE_ID'}, inplace=True)
    df_file_access.to_sql(con=engine, name='FILE_ACCESS', if_exists='replace')

    return HttpResponse("finished")