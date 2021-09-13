import os
import hjson, json
import logging
import pandas as pd
from sqlalchemy import create_engine


logger = logging.getLogger(__name__)


def compare_udw_vs_udp_df(udw_query_string, udp_query_string, udw_engine, udp_engine):

    udw_df = pd.read_sql(
        udw_query_string, udw_engine)

    udp_df = pd.read_sql(
        udp_query_string, udp_engine)

    # compare the two dataframes
    print(f"shape of dataframe from udw table: {udw_df.shape} column types: {udw_df.dtypes}")
    print(udw_df.to_string())
    print(f"shape of dataframe from udp table: {udp_df.shape} column types: {udp_df.dtypes}")
    print(udp_df.to_string())

    # print diff records
    df_diff = pd.concat([udw_df, udp_df]).drop_duplicates(keep=False)
    print("different records:")
    print(df_diff)
    print("end")

    pd.testing.assert_frame_equal(udw_df, udp_df, check_dtype=False, check_exact=False, rtol=1e-02, atol=1e-03)


def get_db_engine(connection_json):
    db_name = connection_json['NAME']
    db_user = connection_json['USER']
    db_password = connection_json['PASSWORD']
    db_host = connection_json['HOST']
    db_port = connection_json['PORT']
    db_engine = create_engine("postgresql://{user}:{password}@{host}:{port}/{db}"
                              .format(db=db_name,
                                      user=db_user,
                                      password=db_password,
                                      host=db_host,
                                      port=db_port))
    return db_engine


def get_env_file(env_file_name, json_or_hjson):
    # Set up ENV
    # CONFIG_PATH = os.path.join(os.path.dirname(
    #    os.path.abspath('__file__')), env_file_name)
    CONFIG_PATH = env_file_name
    try:
        with open(CONFIG_PATH) as env_file:
            if json_or_hjson == "json":
                ENV = json.load(env_file)
            else:
                ENV = hjson.load(env_file)
    except FileNotFoundError:
        logger.error(
            f'Configuration file could not be found; please add file "{CONFIG_PATH}".')
        ENV = dict()
    return ENV


def main():
    """
    Get the configuration file
    """

    # Set up ENV for both UDW and UDP
    dir_path = os.path.dirname(os.path.realpath(__file__))
    print(dir_path)
    print(os.path.abspath(os.path.abspath(os.pardir)))
    ENV_UDW = get_env_file('/secrets/env.json', 'json')
    ENV_UDP = get_env_file('/secrets/env_udp.json', 'json')
    ENV_CRON_UDW = get_env_file('/secrets/cron.hjson', 'hjson')
    ENV_CRON_UDP = get_env_file('/secrets/cron_udp.hjson', 'hjson')
    ENV_VALIDATION = get_env_file(
        os.path.join(os.path.dirname(os.path.abspath('__file__')), 'scripts/data_validation/env_validation.hjson'), 'hjson')

    # print(hjson.dumps(ENV))
    udw_engine = get_db_engine(ENV_UDW['DATA_WAREHOUSE'])
    udp_engine = get_db_engine(ENV_UDP['DATA_WAREHOUSE'])

    DATA_WAREHOUSE_COURSE_IDS = ENV_VALIDATION["DATA_WAREHOUSE_COURSE_IDS"]

    # loop through course ids
    for course_id in DATA_WAREHOUSE_COURSE_IDS:
        data_warehouse_course_id = int(course_id)
        print(f'\n\nfor course id {course_id}:')

        # from the configuration variable, load the queries based on UDP expanded vs events table
        # run queries and compare the returned dataframes
        cron_udw_json = ENV_CRON_UDW["CRON_QUERIES"]
        cron_udp_json = ENV_CRON_UDP["CRON_QUERIES"]
        for query_type in cron_udw_json:
            print(f'\ncomparing type {query_type}:')
            formatted_udw_query_string = cron_udw_json[query_type].format(course_id=course_id)
            formatted_udp_query_string = cron_udp_json[query_type].format(course_id=course_id)
            print(formatted_udw_query_string)
            print(formatted_udp_query_string)

            compare_udw_vs_udp_df(
                formatted_udw_query_string, formatted_udp_query_string, udw_engine, udp_engine)


if __name__ == "__main__":

    main()
