import os
import hjson
import logging
import pandas as pd
from sqlalchemy import create_engine


def compare_udw_vs_udp_df(udw_query_string, udp_query_string, udw_engine, udp_engine):

    udw_df = pd.read_sql(
        udw_query_string, udw_engine)

    udp_df = pd.read_sql(
        udp_query_string, udp_engine)

    # compare the two dataframes
    # print(udw_df.to_string())
    # print(udp_df.to_string())
    print(f"shape of dataframe from udw table: {udw_df.shape} column types: {udw_df.dtypes}")
    print(f"shape of dataframe from udp table: {udp_df.shape} column types: {udp_df.dtypes}")
    pd.testing.assert_frame_equal(udw_df, udp_df)


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
    # print(hjson.dumps(ENV))
    udw_engine = get_db_engine(ENV['UDW_CONNECTION'])
    udp_engine = get_db_engine(ENV['UDP_CONNECTION'])

    DATA_WAREHOUSE_COURSE_IDS = ENV["DATA_WAREHOUSE_COURSE_IDS"]

    # loop through course ids
    for course_id in DATA_WAREHOUSE_COURSE_IDS:
        data_warehouse_course_id = int(course_id)
        print(f'\n\nfor course id {course_id}:')

        # from the configuration variable, load the queries based on UDP expanded vs events table
        # run queries and compare the returned dataframes
        udw_vs_udp_queries_json = ENV["UDP_VS_UDW_QUERIES"]
        for query_type in udw_vs_udp_queries_json:
            print(f'\ncomparing type {query_type}:')
            udw_query_string = ''
            udp_query_string = ''
            for attribute, value in udw_vs_udp_queries_json[query_type].items():
                formatted_query_string = value.format(data_warehouse_course_id=course_id)
                if attribute == "udw_query_string":
                    udw_query_string = formatted_query_string
                    #print("UDW query string:")
                    # print(udw_query_string)
                elif attribute == "udp_query_string":
                    udp_query_string = formatted_query_string
                    #print("UDP query string:")
                    # print(udp_query_string)

            compare_udw_vs_udp_df(
                udw_query_string, udp_query_string, udw_engine, udp_engine)


if __name__ == "__main__":

    main()
