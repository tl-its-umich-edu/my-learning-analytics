
from __future__ import print_function #python 3 support

from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.db import connections as conns

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

from decouple import config, Csv

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

engine = create_engine("mysql+pymysql://{user}:{password}@{host}:{port}/{db}"
                       .format(db = db_name,  # your mysql database name
                               user = db_user, # your mysql user for the database
                               password = db_password, # password for user
                               host = db_host,
                               port = db_port))

# ## Connect to Unizin Data Warehouse
#
# ### Get enrolled users and files within site
CANVAS_COURSE_ID =config('CANVAS_COURSE_IDS', default="")
UDW_ID_PREFIX = "17700000000"
UDW_FILE_ID_PREFIX = "1770000000"
UDW_COURSE_ID = UDW_ID_PREFIX + CANVAS_COURSE_ID

# set the current term id from config
CURRENT_CANVAS_TERM_ID =config('CURRENT_CANVAS_TERM_ID', default="2")

# update FILE records from UDW
def update_with_udw_course(request):

    #select file record from UDW
    course_sql = "select id, name, " + CURRENT_CANVAS_TERM_ID + " as term_id from course_dim where id='" + UDW_COURSE_ID + "'"

    return HttpResponse("loaded file info: " + util_function(course_sql, 'course'))

# update FILE records from UDW
def update_with_udw_file(request):

    #select file record from UDW
    file_sql = "select concat(" + UDW_FILE_ID_PREFIX + ", canvas_id) as id, display_name as name, course_id as course_id from file_dim " \
               "where file_state ='available' " \
               "and course_id='"+ UDW_COURSE_ID + "'" \
               " order by canvas_id"

    return HttpResponse("loaded file info: " + util_function(file_sql, 'file'))

# update FILE_ACCESS records from BigQuery
def update_with_bq_access(request):

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
                        query = 'select CAST(SUBSTR(JSON_EXTRACT_SCALAR(event, "$.object.id"), 35) AS STRING) AS file_id, ' \
                                'SUBSTR(JSON_EXTRACT_SCALAR(event, "$.membership.member.id"), 29) AS user_id, ' \
                                'datetime(EVENT_TIME) as access_time ' \
                                'FROM learning_datasets.enriched_events ' \
                                'where JSON_EXTRACT_SCALAR(event, "$.edApp.id") = \'http://umich.instructure.com/\' ' \
                                'and event_type = \'NavigationEvent\' ' \
                                'and JSON_EXTRACT_SCALAR(event, "$.object.name") = \'attachment\' ' \
                                'and JSON_EXTRACT_SCALAR(event, "$.action") = \'NavigatedTo\' ' \
                                'and JSON_EXTRACT_SCALAR(event, "$.membership.member.id") is not null ' \
                                'and SUBSTR(JSON_EXTRACT_SCALAR(event, "$.group.id"),31) = @course_id '
                        logger.debug(query)
                        query_params =[
                            bigquery.ScalarQueryParameter('course_id', 'STRING', UDW_COURSE_ID),
                        ]
                        job_config = bigquery.QueryJobConfig()
                        job_config.query_parameters = query_params

                        # Location must match that of the dataset(s) referenced in the query.
                        df = bigquery_client.query(query, location='US', job_config=job_config).to_dataframe()  # API request - starts the query

                        logger.debug("df row number=" + str(df.shape[0]))
                        # drop duplicates
                        df.drop_duplicates(["file_id", "user_id", "access_time"], keep='first', inplace=True)

                        logger.debug("after drop duplicates, df row number=" + str(df.shape[0]))

                        # write to MySQL
                        df.to_sql(con=engine, name='file_access', if_exists='append', index=False)

    else:
        logger.debug('{} project does not contain any datasets.'.format(project))

    return HttpResponse("loaded file access info: inserted " + str(df.shape[0]) + " rows.")

