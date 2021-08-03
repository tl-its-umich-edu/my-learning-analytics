import os
import hjson
import logging
import pandas as pd
from google.cloud import bigquery


def run_canvas_query(query_string, query_params):

    # Instantiates a client
    bigquery_client = bigquery.Client()

    print(query_string)

    job_config = bigquery.QueryJobConfig()
    job_config.query_parameters = query_params

    # Location must match that of the dataset(s) referenced in the query.
    bq_job = bigquery_client.query(
        query_string, location='US', job_config=job_config)
    # This is the call that could result in an exception
    df = bq_job.result().to_dataframe()

    return df


def compare_expanded_vs_events_df(expanded_query_string, events_query_string, query_params):

    expanded_df = run_canvas_query(
        expanded_query_string, query_params)

    events_df = run_canvas_query(
        events_query_string, query_params)

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
        os.path.abspath(__file__)), 'env.hjson')
    try:
        with open(CONFIG_PATH) as env_file:
            ENV = hjson.load(env_file)
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

    # from the configuration variable, load the queries based on UDP expanded vs events table
    # run queries and compare the returned dataframes
    expanded_vs_events_queries_json = ENV["EXPANDED_VS_EVENTS_QUERIES"]
    for event_type in expanded_vs_events_queries_json:
        print(event_type)
        expanded_query_string = ''
        events_query_string = ''
        for attribute, value in expanded_vs_events_queries_json[event_type].items():
            if attribute == "expanded_query_string":
                expanded_query_string = value
            elif attribute == "events_query_string":
                events_query_string = value
        compare_expanded_vs_events_df(
            expanded_query_string, events_query_string, query_params)


if __name__ == "__main__":

    main()
