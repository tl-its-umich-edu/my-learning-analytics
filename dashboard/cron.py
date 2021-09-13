from datetime import datetime
import logging
from collections import namedtuple
from typing import Any, Dict, List, Union

import hjson
import pandas as pd
import pytz
import pangres

from django.conf import settings
from django.db import connections as conns, models
from django.db.models import QuerySet
from django_cron import CronJobBase, Schedule
from google.cloud import bigquery
from sqlalchemy import create_engine, types
from sqlalchemy.engine import ResultProxy

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
                       .format(db=db_name,  # your mysql database name
                               user=db_user,  # your mysql user for the database
                               password=db_password,  # password for user
                               host=db_host,
                               port=db_port))

# Set up queries array from configuration file
CRON_QUERY_FILE = settings.CRON_QUERY_FILE
try:
    with open(CRON_QUERY_FILE) as cron_query_file:
        queries = hjson.load(cron_query_file)
except FileNotFoundError:
    logger.error(
        f'Cannot find cron queries file "{CRON_QUERY_FILE}".')
    queries = dict()

# Split a list into *size* shorter pieces


def split_list(a_list: list, size: int = 20):
    return [a_list[i:i + size] for i in range(0, len(a_list), size)]

# the util function


def util_function(data_warehouse_course_id, sql_string, mysql_table, table_identifier=None, param_object=None):
    df = pd.read_sql(sql_string, conns['DATA_WAREHOUSE'], params=param_object)
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
def execute_db_query(query: str, params: List = None) -> ResultProxy:
    with engine.connect() as connection:
        connection.detach()
        if params:
            return connection.execute(query, params)
        else:
            return connection.execute(query)


# remove all records inside the specified table
def delete_all_records_in_table(table_name: str, where_clause: str = "", where_params: List = None):
    # delete all records in the table first, can have an optional where clause
    result_proxy = execute_db_query(f"delete from {table_name} {where_clause}", where_params)
    return(f"\n{result_proxy.rowcount} rows deleted from {table_name}\n")


