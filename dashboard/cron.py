
from __future__ import print_function #python 3 support

from django.db import connections as conns

from dashboard.common import db_util

import logging
import datetime

from sqlalchemy import create_engine
from django.conf import settings

from dashboard.models import Course, Resource

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

# Split a list into *size* shorter pieces
def split_list(a_list: list, size: int = 20):
    return [a_list[i:i + size] for i in range(0, len(a_list), size)]

# the util function
def util_function(data_warehouse_course_id, sql_string, mysql_table, table_identifier=None):
    df = pd.read_sql(sql_string, conns['DATA_WAREHOUSE'])
    logger.debug(df)

    # Sql returns boolean value so grouping course info along with it so that this could be stored in the DB table.
    if table_identifier == 'weight' and data_warehouse_course_id:
        df['course_id']=data_warehouse_course_id
        df.columns=['consider_weight','course_id']

    # drop duplicates
    df.drop_duplicates(keep='first', inplace=True)

    logger.debug(" table: " + mysql_table + " insert size: " + str(df.shape[0]))

    # write to MySQL
    try:
        df.to_sql(con=engine, name=mysql_table, if_exists='append', index=False)
    except Exception as e:
        logger.exception(f"Error running to_sql on table {mysql_table}")
        raise

    # returns the row size of dataframe
    return f"{str(df.shape[0])} {mysql_table} : {data_warehouse_course_id}\n"

# execute database query
def executeDbQuery(query):
    with engine.connect() as connection:
        connection.detach()
        connection.execute(query)

# remove all records inside the specified table
def deleteAllRecordInTable(tableName):
    # delete all records in the table first
    executeDbQuery(f"delete from {tableName}")

    return f"delete : {tableName}\n"

