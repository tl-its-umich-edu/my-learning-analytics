import os
import logging

import hjson, json
import pandas as pd

from dashboard.common.db_util import create_sqlalchemy_engine


logging.basicConfig()
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def format_df(df):
    return '\n'+ df.to_string()

def compare_udw_vs_udp_df(udw_query_string, udp_query_string, udw_engine, udp_engine, query_params):
    udw_df = pd.read_sql(
        udw_query_string, udw_engine, params=query_params)

    udp_df = pd.read_sql(
        udp_query_string, udp_engine, params=query_params)

    # Debug out the data frames
    logger.debug("UDW Dataframe:")
    logger.debug(format_df(udw_df))
    logger.debug("\n\nUDP Dataframe:")
    logger.debug(format_df(udp_df))

    # print diff records
    df_diff = pd.concat([udw_df, udp_df]).drop_duplicates(keep=False)
    if df_diff.empty:
        logger.info("No differences found")
    else:
        logger.info("Differences found. Different records:")
        logger.info(f"shape of dataframe from udw table: {udw_df.shape} column types: {udw_df.dtypes}")
        logger.info(f"shape of dataframe from udp table: {udp_df.shape} column types: {udp_df.dtypes}")
        logger.info(format_df(df_diff))

    # assert that the two dataframes are the same but continue even if they're not
    try:
        pd.testing.assert_frame_equal(udw_df, udp_df, check_dtype=False, check_exact=False, rtol=1e-02, atol=1e-03)
    except AssertionError as e:
        logger.error(e)


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
    logger.debug(dir_path)
    logger.debug(os.path.abspath(os.path.abspath(os.pardir)))
    ENV_UDW = get_env_file('/secrets/env.hjson', 'hjson')
    ENV_UDP = get_env_file('/secrets/env_udp.hjson', 'hjson')

    # Use the config files in this project
    ENV_CRON_UDW = get_env_file('/code/config/cron.hjson', 'hjson')
    ENV_CRON_UDP = get_env_file('/code/config/cron_udp.hjson', 'hjson')
    ENV_VALIDATION = get_env_file(
        os.path.join(os.path.dirname(os.path.abspath('__file__')), 'scripts/data_validation/env_validation.hjson'), 'hjson')

    udw_engine = create_sqlalchemy_engine(ENV_UDW['DATA_WAREHOUSE'], 'postgres')
    udp_engine = create_sqlalchemy_engine(ENV_UDP['DATA_WAREHOUSE'], 'postgres')

    DATA_WAREHOUSE_COURSE_IDS = ENV_VALIDATION["DATA_WAREHOUSE_COURSE_IDS"]

    CANVAS_DATA_ID_INCREMENT = ENV_VALIDATION["CANVAS_DATA_ID_INCREMENT"]

    # from the configuration variable
    # load the queries based on UDP and UDW tables
    # run queries and compare the returned dataframes
    for query_type in ENV_CRON_UDW:
        logger.info('\n\n ------------------------')
        logger.info(f'Comparing query {query_type}:')
        query_params = {
            "course_ids": tuple(DATA_WAREHOUSE_COURSE_IDS),
            'canvas_data_id_increment': ENV_VALIDATION["CANVAS_DATA_ID_INCREMENT"]
        }

        compare_udw_vs_udp_df(
            ENV_CRON_UDW[query_type], ENV_CRON_UDP[query_type], udw_engine, udp_engine, query_params)


if __name__ == "__main__":
    main()
