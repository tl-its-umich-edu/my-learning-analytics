import os
import json
import logging
import pandas as pd
from google.cloud import bigquery


def run_canvas_query(query_array, query_params):

    # Instantiates a client
    bigquery_client = bigquery.Client()

    query_string = ''.join(query_array)
    print(query_string)

    # BQ Total Bytes Billed to report to status
    total_bytes_billed = 0

    job_config = bigquery.QueryJobConfig()
    job_config.query_parameters = query_params

    # Location must match that of the dataset(s) referenced in the query.
    bq_job = bigquery_client.query(
        query_string, location='US', job_config=job_config)
    # This is the call that could result in an exception
    df = bq_job.result().to_dataframe()

    # print(df.to_string())
    total_bytes_billed += bq_job.total_bytes_billed

    return df


def compare_expanded_vs_events_df(expanded_query_array, events_query_array, query_params):

    expanded_df = run_canvas_query(
        expanded_query_array, query_params)

    events_df = run_canvas_query(
        events_query_array, query_params)

    # compare the two dataframes
    # print(expanded_df.columns.values)
    # print(events_df.columns.values)
    print(f"shape of dataframe from expanded table: {expanded_df.shape}")
    print(f"shape of dataframe from events table: {events_df.shape}")
    pd.testing.assert_frame_equal(expanded_df, events_df)


