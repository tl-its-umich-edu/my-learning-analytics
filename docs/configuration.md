[Back to README](../README.md)

## Configuration

Configuration is currently managed via two configuration files, `.env` and `env.hjson`;
some other configuration is handled using the Django admin interface.

The `.env` includes some environment variables, including a path to the `.env.hjson` file;
a template is provided at [.env.sample](../.env.sample).
The `.env.hjson` includes the majority of global settings, including configuration for LTI and resource access queries
(see the [hjson](https://hjson.github.io/) website for more information on allowed syntax). A template is provided at [config/env_sample.hjson](../config/env_sample.hjson).
Both files include explanatory comments to help determine the proper value for a given use case.
More details on certain topics are provided below.

Note: If you were using a prior version of MyLA, there is a utility `env_to_json.py` to help convert your configuration.
Running `python env_to_json.py > config/env.hjson` should create your new config file from your `.env` file.

### LTI v1.3

MyLA supports LTI 1.3, using [pylti1.3](https://github.com/dmitry-viskov/pylti1.3).
Instructions for LTI 1.3 configuration are in the
[MyLA wiki](https://github.com/tl-its-umich-edu/my-learning-analytics/wiki/Dev%7CDeploy:-Configuration-for-LTI-1.3).

To use LTI, you also need to configure the `CSP` value in `env.hjson`, specifically the `FRAME_SRC` (see next section).
In addition, you need to ensure you are using `https` and the `.env.hjson` `CSRF_COOKIE_SECURE` value is `true`,
with your domain (or `instructure.com`) in `CSRF_TRUSTED_ORIGINS`.

You may optionally disable deployment ID validation by setting `LTI_CONFIG_DISABLE_DEPLOYMENT_ID_VALIDATION` in `env.hjson`
to `true` (default `false`).

### Content Security Policy

All of the Content Security Policy headers can be configured in `env.hjson` under `CSP`.
In `env_sample.hjson`, there is a sample security policy that should work to bring it up.
It has `REPORT_ONLY` set to `true`; by default it will not actually do anything.
If you are using LTI to embed this tool or you want to configure the policy,
you need to adjust these values and set `REPORT_ONLY` to false.
Other values from [`django-csp`](https://django-csp-test.readthedocs.io/en/latest/configuration.html)
(the library in use) should be supported; simply remove the leading `CSP_` and nest it under `CSP` in `env.hjson`.

### BigQuery

If the learning record store (LRS) in use for populating resource event data is Google BigQuery,
some additional configuration is required.
The `GOOGLE_APPLICATION_CREDENTIALS` variable defined in the `.env` file
should specify the path to a service account JSON key file for accesssing BigQuery.

### Course view options

Users can control which application views are enabled at the global and course levels.
If a view is disabled globally, it will be disabled for every course, even if previously enabled at the course level. If a view is not globally disabled, it can still be disabled at the course level.
Note that by default all views are enabled when a course is added.

The `VIEWS_DISABLED` variable in `env.hjson` controls global settings.
The value should be a comma-delimited list of views to disable (by default it is empty).
The expected name of the view is the same as the view's column name in the `course_view_option` table.
For example `VIEWS_DISABLED=show_resources_accessed,show_grade_distribution` will disable both
the Resources Accessed and Grade Distribution views.

### Primary user interface color

MyLA allows you to configure the primary color of the user interface
(i.e., the color used for the top toolbar, or DashboardAppBar, and other structural components of the application).
You can set this color by defining a key-value pair in `env.hjson`,
with the key being `"PRIMARY_UI_COLOR"` and the value being a valid hex value. See `env_sample.hjson` for an example.

Other colors from the user interface are currently fixed and included in version control,
as they are intentional design choices. You can see where color values are set in `assets/src/defaultPalette.js`.

### Populating initial terms and courses using demo

A `demo_init.sh.sample` file has been provided to help initialize courses.
This can be used in combination with `cron.py` to provide some data to start exploring the tool's features.
Rename the file to `demo_init.sh` and replace the provided fabricated values with
those of courses relevant to your local institution, providing additional courses as desired.
Ensure that the `CANVAS_DATA_ID_INCREMENT` environment variable is set appropriately in `env.hjson`,
and then run the following command:

```
docker exec -it student_dashboard /bin/bash ./demo_init.sh
```

If you have problems, you can connect direct into a specific container with the command

    docker-compose run web /bin/bash

### Setting up an admin in the deployed application

MyLA is designed to be deployed as an LTI tool. To grant admin privileges to a user
(i.e. access to the admin UI so they can add courses and otherwise configure the tool),
do the following:

1. Have the user the tool in Canvas.
2. Modify their `auth_user` record in the database directly so that `is_staff` and `is_superuser` are true.
    ```
    # Replace username with the user's Canvas username.
    UPDATE auth_user SET is_staff=1, is_superuser=1 where auth_user.username='username';
    ```

Subsequently, that user can grant other users admin privileges using the admin UI.

### Populating copyright information in the UI's footer

Since MyLA can be used by multiple institutions, copyright information needs to be modified to fit the institution's needs.
A Django flatpage can be configured for this purpose using the admin UI.
Do the following to specify a copyright message.

1. In the Django admin UI, click on the "+ Add" icon next to "Flat pages" in the left-hand navigation.
2. Fill in the form, making sure to use `/copyright/` for the URL (what the `base.html` template expects),
to enter the desired HTML or basic string under Content, and to click the available site.

### Additional Resources
[Video guide](https://www.youtube.com/watch?v=CSQmQtLe594&feature=youtu.be)
to setting up courses in the My Learning Analytics admin tool.
