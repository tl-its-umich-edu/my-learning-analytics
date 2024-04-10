from datetime import datetime
import logging
from collections import namedtuple
from typing import Any, Dict, List, Union
from zoneinfo import ZoneInfo

import hjson
import pandas as pd
import pangres

from django.conf import settings
from django.db import connections as conns, models
from django.db.models import QuerySet
from django_cron import CronJobBase, Schedule
from google.cloud import bigquery
from sqlalchemy import types, text
from sqlalchemy.engine import ResultProxy
from sqlalchemy.orm import sessionmaker

from dashboard.common import db_util
from dashboard.models import Course, Resource, AcademicTerms, User


logger = logging.getLogger(__name__)

# cron job to populate course and user tables
class DashboardCronJob(CronJobBase):

    schedule = Schedule(run_at_times=settings.RUN_AT_TIMES)
    code = 'dashboard.DashboardCronJob'    # a unique code

    def setup_queries(self):
        # Set up queries array from configuration file
        CRON_QUERY_FILE = settings.CRON_QUERY_FILE
        logger.info(CRON_QUERY_FILE)
        try:
            with open(CRON_QUERY_FILE) as cron_query_file:
                self.queries = hjson.load(cron_query_file)
        except FileNotFoundError:
            logger.error(f'Cannot find cron queries file "{CRON_QUERY_FILE}".')

    def setup_bigquery(self):
        # Instantiates a client
        self.bigquery_client = bigquery.Client()
