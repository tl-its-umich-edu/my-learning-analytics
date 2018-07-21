from django.shortcuts import render_to_response
from django.http import HttpResponse

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

logger = logging.getLogger(__name__)

def home(request):
    """
    home page
    """
    return render_to_response('home.html')

def files(request):
    return render_to_response("files.html")

def file_access(request):
    conn = MySQLdb.connect (host = 'student-dashboard-django_mysql_1',
                            port = 3306,
                            user = 'root',  # mysql root
                            passwd ='root',  # mysql root password
                            db = 'student_dashboard')
    # you must create a Cursor object. It will let
    #  you execute all the queries you need
    cur = conn.cursor()

    # Use all the SQL you like
    cur.execute('SELECT FILE_ID, count(*) as COUNT FROM FILE_ACCESS group by FILE_ID')
    data = cur.fetchall()

    #Converting data into json
    file_access_list = []
    for row in data :
        d = collections.OrderedDict()
        d['week'] = 1
        d['grade'] = 'A'
        d['files'] = row[0]
        d['interactions'] = row[1]
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

def load_file(request):
    con = MySQLdb.connect (host = 'student-dashboard-django_mysql_1',
                            port = 3306,
                            user = 'root',  # mysql root
                            passwd ='root',  # mysql root password
                            db = 'student_dashboard', autocommit="true")

    df = pd.read_csv('../data/csv/file.csv', header=0)

    engine = create_engine("mysql+pymysql://{user}:{pw}@{host}:{port}/{db}"
                       .format(user="root",
                                pw="root",
                                db="pandas",
                                host="student-dashboard-django_mysql_1",
                                port="3306"))
    df.to_sql(con=engine, name='FILE', if_exists='replace')