# update USER records from UDW
def update_with_udw_user(request):

    # select all student registered for the course
    user_sql = "select u.name AS name, " \
          "p.sis_user_id AS sis_id, " \
          "p.unique_name AS sis_name, " \
          "u.global_canvas_id AS id, " \
          "c.current_score AS current_grade, " \
          "c.final_score AS final_grade, " \
          "'"+ UDW_COURSE_ID + "' as course_id " \
          "from user_dim u, " \
          "pseudonym_dim p, " \
          "course_score_fact c, " \
          "(select e.user_id as user_id, e.id as enrollment_id from enrollment_dim e " \
          "where e.course_id = '" + UDW_COURSE_ID + "' " \
          "and e.type='StudentEnrollment' " \
          "and e.workflow_state='active' ) as e " \
          "where p.user_id=u.id " \
          "and u.id = e.user_id " \
          "and c.enrollment_id =  e.enrollment_id"
    logger.debug(user_sql)

    return HttpResponse("loaded user info: " + util_function(user_sql, 'user'))


def update_groups(request):
    '''
    Loading the assignment groups inforamtion along with weight/points associated ith arn assignment
    :param request:
    :return:
    '''
    logger.debug("update_assignment_groups(): ")
    assignment_groups_sql = "with assignment_details as (select ad.due_at,ad.title,af.course_id ,af.assignment_id,af.points_possible,af.assignment_group_id " \
                            "from assignment_fact af inner join assignment_dim ad on af.assignment_id = ad.id where af.course_id='" + UDW_COURSE_ID + "'" \
                            "and ad.visibility = 'everyone' and ad.workflow_state='published')"\
                            ",assignment_grp as (select agf.*, agd.name from assignment_group_dim agd join assignment_group_fact agf " \
                            "on agd.id = agf.assignment_group_id  where agd.course_id='" + UDW_COURSE_ID + "' and workflow_state='available')"\
                            ",assign_more as (select distinct(a.assignment_group_id) ,da.group_points from assignment_details a join " \
                            "(select assignment_group_id, sum(points_possible) as group_points from assignment_details group by assignment_group_id) as da on a.assignment_group_id = da.assignment_group_id )"\
                            ",assignment_grp_points as (select ag.*, am.group_points AS group_points from assignment_grp ag join assign_more am on ag.assignment_group_id = am.assignment_group_id)"\
                            "select assignment_group_id AS id, course_id AS course_id, group_weight AS weight, name AS name, group_points AS group_points from assignment_grp_points"

    return HttpResponse("loaded assignment group info: " + util_function(assignment_groups_sql, 'assignment_groups'))


def update_assignment(request):
    '''
    Load the assignment info w.r.t to a course such as due_date, points etc
    :param request:
    :return:
    '''
    logger.info("update_assignment(): ")
    assignment_sql="with assignment_info as " \
                   "(select ad.due_at AS due_date,ad.due_at at time zone 'utc' at time zone 'America/New_York' as local_date," \
                   "ad.title AS name,af.course_id AS course_id,af.assignment_id AS id," \
                   "af.points_possible AS points_possible,af.assignment_group_id AS assignment_group_id" \
                   " from assignment_fact af inner join assignment_dim ad on af.assignment_id = ad.id where af.course_id='" + UDW_COURSE_ID + "'" \
                   "and ad.visibility = 'everyone' and ad.workflow_state='published')" \
                   "select * from assignment_info"

    return HttpResponse("loaded assignment info: " + util_function(assignment_sql,'assignment'))


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
                     "select submission_id AS ID, assignment_id AS assignment_id, global_canvas_id AS user_id, " \
                     "published_score AS score, graded_at AS graded_date, local_graded_time as local_graded_date from submission"

    return HttpResponse("loaded assignment submission info: " + util_function(submission_url,'submission'))


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

    return HttpResponse("loaded weight_consideration info: " + util_function(is_weight_considered_url,'assignment_weight_consideration', 'weight'))


# the util function
def util_function(sql_string, mysql_table, table_identifier=None):

    df = pd.read_sql(sql_string, conns['UDW'])
    logger.debug("df shape " + str(df.shape[0]) + " " + str(df.shape[1]))

    # Sql returns boolean value so grouping course info along with it so that this could be stored in the DB table.
    if table_identifier == 'weight':
        df['course_id']=UDW_COURSE_ID
        df.columns=['consider_weight','course_id']

    # drop duplicates
    df.drop_duplicates(keep='first', inplace=True)

    logger.debug(" table: " + mysql_table + " insert size: " + str(df.shape[0]))

    # write to MySQL
    df.to_sql(con=engine, name=mysql_table, if_exists='append', index=False)

    # returns the row size of dataframe
    return "inserted " + str(df.shape[0]) + " rows."