def soft_update_datetime_field(
    model_inst: models.Model,
    field_name: str,
    warehouse_field_value: Union[datetime, None],
) -> List[str]:
    """
    Uses Django ORM to update DateTime field of model instance if the field value is null and the warehouse data is non-null.
    """
    model_name: str = model_inst.__class__.__name__
    current_field_value: Union[datetime, None] = getattr(model_inst, field_name)
    # Skipping update if the field already has a value, provided by a previous cron run or administrator
    if current_field_value is not None:
        logger.info(
            f'Skipped update of {field_name} for {model_name} instance ({model_inst.id}); existing value was found')
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

    def __init__(self) -> None:
        """Constructor to be used to declare valid_locked_course_ids instance variable."""
        super().__init__()
        self.valid_locked_course_ids: List[int]

    # verify whether course ids are valid
    def verify_course_ids(self):
        # whether all course ids are valid ids
        invalid_course_id_list = []
        course_dfs = []

        logger.debug("in checking course")

        # loop through multiple course ids
        for course_id in Course.objects.get_supported_courses():
            logger.debug(course_id)
            # select course based on course id
            course_sql = queries['CRON_QUERIES']['course'].format(course_id=course_id)
            logger.debug(course_sql)

            course_df = pd.read_sql(course_sql, conns['DATA_WAREHOUSE'])
            logger.debug(course_df)

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
            courses_data = pd.DataFrame(
                columns=["id", "canvas_id", "enrollment_term_id", "name", "start_at", "conclude_at"])

        CourseVerification = namedtuple("CourseVerification", ["invalid_course_ids", "course_data"])
        return CourseVerification(invalid_course_id_list, courses_data)

    # update USER records from DATA_WAREHOUSE

    def update_user(self):

        # cron status
        status = ""

        logger.debug("in update with data warehouse user")

        # delete all records in the table first
        status += delete_all_records_in_table("user")

        # loop through multiple course ids
        for course_id in self.valid_locked_course_ids:

            # select all student registered for the course
            user_sql = queries['CRON_QUERIES']['user'].format(course_id=course_id)
            logger.debug(user_sql)

            status += util_function(course_id, user_sql, 'user')

        return status

    # update unizin metadata from DATA_WAREHOUSE

    def update_unizin_metadata(self):

        # cron status
        status = ""

        logger.debug("in update unizin metadata")

        # delete all records in the table first
        status += delete_all_records_in_table("unizin_metadata")

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
        course_ids = self.valid_locked_course_ids
        file_sql = queries['CRON_QUERIES']['resource']
        logger.debug(file_sql)
        df_attach = pd.read_sql(file_sql, conns['DATA_WAREHOUSE'], params={'course_ids': tuple(course_ids)})
        logger.debug(df_attach)
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

    # update RESOURCE_ACCESS records from BigQuery or LRS data sources
    def update_resource_access(self):
        # cron status
        status = ""

        # return string with concatenated SQL insert result
        return_string = ""

        if settings.LRS_IS_BIGQUERY:
            # Instantiates a client
            bigquery_client = bigquery.Client()

            # BQ Total Bytes Billed to report to status
            total_bytes_billed = 0

        data_last_updated = Course.objects.filter(id__in=self.valid_locked_course_ids).get_data_earliest_date()

        logger.info(f"Deleting all records in resource_access after {data_last_updated}")

        status += delete_all_records_in_table("resource_access", f"WHERE access_time > %s", [data_last_updated, ])
        # loop through multiple course ids, 20 at a time
        # (This is set by the CRON_BQ_IN_LIMIT from settings)
        for data_warehouse_course_ids in split_list(self.valid_locked_course_ids, settings.CRON_BQ_IN_LIMIT):
            # query to retrieve all file access events for one course
            # There is no catch if this query fails, event_store.events needs to exist

            final_query = []
            for k, query_obj in queries['RESOURCE_ACCESS_CONFIG'].items():
                # concatenate the multi-line presentation of query into one single string
                query = query_obj['query']
                if (data_last_updated is not None):
                    # insert the start time parameter for query
                    if query_obj.get('query_data_last_updated_condition'):
                        query += f" {query_obj['query_data_last_updated_condition']} "
                    elif settings.LRS_IS_BIGQUERY:
                        query += " and event_time > CAST(@data_last_updated as DATETIME) "

                final_query.append(query)
            final_query = "  UNION ALL   ".join(final_query)

            data_warehouse_course_ids_short = [
                db_util.incremented_id_to_canvas_id(id) for id in data_warehouse_course_ids]

            logger.debug(final_query)
            logger.debug(data_warehouse_course_ids)

            if settings.LRS_IS_BIGQUERY:
                query_params = [
                    bigquery.ArrayQueryParameter('course_ids', 'STRING', data_warehouse_course_ids),
                    bigquery.ArrayQueryParameter('course_ids_short', 'STRING', data_warehouse_course_ids_short),
                    bigquery.ScalarQueryParameter('canvas_data_id_increment', 'INT64',
                                                  settings.CANVAS_DATA_ID_INCREMENT)
                ]
                if (data_last_updated is not None):
                    # insert the start time parameter for query
                    query_params.append(bigquery.ScalarQueryParameter(
                        'data_last_updated', 'TIMESTAMP', data_last_updated))

                job_config = bigquery.QueryJobConfig()
                job_config.query_parameters = query_params

                # Location must match that of the dataset(s) referenced in the query.
                bq_job = bigquery_client.query(final_query, location='US', job_config=job_config)
                # This is the call that could result in an exception
                resource_access_df: pd.DataFrame = bq_job.result().to_dataframe()
                total_bytes_billed += bq_job.total_bytes_billed
            else:
                query_params = {
                    'course_ids': data_warehouse_course_ids,
                    'course_ids_short': data_warehouse_course_ids_short,
                    'canvas_data_id_increment': settings.CANVAS_DATA_ID_INCREMENT,
                }
                if (data_last_updated is not None):
                    query_params['data_last_updated'] = data_last_updated

                resource_access_df = pd.read_sql(final_query, conns['LRS'], params=query_params)

            resource_access_row_count = len(resource_access_df)
            if resource_access_row_count == 0:
                logger.info('No resource access data found.  Continuing...')
                continue

            logger.debug('resource_access_df row count: '
                         f'({resource_access_row_count})')

            logger.debug(f'resource_access_df:\n'
                         f'{resource_access_df}\n'
                         f'{resource_access_df.dtypes}')

            if 'user_login_name' not in resource_access_df.columns:
                logger.warning('Update queries in configuration file '
                               'to include column "user_login_name".')
            else:
                # process data which contains user login names, but not IDs
                if -1 in resource_access_df['user_id'].values:
                    login_names = ','.join(
                        map(repr, resource_access_df['user_login_name']
                            .drop_duplicates().dropna().values))

                    logger.debug(f'login_names:\n{login_names}')

                    # get user ID as string because pd.merge will convert
                    # int64 to scientific notation; converting SN to int64
                    # causes Obi-Wan problems (off by one)
                    user_id_df = pd.read_sql(
                        'select sis_name as user_login_name,'
                        'cast(user_id as char) as user_id_str '
                        f'from user where sis_name in ({login_names})',
                        engine)

                    logger.debug(f'user_id_df:\n'
                                 f'{user_id_df}\n'
                                 f'{user_id_df.dtypes}')

                    # combine user login and ID data
                    resource_access_df = pd.merge(
                        resource_access_df, user_id_df,
                        on='user_login_name', how='outer')

                    # replace real user_id values for missing ones (-1)
                    resource_access_df.loc[
                        resource_access_df['user_id'] == -1,
                        'user_id'] = resource_access_df['user_id_str']

                    # drops must be in this order; especially dropna() LAST
                    resource_access_df = resource_access_df \
                        .drop(columns=['user_id_str', 'user_login_name']) \
                        .dropna()

                    logger.debug(f'resource_access_df:\n'
                                 f'{resource_access_df}\n'
                                 f'{resource_access_df.dtypes}')
                else:
                    resource_access_df = resource_access_df.drop(
                        columns='user_login_name')

            resource_access_df = resource_access_df.dropna()

            # drop duplicates
            resource_access_df = resource_access_df.drop_duplicates(
                ['resource_id', 'user_id', 'access_time'], keep='first')

            logger.debug('resource_access_df row count (de-duped): '
                         f'({len(resource_access_df)})')

            logger.debug(f'resource_access_df:\n'
                         f'{resource_access_df}\n'
                         f'{resource_access_df.dtypes}')

            # Make resource data from resource_access data
            resource_df = resource_access_df.filter(["resource_id", "resource_type", "name"])
            resource_df = resource_df.drop_duplicates(["resource_id"])
            # pangres.upsert() requires DataFrame to have index
            resource_df = resource_df.set_index('resource_id')

            logger.debug(f'resource_df:\n'
                         f'{resource_df}\n'
                         f'{resource_df.dtypes}')

            resource_access_df = resource_access_df.drop(
                columns=['resource_type', 'name'])

            ra_len_before = len(resource_access_df)

            # Drop rows with NA in any column
            resource_access_df = resource_access_df.dropna()

            logger.info(f'{ra_len_before - len(resource_access_df)} / '
                        f'{ra_len_before} resource_access_df rows with '
                        'NA values dropped')

            logger.debug(f'resource_access_df:\n'
                         f'{resource_access_df}\n'
                         f'{resource_access_df.dtypes}')

            # First, update resource table
            try:
                dtype = {'resource_id': types.VARCHAR(255)}
                pangres.upsert(engine=engine, df=resource_df,
                               table_name='resource', if_row_exists='update',
                               create_schema=False, add_new_columns=False,
                               dtype=dtype)
            except Exception as e:
                logger.exception('Error running upsert on table resource')
                raise

            # Next, update resource_access table
            try:
                resource_access_df.to_sql(con=engine, name='resource_access',
                                          if_exists='append', index=False)
            except Exception as e:
                logger.exception('Error running to_sql on table '
                                 'resource_access')
                raise

            return_string += \
                f'{len(resource_access_df)} rows for courses [' + ', '.join(
                    map(repr, data_warehouse_course_ids)) + ']\n'
            logger.info(return_string)

        if settings.LRS_IS_BIGQUERY:
            total_tbytes_billed = total_bytes_billed / 1024 / 1024 / 1024 / 1024
            # $5 per TB as of Feb 2019 https://cloud.google.com/bigquery/pricing
            total_tbytes_price = round(5 * total_tbytes_billed, 2)
            status += (f'TBytes billed for BQ: {total_tbytes_billed} = '
                       f'${total_tbytes_price}\n')
        return status

    def update_groups(self):
        # cron status
        status = ""

        # delete all records in assignment_group table
        status += delete_all_records_in_table("assignment_groups")

        # update groups
        # Loading the assignment groups inforamtion along with weight/points associated ith arn assignment
        logger.debug("update_assignment_groups(): ")

        # loop through multiple course ids
        for course_id in self.valid_locked_course_ids:
            assignment_groups_sql = queries['CRON_QUERIES']['assignment_groups'].format(course_id=course_id)
            logger.debug(assignment_groups_sql)
            status += util_function(course_id, assignment_groups_sql,
                                    'assignment_groups')

        return status

    def update_assignment(self):
        # Load the assignment info w.r.t to a course such as due_date, points etc
        status = ""

        logger.info("update_assignment(): ")

        # delete all records in assignment table
        status += delete_all_records_in_table("assignment")

        # loop through multiple course ids
        for course_id in self.valid_locked_course_ids:
            assignment_sql = queries['CRON_QUERIES']['assignment'].format(course_id=course_id)
            logger.debug(assignment_sql)
            status += util_function(course_id, assignment_sql,
                                    'assignment')

        return status

    def submission(self):
        # student submission information for assignments
        # cron status
        status = ""

        logger.info("update_submission(): ")

        # delete all records in resource_access table
        status += delete_all_records_in_table("submission")

        # loop through multiple course ids
        # filter out not released grades (submission_dim.posted_at date is not null) and partial grades (submission_dim.workflow_state != 'graded')
        for course_id in self.valid_locked_course_ids:
            submission_sql = queries['CRON_QUERIES']['submission'].format(course_id=course_id)
            logger.debug(submission_sql)
            status += util_function(course_id, submission_sql,
                                    'submission')

        return status

    def weight_consideration(self):
        # load the assignment weight consider information with in a course. Some assignments don't have weight consideration
        # the result of it return boolean indicating weight is considered in table calculation or not
        status = ""

        logger.info("weight_consideration()")

        # delete all records in assignment_weight_consideration table
        status += delete_all_records_in_table("assignment_weight_consideration")

        # loop through multiple course ids
        for course_id in self.valid_locked_course_ids:
            is_weight_considered_sql = queries['CRON_QUERIES']['assignment_weight'].format(course_id=course_id)
            logger.debug(is_weight_considered_sql)
            status += util_function(course_id, is_weight_considered_sql,
                                    'assignment_weight_consideration', 'weight')

            logger.debug(status + "\n\n")

        return status

    def update_term(self) -> str:
        """
        Searches warehouse data for new terms and adds them while leaving existing terms as they are.
        """
        status: str = ''
        logger.info('update_term()')

        term_sql: str = queries['CRON_QUERIES']['term']
        logger.debug(term_sql)
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
        courses: QuerySet = Course.objects.filter(id__in=self.valid_locked_course_ids)
        courses_string: str = ', '.join([str(x) for x in self.valid_locked_course_ids])
        status += f'{str(len(courses))} course(s): {courses_string}\n'

        for course in courses:
            updated_fields: List[str] = []
            warehouse_course_dict: Dict[str, Any] = warehouse_courses_data.loc[warehouse_courses_data['id']
                                                                               == course.id].iloc[0].to_dict()

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

            warehouse_date_start: Union[datetime, None] = (
                warehouse_course_dict['start_at'].to_pydatetime() if pd.notna(
                    warehouse_course_dict['start_at']) else None
            )
            updated_fields += soft_update_datetime_field(course, 'date_start', warehouse_date_start)
            warehouse_date_end: Union[datetime, None] = (
                warehouse_course_dict['conclude_at'].to_pydatetime() if pd.notna(
                    warehouse_course_dict['conclude_at']) else None
            )
            updated_fields += soft_update_datetime_field(course, 'date_end', warehouse_date_end)

            if updated_fields:
                course.save()
                status += f'Course {course.id}: updated {", ".join(updated_fields)}\n'
        return status

    def do(self):
        logger.info("** MyLA cron tab")

        status = ""

        run_start = datetime.now(pytz.UTC)
        status += f"Start cron: {str(run_start)} UTC\n"

        course_verification = self.verify_course_ids()
        invalid_course_id_list = course_verification.invalid_course_ids
        if len(invalid_course_id_list) > 0:
            # error out and stop cron job
            status += f"ERROR: Those course ids are invalid: {invalid_course_id_list}\n"
            status += "End cron: " + str(datetime.now()) + "\n"
            logger.info("************ total status=" + status + "/n/n")
            return (status,)

        # Lock in valid course IDs that data will be pulled for.
        self.valid_locked_course_ids = course_verification.course_data['id'].to_list()
        logger.info(f'Valid locked course IDs: {self.valid_locked_course_ids}')

        # continue cron tasks

        logger.info("** term")
        status += self.update_term()

        if len(self.valid_locked_course_ids) == 0:
            logger.info("Skipping course-related table updates...")
            status += "Skipped course-related table updates.\n"
        else:
            # Update the date unless there is an exception
            exception_in_run = False
            logger.info("** course")
            status += self.update_course(course_verification.course_data)

            logger.info("** user")
            status += self.update_user()

            logger.info("** assignment")
            status += self.update_groups()
            status += self.update_assignment()
            #status += self.submission()
            status += self.weight_consideration()

            logger.info("** resources")
            if 'show_resources_accessed' not in settings.VIEWS_DISABLED:
                try:
                    status += self.update_resource_access()
                    status += self.update_canvas_resource()
                except Exception as e:
                    logger.error(f"Exception running BigQuery update: {str(e)}")
                    status += str(e)
                    exception_in_run = True

        if settings.DATABASES.get('DATA_WAREHOUSE', {}).get('IS_UNIZIN'):
            logger.info("** informational")
            status += self.update_unizin_metadata()

        courses_added_during_cron: List[int] = list(
            set(Course.objects.get_supported_courses()) - set(self.valid_locked_course_ids))
        if courses_added_during_cron:
            logger.warning(
                f'During the run, users added {len(courses_added_during_cron)} course(s): {courses_added_during_cron}')
            logger.warning(f'No data was pulled for these courses.')

        # Set all of the courses to have been updated now (this is the same set update_course runs on)
        if not exception_in_run:
            logger.info(f"Updating all valid courses from when this run was started at {run_start}")
            Course.objects.filter(id__in=self.valid_locked_course_ids).update(data_last_updated=run_start)
        else:
            logger.warn("data_last_updated not updated because of an Exception during this run")

        status += "End cron: " + str(datetime.now()) + "\n"

        logger.info("************ total status=" + status + "\n")

        return status
