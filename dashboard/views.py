from django.shortcuts import redirect
from django.http import HttpResponse
from django.contrib import auth
from django.db import connection as conn

import os, random, math, json, logging
from datetime import datetime, timedelta

from decouple import config, Csv

import numpy as np
import pandas as pd
from pandas.io import sql

from django.conf import settings

logger = logging.getLogger(__name__)

# strings for construct file download url
CANVAS_FILE_PREFIX = config("CANVAS_FILE_PREFIX", default="")
CANVAS_FILE_POSTFIX = config("CANVAS_FILE_POSTFIX", default="")
CANVAS_FILE_ID_NAME_SEPARATOR = "|"

# string for no grade
GRADE_A="90-100"
GRADE_B="80-89"
GRADE_C="70-79"
GRADE_LOW="low_grade"
NO_GRADE_STRING = "NO_GRADE"

# how many decimal digits to keep
DECIMAL_ROUND_DIGIT = 1

def gpa_map(grade):
    if grade is None:
        return NO_GRADE_STRING;
    # convert to float
    grade_float = float(grade)
    if grade_float >= 90:
        return GRADE_A
    elif grade_float >=80:
        return GRADE_B
    elif grade_float >=70:
        return GRADE_C
    else:
        return GRADE_LOW

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
    currentWeekNumber = math.ceil((today - termStartDate.date()).days/7)

    # construct json
    data = {}
    data['currentWeekNumber'] = currentWeekNumber
    return HttpResponse(json.dumps(data))

# show percentage of users who read the file within prior n weeks
def file_access_within_week(request, course_id=0):

    current_user=request.user.get_username()

    logger.debug("current_user=" + current_user)

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
    total_number_student_df = pd.read_sql(total_number_student_sql, conn, params={"course_id": course_id})
    total_number_student = total_number_student_df.iloc[0,0]
    logger.debug("course_id_string" + course_id + " total student=" + str(total_number_student))

    ## TODO: term id hardcoded now
    termSqlString = "SELECT start_date FROM academic_terms where term_id = 2"
    termDf = pd.read_sql(termSqlString, conn)
    term_start_date =termDf.iloc[0]['start_date']
    start = term_start_date + timedelta(days=(week_num_start * 7))
    end = term_start_date + timedelta(days=(week_num_end * 7))
    logger.debug("term_start=" + str(term_start_date) + " start=" + str(start) + " end=" + str(end))


    # get time range based on week number passed in via request

    today = datetime.now().date()

    sqlString = "SELECT a.file_id as file_id, f.name as file_name, u.current_grade as current_grade, a.user_id as user_id " \
                "FROM file f, file_access a, user u, course c, academic_terms t  " \
                "WHERE a.file_id =f.ID and a.user_id = u.ID  " \
                "and f.course_id = c.id and c.term_id = t.term_id " \
                "and a.access_time > %(start_time)s " \
                "and a.access_time < %(end_time)s " \
                "and f.course_id = %(course_id)s "
    startTimeString = start.strftime('%Y%m%d') + "000000"
    endTimeString = end.strftime('%Y%m%d') + "000000"
    logger.debug(sqlString);
    logger.debug("start time=" + startTimeString + " end_time=" + endTimeString);
    df = pd.read_sql(sqlString, conn, params={"start_time": startTimeString,"end_time": endTimeString, "course_id": course_id})
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
    output_df=pd.DataFrame(0.0, index=file_id_name, columns=[GRADE_A, GRADE_B, GRADE_C, GRADE_LOW, NO_GRADE_STRING])
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
    output_df["total_count"] = output_df.apply(lambda row: row["90-100"]+row["80-89"]+row["70-79"] + row["low_grade"]+row.NO_GRADE, axis=1)

    if (grade != "all"):
        # drop all other grades
        grades = [GRADE_A, GRADE_B, GRADE_C, GRADE_LOW, NO_GRADE_STRING]
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

