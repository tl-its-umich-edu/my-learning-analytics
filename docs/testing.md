[Back to README](../README.md)

## Testing

The application currently uses two frameworks for frontend testing: [Jest](https://jestjs.io/) and
[Cypress](https://www.cypress.io/). There are plans to implement back-end tests in the future.

### Jest Testing

Frontend tests leverage the [Jest framework](https://jestjs.io/).

To run the Jest test suite, execute the command `docker exec -it webpack_watcher npm test`.

To update snapshots, execute `docker exec -it webpack_watcher npm run-script update-snapshot`.

### Cypress Testing

> **Note:** Cypress tests are still present but have not been maintained and may be removed in the future.

Some frontend tests are implemented using the [Cypress framework](https://www.cypress.io/).

For running Cypress tests locally, it is essential that you have a MyLA instance running locally.
Launch MyLA from the browser, go to the admin view, and add a user called `donald07` with password `root`,
first name `donald`, and last name `07`.
Load the latest depersonalized data dump as described in [Getting Started](getting_started.md).
Then do the following:

1. Install `cypress` and snapshot plugin.
    ```sh
    npm install cypress@4.12.1
    npm install cypress-plugin-snapshots -S
    ```

1. Start Cypress.
    ```sh
    npm run cypress:open
    ```

When running tests, do not use the "All Tests" button due to unsolved issues.
Run a specific Cypress test if UI changes were made as part of your work.
If a snapshot fails due to change in the UI,
try updating the snapshot from the failed test in the Cypress controlled browser.

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