#        self.bigquery_client = bigquery.Client.from_service_account_json(settings.BIGQUERY_SERVICE_ACCOUNT_JSON)

        # BQ Total Bytes Billed to report to status
        self.total_bytes_billed = 0

    def __init__(self) -> None:
        """Constructor to be used to declare valid_locked_course_ids instance variable."""
        super().__init__()
        self.myla_engine = db_util.create_sqlalchemy_engine(settings.DATABASES['default'])
        self.setup_bigquery()
        self.setup_queries()
        self.valid_locked_course_ids: List[str]

    # Split a list into *size* shorter pieces
    def split_list(self, a_list: list, size: int = 20):
        return [a_list[i:i + size] for i in range(0, len(a_list), size)]


    # This util_function is used to run a query against the context store and insert the result into a MySQL table
    def util_function(self, sql_string, mysql_table, params=None, table_identifier=None):
        logger.debug(f'sql={sql_string}')
        logger.debug(f'table={mysql_table} params={params} table_identifier={table_identifier}')

        df = self.execute_bq_query(sql_string, params).to_dataframe()

        # drop duplicates
        df = df.drop_duplicates(keep='first')

        logger.debug(" table: " + mysql_table + " insert size: " + str(df.shape[0]))

        # write to MySQL
        try:
            df.to_sql(con=self.myla_engine, name=mysql_table, if_exists='append', index=False)
        except Exception as e:
            logger.exception(f"Error running to_sql on table {mysql_table}")
            raise

        # returns the row size of dataframe
        return f"{str(df.shape[0])} {mysql_table} : {params}\n"


    # Execute a query against the bigquery database

    def execute_bq_query(self, query: str, params: Dict = None):
        # Remove the newlines from the query
        query = query.replace("\n", " ")

        if params:
            try:
                # Convert to bq schema object
                query_params= db_util.map_dict_to_query_job_config(params)
                query_job_config = bigquery.QueryJobConfig(query_parameters=query_params)
                query_job = self.bigquery_client.query(query, job_config=query_job_config)
                query_job_result = query_job.result()

                self.total_bytes_billed += query_job.total_bytes_billed
                logger.debug(f"This job had {query_job.total_bytes_billed} bytes. Total: {self.total_bytes_billed}")
                return query_job_result
            except Exception as e:
                logger.error(f"Error ({str(e)}) in setting up schema for query {query}.")
                raise Exception(e)
        else:
            query_job = self.bigquery_client.query(query)
            query_job_result = query_job.result()
            self.total_bytes_billed += query_job.total_bytes_billed
            logger.debug(f"This job had {query_job.total_bytes_billed} bytes. Total: {self.total_bytes_billed}")
            return query_job_result

    # Execute a query against the MyLA database
    def execute_myla_query(self, query: str, params: Dict = None) -> ResultProxy:
        with self.myla_engine.begin() as connection:
            connection.detach()
            if params:
                return connection.execute(text(query), params)
            else:
                return connection.execute(text(query))

    # remove all records inside the specified table
    def execute_myla_delete_query(self, query: str, params: Optional[Dict[str,str]] = None) -> str:
        # delete all records in the table first, can have an optional where clause
        result_proxy = self.execute_myla_query(query, params)
        return(f"\n{result_proxy.rowcount} rows deleted from {table_name}\n")

    def soft_update_datetime_field(
        self,
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
                warehouse_field_value = warehouse_field_value.replace(tzinfo=ZoneInfo('UTC'))
                setattr(model_inst, field_name, warehouse_field_value)
                logger.info(f'Updated {field_name} for {model_name} instance ({model_inst.id})')
                return [field_name]
        return []

    # verify whether course ids are valid
    def verify_course_ids(self):
        # whether all course ids are valid ids
        invalid_course_id_list = []
        logger.debug("in checking course")
        supported_courses = Course.objects.get_supported_courses()
        course_ids = [str(x) for x in supported_courses.values_list('id', flat=True)]
        courses_data = self.execute_bq_query(self.queries['course'],
                                             params={'course_ids': course_ids})
        courses_data = courses_data.to_dataframe()
        # error out when course id is invalid, otherwise add DataFrame to list
        for course_id, data_last_updated in supported_courses:
            if course_id not in list(courses_data['id']):
                # Check if the course was ever updated by cron. If it was updated it is invalid, otherwise don't consider this an error and skip it.
                if data_last_updated:
                    logger.error(f"Course {course_id} doesn't have an entry in data warehouse yet. It has local data, so marking invalid.")
                    invalid_course_id_list.append(course_id)
                else:
                    logger.info(f"Course {course_id} doesn't have an entry in data warehouse yet. It hasn't been updated locally, so skipping.")
        if len(invalid_course_id_list) > 0:
            logger.error(f'Course {invalid_course_id_list} do not exist in data warehouse yet. ')
        if len(courses_data) == 0:
            logger.info("No course records were found in the database.")
            courses_data = pd.DataFrame(
                columns=["id", "canvas_id", "enrollment_term_id", "name", "start_at", "conclude_at"])

        CourseVerification = namedtuple("CourseVerification", ["invalid_course_ids", "course_data"])
        return CourseVerification(invalid_course_id_list, courses_data)

    # update USER records from DATA_WAREHOUSE

    def update_user(self):

        # cron status
        status = ""

        logger.info("in update with data warehouse user")

        # delete all records in the table first
        status += self.execute_myla_delete_query("DELETE FROM user")

        # select all student registered for the course
        status += self.util_function(
                                self.queries['user'],
                                'user',
                                {'course_ids': self.valid_locked_course_ids,
                                'canvas_data_id_increment': settings.CANVAS_DATA_ID_INCREMENT
                                })

        return status

    # update unizin metadata from DATA_WAREHOUSE

    def update_unizin_metadata(self):

        # cron status
        status = ""

        logger.debug("in update unizin metadata")

        # delete all records in the table first
        status += self.execute_myla_delete_query("DELETE FROM unizin_metadata")

        # select all student registered for the course
        metadata_sql = self.queries['metadata']

        logger.debug(metadata_sql)

        status += self.util_function(metadata_sql, 'unizin_metadata')

        return status

    # update file records from Canvas that don't have names provided

    def update_canvas_resource(self):
        # cron status
        status = ""

        logger.info("in update canvas resource")

        # Select all the files for these courses
        # convert int array to str array
        df_attach = self.execute_bq_query(self.queries['resource'], params={'course_ids': self.valid_locked_course_ids}).to_dataframe()
        logger.debug(df_attach)
        # Update these back again based on the dataframe
        # Remove any rows where file_state is not available!
        for row in df_attach.itertuples(index=False):
            if row.file_state == 'available':
                Resource.objects.filter(resource_id=row.id).update(name=row.display_name)
                logger.debug(f"Row {row.id} updated to {row.display_name}")
            else:
                Resource.objects.filter(resource_id=row.id).delete()
                logger.debug(f"Row {row.id} removed as it is not available")
        return status

    # update RESOURCE_ACCESS records from BigQuery or LRS data sources
    def update_resource_access(self):
        # cron status
        status = ""

        logger.info("in update resource access")

        # return string with concatenated SQL insert result
        return_string = ""

        data_last_updated = Course.objects.filter(id__in=self.valid_locked_course_ids).get_data_earliest_date()

        logger.info(f"Deleting all records in resource_access after {data_last_updated}")

        status += self.execute_myla_delete_query("DELETE FROM resource_access WHERE access_time > :data_last_updated", {'data_last_updated': data_last_updated })

        # loop through multiple course ids, 20 at a time
        # (This is set by the CRON_BQ_IN_LIMIT from settings)
        for data_warehouse_course_ids in self.split_list(self.valid_locked_course_ids, settings.CRON_BQ_IN_LIMIT):
            # query to retrieve all file access events for one course
            # There is no catch if this query fails, event_store.events needs to exist
            final_query = []
            for k, query_obj in settings.RESOURCE_ACCESS_CONFIG.items():
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

            # convert int array to string array
            data_warehouse_course_ids_short = [
                db_util.incremented_id_to_canvas_id(id) for id in data_warehouse_course_ids]
            course_ids_short = list(map(str, data_warehouse_course_ids_short))

            logger.debug(final_query)
            logger.debug(data_warehouse_course_ids)

            if settings.LRS_IS_BIGQUERY:
                query_params = [
                    bigquery.ArrayQueryParameter('course_ids', 'STRING', data_warehouse_course_ids),
                    bigquery.ArrayQueryParameter('course_ids_short', 'STRING', course_ids_short),
                    bigquery.ScalarQueryParameter('canvas_data_id_increment', 'INT64',
                                                  settings.CANVAS_DATA_ID_INCREMENT)
                ]
                if (data_last_updated is not None):
                    # insert the start time parameter for query
                    query_params.append(bigquery.ScalarQueryParameter(
                        'data_last_updated', 'TIMESTAMP', data_last_updated))
                    query_params.append(bigquery.ArrayQueryParameter(
                        'canvas_event_urls', 'STRING', settings.CANVAS_EVENT_URLS))
                job_config = bigquery.QueryJobConfig()
                job_config.query_parameters = query_params

                # Location must match that of the dataset(s) referenced in the query.
                bq_job = self.bigquery_client.query(final_query, location='US', job_config=job_config)
                # This is the call that could result in an exception
                resource_access_df: pd.DataFrame = bq_job.to_dataframe()
                self.total_bytes_billed += bq_job.total_bytes_billed
                logger.debug(self.total_bytes_billed)
            else:
                query_params = {
                    'course_ids': data_warehouse_course_ids,
                    'course_ids_short': course_ids_short,
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
                        self.myla_engine)

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
                    resource_access_df['user_id'] = pd.to_numeric(resource_access_df['user_id'])
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
            # only keep access events generated by students
            student_enrollment_type = User.EnrollmentType.STUDENT
            student_enrollment_df = pd.read_sql(
                'select user_id, course_id from user where enrollment_type= %s',
                self.myla_engine, params=[(str(student_enrollment_type),)])
            resource_access_df = pd.merge(
                resource_access_df, student_enrollment_df,
                on=['user_id', 'course_id'],
                # use inner merge to keep only resource access event (left)
                # innitiated by people with student enrollment type (right)
                how='inner')
            # First, update resource table
            try:
                dtype = {'resource_id': types.VARCHAR(255)}
                pangres.upsert(con=self.myla_engine, df=resource_df,
                               table_name='resource', if_row_exists='update',
                               create_schema=False, add_new_columns=False,
                               dtype=dtype)
            except Exception as e:
                logger.exception('Error running upsert on table resource')
                raise

            # Next, update resource_access table
            try:
                resource_access_df.to_sql(con=self.myla_engine, name='resource_access',
                                          if_exists='append', index=False)
            except Exception as e:
                logger.exception('Error running to_sql on table '
                                 'resource_access')
                raise

            return_string += \
                f'{len(resource_access_df)} rows for courses [' + ', '.join(
                    map(repr, data_warehouse_course_ids)) + ']\n'
            logger.info(return_string)

        return status

    def update_groups(self):
        # cron status
        status = ""

        logger.info("update_groups(): ")

        # delete all records in assignment_group table
        status += self.execute_myla_delete_query("DELETE FROM assignment_groups")

        # update groups
        # Loading the assignment groups inforamtion along with weight/points associated ith arn assignment
        logger.debug("update_assignment_groups(): ")

        # loop through multiple course ids
        status += self.util_function(self.queries['assignment_groups'],
                                'assignment_groups',
                                {'course_ids': self.valid_locked_course_ids})

        return status

    def update_assignment(self):
        # Load the assignment info w.r.t to a course such as due_date, points etc
        status = ""

        logger.info("update_assignment(): ")

        # delete all records in assignment table
        status += self.execute_myla_delete_query("DELETE FROM assignment")

        # loop through multiple course ids
        status += self.util_function(self.queries['assignment'],
                                    'assignment',
                                    {'course_ids': self.valid_locked_course_ids})

        return status

    def submission(self):
        # student submission information for assignments
        # cron status
        status = ""

        logger.info("update_submission(): ")

        # delete all records in submission table
        status += self.execute_myla_delete_query("DELETE FROM submission")

        # loop through multiple course ids
        # filter out not released grades (submission_dim.posted_at date is not null) and partial grades (submission_dim.workflow_state != 'graded')
        query_params = {
                        'course_ids': self.valid_locked_course_ids,
                        'canvas_data_id_increment': settings.CANVAS_DATA_ID_INCREMENT,
                        }

        df = self.execute_bq_query(self.queries['submission'], query_params).to_dataframe()
        df = df.drop_duplicates(keep='first')
        df.to_sql(con=self.myla_engine, name='submission', if_exists='append', index=False)

        status+=f"{str(df.shape[0])} submission: {query_params}\n"

        # returns the row size of dataframe
        return status

    def weight_consideration(self):
        # load the assignment weight consider information with in a course. Some assignments don't have weight consideration
        # the result of it return boolean indicating weight is considered in table calculation or not
        status = ""

        logger.info("weight_consideration()")

        # delete all records in assignment_weight_consideration table
        status += self.execute_myla_delete_query("DELETE FROM assignment_weight_consideration")

        # loop through multiple course ids
        status += self.util_function(self.queries['assignment_weight'],
                                    'assignment_weight_consideration',
                                    {'course_ids': self.valid_locked_course_ids },
                                    'weight')

        logger.debug(status + "\n\n")

        return status

    def update_term(self) -> str:
        """
        Searches warehouse data for new terms and adds them while leaving existing terms as they are.
        """
        status: str = ''
        logger.info('update_term()')

        term_sql: str = self.queries['term']
        logger.debug(term_sql)
        warehouse_term_df: pd.DataFrame = self.execute_bq_query(term_sql).to_dataframe()

        existing_terms_ids: List[int] = [term.id for term in list(AcademicTerms.objects.all())]
        new_term_ids: List[int] = [int(id) for id in warehouse_term_df['id'].to_list() if id not in existing_terms_ids]

        if not new_term_ids:
            logger.info('No new terms were found to add to the academic_terms table.')
        else:
            new_term_df: pd.DataFrame = warehouse_term_df.loc[warehouse_term_df['id'].isin(new_term_ids)]
            try:
                new_term_df.to_sql(con=self.myla_engine, name='academic_terms', if_exists='append', index=False)
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
        logger.info('update_course()')

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
                warehouse_course_dict['start_at'] if pd.notna(
                    warehouse_course_dict['start_at']) else None
            )
            updated_fields += self.soft_update_datetime_field(course, 'date_start', warehouse_date_start)
            warehouse_date_end: Union[datetime, None] = (
                warehouse_course_dict['conclude_at'] if pd.notna(
                    warehouse_course_dict['conclude_at']) else None
            )
            updated_fields += self.soft_update_datetime_field(course, 'date_end', warehouse_date_end)

            if updated_fields:
                course.save()
                status += f'Course {course.id}: updated {", ".join(updated_fields)}\n'
        return status

    def do(self) -> str:
        logger.info("** MyLA cron tab")

        status = ""

        run_start = datetime.now(ZoneInfo('UTC'))
        status += f"Start cron: {str(run_start)} UTC\n"
        course_verification = self.verify_course_ids()
        invalid_course_id_list = course_verification.invalid_course_ids
        if len(invalid_course_id_list) > 0:
            # error out and stop cron job
            status += f"ERROR: Those course ids are invalid: {invalid_course_id_list}\n"
            status += "End cron: " + str(datetime.now()) + "\n"
            logger.info("************ total status=" + status + "/n/n")
            return status

        # Lock in valid course IDs that data will be pulled for.
        self.valid_locked_course_ids = [str(x) for x in course_verification.course_data['id'].to_list()]

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
            status += self.submission()
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

        all_str_course_ids = set(
            str(x) for x in Course.objects.get_supported_courses().values_list('id', flat=True)
        )
        courses_added_during_cron: List[str] = list(all_str_course_ids - set(self.valid_locked_course_ids))
        if courses_added_during_cron:
            logger.debug(
                f'During the run, users added {len(courses_added_during_cron)} course(s): {courses_added_during_cron}')
            logger.debug(f'No data was pulled for these courses.')

        # Set all of the courses to have been updated now (this is the same set update_course runs on)
        if not exception_in_run:
            logger.info(f"Updating all valid courses from when this run was started at {run_start}")
            Course.objects.filter(id__in=self.valid_locked_course_ids).update(data_last_updated=run_start)
        else:
            logger.warn("data_last_updated not updated because of an Exception during this run")


        if settings.LRS_IS_BIGQUERY:
            total_tbytes_billed = self.total_bytes_billed / 1024 / 1024 / 1024 / 1024
            # $6.25 per TB as of Feb 2024 https://cloud.google.com/bigquery/pricing
            total_tbytes_price = round(6.25 * total_tbytes_billed, 2)
            status += (f'TBytes billed for BQ: {total_tbytes_billed} = '
                       f'${total_tbytes_price}\n')

        status += "End cron: " + str(datetime.now()) + "\n"
        logger.info("************ total status=" + status + "\n")
        return status
