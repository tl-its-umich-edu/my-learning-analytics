import datetime, logging
from collections import namedtuple
from typing import Dict, List, Union

import pandas as pd
import pytz
import pangres

from django.conf import settings
from django.db import connections as conns, models
from django.db.models import QuerySet
from django_cron import CronJobBase, Schedule
from google.cloud import bigquery
from sqlalchemy import create_engine, types

from dashboard.common import db_util, utils
from dashboard.models import Course, Resource, AcademicTerms, ResourceAccess


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
                               user = db_user,  # your mysql user for the database
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
        df['course_id'] = data_warehouse_course_id
        df.columns = ['consider_weight', 'course_id']

    # drop duplicates
    df = df.drop_duplicates(keep='first')

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


def soft_update_datetime_field(
    model_inst: models.Model,
    field_name: str,
    warehouse_field_value: Union[datetime.datetime, None],
) -> List[str]:
    """
    Uses Django ORM to update DateTime field of model instance if the field value is null and the warehouse data is non-null.
    """
    model_name: str = model_inst.__class__.__name__
    current_field_value: Union[datetime.datetime, None] = getattr(model_inst, field_name)
    # Skipping update if the field already has a value, provided by a previous cron run or administrator
    if current_field_value is not None:
        logger.info(f'Skipped update of {field_name} for {model_name} instance ({model_inst.id}); existing value was found')
    else:
        if warehouse_field_value:
            warehouse_field_value = warehouse_field_value.replace(tzinfo=pytz.UTC)
            setattr(model_inst, field_name, warehouse_field_value)
            logger.info(f'Updated {field_name} for {model_name} instance ({model_inst.id})')
            return [field_name]
    return []


