[Back to README](../README.md)

## Testing

The application currently uses one framework for frontend testing: [Jest](https://jestjs.io/). There are plans to implement back-end tests in the future.

### Jest Testing

Frontend tests leverage the [Jest framework](https://jestjs.io/).

To run the Jest test suite, execute the command `docker exec -it webpack_watcher npm test`.

To update snapshots, execute `docker exec -it webpack_watcher npm run-script update-snapshot`.

The frontend package uses `type: module`. Webpack's configuration is ESM in `webpack.config.js`, and Jest's CSS/asset transformers are ESM `.js` modules (`assets/config/jest/cssTransform.js` and `fileTransform.js`) with a default export; tests continue to be Babel-transformed. Transformer regression tests cover CSS imports and filename/SVG mocks. Run all frontend builds and Jest tests inside Docker.

The app's webpack rule retains `javascript/auto` and extensionless resolution for bundled source so legacy MUI 5 CommonJS icon imports remain valid React components. The native Node ESM package/configuration is unaffected. Restart the frontend watcher after webpack configuration changes so it does not retain stale rules.

### LTI Browser Smoke Helper

The standalone launcher needs Google Chrome and the `playwright` package available locally. With Playwright installed in the project, run:

```sh
node scripts/lti-browser-chrome.mjs
```

Alternatively, set `PLAYWRIGHT_MODULE` to the absolute path of an isolated Playwright `index.mjs` before running the launcher. `CANVAS_TOOL_URL` and `MYLA_TOOL_ORIGIN` override the default Canvas test launch URL and ngrok origin when they change. Sign in and approve Okta directly in the opened browser, then enter `check` in the launcher terminal; enter `close` to end the session. Starting another instance of this launcher closes the previous launcher-controlled browser; other Chrome windows are unaffected. It does not save browser authentication state, so a replacement requires another sign-in.

#### Standalone launcher: step-by-step

This is the full, repeatable sequence for launching a standalone Chrome (outside any editor), completing the Canvas/Okta login, and verifying both GraphQL channels live. Each new session needs a fresh manual sign-in — the launcher intentionally does not persist authentication state.

1. **One-time: isolated Playwright install** (keeps the repo's `node_modules` and `package.json` untouched, which matters during dependency upgrades):

    ```sh
    mkdir -p ~/.cache/myla-isolated-playwright
    cd ~/.cache/myla-isolated-playwright && npm init -y && npm install playwright
    ```

    The launcher uses the system Google Chrome (`channel: 'chrome'`), so no `npx playwright install` browser download is needed. Point `PLAYWRIGHT_MODULE` at the ESM entry `index.mjs`, **not** `index.js`: the CommonJS entry that `require.resolve('playwright')` returns does not expose the `chromium` named export under dynamic `import()`.

2. **Confirm preconditions**: the Docker app is up (`http://localhost:5001`) and the ngrok tunnel to it is current. If the ngrok origin differs from the launcher default, export `MYLA_TOOL_ORIGIN` (and `CANVAS_TOOL_URL` if the Canvas link changed) before launching.

3. **Start the launcher** from the repo root:

    ```sh
    export PLAYWRIGHT_MODULE="$HOME/.cache/myla-isolated-playwright/node_modules/playwright/index.mjs"
    node scripts/lti-browser-chrome.mjs
    ```

    A standalone Chrome window opens to the Canvas test tool link and redirects to `U-M Canvas Login DEV`.

4. **Sign in**: complete U-M Login + Okta directly in that window, then launch `pu_myla_lti` in the test course so MyLA loads. Never enter credentials, MFA, or tokens in the terminal or chat.

5. **Read-only check** (Apollo `useQuery` path): type `check` in the launcher terminal. It prints a `data`/`empty` result per desktop view, e.g. `desktop: Assignment Planning: data`.

6. **Live GraphQL write check** (Apollo `useMutation` path): in the MyLA **Assignment Planning** view, change **My Minimum Goal (%)** and confirm the **"Setting saved successfully!"** snackbar, then reload the tool and confirm the value persisted. Persistence proves the `/graphql` mutation reached Django with a valid `X-CSRFToken` (a 403 fails silently with no persistence). This changes only the current user's own setting, not real grades; `check` itself stays read-only. Restore the prior value manually afterward if it matters.

7. **Close**: type `close` to end the session and shut the browser.

When an agent runs the launcher on your behalf it feeds these same commands to the process's stdin (e.g. through a FIFO); when running it yourself, just type them in the terminal.

For the recorded student workflow, start from the course page as an authorized instructor/admin and enter `student`. Enter a student name (blank defaults to Student Bee), then enter `yes` to confirm impersonation. Any other confirmation cancels without navigating. The launcher follows People, the exact student link, Act as, Proceed, and `pu_myla_lti`, then waits for MyLA in its dynamically named frame. Enter `check` afterward to run the desktop checks as that student. This does not change grade goals or settings. Impersonation persists until you return to your original Canvas role manually or close the isolated browser; if launch fails, check whether impersonation is already active before retrying. Restart the launcher to load newly added commands; an already running process does not load command-loop changes automatically.

The reusable `scripts/lti-browser-smoke.mjs` also exports `checkMylaViews` for an existing authenticated Playwright `page`:

To demonstrate a new workflow, finish signing in first, then enter `record` in the launcher terminal. This opens Playwright Inspector; enable its Record control only after authentication. Repeat the workflow, stop recording, and resume the script. Inspector does not recover previous clicks, and this launcher does not automatically save generated code. Review generated steps for personal information before saving or sharing them. Do not record login, passwords, MFA, or export authentication state. For student impersonation, first return to the authorized instructor/admin role, select the agreed test student (default Student Bee), and demonstrate the People-to-MyLA launch. Do not automate impersonation until the user confirms the selected student and generated steps have been reviewed.

```js
import { checkMylaViews } from './scripts/lti-browser-smoke.mjs'

await checkMylaViews(page, {
    toolOrigin: 'https://your-current-ngrok-domain.example'
})
```

The helper finds the tool frame by origin and checks navigation and loaded controls/content at desktop size (1280 x 800) by default. Mobile is not fully supported and is not an upgrade gate. Optional exploratory sizes can be supplied through the `viewports` option. It checks resource and grade charts, assignment controls, heading overflow, and sanitized API HTTP/network failures and uncaught page errors. Errors from Canvas itself can also be reported as page errors. It requires data by default; pass `expectedStates: { resources: 'empty', grades: 'empty' }` only when those empty states are the approved baseline. Unexpected empty states and timeouts fail. These are smoke checks, not verification of grade values, all layout/overlap issues, or saved settings. The integrated browser cannot import the helper directly. See `.claude/lti-browser-testing-plan.md` for the manual handoff and real-course safety rules.

For optional heading-only screenshots when calling the helper, pass `screenshotDirectory: 'playwright-artifacts'`. The directory is gitignored. These screenshots do not capture the full page or establish a layout baseline; never capture course data without appropriate permission.

Each smoke run reloads the authenticated MyLA frame first so it tests the currently built bundle, not JavaScript retained from before an upgrade. Pass `reload: false` only for an intentional same-page diagnostic, not upgrade acceptance.

Build the frontend in Docker first, then run browser regression checks with Chrome and Playwright installed using `node --test scripts/__tests__/lti-browser-smoke.test.mjs`. The same `PLAYWRIGHT_MODULE` override works for an isolated installation. One test loads the actual generated bundle and renders its MUI course UI with synthetic identity/course responses, catching module-interop failures that markup-only fixtures and Jest can miss. The fixtures contain no real Canvas or student data.

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
