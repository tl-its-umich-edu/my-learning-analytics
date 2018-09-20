from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib import auth
from django.db import connection as conn

import os
import numpy as np

import random
from datetime import datetime, timedelta
import math
import time
import MySQLdb
import json
import collections
import logging
import csv

from decouple import config, Csv

import pandas as pd
from pandas.io import sql
#import MySQLdb

import pandas as pd
#from sqlalchemy import create_engine
#import pymysql
from django.conf import settings

logger = logging.getLogger(__name__)

# Todo the framework needs to remember the course
CANVAS_COURSE_ID =config("CANVAS_COURSE_IDS", default="")
UDW_ID_PREFIX = "17700000000"

# strings for construct file download url
CANVAS_FILE_PREFIX = config("CANVAS_FILE_PREFIX", default="")
CANVAS_FILE_POSTFIX = config("CANVAS_FILE_POSTFIX", default="")
CANVAS_FILE_ID_NAME_SEPARATOR = "|"

UDW_COURSE_ID = UDW_ID_PREFIX + CANVAS_COURSE_ID

# string for no grade
NO_GRADE_STRING = "NO_GRADE"

# how many decimal digits to keep
DECIMAL_ROUND_DIGIT = 1

def home(request):
    """
    home page
    """
    return render(request, 'home.html')

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
    elif grade_float > 90:
        return 'A'
    else:
        return NO_GRADE_STRING

def get_current_week_number(request):
    # get term start date
    # TODO: term id hardcoded now
    termSqlString = "SELECT start_date FROM academic_terms where term_id = 2"
    termDf = pd.read_sql(termSqlString, conn)
    # 2018-09-04 04:00:00
    termStartDate =termDf.iloc[0]['start_date']
    today = datetime.now().date()

    logger.info(termStartDate.date())
    logger.info(today)

    ## calculate the week number
    currentWeekNumber = math.ceil((today - termStartDate.date()).days/7) + 1

    # construct json
    data = {}
    data['currentWeekNumber'] = currentWeekNumber
    return HttpResponse(json.dumps(data))

def get_current_user_from_request(request):
    if request.user.is_authenticated:
        # get current user username
        return request.user.get_username()
    else:
        # not user not login
        return ""

