[Back to README](../README.md)

## Testing

The application currently uses one framework for frontend testing: [Jest](https://jestjs.io/). There are plans to implement back-end tests in the future.

### Jest Testing

Frontend tests leverage the [Jest framework](https://jestjs.io/).

To run the Jest test suite, execute the command `docker exec -it webpack_watcher npm test`.

To update snapshots, execute `docker exec -it webpack_watcher npm run-script update-snapshot`.

The frontend package uses `type: module`. Webpack's configuration is ESM in `webpack.config.js`, and Jest's CSS/asset transformers are ESM `.js` modules (`assets/config/jest/cssTransform.js` and `fileTransform.js`) with a default export; tests continue to be Babel-transformed. Transformer regression tests cover CSS imports and filename/SVG mocks. Run all frontend builds and Jest tests inside Docker.

The app's webpack rule retains `javascript/auto` and extensionless resolution for bundled source so legacy MUI 5 CommonJS icon imports remain valid React components. The native Node ESM package/configuration is unaffected. Restart the frontend watcher after webpack configuration changes so it does not retain stale rules.

Development builds write a separate `.js.map` next to the bundle. Serve both files from the same directory so browser DevTools can set breakpoints in the original frontend code. Production builds do not generate source maps



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

[Next: Contributing](../docs/CONTRIBUTING.md)
