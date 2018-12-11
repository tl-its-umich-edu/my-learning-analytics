
from __future__ import print_function #python 3 support

from django.db import connections as conns

import logging
import datetime

from sqlalchemy import create_engine
from django.conf import settings

from dashboard.models import Course

import pandas as pd

# Imports the Google Cloud client library
from google.cloud import bigquery

from django_cron import CronJobBase, Schedule

logger = logging.getLogger(__name__)

db_name = settings.DATABASES['default']['NAME']
db_user = settings.DATABASES['default']['USER']
db_password = settings.DATABASES['default']['PASSWORD']
db_host = settings.DATABASES['default']['HOST']
db_port = settings.DATABASES['default']['PORT']

logger.debug("db-name:" + db_name)
logger.debug("db-user:" + db_user)

engine = create_engine("mysql+mysqldb://{user}:{password}@{host}:{port}/{db}?charset=utf8mb4"
                       .format(db = db_name,  # your mysql database name
                               user = db_user, # your mysql user for the database
                               password = db_password, # password for user
                               host = db_host,
                               port = db_port))

# the util function
def util_function(UDW_course_id, sql_string, mysql_table, table_identifier=None):
    df = pd.read_sql(sql_string, conns['UDW'])
    logger.debug(df)

    # Sql returns boolean value so grouping course info along with it so that this could be stored in the DB table.
    if table_identifier == 'weight' and UDW_course_id:
        df['course_id']=UDW_course_id
        df.columns=['consider_weight','course_id']

    # drop duplicates
    df.drop_duplicates(keep='first', inplace=True)

    logger.debug(" table: " + mysql_table + " insert size: " + str(df.shape[0]))

    # write to MySQL
    try:
        df.to_sql(con=engine, name=mysql_table, if_exists='append', index=False)
    except Exception as e:
        logger.warn(e)
        raise

    # returns the row size of dataframe
    return f"inserted + {str(df.shape[0])} rows in table {mysql_table} for course {UDW_course_id};"

# execute database query
def executeDbQuery(query):
    with engine.connect() as connection:
        connection.detach()
        connection.execute(query)

# remove all records inside the specified table
def deleteAllRecordInTable(tableName):
    # delete all records in the table first
    executeDbQuery(f"delete from {tableName}")

    return "records removed from " + tableName + ";"