# cron job to populate course and user tables
class DashboardCronJob(CronJobBase):

    schedule = Schedule(run_at_times=settings.RUN_AT_TIMES)
    code = 'dashboard.DashboardCronJob'    # a unique code

    # verify whether course ids are valid
    def verify_course_ids(self):
        # whether all course ids are valid ids
        invalid_course_id_list = []

        logger.debug("in checking course")

        # loop through multiple course ids
        for course_id in Course.objects.get_supported_courses():
            # select course based on course id
            course_sql = f"""select *
                        from course_dim c
                        where c.id = '{course_id}'
                        """
            logger.debug(course_sql)
            course_df = pd.read_sql(course_sql, conns['DATA_WAREHOUSE'])

            # error out when course id is invalid
            if course_df.empty:
                logger.error(f"""Course {course_id} don't have the entry in data warehouse yet. """)
                invalid_course_id_list.append(course_id)


        return invalid_course_id_list

    # update USER records from DATA_WAREHOUSE
    def update_user(self):

        # cron status
        status = ""

        logger.debug("in update with data warehouse user")

        # delete all records in the table first
        status += deleteAllRecordInTable("user")

        # loop through multiple course ids
        for data_warehouse_course_id in Course.objects.get_supported_courses():


            # select all student registered for the course
            user_sql=f"""with
                         enroll_data as (select id as enroll_id, user_id, type from enrollment_dim where course_id='{data_warehouse_course_id}'
                                         and type in ('StudentEnrollment', 'TaEnrollment', 'TeacherEnrollment') and workflow_state= 'active'),
                         user_info as (select p.unique_name,p.sis_user_id, u.name, u.id as user_id, u.global_canvas_id
                                        from pseudonym_dim p join user_dim u on u.id = p.user_id where p.sis_user_id is not null),
                         user_enroll as (select u.unique_name, u.sis_user_id, u.name, u.user_id, e.enroll_id,
                                         u.global_canvas_id, e.type from enroll_data e join user_info u on e.user_id= u.user_id),
                         course_fact as (select enrollment_id, current_score, final_score from course_score_fact
                                         where course_id='{data_warehouse_course_id}'),
                         final as (select u.global_canvas_id as user_id,u.name, u.sis_user_id as sis_id, u.unique_name as sis_name,
                                   '{data_warehouse_course_id}' as course_id, c.current_score as current_grade, c.final_score as final_grade,
                                    u.type as enrollment_type
                                    from user_enroll u left join course_fact c on u.enroll_id= c.enrollment_id)
                         select * from final
                      """
            logger.debug(user_sql)

            status += util_function(data_warehouse_course_id, user_sql, 'user')

        return status

    # update unizin metadata from DATA_WAREHOUSE
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



    # update file records from Canvas that don't have names provided
    def update_canvas_resource(self):
        # cron status
        status = ""

        logger.debug("in update canvas resource")

        # Select all the files for these courses
        file_sql = f"select id, file_state, display_name from file_dim where course_id in %(course_ids)s"
        df_attach = pd.read_sql(file_sql, conns['DATA_WAREHOUSE'], params={'course_ids':tuple(Course.objects.get_supported_courses())})

        # Update these back again based on the dataframe
        # Remove any rows where file_state is not available!
        for row in df_attach.itertuples(index=False):
            if row.file_state == 'available':
                Resource.objects.filter(id=row.id).update(name=row.display_name)
                status += f"Row {row.id} updated to {row.display_name}\n"
            else:
                Resource.objects.filter(id=row.id).delete()
                status += f"Row {row.id} removed as it is not available\n"

        return status

    # update RESOURCE_ACCESS records from BigQuery
    def update_with_bq_access(self):

        # cron status
        status = ""

        # delete all records in resource and resource_access table
        status += deleteAllRecordInTable("resource")
        status += deleteAllRecordInTable("resource_access")

        # return string with concatenated SQL insert result
        return_string = ""

        # Instantiates a client
        bigquery_client = bigquery.Client()

        # BQ Total Bytes Billed to report to status
        total_bytes_billed = 0

        # loop through multiple course ids, 20 at a time
        # (This is set by the CRON_BQ_IN_LIMIT from settings)
        for data_warehouse_course_ids in split_list(Course.objects.get_supported_courses(), settings.CRON_BQ_IN_LIMIT):
            # query to retrieve all file access events for one course
            # There is no catch if this query fails, event_store.events needs to exist

            final_bq_query = []
            for k, query_obj in settings.RESOURCE_ACCESS_CONFIG.items():
                final_bq_query.append(query_obj['query'])
            final_bq_query = "  UNION ALL   ".join(final_bq_query)

            data_warehouse_course_ids_short = [db_util.incremented_id_to_canvas_id(id) for id in data_warehouse_course_ids]

            logger.debug(final_bq_query)
            logger.debug(data_warehouse_course_ids)
            query_params = [
                bigquery.ArrayQueryParameter('course_ids', 'STRING', data_warehouse_course_ids),
                bigquery.ArrayQueryParameter('course_ids_short', 'STRING', data_warehouse_course_ids_short),
                bigquery.ScalarQueryParameter('canvas_data_id_increment', 'INT64', settings.CANVAS_DATA_ID_INCREMENT)
            ]
            job_config = bigquery.QueryJobConfig()
            job_config.query_parameters = query_params

            # Location must match that of the dataset(s) referenced in the query.
            bq_query = bigquery_client.query(final_bq_query, location='US', job_config=job_config)
            #bq_query.result()
            resource_access_df = bq_query.to_dataframe()
            total_bytes_billed += bq_query.total_bytes_billed

            logger.debug("df row number=" + str(resource_access_df.shape[0]))
            # drop duplicates
            resource_access_df.drop_duplicates(["resource_id", "user_id", "access_time"], keep='first', inplace=True)

            logger.debug("after drop duplicates, df row number=" + str(resource_access_df.shape[0]))

            logger.debug(resource_access_df)

            # Because we're pulling all the data down into one query we need to manipulate it a little bit
            # Make a copy of the access dataframe
            resource_df = resource_access_df.copy(deep=True)
            # Drop out the columns user and access time from resource data frame
            resource_df.drop(["user_id", "access_time"], axis=1, inplace=True)
            # Drop out the duplicates
            resource_df.drop_duplicates(["resource_id", "course_id"], inplace=True)
            # Rename the column resource_id to id
            resource_df.rename(columns={"resource_id": "id"}, inplace=True)

            # Drop out the columns resource_type, course_id, name from the resource_access
            resource_access_df.drop(["resource_type","name", "course_id"], axis=1, inplace=True)

            # Drop the columns where there is a Na value
            resource_access_df_drop_na = resource_access_df.dropna()

            logger.info(f"{len(resource_access_df) - len(resource_access_df_drop_na)} / {len(resource_access_df)} rows were dropped because of NA")

            # First update the resource table
            # write to MySQL
            try:
                resource_df.to_sql(con=engine, name='resource', if_exists='append', index=False)
            except Exception as e:
                logger.exception("Error running to_sql on table resource")
                raise

            try:
                resource_access_df_drop_na.to_sql(con=engine, name='resource_access', if_exists='append', index=False)
            except Exception as e:
                logger.exception("Error running to_sql on table resource_access")
                raise
            return_string += str(resource_access_df_drop_na.shape[0]) + " rows for courses " + ",".join(map(str, data_warehouse_course_ids)) + "\n"
            logger.info(return_string)

        total_tbytes_billed = total_bytes_billed / 1024 / 1024 / 1024 / 1024
        # $5 per TB as of Feb 2019 https://cloud.google.com/bigquery/pricing
        total_tbytes_price = round(5 * total_tbytes_billed, 2)
        status +=(f"TBytes billed for BQ: {total_tbytes_billed} = ${total_tbytes_price}\n")
        return status

    def update_assignment_groups(self):
        # cron status
        status =""

        # delete all records in assignment_group table
        status += deleteAllRecordInTable("assignment_groups")

        # update groups
        #Loading the assignment groups inforamtion along with weight/points associated ith arn assignment
        logger.debug("update_assignment_groups(): ")

        # loop through multiple course ids
        for data_warehouse_course_id in Course.objects.get_supported_courses():
            assignment_groups_sql= f"""with assignment_details as (select ad.due_at,ad.title,af.course_id ,af.assignment_id,af.points_possible,af.assignment_group_id from assignment_fact af inner join assignment_dim ad on af.assignment_id = ad.id where af.course_id='{data_warehouse_course_id}' and ad.visibility = 'everyone' and ad.workflow_state='published'),
            assignment_grp as (select agf.*, agd.name from assignment_group_dim agd join assignment_group_fact agf on agd.id = agf.assignment_group_id  where agd.course_id='{data_warehouse_course_id}' and workflow_state='available'),
            assign_more as (select distinct(a.assignment_group_id) ,da.group_points from assignment_details a join (select assignment_group_id, sum(points_possible) as group_points from assignment_details group by assignment_group_id) as da on a.assignment_group_id = da.assignment_group_id ),
            grp_full as (select a.group_points, b.assignment_group_id from assign_more a right join assignment_grp b on a.assignment_group_id = b.assignment_group_id),
            assign_rules as (select DISTINCT ad.assignment_group_id,agr.drop_lowest,agr.drop_highest from grp_full ad join assignment_group_rule_dim agr on ad.assignment_group_id=agr.assignment_group_id),
            assignment_grp_points as (select ag.*, am.group_points AS group_points from assignment_grp ag join grp_full am on ag.assignment_group_id = am.assignment_group_id),
            assign_final as (select assignment_group_id AS id, course_id AS course_id, group_weight AS weight, name AS name, group_points AS group_points from assignment_grp_points)
            select g.*, ar.drop_lowest,ar.drop_highest from assign_rules ar join assign_final g on ar.assignment_group_id=g.id;
                                   """
            status += util_function(data_warehouse_course_id, assignment_groups_sql, 'assignment_groups')

        return status

    def update_assignment(self):
        #Load the assignment info w.r.t to a course such as due_date, points etc
        status =""

        logger.info("update_assignment(): ")

        # delete all records in assignment table
        status += deleteAllRecordInTable("assignment")

        # loop through multiple course ids
        for data_warehouse_course_id in Course.objects.get_supported_courses():
            assignment_sql = f"""with assignment_info as
                            (select ad.due_at AS due_date,ad.due_at at time zone 'utc' at time zone '{settings.TIME_ZONE}' as local_date,
                            ad.title AS name,af.course_id AS course_id,af.assignment_id AS id,
                            af.points_possible AS points_possible,af.assignment_group_id AS assignment_group_id
                            from assignment_fact af inner join assignment_dim ad on af.assignment_id = ad.id where af.course_id='{data_warehouse_course_id}'
                            and ad.visibility = 'everyone' and ad.workflow_state='published')
                            select * from assignment_info
                            """
            status += util_function(data_warehouse_course_id, assignment_sql,'assignment')

        return status


    def submission(self):
        #student submission information for assignments
        # cron status
        status =""

        logger.info("update_submission(): ")

        # delete all records in resource_access table
        status += deleteAllRecordInTable("submission")

        # loop through multiple course ids
        for data_warehouse_course_id in Course.objects.get_supported_courses():
            submission_url = f"""with sub_fact as (select submission_id, assignment_id, course_id, user_id, global_canvas_id, published_score from submission_fact sf join user_dim u on sf.user_id = u.id where course_id = '{data_warehouse_course_id}'),
                             enrollment as (select  distinct(user_id) from enrollment_dim where course_id = '{data_warehouse_course_id}' and workflow_state='active' and type = 'StudentEnrollment'),
                             sub_with_enroll as (select sf.* from sub_fact sf join enrollment e on e.user_id = sf.user_id),
                             submission_time as (select sd.id, sd.graded_at from submission_dim sd join sub_fact suf on sd.id=suf.submission_id),
                             assign_fact as (select s.*,a.title from assignment_dim a join sub_with_enroll s on s.assignment_id=a.id where a.course_id='{data_warehouse_course_id}' and a.workflow_state='published' and muted = false),
                             assign_sub_time as (select a.*, t.graded_at from assign_fact a join submission_time t on a.submission_id = t.id),
                             all_assign_sub as (select submission_id AS id, assignment_id AS assignment_id, course_id, global_canvas_id AS user_id, round(published_score,1) AS score, graded_at AS graded_date from assign_sub_time order by assignment_id)
                             select f.*, f1.avg_score from all_assign_sub f join (select assignment_id, round(avg(score),1) as avg_score from all_assign_sub group by assignment_id) as f1 on f.assignment_id = f1.assignment_id
                             """
            status += util_function(data_warehouse_course_id, submission_url,'submission')

        return status


    def weight_consideration(self):
        #load the assignment weight consider information with in a course. Some assignments don't have weight consideration
        #the result of it return boolean indicating weight is considered in table calculation or not
        status =""

        logger.info("weight_consideration()")

        # delete all records in assignment_weight_consideration table
        status += deleteAllRecordInTable("assignment_weight_consideration")

        # loop through multiple course ids
        for data_warehouse_course_id in Course.objects.get_supported_courses():
            is_weight_considered_url = f"""with course as (select course_id, sum(group_weight) as group_weight from assignment_group_fact
                                        where course_id = '{data_warehouse_course_id}' group by course_id having sum(group_weight)>1)
                                        (select CASE WHEN EXISTS (SELECT * FROM course WHERE group_weight > 1) THEN CAST(1 AS BOOLEAN) ELSE CAST(0 AS BOOLEAN) END)
                                        """
            status += util_function(data_warehouse_course_id, is_weight_considered_url,'assignment_weight_consideration', 'weight')

            logger.debug(status+"\n\n")

        return status

    def update_group_membership(self):
        #load group membership
        status =""

        # delete all records in group_membership table
        status += deleteAllRecordInTable("group_membership")

        # loop through multiple course ids
        for data_warehouse_course_id in Course.objects.get_supported_courses():
            group_membership_url = f"""
                with grp_info as (select gf.group_id
                                  from group_fact gf join group_dim gd on gf.group_id = gd.id
                                  where gf.parent_course_id = '{data_warehouse_course_id}' and gd.workflow_state = 'available'),
                grp_member_info as (select gmf.group_id, ud.global_canvas_id as user_id, gmf.group_membership_id
                                    from group_membership_fact gmf join grp_info gi on gmf.group_id = gi.group_id join user_dim ud on gmf.user_id = ud.id)
                select gmi.group_id, gmi.user_id
                from group_membership_dim gmd join grp_member_info gmi on gmd.id = gmi.group_membership_id
                where workflow_state = 'accepted'
            """
            status += util_function(data_warehouse_course_id, group_membership_url, 'group_membership')
            logger.debug(status+"\n\n")

        return status

    def update_discussion(self):
        #load the discussion topic and entry information within a course into a flat table.
        status =""

        # delete all records in discussion_flattened table
        status += deleteAllRecordInTable("discussion_flattened")

        # loop through multiple course ids
        for data_warehouse_course_id in Course.objects.get_supported_courses():
            # NOTE: Pandas has trouble with int columns with null values mixed in (converts to float causing perscision issues)
            # as a way around this, some fields (entry_id, assignment_id, group_id, and user_id) are cast as varchar in the query
            discussion_url = f"""
                with grp_info as (select gf.group_id, gf.parent_course_id, gd.is_public
                                  from group_fact gf join group_dim gd on gf.group_id = gd.id
                                  where gf.parent_course_id = '{data_warehouse_course_id}' and gd.workflow_state = 'available'),
                topic_info as (select dtf.discussion_topic_id, dtf.assignment_id, dtf.group_id, ud.global_canvas_id as user_id, gi.is_public as group_is_public
                               from discussion_topic_fact dtf left join grp_info gi on dtf.group_id = gi.group_id left join user_dim ud on dtf.user_id = ud.id
                               where dtf.course_id = '{data_warehouse_course_id}' or gi.parent_course_id = '{data_warehouse_course_id}'),
                topic_more as (select ti.discussion_topic_id as topic_id, null as entry_id, '{data_warehouse_course_id}' as course_id,
                               CAST(ti.assignment_id as VARCHAR), CAST(ti.group_id as VARCHAR), CAST(ti.user_id as VARCHAR), ti.group_is_public,
                               dtd.title, dtd.message, dtd.updated_at
                               from discussion_topic_dim dtd join topic_info ti on dtd.id = ti.discussion_topic_id
                               where dtd.type is null and dtd.workflow_state = 'active'),
                entry_info as (select tm.topic_id, def.discussion_entry_id, tm.assignment_id, tm.group_id, ud.global_canvas_id as user_id, tm.group_is_public
                               from discussion_entry_fact def join topic_more tm on def.topic_id = tm.topic_id left join user_dim ud on def.user_id = ud.id)
                select * from topic_more
                UNION
                select ei.topic_id, CAST(ei.discussion_entry_id as VARCHAR) as entry_id, '{data_warehouse_course_id}' as course_id,
                CAST(ei.assignment_id as VARCHAR), CAST(ei.group_id as VARCHAR), CAST(ei.user_id as VARCHAR), ei.group_is_public,
                null as title, ded.message, ded.updated_at
                from discussion_entry_dim ded join entry_info ei on ded.id = ei.discussion_entry_id
                where ded.workflow_state = 'active'
                order by topic_id, entry_id nulls first
            """
            status += util_function(data_warehouse_course_id, discussion_url, 'discussion_flattened')
            logger.debug(status+"\n\n")

        return status

    def update_term(self):
        # cron status
        status = ""

        logger.debug("in update with data warehouse term")

        # delete all records in the table first
        status += deleteAllRecordInTable("academic_terms")

        #select term records from DATA_WAREHOUSE
        term_sql = f"select id, canvas_id, name, date_start, date_end from enrollment_term_dim where date_start > '{settings.EARLIEST_TERM_DATE}'"
        logger.debug(term_sql)
        status += util_function(None, term_sql, 'academic_terms')

        return status

    def do(self):
        logger.info("** dashboard cron tab")

        status = ""

        status += "Start cron: " +  str(datetime.datetime.now()) + "\n"

        invalid_course_id_list = self.verify_course_ids()
        logger.debug(f"invalid id {invalid_course_id_list}")
        if len(invalid_course_id_list) > 0:
            # error out and stop cron job
            status += f"ERROR: Those course ids are invalid: {invalid_course_id_list}\n"
            status += "End cron: " +  str(datetime.datetime.now()) + "\n"
            logger.info("************ total status=" + status + "/n/n")
            return (status,)

        # continue cron tasks

        logger.info("** term")
        status += self.update_term()

        logger.info("** user")
        status += self.update_user()

        logger.info("** assignment")
        status += self.update_assignment_groups()
        status += self.update_assignment()

        status += self.submission()
        status += self.weight_consideration()

        logger.info("** file")
        if 'show_resources_accessed' not in settings.VIEWS_DISABLED:
            try:
                status += self.update_with_bq_access()
                status += self.update_canvas_resource()
            except Exception as e:
                logger.info(e)

        logger.info("** group")
        status += self.update_group_membership()

        logger.info("** discussion")
        # TODO: add a if condition around this if in VIEWS_DISABLED
        status += self.update_discussion()

        if settings.DATA_WAREHOUSE_IS_UNIZIN:
            logger.info("** informational")
            status += self.update_unizin_metadata()

        status += "End cron: " +  str(datetime.datetime.now()) + "\n"

        logger.info("************ total status=" + status + "\n")

        return status