# cron job to populate course and user tables
class DashboardCronJob(CronJobBase):

    schedule = Schedule(run_at_times=settings.RUN_AT_TIMES)
    code = 'dashboard.DashboardCronJob'    # a unique code

    # verify whether course ids are valid
    def verify_course_ids(self):
        # whether all course ids are valid ids
        invalid_course_id_list = []
        course_dfs = []

        logger.debug("in checking course")

        # loop through multiple course ids
        for course_id in Course.objects.get_supported_courses():
            # select course based on course id
            course_sql = f"""
                select id, canvas_id, enrollment_term_id, name, start_at, conclude_at
                from course_dim c
                where c.id = '{course_id}'
            """
            logger.debug(course_sql)
            course_df = pd.read_sql(course_sql, conns['DATA_WAREHOUSE'])

            # error out when course id is invalid, otherwise add DataFrame to list
            if course_df.empty:
                logger.error(f"""Course {course_id} don't have the entry in data warehouse yet. """)
                invalid_course_id_list.append(course_id)
            else:
                course_dfs.append(course_df)

        if len(course_dfs) > 0:
            courses_data = pd.concat(course_dfs).reset_index()
        else:
            logger.info("No course records were found in the database.")
            courses_data = pd.DataFrame()

        CourseVerification = namedtuple("CourseVerification", ["invalid_course_ids", "course_data"])
        return CourseVerification(invalid_course_id_list, courses_data)


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
        course_ids = Course.objects.get_supported_courses()
        file_sql = f"select id, file_state, display_name from file_dim where course_id in %(course_ids)s"
        df_attach = pd.read_sql(file_sql, conns['DATA_WAREHOUSE'], params={'course_ids':tuple(course_ids)})

        # Update these back again based on the dataframe
        # Remove any rows where file_state is not available!
        for row in df_attach.itertuples(index=False):
            if row.file_state == 'available':
                Resource.objects.filter(resource_id=row.id).update(name=row.display_name)
                status += f"Row {row.id} updated to {row.display_name}\n"
            else:
                Resource.objects.filter(resource_id=row.id).delete()
                status += f"Row {row.id} removed as it is not available\n"
        return status


    # update RESOURCE_ACCESS records from BigQuery
    def update_with_bq_access(self):

        # cron status
        status = ""

        # return string with concatenated SQL insert result
        return_string = ""

        # Instantiates a client
        bigquery_client = bigquery.Client()

        # BQ Total Bytes Billed to report to status
        total_bytes_billed = 0

        # the earliest start date of all courses
        course_start_time = utils.find_earliest_start_datetime_of_courses()

        # the earliest latest date of all resources_accessed
        try:
            latest_resource = ResourceAccess.objects.latest('access_time')
            latest_resource_time = latest_resource.access_time
        except ResourceAccess.DoesNotExist:
            latest_resource_time = course_start_time

        logger.info(f"Earliest Start: {course_start_time} Latest resource: {latest_resource_time}")

        # loop through multiple course ids, 20 at a time
        # (This is set by the CRON_BQ_IN_LIMIT from settings)
        for data_warehouse_course_ids in split_list(Course.objects.get_supported_courses(), settings.CRON_BQ_IN_LIMIT):
            # query to retrieve all file access events for one course
            # There is no catch if this query fails, event_store.events needs to exist

            final_bq_query = []
            for k, query_obj in settings.RESOURCE_ACCESS_CONFIG.items():
                # concatenate the multi-line presentation of query into one single string
                query = " ".join(query_obj['query'])

                if (latest_resource_time is not None):
                    # insert the start time parameter for query
                    query += " and event_time > @latest_resource_time"

                final_bq_query.append(query)
            final_bq_query = "  UNION ALL   ".join(final_bq_query)

            data_warehouse_course_ids_short = [db_util.incremented_id_to_canvas_id(id) for id in data_warehouse_course_ids]

            logger.debug(final_bq_query)
            logger.debug(data_warehouse_course_ids)
            query_params = [
                bigquery.ArrayQueryParameter('course_ids', 'STRING', data_warehouse_course_ids),
                bigquery.ArrayQueryParameter('course_ids_short', 'STRING', data_warehouse_course_ids_short),
                bigquery.ScalarQueryParameter('canvas_data_id_increment', 'INT64', settings.CANVAS_DATA_ID_INCREMENT)
            ]
            if (latest_resource_time is not None):
                # insert the start time parameter for query
                query_params.append(bigquery.ScalarQueryParameter('latest_resource_time', 'TIMESTAMP', latest_resource_time))

            job_config = bigquery.QueryJobConfig()
            job_config.query_parameters = query_params

            # Location must match that of the dataset(s) referenced in the query.
            bq_query = bigquery_client.query(final_bq_query, location='US', job_config=job_config)
            #bq_query.result()
            resource_access_df = bq_query.to_dataframe()
            total_bytes_billed += bq_query.total_bytes_billed

            logger.debug("df row number=" + str(resource_access_df.shape[0]))
            # drop duplicates
            resource_access_df = resource_access_df.drop_duplicates(["resource_id", "user_id", "access_time"], keep='first')

            logger.debug("after drop duplicates, df row number=" + str(resource_access_df.shape[0]))

            logger.debug(resource_access_df)

            # Because we're pulling all the data down into one query we need to manipulate it a little bit
            # Make a copy of the access dataframe
            resource_df = resource_access_df.copy(deep=True)
            # Drop out the columns user and access time from resource data frame
            resource_df = resource_df.drop(["user_id", "access_time"], axis=1)
            # Drop out the duplicates
            resource_df = resource_df.drop_duplicates(["resource_id"])

            # Set a dual index for upsert
            resource_df = resource_df.set_index(["resource_id",])

            # Drop out the columns resource_type, course_id, name from the resource_access
            resource_access_df = resource_access_df.drop(["resource_type","name", "course_id"], axis=1)

            # Drop the columns where there is a Na value
            resource_access_df_drop_na = resource_access_df.dropna()

            logger.info(f"{len(resource_access_df) - len(resource_access_df_drop_na)} / {len(resource_access_df)} rows were dropped because of NA")

            # First update the resource table
            # write to MySQL
            try:
                dtype = {'resource_id': types.VARCHAR(255)}
                pangres.upsert(engine=engine, df=resource_df, table_name='resource', if_row_exists='update', dtype=dtype)
            except Exception as e:
                logger.exception("Error running upsert on table resource")
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


    def update_groups(self):
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
        status = ""

        logger.info("update_submission(): ")

        # delete all records in resource_access table
        status += deleteAllRecordInTable("submission")

        # loop through multiple course ids
        for data_warehouse_course_id in Course.objects.get_supported_courses():
            submission_url = f"""with sub_fact as (select submission_id, assignment_id, course_id, user_id, global_canvas_id, published_score from submission_fact sf join user_dim u on sf.user_id = u.id where course_id = '{data_warehouse_course_id}'),
                enrollment as (select  distinct(user_id) from enrollment_dim where course_id = '{data_warehouse_course_id}' and workflow_state='active' and type = 'StudentEnrollment'),
                sub_with_enroll as (select sf.* from sub_fact sf join enrollment e on e.user_id = sf.user_id),
                submission_time as (select sd.id, sd.graded_at, sd.posted_at at time zone 'utc' at time zone '{settings.TIME_ZONE}' as grade_posted_local_date from submission_dim sd join sub_fact suf on sd.id=suf.submission_id where posted_at is not null and posted_at < getdate()),
                assign_fact as (select s.*,a.title from assignment_dim a join sub_with_enroll s on s.assignment_id=a.id where a.course_id='{data_warehouse_course_id}' and a.workflow_state='published'),
                assign_sub_time as (select a.*, t.graded_at, t.grade_posted_local_date from assign_fact a join submission_time t on a.submission_id = t.id),
                all_assign_sub as (select submission_id AS id, assignment_id AS assignment_id, course_id, global_canvas_id AS user_id, round(published_score,1) AS score, graded_at AS graded_date, grade_posted_local_date from assign_sub_time order by assignment_id)
                select f.*, f1.avg_score from all_assign_sub f join (select assignment_id, round(avg(score),1) as avg_score from all_assign_sub group by assignment_id) as f1 on f.assignment_id = f1.assignment_id;
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
            is_weight_considered_sql = f"""with course as (select course_id, sum(group_weight) as group_weight from assignment_group_fact
                                        where course_id = '{data_warehouse_course_id}' group by course_id having sum(group_weight)>1)
                                        (select CASE WHEN EXISTS (SELECT * FROM course WHERE group_weight > 1) THEN CAST(1 AS BOOLEAN) ELSE CAST(0 AS BOOLEAN) END)
                                        """
            status += util_function(data_warehouse_course_id, is_weight_considered_sql, 'assignment_weight_consideration', 'weight')

            logger.debug(status + "\n\n")

        return status

    def update_term(self) -> str:
        """
        Searches warehouse data for new terms and adds them while leaving existing terms as they are.
        """
        status: str = ''
        logger.info('update_term()')

        term_sql: str = 'SELECT id, canvas_id, name, date_start, date_end FROM enrollment_term_dim;'
        warehouse_term_df: pd.DataFrame = pd.read_sql(term_sql, conns['DATA_WAREHOUSE'])

        existing_terms_ids: List[int] = [term.id for term in list(AcademicTerms.objects.all())]
        new_term_ids: List[int] = [int(id) for id in warehouse_term_df['id'].to_list() if id not in existing_terms_ids]

        if not new_term_ids:
            logger.info('No new terms were found to add to the academic_terms table.')
        else:
            new_term_df: pd.DataFrame = warehouse_term_df.loc[warehouse_term_df['id'].isin(new_term_ids)]
            try:
                new_term_df.to_sql(con=engine, name='academic_terms', if_exists='append', index=False)
                term_message: str = f'Added {len(new_term_df)} new records to academic_terms table: {new_term_ids}'
                logger.info(term_message)
                status += term_message + '\n'
            except Exception as e:
                logger.error(f'Error running to_sql on term table: {e}')
                raise
        return status

    def update_course(self, warehouse_courses_data: pd.DataFrame) -> str:
        """
        Updates course records with data returned from verify_course_ids, only making changes when necessary.
        """
        status: str = ''
        logger.debug('update_course()')

        logger.debug(warehouse_courses_data.to_json(orient='records'))
        courses: QuerySet = Course.objects.all()
        courses_string: str = ', '.join([str(x) for x in Course.objects.get_supported_courses()])
        status += f'{str(len(courses))} course(s): {courses_string}\n'

        for course in courses:
            updated_fields: List[str] = []
            warehouse_course_dict: Dict[str, any] = warehouse_courses_data.loc[warehouse_courses_data['id'] == course.id].iloc[0].to_dict()

            warehouse_course_name: str = warehouse_course_dict['name']
            if course.name != warehouse_course_name:
                course.name = warehouse_course_name
                logger.info(f'Name for {course.id} has been updated.')
                updated_fields.append('name')

            warehouse_term_id: int = int(warehouse_course_dict['enrollment_term_id'])
            if (course.term is None) or (course.term.id != warehouse_term_id):
                course.term = AcademicTerms.objects.get(id=warehouse_term_id)
                logger.info(f'Term for {course.id} has been updated.')
                updated_fields.append('term')

            warehouse_date_start: Union[datetime.datetime, None] = (
                warehouse_course_dict['start_at'].to_pydatetime() if pd.notna(warehouse_course_dict['start_at']) else None
            )
            updated_fields += soft_update_datetime_field(course, 'date_start', warehouse_date_start)
            warehouse_date_end: Union[datetime.datetime, None] = (
                warehouse_course_dict['conclude_at'].to_pydatetime() if pd.notna(warehouse_course_dict['conclude_at']) else None
            )
            updated_fields += soft_update_datetime_field(course, 'date_end', warehouse_date_end)

            if updated_fields:
                course.save()
                status += f'Course {course.id}: updated {", ".join(updated_fields)}\n'
        return status

    def do(self):
        logger.info("** MyLA cron tab")

        status = ""

        status += "Start cron: " +  str(datetime.datetime.now()) + "\n"

        course_verification = self.verify_course_ids()
        invalid_course_id_list = course_verification.invalid_course_ids
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

        if len(Course.objects.get_supported_courses()) == 0:
            logger.info("Skipping course-related table updates...")
            status += "Skipped course-related table updates.\n"
        else:
            logger.info("** course")
            status += self.update_course(course_verification.course_data)

            logger.info("** user")
            status += self.update_user()

            logger.info("** assignment")
            status += self.update_groups()
            status += self.update_assignment()

            status += self.submission()
            status += self.weight_consideration()

            logger.info("** resources")
            if 'show_resources_accessed' not in settings.VIEWS_DISABLED:
                try:
                    status += self.update_with_bq_access()
                    status += self.update_canvas_resource()
                except Exception as e:
                    logger.exception("Exception running BigQuery update")

        if settings.DATA_WAREHOUSE_IS_UNIZIN:
            logger.info("** informational")
            status += self.update_unizin_metadata()

        status += "End cron: " +  str(datetime.datetime.now()) + "\n"

        logger.info("************ total status=" + status + "\n")

        return status