# show percentage of users who read the file within prior n weeks
def file_access_within_week(request):

    current_user=get_current_user_from_request(request)
    logger.info("current_user=" + current_user)

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
    total_number_student_sql = "select count(*) from user where course_id = %(course_id)s"
    total_number_student_df = pd.read_sql(total_number_student_sql, conn, params={"course_id": UDW_COURSE_ID})
    total_number_student = total_number_student_df.iloc[0,0]
    logger.debug("total student=" + str(total_number_student))

    ## TODO: term id hardcoded now
    termSqlString = "SELECT start_date FROM academic_terms where term_id = 2"
    termDf = pd.read_sql(termSqlString, conn)
    term_start_date =termDf.iloc[0]['start_date']
    start = term_start_date + timedelta(days=((week_num_start - 1) * 7 + term_start_date.weekday()))
    end = term_start_date + timedelta(days=((week_num_end-1) * 7 + term_start_date.weekday()))


    # get time range based on week number passed in via request

    today = datetime.now().date()

    sqlString = "SELECT a.file_id as file_id, f.name as file_name, u.current_grade as current_grade, a.user_id as user_id " \
                "FROM file f, file_access a, user u, course c, academic_terms t  " \
                "WHERE a.file_id =f.ID and a.user_id = u.ID  " \
                "and f.course_id = c.id and c.term_id = t.term_id " \
                "and a.access_time > %(start_time)s " \
                "and a.access_time < %(end_time)s "
    startTimeString = start.strftime('%Y%m%d') + "000000"
    endTimeString = end.strftime('%Y%m%d') + "000000"
    logger.debug(sqlString);
    logger.debug("start time=" + startTimeString + " end_time=" + endTimeString);
    df = pd.read_sql(sqlString, conn, params={"start_time": startTimeString,"end_time": endTimeString})
    logger.debug(df);

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
    output_df=pd.DataFrame(0.0, index=file_id_name, columns=['A','B','C','D','F', 'NO_GRADE'])
    output_df=output_df.rename_axis('file_id_name')

    for index, row in df.iterrows():
        # set value
        output_df.at[row['file_id_name'], row['grade']] = row['percent']
    output_df.reset_index(inplace=True)

    # now insert person's own viewing records: what files the user has viewed, and the last access timestamp
    # now insert person's own viewing records: what files the user has viewed, and the last access timestamp
    selfSqlString = "select CONCAT(f.id, ';', f.name) as file_id_name, count(*) as self_access_count, max(a.access_time) as self_access_last_time " \
                    "from file_access a, user u, file f " \
                    "where a.user_id = u.id " \
                    "and a.file_id = f.ID " \
                    "and u.sis_name=%(current_user)s " \
                    "group by CONCAT(f.id, ';', f.name)";
    logger.debug(selfSqlString)
    logger.debug("current_user=" + current_user)

    selfDf= pd.read_sql(selfSqlString, conn, params={"current_user":current_user})

    output_df = output_df.join(selfDf.set_index('file_id_name'), on='file_id_name', how='left')
    output_df["total_count"] = output_df.apply(lambda row: row.A + row.B+row.C+row.D+row.F+row.NO_GRADE, axis=1)

    if (grade != "all"):
        # drop all other grades
        grades = ['A', 'B', 'C', 'D', 'F', NO_GRADE_STRING]
        for i_grade in grades:
            if (i_grade==grade):
                output_df["total_count"] = output_df[i_grade]
            else:
                output_df=output_df.drop([i_grade], axis=1)

    # only keep rows where total_count > 0
    output_df = output_df[output_df.total_count > 0]

    # time 100 to show the percentage
    output_df["total_count"] = output_df["total_count"] * 100
    # round all numbers to one decimal point
    output_df = output_df.round(DECIMAL_ROUND_DIGIT)

    output_df.fillna(0, inplace=True) #replace null value with 0

    output_df['file_id_part'], output_df['file_name_part'] = output_df['file_id_name'].str.split(';', 1).str
    output_df['file_name'] = output_df.apply(lambda row: CANVAS_FILE_PREFIX + row.file_id_part + CANVAS_FILE_POSTFIX + CANVAS_FILE_ID_NAME_SEPARATOR + row.file_name_part, axis=1)
    output_df.drop(columns=['file_id_part', 'file_name_part', 'file_id_name'], inplace=True)
    logger.debug(output_df.to_json(orient='records'))

    return HttpResponse(output_df.to_json(orient='records'))

def grade_distribution(request):
    logger.info(grade_distribution.__name__)

    current_user = get_current_user_from_request(request)

    # Later this could be coming from a table specific to the course
    bins = [0, 50, 65, 78, 89, 100]
    labels = ['F', 'D', 'C', 'B', 'A']

    grade_score_sql = "Select current_grade, final_grade FROM user where course_id=%(course_id)s"
    df = pd.read_sql(grade_score_sql, conn, params={'course_id': UDW_COURSE_ID})
    number_of_students = df.shape[0]
    df = df[df['current_grade'].notnull()]
    if not df.empty:
        average_grade = df['current_grade'].astype(float).mean().round(2)
        standard_deviation = df['current_grade'].astype(float).std().round(2)
        # Round half to even
        df['rounded_score'] = df['current_grade'].astype(float).map(lambda x: int(x / 2) * 2)
        df_grade = df.groupby(['rounded_score'])[["rounded_score"]].count()
        df_grade.columns = [['count']]
        df_grade.reset_index(inplace=True)
        df_grade.columns = ['score', 'count']
        df_grade['grade'] = pd.cut(df_grade['score'].astype(float), bins=bins, labels=labels)
        user_score, rounded_score=get_current_user_score(current_user)
        df_grade['my_score'] = rounded_score
        df_grade['my_score_actual'] = user_score
        df_grade['tot_students'] = number_of_students
        df_grade['grade_stdev'] = standard_deviation
        df_grade['grade_avg'] = average_grade
        return HttpResponse(df_grade.to_json(orient='records'))
    else: return HttpResponse(json.dumps({}), content_type='application/json')

