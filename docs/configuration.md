## Configuration

- If you were using a prior version of MyLA, there is a utility `env_to_json.py` to help convert your configuration. Running `python env_to_json.py > config/env.hjson` should create your new config file from your `.env`file.

### Secrets (Optional)
The `bq_cred.json` defined in the `.env` file is service account for BigQuery, and it needs to be supplied and put into the directory defined in the `.env` file and setup in the environment.

### Control course view options
View options can be controlled at the global and course level. If a view is disabled globally, it will be disabled for every course, even if previously enabled at the course level. If a view is not globally disabled, it can still be disabled at the course level.

`VIEWS_DISABLED` is the comma delimited list of views to disable (default empty). The expected name of the view is the same as the view's column name in the `course_view_option` table. For example `VIEWS_DISABLED=show_resources_accessed,show_grade_distribution` will disable both the Resources Accessed and Grade Distribution views.

'show_grade_type' is a field in the 'course' table that can either be 'Percent' or 'Point'. This specifies how the grades should be displayed in the different views in MyLA.  

Note that by default all views are enabled when a course is added.

### Control the primary user interface color
MyLA allows you to configure the primary color of the user interface (i.e., the color used for the top toolbar, or DashboardAppBar, and other structural components of the application). You can set this color by defining a key-value pair in `env.hjson`, with the key being `"PRIMARY_UI_COLOR"` and the value being a valid hex value. See `env_sample.hjson` for an example.

Other colors from the user interface are currently fixed and included in version control, as they are intentional design choices. You can see where color values are set in `assets/src/defaultPalette.js`.

### LTI v1.3 Configuration
* MyLA Supports LTI 1.3, using [pylti1.3](https://github.com/dmitry-viskov/pylti1.3) 
* Instructions for LTI 1.3 configuration are in the [MyLA wiki](https://github.com/tl-its-umich-edu/my-learning-analytics/wiki/Dev%7CDeploy:-Configuration-for-LTI-1.3)

* You also need to configure CSP value in the environment, specifically the `FRAME_SRC.` (See next section) In addition you need to ensure you are using https and `CSRF_COOKIE_SECURE` is true with your domain (or instructure.com) in trusted origins.

* You may optionally disable Deployment Id validation by settings `LTI_CONFIG_DISABLE_DEPLOYMENT_ID_VALIDATION` to `True` (default `False`).

### Content Security Policy

All of the Content Security Policy headers can be configured. In the `env_sample.hjson` there is a sample security policy that should work to bring it up. It has `REPORT_ONLY` set to true; by default it won't actually do anything. If you're using LTI to embed this tool or you want to configure the policy you need to adjust these values and set `REPORT_ONLY` to false.

### Populate initial terms and courses using demo
A `demo_init.sh.sample` file has been provided to help initialize terms and courses. This can be used in combination
with `cron.py` to provide some data to start exploring the tool's features. Rename the file to `demo_init.sh` and
replace the provided fabricated values with those of terms and courses relevant to your local institution, providing
additional courses or terms as desired. Ensure that the `CANVAS_DATA_ID_INCREMENT` environment variable is set
appropriately in `dashboard/settings.py`, and then run the following command:


    docker exec -it student_dashboard /bin/bash ./demo_init.sh


If you have problems, you can connect direct into a specific container with the command

    docker-compose run web /bin/bash

### Openshift process
You should login via Shibboleth into the application. Once you do that for the first admin you'll have to go into the database `auth_user` table and change `is_staff` and `is_superuser` to both be true. After doing this you can change future users with any admin via the GUI.

### Populating Copyright information in footer
1. Since MyLA can be used by multiple institution, copyright information needs to be entitled to institutions needs.
2. Django Flatpages serves the purpose. The display of the copyright content can be controlled from the Django Admin view.
3. The url for configuring copyright info must be `/copyright/` since that is used in the `base.html` for pulling the info. [Read more here](https://simpleisbetterthancomplex.com/tutorial/2016/10/04/how-to-use-django-flatpages-app.html)

### Additional Resources
[Video guide](https://www.youtube.com/watch?v=CSQmQtLe594&feature=youtu.be) to setting up courses in the My Learning Analytics admin tool.
