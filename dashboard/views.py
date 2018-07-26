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

logger.info("host" + db_host);
##logger.info("port" + db_port);
logger.info("user" + db_user);
logger.info("password" + db_password);
logger.info("database" + db_name);



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

def file_access(request):
    # you must create a Cursor object. It will let
    #  you execute all the queries you need
    cur = conn.cursor()

    # Use all the SQL you like
    cur.execute(
        "SELECT FILE_ID, NAME, COUNT FROM FILE, (SELECT FILE_ID, COUNT(*) AS COUNT FROM FILE_ACCESS GROUP BY FILE_ID) AS FILE_COUNT WHERE FILE.ID = FILE_COUNT.FILE_ID order by count desc")
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