def assignment_progress(request):
    logger.info(assignment_view.__name__)

    current_user = get_current_user_from_request(request)

    sql = "select assignment_id,local_graded_date as graded_date,score,name,assign_grp_name,local_date as due_date,points_possible,group_points,weight,drop_lowest,drop_highest  from (" \
          "(select assignment_id,local_graded_date,score from" \
          "(select id from user where sis_name = %(current_user)s ) as u join" \
          "(select user_id,assignment_id,local_graded_date,score from submission) as sub on sub.user_id=u.id) as rock join" \
          "(select assign_id,name,assign_grp_name,local_date,points_possible,group_points,weight,drop_lowest,drop_highest  from" \
          "(select id as assign_id,assignment_group_id, local_date,name,points_possible from assignment where course_id = %(course_id)s) as a join" \
          "(select id,name as assign_grp_name,group_points, weight,drop_lowest,drop_highest  from assignment_groups) as ag on ag.id=a.assignment_group_id) as bottom on rock.assignment_id = bottom.assign_id)"
    df = pd.read_sql(sql,conn,params={"current_user": current_user,'course_id': UDW_COURSE_ID},parse_dates={'due_date': '%Y-%m-%d','graded_date':'%Y-%m-%d'})
    if df.empty:
        return HttpResponse(json.dumps({}), content_type='application/json')
    df['due_date'] = pd.to_datetime(df['due_date'],unit='ms')
    df['graded_date'] = pd.to_datetime(df['graded_date'],unit='ms')
    df[['points_possible', 'group_points','weight','score']] = df[['points_possible', 'group_points','weight','score']].astype(float)
    consider_weight=False
    total_points=df['points_possible'].sum()
    def percent_calculation(consider_weight,total_points,row):
        if consider_weight:
            return round((row['points_possible']/row['group_points'])*row['weight'],2)
        else:
            return round((row['points_possible']/total_points)*100,2)
    df['towards_final_grade']=df.apply(lambda x: percent_calculation(consider_weight, total_points,x), axis=1)
    df.sort_values(by='due_date', inplace = True)
    df['graded']=df['graded_date'].notnull()
    df['due_date_mod'] =df['due_date'].astype(str).apply(lambda x:x.split()[0])
    df.drop(columns=['assignment_id','due_date','graded_date'], inplace=True)
    df = df[df['towards_final_grade']>0.0]

    def user_percent(row):
        if row['graded']==True:
            s =round((row['score']/row['points_possible'])*row['towards_final_grade'],2)
            return s
        else: return row['towards_final_grade']

    df['percent_gotten']=df.apply(user_percent,axis=1)
    df.reset_index(inplace=True)
    df.drop(columns=['index'],inplace=True)
    return HttpResponse(df.to_json(orient='records'))


