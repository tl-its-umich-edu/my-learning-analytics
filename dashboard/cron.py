
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

# Imports the Google Cloud client library
from google.cloud import bigquery


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
UDW_ID_PREFIX = "17700000000"
UDW_FILE_ID_PREFIX = "1770000000"
UDW_COURSE_ID = UDW_ID_PREFIX + CANVAS_COURSE_ID

# update FILE records from UDW
def update_with_udw_file(request):

    #select file record from UDW
    file_sql = "select concat(" + UDW_FILE_ID_PREFIX + ", canvas_id) as ID, display_name as NAME, course_id as COURSE_ID from file_dim " \
               "where file_state ='available' " \
               "and course_id='"+ UDW_COURSE_ID + "'" \
               " order by canvas_id"

    # update FILE_ACCESS records
    util_function(file_sql, 'FILE')

    return HttpResponse("loaded file info")

# update FILE_ACCESS records from BigQuery
def update_with_udw_access(request):

    # Instantiates a client
    bigquery_client = bigquery.Client()

    datasets = list(bigquery_client.list_datasets())
    project = bigquery_client.project

    # list all datasets
    if datasets:
        logger.debug('Datasets in project {}:'.format(project))
        for dataset in datasets:  # API request(s)
            logger.debug('\t{}'.format(dataset.dataset_id))

            # choose the right dataset
            if ("learning_datasets" == dataset.dataset_id):
                # list all tables
                dataset_ref = bigquery_client.dataset(dataset.dataset_id)
                tables = list(bigquery_client.list_tables(dataset_ref))  # API request(s)
                for table in tables:
                    if ("enriched_events" == table.table_id):
                        logger.debug('\t{}'.format("found table"))

                        # query to retrieve all file access events for one course
                        query = 'select CAST(SUBSTR(JSON_EXTRACT_SCALAR(event, "$.object.id"), 35) AS STRING) AS FILE_ID, ' \
                                'SUBSTR(JSON_EXTRACT_SCALAR(event, "$.membership.member.id"), 29) AS USER_ID, ' \
                                'EVENT_TIME as ACCESS_TIME, ' \
                                'SUBSTR(JSON_EXTRACT_SCALAR(event, "$.group.id"),31) AS COURSE_ID ' \
                                'FROM learning_datasets.enriched_events ' \
                                'where JSON_EXTRACT_SCALAR(event, "$.edApp.id") = \'http://umich.instructure.com/\' ' \
                                'and event_type = \'NavigationEvent\' ' \
                                'and JSON_EXTRACT_SCALAR(event, "$.object.name") = \'attachment\' ' \
                                'and JSON_EXTRACT_SCALAR(event, "$.action") = \'NavigatedTo\' ' \
                                'and JSON_EXTRACT_SCALAR(event, "$.membership.member.id") is not null ' \
                                'and SUBSTR(JSON_EXTRACT_SCALAR(event, "$.group.id"),31) = \'' + UDW_COURSE_ID + '\' '
                        logger.debug(query)

                        # Location must match that of the dataset(s) referenced in the query.
                        df = bigquery_client.query(query, location='US').to_dataframe()  # API request - starts the query
                        logger.debug(df.describe())

                        # drop duplicates
                        df.drop_duplicates(keep=False, inplace=True)

                        # adjust the time value to drop time zone info
                        # so instead of 2018-07-02 15:28:32 UTC, we only want 2018-07-02 15:28:32

                        df['ACCESS_TIME'] = df['ACCESS_TIME'].dt.date
                        # write to MySQL
                        df.to_sql(con=engine, name='FILE_ACCESS', if_exists='append', index=False)

    else:
        logger.debug('{} project does not contain any datasets.'.format(project))



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
          "where e.course_id = '" + UDW_COURSE_ID + "' " \
          "and e.type='StudentEnrollment' " \
          "and e.workflow_state='active' ) as e " \
          "where p.user_id=u.id " \
          "and u.id = e.user_id " \
          "and c.enrollment_id =  e.enrollment_id " \
          "and c.current_score is not null " \
          "and c.final_score is not null"

    logger.debug(user_sql)

    # upate USER records
    util_function(user_sql, 'USER')

    return HttpResponse("loaded user info")


def update_groups(request):
    '''
    Loading the assignment groups inforamtion along with weight/points associated ith arn assignment
    :param request:
    :return:
    '''
    logger.info("update_assignment_groups(): ")
    assignment_groups_sql = "with assignment_details as (select ad.due_at,ad.title,af.course_id ,af.assignment_id,af.points_possible,af.assignment_group_id " \
                            "from assignment_fact af inner join assignment_dim ad on af.assignment_id = ad.id where af.course_id='" + UDW_COURSE_ID + "'" \
                            "and ad.visibility = 'everyone' and ad.workflow_state='published')"\
                            ",assignment_grp as (select agf.*, agd.name from assignment_group_dim agd join assignment_group_fact agf " \
                            "on agd.id = agf.assignment_group_id  where agd.course_id='" + UDW_COURSE_ID + "' and workflow_state='available')"\
                            ",assign_more as (select distinct(a.assignment_group_id) ,da.group_points from assignment_details a join " \
                            "(select assignment_group_id, sum(points_possible) as group_points from assignment_details group by assignment_group_id) as da on a.assignment_group_id = da.assignment_group_id )"\
                            ",assignment_grp_points as (select ag.*, am.group_points AS GROUP_POINTS from assignment_grp ag join assign_more am on ag.assignment_group_id = am.assignment_group_id)"\
                            "select assignment_group_id AS ID, course_id AS COURSE_ID, group_weight AS WEIGHT, name AS NAME, group_points AS GROUP_POINTS from assignment_grp_points"
    util_function(assignment_groups_sql, 'ASSIGNMENT_GROUPS')
    return HttpResponse("loaded assignment group info")


