# How to Contribute To My Learning Analytics
MyLA is fully open source and being actively developed by [Information and Technology Services, University of Michigan](https://its.umich.edu/) and [Centre for Teaching, Learning and Technology, University of British Columbia](https://ctlt.ubc.ca/). The back-end is written in Python using the Django framework, and the front-end is written in JavaScript using React. We welcome any kind of contribution, from code to improvements in documentation to suggestions for future development.

## Technology Overview
### Front-end
The front end of MyLA is written in JavaScript using [React](https://reactjs.org/), with [Material-UI](https://material-ui.com/) as the component library and [D3](https://d3js.org/) for the data visualizations. [Jest](https://jestjs.io/) is used as the testing framework - more information can be found below for running the tests.

The code for the front-end is located under `/assets/src/`. MyLA uses functional components instead of class-based components and uses [React hooks](https://reactjs.org/docs/hooks-intro.html) for state and side-effects.

[Standard](https://standardjs.com/) is the JavaScript linter. Please ensure code is standards-complaint by running the linter manually. It is installed as a dev-dependency. 
1. Run it by simply typing `standard` too see any problems.
2. To fix this use `standard --fix`.

### Back-end
MyLA Backend is build using [Django](https://www.djangoproject.com/) Framework, [MySQL](https://www.mysql.com/) DataBase,
Cron schedule for getting the Canvas context and event data to the MySQL DB each institution might set this up differently based on the infrastruture support.
MyLA can only be run as an LTI tool. Previous versions of MyLA supported SAML, but this has been removed with a preference on launching via LTI Advantage.

More info of various institutions infrastructure set up is [here](https://github.com/tl-its-umich-edu/my-learning-analytics/wiki/Myla-institutions-Architecture-flow).

## Create an issue
Before sending a pull request, please create an [issue](https://github.com/tl-its-umich-edu/my-learning-analytics/issues/new) describing either a problem (i.e. bug) in MyLA or a feature to be contributed. We'll do our best to review the issue in a timely manner to discuss before starting work to address the issue.

## Tips for working with Git

When working with branches it's [advisable](https://randyfay.com/content/simpler-rebasing-avoiding-unintentional-merge-commits) to use the options
`git config --global branch.autosetuprebase always` and `git config --global pull.rebase true`

To always do a `git pull --rebase` when merging back changes from master. This avoids unintentional merge commits, keeps the local branch clean and makes it easier to rebase the branch in the future. These options can be changed at any time if they aren't working well for the situation.

Another great option that will save some time is
`git config --global push.default current` 

This avoids having to [set an upstream everytime](https://www.jvt.me/posts/2019/09/22/git-push-matching/) and make it easier to run `git push`.

Reference these github guides on [Forking Projects](https://guides.github.com/activities/forking/) and [Understanding the Github flow](https://guides.github.com/introduction/flow/) for further information. 


## Making a pull request
Once the issue has been discussed with one of the project maintainers, please follow these steps for making a [pull request](https://github.com/tl-its-umich-edu/my-learning-analytics/pulls).

1. Fork [this project](https://github.com/tl-its-umich-edu/my-learning-analytics) on Github by pressing the `Fork` button on the top-right hand corner.
1. Clone the forked repository to the local machine. `git clone https://github.com/{github-username}/my-learning-analytics.git`.
1. Create local branches to keep contributions organized - generally one branch for each issue.
1. Once changes have been pushed the fork, Github will show a button to create a pull request from the forked repository to the main project repository.


## Testing tips

1. Connect to the docker and edit some files!

    `docker exec -it student_dashboard /bin/bash`

    then install a text editor like vim
    `apt-get -y install vim`

    Then files may be edited. (Most code is in`/code/dashboard`.)

2. Restart the gunicorn to read the configuration. This is useful to avoid a redeploy.

    `docker exec student_dashboard pkill -HUP gunicorn`

3. VsCode is supported via DEBUGPY (Formerly PTVSD) for debugging the code running in Docker. See this information here for details https://code.visualstudio.com/docs/python/debugging#_remote-debugging

    A few variables are available to be defined in the .env file to enable this but minimally `DEBUGPY_ENABLE=True` must be set. Currently docker-compose.yml opens 2 ports that can be used current, 3000 and 3001. More may be opened, if needed.   These can be configured with other variables.  See `.env.sample` for examples.

    To connect to the cron job, use a different port because Django uses port 3000 by default.  (Wait for attach.)

    Set breakpoints then run the command below in the docker instance. Next, connect to the cron container. The job will start running when the debugger is attached.
    `docker exec -it student_dashboard /bin/bash -c "DEBUGPY_WAIT_FOR_ATTACH=True DEBUGPY_ENABLE=TRUE DEBUGPY_REMOTE_PORT=3001 ./manage_debugpy.py runcrons --force"`

## Database Upgrade in Development

While working on issues, MyLA's `docker-compose.yml` may need to be updated to use a newer version of MySQL.  Some new versions may cause MySQL to complain about using an older DB.

For example, MySQL's log may contain warnings like:

```txt
InnoDB: Table mysql/innodb_table_stats has length mismatch in the column name table_name.  Please run mysql_upgrade
```

This problem can be resolved by running the recommended upgrade in the MySQL container:

```sh
docker exec -it student_dashboard_mysql mysql_upgrade \
--user=root --password student_dashboard
```

When prompted, specify the password for the root MySQL user.  It should be found in the `MYSQL.ROOT_PASSWORD` property of `env.json`.

## Code Review

All contributions must be code reviewed. Contributions may need to be changed before they can be accepted. We really appreciate tests as well, so if at all possible please try to add tests.