def grade_distribution(request, course_id=0):
    logger.info(grade_distribution.__name__)

    current_user = request.user.get_username()
    grade_score_sql = "select current_grade,(select current_grade from user where sis_name=" \
                      "%(current_user)s and course_id=%(course_id)s) as current_user_grade from user where course_id=%(course_id)s;"
    df = pd.read_sql(grade_score_sql, conn, params={"current_user": current_user,'course_id': course_id})
    if df.empty or df['current_grade'].isnull().all():
        return HttpResponse(json.dumps({}), content_type='application/json')
    number_of_students = df.shape[0]
    df = df[df['current_grade'].notnull()]
    df['current_grade_mod'] = df['current_grade'].apply(lambda x: x.replace("100","99.99"))
    average_grade = df['current_grade'].astype(float).mean().round(2)
    df['tot_students'] = number_of_students
    df['grade_avg'] = average_grade
    return HttpResponse(df.to_json(orient='records'))

def assignment_progress(request, course_id=0):
    logger.info(assignment_view.__name__)

    current_user = request.user.get_username()

    sql = "select assignment_id,local_graded_date as graded_date,score,name,assign_grp_name,local_date as due_date,points_possible,group_points,weight,drop_lowest,drop_highest  from (" \
          "(select assignment_id,local_graded_date,score from" \
          "(select id from user where sis_name = %(current_user)s ) as u join" \
          "(select user_id,assignment_id,local_graded_date,score from submission) as sub on sub.user_id=u.id) as rock join" \
          "(select assign_id,name,assign_grp_name,local_date,points_possible,group_points,weight,drop_lowest,drop_highest  from" \
          "(select id as assign_id,assignment_group_id, local_date,name,points_possible from assignment where course_id = %(course_id)s) as a join" \
          "(select id,name as assign_grp_name,group_points, weight,drop_lowest,drop_highest  from assignment_groups) as ag on ag.id=a.assignment_group_id) as bottom on rock.assignment_id = bottom.assign_id)"
    df = pd.read_sql(sql,conn,params={"current_user": current_user,'course_id': course_id},parse_dates={'due_date': '%Y-%m-%d','graded_date':'%Y-%m-%d'})
    if df.empty:
        return HttpResponse(json.dumps({}), content_type='application/json')
    df.drop_duplicates(keep='first', inplace=True)
    df['due_date'] = pd.to_datetime(df['due_date'],unit='ms')
    df['graded_date'] = pd.to_datetime(df['graded_date'],unit='ms')
    df[['points_possible','group_points']]=df[['points_possible','group_points']].fillna(0)
    df[['points_possible', 'group_points','weight','score']] = df[['points_possible', 'group_points','weight','score']].astype(float)
    consider_weight=is_weight_considered(course_id)
    total_points=df['points_possible'].sum()
    df['towards_final_grade']=df.apply(lambda x: percent_calculation(consider_weight, total_points,x), axis=1)
    df.sort_values(by='due_date', inplace = True)
    df['graded']=df['graded_date'].notnull()
    df['due_date_mod'] =df['due_date'].astype(str).apply(lambda x:x.split()[0])
    df['due_dates']= pd.to_datetime(df['due_date_mod']).dt.strftime('%m/%d')
    df['due_dates'].replace('NaT','N/A',inplace=True)
    df.drop(columns=['assignment_id','due_date','graded_date'], inplace=True)
    df = df[df['towards_final_grade']>0.0]

    def user_percent(row):
        if row['graded']==True:
            s =round((row['score']/row['points_possible'])*row['towards_final_grade'],2)
            return s
        else: return row['towards_final_grade']

    df['percent_gotten']=df.apply(user_percent,axis=1)
    df.sort_values(by=['graded','due_date_mod'], ascending=[False,True],inplace = True)
    df.reset_index(inplace=True)
    df.drop(columns=['index'],inplace=True)
    return HttpResponse(df.to_json(orient='records'))


