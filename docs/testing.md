[Back to README](../README.md)

## Testing

The application currently uses one framework for frontend testing: [Jest](https://jestjs.io/). There are plans to implement back-end tests in the future.

### Jest Testing

Frontend tests leverage the [Jest framework](https://jestjs.io/).

To run the Jest test suite, execute the command `docker exec -it webpack_watcher npm test`.

To update snapshots, execute `docker exec -it webpack_watcher npm run-script update-snapshot`.

### Data Validation Testing

Data validation scripts are in `scripts/data_validation` folder.
To run the data validation scripts, follow the steps below:

1. Copy `env_validation.hjson` file from `env_sample.hjson` file
    ```sh
    cp scripts/data_validation/env_sample.hjson scripts/data_validation/env_validation.hjson
    ```

2. Update the configuration values. Note the hard-coded Michigan specific filters in various query strings.
Please adjust those values based on your institution's needs.

3. Run the data validation script within the Docker container:

    - Validate queries using UDP BigQuery Expanded Table:
    This script will validate queries against the UDP BigQuery `expanded` table,
    and compare whether the data results are identical with those returned from the `events` table queries.
        ```sh
        docker exec -it student_dashboard /bin/bash -c \
            "python scripts/data_validation/validate_udp_events_vs_expanded.py"
        ```

    - Validate UDP context store queries: This script will validate queries against the UDP `context_store` tables, and
    compare whether the data results are identical with those returned from Unizin Data Warehouse (UDW) tables.
    Before running this queries, please make sure there are two cron queries files in the `~/mylasecrets` folder,
    named `cron.hjson` (for UDW queries) and `cron_udp.hjson` (for UDP queries).
        ```sh
        docker exec -it student_dashboard /bin/bash -c \
            "python scripts/data_validation/validate_udw_vs_udp.py"
        ```

[Next: Contributing](../docs/CONTRIBUTING.md)
