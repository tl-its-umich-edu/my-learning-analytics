from django.shortcuts import render_to_response
from django.http import HttpResponse

import os
import numpy as np

import random
from datetime import datetime, timedelta
import time
import nvd3
import MySQLdb
import json
import collections
import logging
import csv

import pandas as pd
from pandas.io import sql
#import MySQLdb

import pandas as pd
#from sqlalchemy import create_engine
#import pymysql
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

# Todo the framework needs to remember the course
CANVAS_COURSE_ID =os.environ.get('CANVAS_COURSE_IDS', '')
UDW_ID_PREFIX = "17700000000"

# TODO: need to put this into env.sample file
# strings for construct file download url
CANVAS_FILE_PREFIX = os.environ.get('CANVAS_FILE_PREFIX', 'https://umich.instructure.com/files/')
CANVAS_FILE_POSTFIX=os.environ.get('CANVAS_FILE_POSTFIX', '/download?download_frd=1')
CANVAS_FILE_ID_NAME_SEPARATOR = "|"

UDW_COURSE_ID = UDW_ID_PREFIX + CANVAS_COURSE_ID

# string for no grade
NO_GRADE_STRING = "NO_GRADE"


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

def gpa_map(grade):
    if grade is None:
        return NO_GRADE_STRING;

    # convert to float
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

    # Use all the SQL you like
    sqlString = "SELECT a.FILE_ID as FILE_ID, f.NAME as files, u.CURRENT_GRADE as current_grade, CEIL(HOUR(TIMEDIFF(a.ACCESS_TIME, t.START_DATE))/(24*7)) as week " \
                "FROM FILE f, FILE_ACCESS a, USER u, COURSE c, ACADEMIC_TERMS t " \
                "WHERE a.FILE_ID =f.ID " \
                "and a.USER_ID = u.ID " \
                "and f.COURSE_ID = c.ID " \
                "and c.TERM_ID = t.TERM_ID"
    df = pd.read_sql(sqlString, conn)
    logger.debug(df.dtypes)
    logger.debug(df.describe())

    # map point grade to letter grade
    df['grade'] = df['current_grade'].map(gpa_map)
    logger.debug(df.dtypes)

    df['interactions'] = df.groupby(['FILE_ID','files', 'week', 'grade'])['FILE_ID'].transform('count')
    df.drop_duplicates(inplace=True)
    logger.debug(df.dtypes)
    logger.debug(df.describe())


    # now insert person's own viewing records: what files the user has viewed, and the last access timestamp
    selfSqlString = "select a.FILE_ID as FILE_ID, count(*) as SELF_ACCESS_COUNT, max(a.ACCESS_TIME) as SELF_ACCESS_LAST_TIME " \
                    "from FILE_ACCESS a, USER u " \
                    "where a.USER_ID = u.id " \
                    "and u.SIS_NAME=%(current_user)s " \
                    "group by a.FILE_ID;"
    logger.debug(selfSqlString)
    selfDf= pd.read_sql(selfSqlString, conn, params={"current_user":current_user})
    logger.debug(selfDf.dtypes)
    logger.debug(selfDf.describe())
    df = df.join(selfDf.set_index('FILE_ID'), on='FILE_ID')
    logger.debug(df.describe())

    return HttpResponse(df.to_json(orient='records'))