def main():
    """
    Get the configuration file
    """
    logger = logging.getLogger(__name__)

    # Set up ENV
    CONFIG_PATH = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), 'env.json')
    try:
        with open(CONFIG_PATH) as env_file:
            ENV = json.load(env_file)
    except FileNotFoundError:
        logger.error(
            f'Configuration file could not be found; please add file "{CONFIG_PATH}".')
        ENV = dict()

    DATA_WAREHOUSE_COURSE_IDS = ENV["DATA_WAREHOUSE_COURSE_IDS"]
    DATA_WAREHOUSE_SHORT_COURSE_IDS = ENV["DATA_WAREHOUSE_SHORT_COURSE_IDS"]
    CANVAS_DATA_ID_INCREMENT = ENV["CANVAS_DATA_ID_INCREMENT"]
    TIME_LIMIT = ENV["TIME_LIMIT"]

    query_params = [
        bigquery.ArrayQueryParameter(
            'course_ids', 'STRING', DATA_WAREHOUSE_COURSE_IDS),
        bigquery.ArrayQueryParameter(
            'course_ids_short', 'STRING', DATA_WAREHOUSE_SHORT_COURSE_IDS),
        bigquery.ScalarQueryParameter(
            'canvas_data_id_increment', 'INT64', CANVAS_DATA_ID_INCREMENT),
        bigquery.ScalarQueryParameter(
            'time_limit', 'STRING', TIME_LIMIT)
    ]

    # compare the Canvas query
    canvas_expanded_query_array = [
        "SELECT 'canvas' AS resource_type, ",
        "REGEXP_EXTRACT(object.id, r'.*:(.*)') AS resource_id, ",
        "CAST(REGEXP_EXTRACT(membership.id, r'.*:(.*)') AS INT64) AS user_id, ",
        "cast(null as string) AS user_login_name, ",
        "CAST(REGEXP_EXTRACT(`group`.id, r'.*:(.*)') AS INT64) AS course_id, ",
        "COALESCE( ",
        "JSON_EXTRACT_SCALAR(object.extensions, '$[\\'com.instructure.canvas\\'][asset_name]'), ",
        "JSON_EXTRACT_SCALAR(object.extensions, '$[\\'com.instructure.canvas\\'][filename]'), ",
        "object.name, ",
        "'attachment' ",
        ") as name, ",
        "datetime(EVENT_TIME) as access_time ",
        "FROM event_store.expanded ",
        "where ",
        "JSON_EXTRACT_SCALAR(ed_app.json, '$.id') IN UNNEST(['http://m.canvas.umich.edu/', 'http://umich.instructure.com/']) ",
        "and type = 'NavigationEvent' ",
        "and STARTS_WITH(object.id, 'urn:instructure:canvas:attachment') ",
        "and action = 'NavigatedTo' ",
        "and membership.id is not null ",
        "and REGEXP_EXTRACT(`group`.id, r'.*:(.*)') IN UNNEST(@course_ids) ",
        "and event_time > @time_limit ",
        "order by resource_id, user_id, access_time "
    ]
    canvas_events_query_array = [
        "SELECT 'canvas' AS resource_type, ",
        "CAST(SUBSTR(JSON_EXTRACT_SCALAR(event, '$.object.id'), 35) AS STRING) AS resource_id, ",
        "CAST(SUBSTR(JSON_EXTRACT_SCALAR(event, '$.membership.member.id'), 29) AS INT64) AS user_id, ",
        "cast(null as string) AS user_login_name,",
        "CAST(SUBSTR(JSON_EXTRACT_SCALAR(event, '$.group.id'), 31) AS INT64) AS course_id, ",
        "COALESCE(",
        "JSON_EXTRACT_SCALAR(event, '$.object.extensions[\\'com.instructure.canvas\\'].asset_name'), ",
        "JSON_EXTRACT_SCALAR(event, '$.object.extensions[\\'com.instructure.canvas\\'].filename'), ",
        "JSON_EXTRACT_SCALAR(event, '$.object.name'), ",
        "'attachment'",
        ") as name, ",
        "datetime(EVENT_TIME) as access_time ",
        "FROM event_store.events ",
        "where JSON_EXTRACT_SCALAR(event, '$.edApp.id') IN ",
        "UNNEST(['http://m.canvas.umich.edu/'   , 'http://umich.instructure.com/'   ]) ",
        "and type = 'NavigationEvent' ",
        "and SUBSTR(JSON_EXTRACT_SCALAR(event, '$.object.id'), 24, 10) = 'attachment' ",
        "and JSON_EXTRACT_SCALAR(event, '$.action') = 'NavigatedTo' ",
        "and JSON_EXTRACT_SCALAR(event, '$.membership.member.id') is not null ",
        "and SUBSTR(JSON_EXTRACT_SCALAR(event, '$.group.id'), 31) IN UNNEST(@course_ids) ",
        "and event_time > @time_limit ",
        "order by resource_id, user_id, access_time"
    ]
    compare_expanded_vs_events_df(
        canvas_expanded_query_array, canvas_events_query_array, query_params)

    # compare the lecture capture query
    leccap_expanded_query_array = [
        "select 'leccap' AS resource_type, ",
        "REGEXP_EXTRACT(object.id, r'.*:(.*)') AS resource_id, ",
        "@canvas_data_id_increment + CAST(JSON_EXTRACT_SCALAR(federated_session_json, '$.messageParameters.custom_canvas_user_id') AS INT64) AS user_id, ",
        "cast(null as string) AS user_login_name,",
        "@canvas_data_id_increment + CAST(JSON_EXTRACT_SCALAR(federated_session_json, '$.messageParameters.custom_canvas_course_id') AS INT64) AS course_id, ",
        "object.name as name, ",
        "datetime(EVENT_TIME) as access_time ",
        "FROM event_store.expanded ",
        "where ed_app.id = 'https://leccap.engin.umich.edu/#applicationName=Lecture+Capture'  ",
        "and type = 'MediaEvent' and action = 'Started' ",
        "and JSON_EXTRACT_SCALAR(federated_session_json, '$.messageParameters.custom_canvas_course_id') is not null ",
        "and JSON_EXTRACT_SCALAR(federated_session_json, '$.messageParameters.custom_canvas_course_id') IN UNNEST(@course_ids_short) ",
        "and event_time > @time_limit ",
        "order by resource_id, user_id, access_time"
    ]
    leccap_events_query_array = [
        "select 'leccap' AS resource_type, ",
        "CAST(SUBSTR(JSON_EXTRACT_SCALAR(event, '$.object.id'), 48) AS STRING) AS resource_id, ",
        "@canvas_data_id_increment + CAST(JSON_EXTRACT_SCALAR(event, '$.federatedSession.messageParameters.custom_canvas_user_id') AS INT64) AS user_id, ",
        "cast(null as string) AS user_login_name,",
        "@canvas_data_id_increment + CAST(JSON_EXTRACT_SCALAR(event, '$.federatedSession.messageParameters.custom_canvas_course_id') AS INT64) AS course_id, ",
        "JSON_EXTRACT_SCALAR(event, '$.object.name') as name, ",
        "datetime(EVENT_TIME) as access_time ",
        "FROM event_store.events ",
        "where JSON_EXTRACT_SCALAR(event, '$.edApp') = 'https://leccap.engin.umich.edu/#applicationName=Lecture+Capture'   ",
        "and type = 'MediaEvent' and JSON_EXTRACT_SCALAR(event, '$.action') = 'Started' ",
        "and JSON_EXTRACT_SCALAR(event, '$.federatedSession.messageParameters.custom_canvas_course_id') is not null ",
        "and JSON_EXTRACT_SCALAR(event, '$.federatedSession.messageParameters.custom_canvas_course_id') IN UNNEST(@course_ids_short) "
        "and event_time > @time_limit ",
        "order by resource_id, user_id, access_time"
    ]
    compare_expanded_vs_events_df(
        leccap_expanded_query_array, leccap_events_query_array, query_params)

    # compare MiVideo query
    mivideo_expanded_query_array = [
        "SELECT 'mivideo' AS resource_type, ",
        "replace(object.id, 'https://aakaf.mivideo.it.umich.edu/caliper/info/media/' , '') AS resource_id, ",
        "cast(-1 as INT64) AS user_id, ",
        "replace(actor.id, 'https://aakaf.mivideo.it.umich.edu/caliper/info/user/' , '') AS user_login_name, ",
        "@canvas_data_id_increment + CAST(JSON_EXTRACT_SCALAR(object.extensions, '$.kaf:course_id') AS INT64) AS course_id, ",
        "object.name AS name, ",
        "datetime(EVENT_TIME) AS access_time ",
        "FROM event_store.expanded WHERE ",
        "ed_app.id = 'https://aakaf.mivideo.it.umich.edu/caliper/info/app/KafEdApp' ",
        "AND TYPE = 'MediaEvent'",
        "AND action = 'Started'",
        "AND JSON_EXTRACT_SCALAR(object.extensions, '$.kaf:course_id') IN UNNEST(@course_ids_short) ",
        "and event_time > @time_limit ",
        "order by resource_id, user_id, access_time"
    ]
    mivideo_events_query_array = [
        "SELECT 'mivideo' AS resource_type, ",
        "replace(JSON_EXTRACT_SCALAR(event, '$.object.id'), 'https://aakaf.mivideo.it.umich.edu/caliper/info/media/'  , '') AS resource_id, ",
        "cast(-1 as INT64) AS user_id,",
        "replace(JSON_EXTRACT_SCALAR(event, '$.actor.id'), 'https://aakaf.mivideo.it.umich.edu/caliper/info/user/'  , '') AS user_login_name, ",
        "@canvas_data_id_increment + CAST(JSON_EXTRACT_SCALAR(event, '$.object.extensions.kaf:course_id') AS INT64) AS course_id, ",
        "JSON_EXTRACT_SCALAR(event, '$.object.name') AS name,",
        "datetime(EVENT_TIME) AS access_time ",
        "FROM event_store.events WHERE ",
        "COALESCE(JSON_EXTRACT_SCALAR(event, '$.edApp.id'), JSON_EXTRACT_SCALAR(event, '$.edApp')) = 'https://aakaf.mivideo.it.umich.edu/caliper/info/app/KafEdApp' ",
        "AND TYPE = 'MediaEvent' ",
        "AND JSON_EXTRACT_SCALAR(event, '$.action') = 'Started' ",
        "AND JSON_EXTRACT_SCALAR(event, '$.object.extensions.kaf:course_id') IN UNNEST(@course_ids_short) ",
        "and event_time > @time_limit ",
        "order by resource_id, user_id, access_time"
    ]

    # compare mivideo
    compare_expanded_vs_events_df(
        mivideo_expanded_query_array, mivideo_events_query_array, query_params)


if __name__ == "__main__":

    main()