def update_assignment(request):
    '''
    Load the assignment info w.r.t to a course such as due_date, points etc
    :param request:
    :return:
    '''
    logger.info("update_assignment(): ")
    assignment_sql="with assignment_info as " \
                   "(select ad.due_at AS DUE_DATE,ad.due_at at time zone 'utc' at time zone 'America/New_York' as LOCAL_DATE," \
                   "ad.title AS NAME,af.course_id AS COURSE_ID,af.assignment_id AS ID," \
                   "af.points_possible AS POINTS_POSSIBLE,af.assignment_group_id AS ASSIGNMENT_GROUP_ID" \
                   " from assignment_fact af inner join assignment_dim ad on af.assignment_id = ad.id where af.course_id='" + UDW_COURSE_ID + "'" \
                   "and ad.visibility = 'everyone' and ad.workflow_state='published')" \
                   "select * from assignment_info"
    util_function(assignment_sql,'ASSIGNMENT')
    return HttpResponse("loaded assignment info")


def submission(request):
    '''
    student submission information for assignments
    :param request:
    :return:
    '''
    logger.info("update_submission(): ")
    submission_url = "with sub_fact as (select submission_id, assignment_id,user_id, global_canvas_id, published_score " \
                     "from submission_fact sf join user_dim u on sf.user_id = u.id where course_id = '" + UDW_COURSE_ID + "')," \
                     "enrollment as (select  distinct(user_id) from enrollment_dim where course_id = '" + UDW_COURSE_ID + "' and workflow_state='active' " \
                     "and type = 'StudentEnrollment'),"\
                     "submission_time as (select id, graded_at, graded_at at time zone 'utc' at time zone 'America/New_York' as local_graded_time from submission_dim),"\
                     "sub_with_enroll as (select sf.* from sub_fact sf join enrollment e on e.user_id = sf.user_id),"\
                     "submission as (select se.submission_id,se.assignment_id,se.global_canvas_id,se.published_score, st.graded_at, st.local_graded_time " \
                     "from sub_with_enroll se inner join submission_time st on se.submission_id = st.id)" \
                     "select submission_id AS ID, assignment_id AS ASSIGNMENT_ID, global_canvas_id AS USER_ID, " \
                     "published_score AS SCORE, graded_at AS GRADED_DATE, local_graded_time as LOCAL_GRADED_DATE from submission"
    util_function(submission_url,'SUBMISSION')
    return HttpResponse("loaded assignment submission info")


def weight_consideration(request):
    '''
    load the assignment weight consider information with in a course. Some assignments don't have weight consideration
    the result of it return boolean indicating weight is considered in table calculation or not
    :param request:
    :return:
    '''
    logger.info("weight_consideration()")
    is_weight_considered_url ="with course as (select course_id, sum(group_weight) as group_weight from assignment_group_fact " \
                              "where course_id = '" + UDW_COURSE_ID + "' group by course_id having sum(group_weight)>1)"\
                              "(select CASE WHEN EXISTS (SELECT * FROM course WHERE group_weight > 1) THEN CAST(1 AS BOOLEAN) ELSE CAST(0 AS BOOLEAN) END)"

    util_function(is_weight_considered_url,'ASSIGNMENT_WEIGHT_CONSIDERATION', 'weight')
    return HttpResponse("loaded weight_consideration info")


# the util function
def util_function(sql_string, mysql_table, table_identifier=None):

    # get UDW connection
    udw_conn = psycopg2.connect(
        host=UDW_ENDPOINT,
        user=UDW_USER,
        port=5439,#int(UDW_PORT),
        password=UDW_PASSWORD,
        dbname=UDW_DATABASE)

    df = pd.read_sql(sql_string, udw_conn)
    # Sql returns boolean value so grouping course info along with it so that this could be stored in the DB table.
    if table_identifier == 'weight':
        df['COURSE_ID']=UDW_COURSE_ID
        df.columns=['CONSIDER_WEIGHT','COURSE_ID']
    logger.info('sql data: ',df.head())
    # close UDW connection
    udw_conn.close()

    # drop duplicates
    df.drop_duplicates(keep=False, inplace=True)

    # write to MySQL
    df.to_sql(con=engine, name=mysql_table, if_exists='append', index=False)