# show percentage of users who read the file within prior n weeks
def file_access_within_week(request):

    # environment settings:
    pd.set_option('display.max_column',None)
    pd.set_option('display.max_rows',None)
    pd.set_option('display.max_seq_items',None)
    pd.set_option('display.max_colwidth', 500)
    pd.set_option('expand_frame_repr', True)

    # read from request param
    week_num_start = int(request.GET.get('week_num_start','1'))
    week_num_end = int(request.GET.get('week_num_end','0'))
    grade = request.GET.get('grade','all')

    # get total number of student within the course_id
    total_number_student_sql = "select count(*) from USER where COURSE_ID = %(course_id)s"
    total_number_student_df = pd.read_sql(total_number_student_sql, conn, params={"course_id": UDW_COURSE_ID})
    total_number_student = total_number_student_df.iloc[0,0]
    logger.info("total student=" + str(total_number_student))

    # get time range based on week number passed in via request

    today = datetime.now().date()
    start = today - timedelta(days=((week_num_start - 1) * 7 + today.weekday()))
    end = today - timedelta(days=((week_num_end-1) * 7 + today.weekday()))

    sqlString = "SELECT a.FILE_ID as file_id, f.NAME as file_name, u.CURRENT_GRADE as current_grade, a.user_ID as user_id " \
                "FROM FILE f, FILE_ACCESS a, USER u, COURSE c, ACADEMIC_TERMS t  " \
                "WHERE a.FILE_ID =f.ID and a.USER_ID = u.ID  " \
                "and f.COURSE_ID = c.ID and c.TERM_ID = t.TERM_ID " \
                "and a.ACCESS_TIME > %(start_time)s " \
                "and a.ACCESS_TIME < %(end_time)s "
    startTimeString = start.strftime('%Y%m%d') + "000000"
    endTimeString = end.strftime('%Y%m%d') + "000000"
    logger.info(sqlString);
    logger.info("start time=" + startTimeString + " end_time=" + endTimeString);
    df = pd.read_sql(sqlString, conn, params={"start_time": startTimeString,"end_time": endTimeString})

    # return if there is no data during this interval
    if (df.empty):
        return HttpResponse("no data")

    # group by file_id, and file_name
    # reformat for output
    df['file_id_name'] = df['file_id'].str.cat(df['file_name'], sep=';')

    df=df.drop(['file_id', 'file_name'], axis=1)
    df.set_index(['file_id_name'])
    # drop file records when the file has been accessed multiple times by one user
    df.drop_duplicates(inplace=True)

    # map point grade to letter grade
    df['grade'] = df['current_grade'].map(gpa_map)
    # calculate the percentage
    df['percent'] = round(df.groupby(['file_id_name', 'grade'])['file_id_name'].transform('count')/total_number_student, 2)
    df=df.drop(['current_grade', 'user_id'], axis=1)
    # now only keep the file access stats by grade level
    df.drop_duplicates(inplace=True)

    file_id_name=df["file_id_name"].unique()

    #df.reset_index(inplace=True)

    # zero filled dataframe with file name as row name, and grade as column name
    output_df=pd.DataFrame(0.0, index=file_id_name, columns=['A','B','C','D','F', NO_GRADE_STRING])
    output_df=output_df.rename_axis('file_id_name')

    logger.debug(output_df)

    for index, row in df.iterrows():
        # set value
        output_df.at[row['file_id_name'], row['grade']] = row['percent']
    output_df.reset_index(inplace=True)

    # now insert person's own viewing records: what files the user has viewed, and the last access timestamp
    selfSqlString = "select f.ID + ';' + f.NAME as file_id_name, count(*) as self_access_count, max(a.ACCESS_TIME) as self_access_last_time " \
                    "from FILE_ACCESS a, USER u, FILE f " \
                    "where a.USER_ID = u.id " \
                    "and a.FILE_ID = f.ID " \
                    "and u.SIS_NAME=%(current_user)s " \
                    "group by f.ID + ';' + f.NAME;"
    logger.info(selfSqlString)
    logger.info("current_user=" + current_user)

    selfDf= pd.read_sql(selfSqlString, conn, params={"current_user":current_user})
    output_df = output_df.join(selfDf.set_index('file_id_name'), on='file_id_name', how='left')
    output_df["total_count"] = output_df.apply(lambda row: row.A + row.B+row.C+row.D+row.F+row.NO_GRADE, axis=1)

    if (grade != "all"):
        # drop all other grades
        grades = ['A', 'B', 'C', 'D', 'F', NO_GRADE_STRING]
        for i_grade in grades:
            if (i_grade!=grade):
                output_df["total_count"] = output_df["total_count"] - output_df[i_grade]
                output_df=output_df.drop([i_grade], axis=1)

    # only keep rows where total_count > 0
    output_df = output_df[output_df.total_count > 0]

    # time 100 to show the percentage
    output_df["total_count"] = output_df["total_count"] * 100
    # round all numbers to one decimal point
    output_df = output_df.round(1)

    output_df.fillna(0, inplace=True) #replace null value with 0

    output_df['file_id_part'], output_df['file_name_part'] = output_df['file_id_name'].str.split(';', 1).str
    output_df['file_name'] = output_df.apply(lambda row: CANVAS_FILE_PREFIX + row.file_id_part + CANVAS_FILE_POSTFIX + CANVAS_FILE_ID_NAME_SEPARATOR + row.file_name_part, axis=1)
    output_df.drop(columns=['file_id_part', 'file_name_part', 'file_id_name'], inplace=True)
    logger.debug(output_df.to_json(orient='records'))

    return HttpResponse(output_df.to_json(orient='records'))

