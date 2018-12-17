from django.shortcuts import redirect
from django.http import HttpResponse
from django.contrib import auth
from django.db import connection as conn
from dashboard.models import AcademicTerms, Course

import random, math, json, logging
from datetime import datetime, timedelta

from decouple import config

import numpy as np
import pandas as pd

from django.conf import settings

from pinax.eventlog.models import log as eventlog

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

EVENT_VIEW_FILE_ACCESS="VIEW_FILE_ACCESS"
EVENT_VIEW_ASSIGNMENT_PLANNING="VIEW_ASSIGNMENT_PLANNING"
EVENT_VIEW_GRADE_DISTRIBUTION="VIEW_GRADE_DISTRIBUTION"

# how many decimal digits to keep
DECIMAL_ROUND_DIGIT = 1

def gpa_map(grade):
    if grade is None:
        return NO_GRADE_STRING
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

def get_current_week_number(request, course_id=0):
    # get current term start date
    term_date_start = AcademicTerms.objects.course_date_start(course_id).date()

    today = datetime.now().date()

    logger.info(term_date_start)
    logger.info(today)

    ## calculate the week number
    currentWeekNumber = math.ceil((today - term_date_start).days/7)

    # construct json
    data = {}
    data['currentWeekNumber'] = currentWeekNumber
    return HttpResponse(json.dumps(data))

# show percentage of users who read the file within prior n weeks
def file_access_within_week(request, course_id=0):

    current_user=request.user.get_username()

    logger.debug("current_user=" + current_user)

    # environment settings:
    df_default_display_settings()

    # read from request param
    week_num_start = int(request.GET.get('week_num_start','1'))
    week_num_end = int(request.GET.get('week_num_end','0'))
    grade = request.GET.get('grade','all')

    # json for eventlog
    data = {
        "week_num_start": week_num_start,
        "week_num_end": week_num_end,
        "grade": grade,
        "course_id": course_id
    }
    eventlog(request.user, EVENT_VIEW_FILE_ACCESS, extra=data)


    # get total number of student within the course_id
    total_number_student_sql = "select count(*) from user where course_id = %(course_id)s"
    total_number_student_df = pd.read_sql(total_number_student_sql, conn, params={"course_id": course_id})
    total_number_student = total_number_student_df.iloc[0,0]
    logger.debug("course_id_string" + course_id + " total student=" + str(total_number_student))

    term_date_start = AcademicTerms.objects.course_date_start(course_id)

    start = term_date_start + timedelta(days=(week_num_start * 7))
    end = term_date_start + timedelta(days=(week_num_end * 7))
    logger.debug("term_start=" + str(term_date_start) + " start=" + str(start) + " end=" + str(end))


    # get time range based on week number passed in via request

    sqlString = "SELECT a.file_id as file_id, f.name as file_name, u.current_grade as current_grade, a.user_id as user_id " \
                "FROM file f, file_access a, user u, course c, academic_terms t  " \
                "WHERE a.file_id =f.ID and a.user_id = u.ID  " \
                "and f.course_id = c.id and c.term_id = t.id " \
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
    df['current_grade'] = df['current_grade'].astype(float)
    if df[df['current_grade'] > 100.0].shape[0] > 0:
        df['graph_upper_limit']=int((5 * round(float(df['current_grade'].max())/5)+5))
    else:
        df['current_grade'] = df['current_grade'].apply(lambda x: 99.99 if x == 100.00 else x)
        df['graph_upper_limit']=100
    average_grade = df['current_grade'].mean().round(2)
    df['tot_students'] = number_of_students
    df['grade_avg'] = average_grade

    # json for eventlog
    data = {
        "course_id": course_id
    }
    eventlog(request.user, EVENT_VIEW_GRADE_DISTRIBUTION, extra=data)

    return HttpResponse(df.to_json(orient='records'))