def assignment_view(request, course_id=0):
    logger.info(assignment_view.__name__)

    current_user = request.user.get_username()

    percent_selection = float(request.GET.get('percent','0.0'))
    logger.info('selection from assignment view %s '.format(percent_selection))
    sql = "select assignment_id,local_graded_date as graded_date,score,name,local_date as due_date,points_possible,group_points,weight,drop_lowest,drop_highest from (" \
          "(select assignment_id,local_graded_date,score from"\
          "(select id from user where sis_name = %(current_user)s ) as u join"\
          "(select user_id,assignment_id,local_graded_date,score from submission) as sub on sub.user_id=u.id) as rock join"\
          "(select assign_id,name,local_date,points_possible,group_points,weight,drop_lowest,drop_highest from"\
          "(select id as assign_id,assignment_group_id, local_date,name,points_possible from assignment where course_id = %(course_id)s) as a join"\
          "(select id, group_points, weight,drop_lowest,drop_highest from assignment_groups) as ag on ag.id=a.assignment_group_id) as bottom on rock.assignment_id = bottom.assign_id)"
    df = pd.read_sql(sql,conn,params={"current_user": current_user,'course_id': course_id},parse_dates={'due_date': '%Y-%m-%d','graded_date':'%Y-%m-%d'})
    if df.empty:
        return HttpResponse(json.dumps([]), content_type='application/json')
    df.drop_duplicates(keep='first', inplace=True)
    df['due_date'] = pd.to_datetime(df['due_date'],unit='ms')
    df['graded_date'] = pd.to_datetime(df['graded_date'],unit='ms')
    df[['points_possible','group_points']]=df[['points_possible','group_points']].fillna(0)
    df[['points_possible', 'group_points','weight']] = df[['points_possible', 'group_points','weight']].astype(float)
    consider_weight=is_weight_considered(course_id)
    total_points=df['points_possible'].sum()
    df['towards_final_grade']=df.apply(lambda x: percent_calculation(consider_weight, total_points,x), axis=1)
    df['calender_week']=df['due_date'].dt.week
    df['calender_week']=df['calender_week'].fillna(0).astype(int)
    min_week=find_min_week(course_id)
    max_week=df['calender_week'].max()
    week_list = [x for x in range(min_week,max_week+1)]
    df['week']=df['calender_week'].apply(lambda x: 0 if x == 0 else week_list.index(x)+1)
    df.sort_values(by='due_date', inplace = True)
    df['current_week']=df['calender_week'].apply(lambda x: find_current_week(x))
    df['graded']=df['graded_date'].notnull()
    df['due_date_mod'] =df['due_date'].astype(str).apply(lambda x:x.split()[0])
    df['due_dates']= pd.to_datetime(df['due_date_mod']).dt.strftime('%m/%d')
    df['due_dates'].replace('NaT','N/A',inplace=True)
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
    if consider_weight and row['group_points']!=0:
        return round((row['points_possible']/row['group_points'])*row['weight'],2)
    else:
        return round((row['points_possible']/total_points)*100,2)


def find_min_week(course_id):
    date = get_term_dates_for_course(course_id)
    year,week,dow=date.isocalendar()
    return week;


def find_current_week(row):
    current_date = datetime.now()
    year,week,dow = current_date.isocalendar() #dow = day of week
    if row == week:
        return True
    else: return False


def is_weight_considered(course_id):
    url = "select consider_weight from assignment_weight_consideration where course_id=%(course_id)s"
    df = pd.read_sql(url, conn, params={"course_id": course_id})
    value = df['consider_weight'].iloc[0]
    return value


def get_term_dates_for_course(course_id):
    logger.info(get_term_dates_for_course.__name__)
    sql = "select a.start_date from course c, academic_terms a where c.id = %(course_id)s and c.term_id=a.term_id;"
    df = pd.read_sql(sql, conn, params={"course_id": course_id}, parse_dates={'start_date': '%Y-%m-%d'})
    return df['start_date'].iloc[0]

def logout(request):
    logger.info('User %s logging out.' % request.user.username)
    auth.logout(request)
    return redirect(settings.LOGOUT_REDIRECT_URL)