def assignment_view(request):
    logger.info(assignment_view.__name__)

    current_user = get_current_user_from_request(request)

    percent_selection = float(request.GET.get('percent','0.0'))
    logger.info('selection from assignment view %s '.format(percent_selection))
    sql = "select assignment_id,local_graded_date as graded_date,score,name,local_date as due_date,points_possible,group_points,weight,drop_lowest,drop_highest from (" \
          "(select assignment_id,local_graded_date,score from"\
          "(select id from user where sis_name = %(current_user)s ) as u join"\
          "(select user_id,assignment_id,local_graded_date,score from submission) as sub on sub.user_id=u.id) as rock join"\
          "(select assign_id,name,local_date,points_possible,group_points,weight,drop_lowest,drop_highest from"\
          "(select id as assign_id,assignment_group_id, local_date,name,points_possible from assignment where course_id = %(course_id)s) as a join"\
          "(select id, group_points, weight,drop_lowest,drop_highest from assignment_groups) as ag on ag.id=a.assignment_group_id) as bottom on rock.assignment_id = bottom.assign_id)"
    df = pd.read_sql(sql,conn,params={"current_user": current_user,'course_id': UDW_COURSE_ID},parse_dates={'due_date': '%Y-%m-%d','graded_date':'%Y-%m-%d'})
    if df.empty:
        return HttpResponse(json.dumps([]), content_type='application/json')

    df['due_date'] = pd.to_datetime(df['due_date'],unit='ms')
    df['graded_date'] = pd.to_datetime(df['graded_date'],unit='ms')
    df[['points_possible', 'group_points','weight']] = df[['points_possible', 'group_points','weight']].astype(float)
    consider_weight=False
    total_points=df['points_possible'].sum()
    df['towards_final_grade']=df.apply(lambda x: percent_calculation(consider_weight, total_points,x), axis=1)
    df['calender_week']=df['due_date'].dt.week
    df['calender_week']=df['calender_week'].fillna(0).astype(int)
    min=find_min_week()
    max = df['calender_week'].max()
    week_list = [x for x in range(min,max+1)]
    df['week']=df['calender_week'].apply(lambda x: 0 if x == 0 else week_list.index(x)+1)
    df.sort_values(by='due_date', inplace = True)
    df['current_week']=df['calender_week'].apply(lambda x: find_current_week(x))
    df['graded']=df['graded_date'].notnull()
    df['due_date_mod'] =df['due_date'].astype(str).apply(lambda x:x.split()[0])
    df['due_dates']= pd.to_datetime(df['due_date_mod']).dt.strftime('%m/%d')
    df.drop(columns=['assignment_id','due_date','graded_date'], inplace=True)
    df2 = df[df['towards_final_grade']>=percent_selection]
    df2.reset_index(inplace=True)
    df2.drop(columns=['index'],inplace=True)
    grouped = df2.groupby(['week','due_dates'])

    assignment_list=[]
    for name, group in grouped:
    # name is a tuple of (week,due_date) => (1,'06/23/2018')
    # group is a dataframe based on grouping by week,due_date
        dic={}
        group.drop(['week', 'due_dates'], axis=1,inplace = True)
        dic['week']=name[0]
        dic['due_date']=name[1]
        dic['assign']=json.loads(group.to_json(orient='records'))
        assignment_list.append(dic)
    week_list=[]
    for item in assignment_list:
        week_list.append(item['week'])
    weeks = set(week_list)
    full = []
    i=1
    for week in weeks:
        data = {}
        data["week"]=np.uint64(week).item()
        data["id"]=i
        dd_items = data["due_date_items"]=[]
        for item in assignment_list:
            assignment_due_date_grp={}
            if item['week']==week:
                assignment_due_date_grp['due_date']=item['due_date']
                assignment_due_date_grp['assignment_items']=item['assign']
                dd_items.append(assignment_due_date_grp)
        full.append(data)
        i+=1
    return HttpResponse(json.dumps(full), content_type='application/json')


def percent_calculation(consider_weight,total_points,row):
    if consider_weight:
        return round((row['points_possible']/row['group_points'])*row['weight'],2)
    else:
        return round((row['points_possible']/total_points)*100,2)


def find_min_week():
    date = get_term_dates_for_course()
    year,week,dow=date.isocalendar()
    return week;


def find_current_week(row):
    current_date = datetime.now()
    year,week,dow = current_date.isocalendar() #dow = day of week
    if row == week:
        return True
    else: return False


def get_term_dates_for_course():
    logger.info(get_term_dates_for_course.__name__)
    sql = "select a.start_date from course c, academic_terms a where c.id = %(course_id)s and c.term_id=a.term_id;"
    df = pd.read_sql(sql, conn, params={"course_id": UDW_COURSE_ID}, parse_dates={'start_date': '%Y-%m-%d'})
    return df['start_date'].iloc[0]


def get_current_user_score(current_user):
    logger.info(get_current_user_score.__name__)

    user_score_sql= "select * from user where sis_name = %(current_user)s and course_id=%(course_id)s"
    df = pd.read_sql(user_score_sql, conn, params={"current_user": current_user,'course_id': UDW_COURSE_ID})
    df['rounded_score'] = df['current_grade'].astype(float).map(lambda x: int(x / 2) * 2)
    df.to_json('user.json',orient='records')
    # iloc is used to return single value(as there is single record) otherwise return a Series
    user_score = df['current_grade'].iloc[0]
    rounded_score = df['rounded_score'].iloc[0]
    return user_score,rounded_score

def logout(request):
    logger.info('User %s logging out.' % request.user.username)
    auth.logout(request)
    return redirect(settings.LOGOUT_REDIRECT_URL)