def assignments(request, course_id=0):
    logger.info(assignments.__name__)

    current_user = request.user.get_username()
    df_default_display_settings()

    percent_selection = float(request.GET.get('percent', '0.0'))

    # json for eventlog
    data = {
        "course_id": course_id,
        "percent_selection": percent_selection
    }
    eventlog(request.user, EVENT_VIEW_ASSIGNMENT_PLANNING, extra=data)

    logger.info('selection from assignment Planning {}'.format(percent_selection))

    assignments_in_course = get_course_assignments(course_id)

    if assignments_in_course.empty:
        return HttpResponse(json.dumps([]), content_type='application/json')

    assignment_submissions = get_user_assignment_submission(current_user, assignments_in_course, course_id)

    df = pd.merge(assignments_in_course, assignment_submissions, on='assignment_id', how='left')
    if df.empty:
        logger.info('There are no assignment data in the course %s for user %s ' % (course_id, current_user))
        return HttpResponse(json.dumps([]), content_type='application/json')

    df.sort_values(by='due_date', inplace=True)
    df.drop(columns=['assignment_id', 'due_date'], inplace=True)
    df.drop_duplicates(keep='first', inplace=True)

    # instructor might not ever see the avg score as he don't have grade in assignment. we don't have role described in the flow to open the gates for him
    if not request.user.is_superuser:
        df['avg_score']= df.apply(no_show_avg_score_for_ungraded_assignments, axis=1)
    df['avg_score']=df['avg_score'].fillna('N/A')

    df3 = df[df['towards_final_grade'] > 0.0]
    df3[['score']] = df3[['score']].astype(float)
    df3['percent_gotten'] = df3.apply(user_percent, axis=1)
    df3['graded'] = df3['graded'].fillna(False)
    df3[['score']] = df3[['score']].astype(float)
    df3['percent_gotten'] = df3.apply(user_percent, axis=1)
    df3.sort_values(by=['graded', 'due_date_mod'], ascending=[False, True], inplace=True)
    df3.reset_index(inplace=True)
    df3.drop(columns=['index'], inplace=True)

    assignment_data = {}
    assignment_data['progress'] = json.loads(df3.to_json(orient='records'))

    # Group the data according the assignment prep view
    df2 = df[df['towards_final_grade'] >= percent_selection]
    df2.reset_index(inplace=True)
    df2.drop(columns=['index'], inplace=True)
    logger.debug('The Dataframe for the assignment planning %s ' % df2)
    grouped = df2.groupby(['week', 'due_dates'])

    assignment_list = []
    for name, group in grouped:
        # name is a tuple of (week,due_date) => (1,'06/23/2018')
        # group is a dataframe based on grouping by week,due_date
        dic = {}
        group.drop(['week', 'due_dates'], axis=1, inplace=True)
        dic['week'] = name[0]
        dic['due_date'] = name[1]
        dic['assign'] = json.loads(group.to_json(orient='records'))
        assignment_list.append(dic)
    week_list = set()
    for item in assignment_list:
        week_list.add(item['week'])
    weeks = sorted(week_list)
    full = []
    for i, week in enumerate(weeks):
        data = {}
        data["week"] = np.uint64(week).item()
        data["id"] = i + 1
        dd_items = data["due_date_items"] = []
        for item in assignment_list:
            assignment_due_date_grp = {}
            if item['week'] == week:
                assignment_due_date_grp['due_date'] = item['due_date']
                assignment_due_date_grp['assignment_items'] = item['assign']
                dd_items.append(assignment_due_date_grp)
        full.append(data)
    assignment_data['plan'] = json.loads(json.dumps(full))
    return HttpResponse(json.dumps(assignment_data), content_type='application/json')


