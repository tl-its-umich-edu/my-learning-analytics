## Testing

The application currently uses two frameworks for front-end testing: [Cypress](https://www.cypress.io/) and [Jest](https://jestjs.io/). There are plans to implement back-end tests in the future.

### Cypress Testing

Some front-end tests are implemented using the [Cypress framework](https://www.cypress.io/). 

 For running cypress tests locally, it is essential that you have Myla instance running locally. Launch Myla from the
 browser go to the admin view and add user called `donald07` with password `root`, first name `donald`, and last name `07`. Get the latest depersonalized datadump
 as described from the Step 9 in [installation and setup](#installation-and-setup).

 Install cypress 

 `npm install cypress`

 and install the plugins add-on with

 `npm i cypress-plugin-snapshots -S`

 Cypress can be started with the command

 `npm run cypress:open`

 When running tests do not use the All Tests button due to unsolved issues. 
 Run the cypress test if UI change are there as part of the work.
 If a snapshot fails due to change in the UI, try updating the snapshot from the failed test from cypress controlled 
 browser 'compare snapshot' and a pop up appears to `Update Snapshot` 

## Jest Testing
Other front-end tests leverage the [Jest framework](https://jestjs.io/). 

To run the Jest test suite, execute the command `docker exec -it webpack_watcher npm test`

To update snapshots, execute `docker exec -it webpack_watcher npm run-script update-snapshot`

## Data Validation Testing

Data validation scripts are in scripts/data_validation folder. To run the data validation scripts, follow the steps below:

1. Copy env_validation.hjson file from env_sample.hjson file
   ```sh
   cp scripts/data_validation/env_sample.hjson scripts/data_validation/env_validation.hjson
   ```
2. Update the configuration values. Note the hard-coded Michigan specific filters in various query strings. Please adjust those values for your institution usage.

3. Run data validation script within docker container:

   - Validate queries using UDP BigQuery Expanded Table: This script will validate queries against the UDP BigQuery `expanded` table, and compare whether the data results are identical with those returned from the `events` table queries.

     ```sh
     docker exec -it student_dashboard /bin/bash -c "python scripts/data_validation/validate_udp_events_vs_expanded.py"
     ```
    - Validate UDP context store queries: This script will validate queries against the UDP context_store tables, and compare whether the data results are identical with those returned from Unizin Data Warehouse(UDW) tables.
        - Before running this queries, please make sure there are two cron queries files in ~/mylasecrets folder, naming cron.hjson (for UDW queries ) and cron_udp.hjson (for UDP queries) 

     ```sh
     docker exec -it student_dashboard /bin/bash -c "python scripts/data_validation/validate_udw_vs_udp.py"
     ```