# cron job to populate course and user tables
class DashboardCronJob(CronJobBase):

    schedule = Schedule(run_at_times=settings.RUN_AT_TIMES)
    code = 'dashboard.DashboardCronJob'    # a unique code

    # update USER records from UDW
    def update_with_udw_user(self):

        # cron status
        status = ""

        logger.debug("in update with udw user")

        # delete all records in the table first
        status += deleteAllRecordInTable("user")

        # loop through multiple course ids
        for UDW_course_id in Course.objects.get_supported_courses():

            # select all student registered for the course
            user_sql = f"""select u.name AS name, 
                        p.sis_user_id AS sis_id, 
                        p.unique_name AS sis_name, 
                        u.global_canvas_id AS id, 
                        c.current_score AS current_grade, 
                        c.final_score AS final_grade, 
                        '{UDW_course_id}' as course_id 
                        from user_dim u, 
                        pseudonym_dim p, 
                        course_score_fact c, 
                        (select e.user_id as user_id, e.id as enrollment_id from enrollment_dim e 
                        where e.course_id = '{UDW_course_id}' 
                        and e.type='StudentEnrollment' 
                        and e.workflow_state='active' ) as e 
                        where p.user_id=u.id 
                        and u.id = e.user_id 
                        and c.enrollment_id =  e.enrollment_id 
                        and p.sis_user_id is not null
                        """
            logger.debug(user_sql)

            status += util_function(UDW_course_id, user_sql, 'user')

        return status

    # update unizin metadata from UDW
    def update_unizin_metadata(self):

        # cron status
        status = ""

        logger.debug("in update unizin metadata")

        # delete all records in the table first
        status += deleteAllRecordInTable("unizin_metadata")

        # select all student registered for the course
        metadata_sql = "select key as pkey, value as pvalue from unizin_metadata"

        logger.debug(metadata_sql)

        status += util_function("", metadata_sql, 'unizin_metadata')

        return status



    # update file records from UDW
    def update_with_udw_file(self):
        # cron status
        status = ""

        logger.debug("in update with udw file")

        # delete all records in the table first
        status += deleteAllRecordInTable("file")

        #select file record from UDW
        for UDW_course_id in Course.objects.get_supported_courses():
            file_sql = f"""select concat({settings.UDW_FILE_ID_PREFIX}, canvas_id) as ID, display_name as NAME, course_id as COURSE_ID from file_dim
                        where file_state ='available' 
                        and course_id='{UDW_course_id}'
                        order by canvas_id
                        """

            status += util_function(UDW_course_id, file_sql, 'file')
        return status

    # update FILE_ACCESS records from BigQuery
    def update_with_bq_access(self):

        # cron status
        status = ""

        # delete all records in file_access table
        status += deleteAllRecordInTable("file_access")

        # return string with concatenated SQL insert result
        returnString = ""

        # Instantiates a client
        bigquery_client = bigquery.Client()

        datasets = list(bigquery_client.list_datasets())
        project = bigquery_client.project

        # list all datasets
        if datasets:
            logger.debug('Datasets in project {}:'.format(project))
            for dataset in datasets:
                logger.debug('\t{}'.format(dataset.dataset_id))

                # choose the right dataset
                if ("learning_datasets" == dataset.dataset_id):
                    # list all tables
                    dataset_ref = bigquery_client.dataset(dataset.dataset_id)
                    tables = list(bigquery_client.list_tables(dataset_ref))
                    for table in tables:
                        if ("enriched_events" == table.table_id):
                            logger.debug('\t{}'.format("found table"))

                            # loop through multiple course ids
                            for UDW_course_id in Course.objects.get_supported_courses():

                                # query to retrieve all file access events for one course
                                query = '''select CAST(SUBSTR(JSON_EXTRACT_SCALAR(event, "$.object.id"), 35) AS STRING) AS file_id,
                                        SUBSTR(JSON_EXTRACT_SCALAR(event, "$.membership.member.id"), 29) AS user_id,
                                        datetime(EVENT_TIME) as access_time
                                        FROM learning_datasets.enriched_events
                                        where JSON_EXTRACT_SCALAR(event, "$.edApp.id") = \'http://umich.instructure.com/\'
                                        and event_type = \'NavigationEvent\'
                                        and JSON_EXTRACT_SCALAR(event, "$.object.name") = \'attachment\'
                                        and JSON_EXTRACT_SCALAR(event, "$.action") = \'NavigatedTo\'
                                        and JSON_EXTRACT_SCALAR(event, "$.membership.member.id") is not null
                                        and SUBSTR(JSON_EXTRACT_SCALAR(event, "$.group.id"),31) = @course_id
                                        '''
                                logger.debug(query)
                                query_params =[
                                    bigquery.ScalarQueryParameter('course_id', 'STRING', UDW_course_id),
                                ]
                                job_config = bigquery.QueryJobConfig()
                                job_config.query_parameters = query_params

                                # Location must match that of the dataset(s) referenced in the query.
                                df = bigquery_client.query(query, location='US', job_config=job_config).to_dataframe()

                                logger.debug("df row number=" + str(df.shape[0]))
                                # drop duplicates
                                df.drop_duplicates(["file_id", "user_id", "access_time"], keep='first', inplace=True)

                                logger.debug("after drop duplicates, df row number=" + str(df.shape[0]))

                                # write to MySQL
                                df.to_sql(con=engine, name='file_access', if_exists='append', index=False)

                                returnString += str(df.shape[0]) + " rows for course " + UDW_course_id + ";"
                                logger.info(returnString)

        else:
            returnString += "BigQuery project does not contain any datasets."

        return status

    def update_groups(self):
        # cron status
        status =""

        # delete all records in assignment_group table
        status += deleteAllRecordInTable("assignment_groups")

        # update groups
        #Loading the assignment groups inforamtion along with weight/points associated ith arn assignment
        logger.debug("update_assignment_groups(): ")
        
        # loop through multiple course ids
        for UDW_course_id in Course.objects.get_supported_courses():
            assignment_groups_sql = f"""with assignment_details as (select ad.due_at,ad.title,af.course_id ,af.assignment_id,af.points_possible,af.assignment_group_id from assignment_fact af inner join assignment_dim ad on af.assignment_id = ad.id where af.course_id='{UDW_course_id}' and ad.visibility = 'everyone' and ad.workflow_state='published'),
                                    assignment_grp as (select agf.*, agd.name from assignment_group_dim agd join assignment_group_fact agf on agd.id = agf.assignment_group_id  where agd.course_id='{UDW_course_id}' and workflow_state='available'),
                                    assign_more as (select distinct(a.assignment_group_id) ,da.group_points from assignment_details a join (select assignment_group_id, sum(points_possible) as group_points from assignment_details group by assignment_group_id) as da on a.assignment_group_id = da.assignment_group_id ),
                                    assign_rules as (select DISTINCT ad.assignment_group_id,agr.drop_lowest,agr.drop_highest from assignment_details ad join assignment_group_rule_dim agr on ad.assignment_group_id=agr.assignment_group_id),
                                    assignment_grp_points as (select ag.*, am.group_points AS group_points from assignment_grp ag join assign_more am on ag.assignment_group_id = am.assignment_group_id),
                                    assign_final as (select assignment_group_id AS id, course_id AS course_id, group_weight AS weight, name AS name, group_points AS group_points from assignment_grp_points)
                                    select g.*, ar.drop_lowest,ar.drop_highest from assign_rules ar join assign_final g on ar.assignment_group_id=g.id
                                    """
            status += util_function(UDW_course_id, assignment_groups_sql, 'assignment_groups')

        return status

    def update_assignment(self):
        #Load the assignment info w.r.t to a course such as due_date, points etc
        status =""

        logger.info("update_assignment(): ")

        # delete all records in assignment table
        status += deleteAllRecordInTable("assignment")

        # loop through multiple course ids
        for UDW_course_id in Course.objects.get_supported_courses():
            assignment_sql = f"""with assignment_info as
                            (select ad.due_at AS due_date,ad.due_at at time zone 'utc' at time zone 'America/New_York' as local_date,
                            ad.title AS name,af.course_id AS course_id,af.assignment_id AS id,
                            af.points_possible AS points_possible,af.assignment_group_id AS assignment_group_id
                            from assignment_fact af inner join assignment_dim ad on af.assignment_id = ad.id where af.course_id='{UDW_course_id}' 
                            and ad.visibility = 'everyone' and ad.workflow_state='published')
                            select * from assignment_info
                            """
            status += util_function(UDW_course_id, assignment_sql,'assignment')

        return status


    def submission(self):
        #student submission information for assignments
        # cron status
        status =""

        logger.info("update_submission(): ")

        # delete all records in file_access table
        status += deleteAllRecordInTable("submission")

        # loop through multiple course ids
        for UDW_course_id in Course.objects.get_supported_courses():
            submission_url = f"""with sub_fact as (select submission_id, assignment_id, course_id, user_id, global_canvas_id, published_score from submission_fact sf join user_dim u on sf.user_id = u.id where course_id = '{UDW_course_id}'),
                             enrollment as (select  distinct(user_id) from enrollment_dim where course_id = '{UDW_course_id}' and workflow_state='active' and type = 'StudentEnrollment'),
                             sub_with_enroll as (select sf.* from sub_fact sf join enrollment e on e.user_id = sf.user_id),
                             submission_time as (select sd.id, sd.graded_at from submission_dim sd join sub_fact suf on sd.id=suf.submission_id),
                             assign_fact as (select s.*,a.title from assignment_dim a join sub_with_enroll s on s.assignment_id=a.id where a.course_id='{UDW_course_id}' and a.workflow_state='published' and muted = false),
                             assign_sub_time as (select a.*, t.graded_at from assign_fact a join submission_time t on a.submission_id = t.id)
                             select submission_id AS id, assignment_id AS assignment_id, course_id, global_canvas_id AS user_id, published_score AS score, graded_at AS graded_date from assign_sub_time
                             """
            status += util_function(UDW_course_id, submission_url,'submission')

        return status


    def weight_consideration(self):
        #load the assignment weight consider information with in a course. Some assignments don't have weight consideration
        #the result of it return boolean indicating weight is considered in table calculation or not
        status =""

        logger.info("weight_consideration()")

        # delete all records in assignment_weight_consideration table
        status += deleteAllRecordInTable("assignment_weight_consideration")

        # loop through multiple course ids
        for UDW_course_id in Course.objects.get_supported_courses():
            is_weight_considered_url = f"""with course as (select course_id, sum(group_weight) as group_weight from assignment_group_fact
                                        where course_id = '{UDW_course_id}' group by course_id having sum(group_weight)>1)
                                        (select CASE WHEN EXISTS (SELECT * FROM course WHERE group_weight > 1) THEN CAST(1 AS BOOLEAN) ELSE CAST(0 AS BOOLEAN) END)
                                        """
            status += util_function(UDW_course_id, is_weight_considered_url,'assignment_weight_consideration', 'weight')

            logger.debug(status+"\n\n")

        return status

    def update_with_udw_term(self):
        # cron status
        status = ""

        logger.debug("in update with udw term")

        # delete all records in the table first
        status += deleteAllRecordInTable("academic_terms")

        #select file record from UDW
        term_sql = f"select id, canvas_id, name, date_start, date_end from enrollment_term_dim where date_start > '{settings.EARLIEST_TERM_DATE}'"
        logger.debug(term_sql)
        status += util_function(None, term_sql, 'academic_terms')

        return status

    def do(self):
        logger.info("************ dashboard cron tab")

        status = ""

        status += "Start cron at: " +  str(datetime.datetime.now()) + ";"

        logger.info("************ term")
        status += self.update_with_udw_term()

        logger.info("************ user")
        status += self.update_with_udw_user()


        logger.info("************ file")
        status += self.update_with_udw_file()
        status += self.update_with_bq_access()

        logger.info("************ assignment")
        status += self.update_groups()
        status += self.update_assignment()

        status += self.submission()
        status += self.weight_consideration()
        
        logger.info("************ informational")
        status += self.update_unizin_metadata()

        status += "End cron at: " +  str(datetime.datetime.now()) + ";"

        logger.info("************ total status=" + status + "/n/n")

        return status