def get_course_assignments(course_id):

    sql=f"""select assign.*,sub.avg_score from
            (select assignment_id,name,due_date,points_possible,group_points,weight,drop_lowest,drop_highest from
            (select a.id as assignment_id,a.assignment_group_id, a.local_date as due_date,a.name,a.points_possible from assignment as a  where a.course_id =%(course_id)s) as a join
            (select id, group_points, weight,drop_lowest,drop_highest from assignment_groups) as ag on ag.id=a.assignment_group_id) as assign left join
            (select distinct assignment_id,avg_score from submission where course_id=%(course_id)s) as sub on sub.assignment_id = assign.assignment_id
            """

    assignments_in_course = pd.read_sql(sql,conn,params={'course_id': course_id}, parse_dates={'due_date': '%Y-%m-%d'})
    # No assignments found in the course
    if assignments_in_course.empty:
        logger.info('The course %s don\'t seems to have assignment data' % course_id)
        return assignments_in_course

    assignments_in_course['due_date'] = pd.to_datetime(assignments_in_course['due_date'],unit='ms')
    assignments_in_course[['points_possible','group_points']]=assignments_in_course[['points_possible','group_points']].fillna(0)
    assignments_in_course[['points_possible', 'group_points','weight']] = assignments_in_course[['points_possible', 'group_points','weight']].astype(float)
    consider_weight=is_weight_considered(course_id)
    total_points=assignments_in_course['points_possible'].sum()
    assignments_in_course['towards_final_grade']=assignments_in_course.apply(lambda x: percent_calculation(consider_weight, total_points,x), axis=1)
    assignments_in_course['calender_week']=assignments_in_course['due_date'].dt.week
    assignments_in_course['calender_week']=assignments_in_course['calender_week'].fillna(0).astype(int)
    min_week=find_min_week(course_id)
    max_week=assignments_in_course['calender_week'].max()
    week_list = [x for x in range(min_week,max_week+1)]
    assignments_in_course['week']=assignments_in_course['calender_week'].apply(lambda x: 0 if x == 0 else week_list.index(x)+1)
    assignments_in_course.sort_values(by='due_date', inplace = True)
    assignments_in_course['current_week']=assignments_in_course['calender_week'].apply(lambda x: find_current_week(x))
    assignments_in_course['due_date_mod'] =assignments_in_course['due_date'].astype(str).apply(lambda x:x.split()[0])
    assignments_in_course['due_dates']= pd.to_datetime(assignments_in_course['due_date_mod']).dt.strftime('%m/%d')
    assignments_in_course['due_dates'].replace('NaT','N/A',inplace=True)
    return assignments_in_course


def get_user_assignment_submission(current_user,assignments_in_course_df, course_id):
    sql = "select assignment_id, score, graded_date from submission where " \
          "user_id=(select id from user where sis_name = %(current_user)s and course_id = %(course_id)s ) and course_id = %(course_id)s"
    assignment_submissions = pd.read_sql(sql, conn, params={'course_id': course_id, "current_user": current_user})
    if assignment_submissions.empty:
        logger.info('The user %s seems to be a not student in the course.' % current_user)
        # manually adding the columns for display in UI
        assignment_submissions = pd.DataFrame()
        assignment_submissions['assignment_id'] = assignments_in_course_df['assignment_id']
        assignment_submissions['score'] = None
        assignment_submissions['graded'] = False
    else:
        assignment_submissions['graded'] = assignment_submissions['graded_date'].notnull()
        assignment_submissions.drop(columns=['graded_date'], inplace=True)
    return assignment_submissions

# don't show the avg scores for student when individual assignment is not graded as canvas currently don't show it
def no_show_avg_score_for_ungraded_assignments(row):
    if row['score'] is None:
        return 'N/A'
    else: return row['avg_score']


def user_percent(row):
    if row['graded']:
        s = round((row['score'] / row['points_possible']) * row['towards_final_grade'], 2)
        return s
    else:
        return row['towards_final_grade']


def percent_calculation(consider_weight,total_points,row):
    if consider_weight and row['group_points']!=0:
        return round((row['points_possible']/row['group_points'])*row['weight'],2)
    else:
        return round((row['points_possible']/total_points)*100,2)


def find_min_week(course_id):
    date = get_term_dates_for_course(course_id)
    year,week,dow=date.isocalendar()
    return week


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
    sql = "select a.date_start from course c, academic_terms a where c.id = %(course_id)s and c.term_id=a.id;"
    df = pd.read_sql(sql, conn, params={"course_id": course_id}, parse_dates={'date_start': '%Y-%m-%d'})
    return df['date_start'].iloc[0]


def df_default_display_settings():
    pd.set_option('display.max_column', None)
    pd.set_option('display.max_rows', None)
    pd.set_option('display.max_seq_items', None)
    pd.set_option('display.max_colwidth', 500)
    pd.set_option('expand_frame_repr', True)


def logout(request):
    logger.info('User %s logging out.' % request.user.username)
    auth.logout(request)
    return redirect(settings.LOGOUT_REDIRECT_URL)