def grade_distribution(request):
    logger.info(grade_distribution.__name__)

    # Later this could be coming from a table specific to the course
    bins = [0, 50, 65, 78, 89, 100]
    labels = ['F', 'D', 'C', 'B', 'A']

    grade_score_sql = "Select CURRENT_GRADE, FINAL_GRADE FROM USER where COURSE_ID=%(course_id)s"
    df = pd.read_sql(grade_score_sql, conn, params={'course_id': UDW_COURSE_ID})
    number_of_students = df.shape[0]
    average_grade = df['CURRENT_GRADE'].astype(float).mean().round(2)
    standard_deviation = df['CURRENT_GRADE'].astype(float).std().round(2)
    # Round half to even
    df['rounded_score'] = df['CURRENT_GRADE'].astype(float).map(lambda x: int(x / 2) * 2)
    df_grade = df.groupby(['rounded_score'])[["rounded_score"]].count()
    df_grade.columns = [['count']]
    df_grade.reset_index(inplace=True)
    df_grade.columns = ['score', 'count']
    df_grade['grade'] = pd.cut(df_grade['score'].astype(float), bins=bins, labels=labels)
    user_score, rounded_score=get_current_user_score()
    df_grade['my_score'] = user_score
    df_grade['my_score_actual'] = rounded_score
    df_grade['tot_students'] = number_of_students
    df_grade['grade_stdev'] = standard_deviation
    df_grade['grade_avg'] = average_grade
    return HttpResponse(df_grade.to_json(orient='records'))


def assignment_view(request):
    logger.info(assignment_view.__name__)

    percent_selection = float(request.GET.get('percent','0.0'))
    logger.info("selection from assignment view",percent_selection)
    sql = "select assignment_id,local_graded_date as graded_date,score,name,local_date as due_date,points_possible,group_points,weight from (" \
          "(select assignment_id,local_graded_date,score from"\
          "(select id from USER where sis_name = %(current_user)s ) as u join"\
          "(select user_id,assignment_id,local_graded_date,score from SUBMISSION) as sub on sub.user_id=u.id) as rock join"\
          "(select assign_id,name,local_date,points_possible,group_points,weight from"\
          "(select id as assign_id,assignment_group_id, local_date,name,points_possible from ASSIGNMENT where course_id = %(course_id)s) as a join"\
          "(select id,group_points, weight from ASSIGNMENT_GROUPS) as ag on ag.id=a.assignment_group_id) as bottom on rock.assignment_id = bottom.assign_id)"
    df = pd.read_sql(sql,conn,params={"current_user": current_user,'course_id': UDW_COURSE_ID},parse_dates={'due_date': '%Y-%m-%d','graded_date':'%m/%d/%Y'})
    df['due_date'] = pd.to_datetime(df['due_date'],unit='ms')
    df['graded_date'] = pd.to_datetime(df['graded_date'],unit='ms')
    df[['points_possible', 'group_points','weight']] = df[['points_possible', 'group_points','weight']].astype(float)
    df['towards_final_grade'] = round((df['points_possible']/df['group_points'])*df['weight'],2)

    df['calender_week']=df['due_date'].dt.week
    min = df['calender_week'].min()
    max =  df['calender_week'].max()
    week_list = [x for x in range(min,max+1)]
    df['week']=df['calender_week'].apply(lambda x: week_list.index(x)+1)
    df.sort_values(by='due_date', inplace = True)
    df['graded']=df['graded_date'].notnull()
    df['due_date_mod'] =df['due_date'].astype(str).apply(lambda x:x.split()[0])
    df.drop(columns=['assignment_id','due_date','graded_date'], inplace=True)
    df2 = df[df['towards_final_grade']>=percent_selection]
    df2.reset_index(inplace=True)
    df2.drop(columns=['index'],inplace=True)

    grouped = df2.groupby(['week','due_date_mod'])
    assignment_list=[]
    for name, group in grouped:
        temp_dict={}
        group.drop(['week', 'due_date_mod'], axis=1,inplace = True)
        temp_dict['week']=name[0]
        temp_dict['due_date']=name[1]
        temp_dict['assign']=json.loads(group.to_json(orient='records'))
        assignment_list.append(temp_dict)

    week_list=[]
    for item in assignment_list:
        week_list.append(item['week'])
    weeks = set(week_list)
    full = []
    for week in weeks:
        data = {}
        data["week"]=np.uint64(week).item()
        dd_items = data["due_date_items"]=[]
        for item in assignment_list:
            assignment_due_date_grp={}
            if item['week']==week:
                assignment_due_date_grp['due_date']=item['due_date']
                assignment_due_date_grp['assignment_items']=item['assign']
                dd_items.append(assignment_due_date_grp)
        full.append(data)
    return HttpResponse(json.dumps(full), content_type='application/json')





def get_current_user_score():
    logger.info(get_current_user_score.__name__)
    user_score_sql= "select * from USER where SIS_NAME = %(current_user)s and COURSE_ID=%(course_id)s"
    df = pd.read_sql(user_score_sql, conn, params={"current_user": current_user,'course_id': UDW_COURSE_ID})
    df['rounded_score'] = df['CURRENT_GRADE'].astype(float).map(lambda x: int(x / 2) * 2)
    df.to_json('user.json',orient='records')
    # iloc is used to return single value(as there is single record) otherwise return a Series
    user_score = df['CURRENT_GRADE'].iloc[0]
    rounded_score = df['rounded_score'].iloc[0]
    return user_score,rounded_score

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