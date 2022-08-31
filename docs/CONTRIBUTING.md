## Contributing

MyLA is fully open source and being actively developed by
[Information and Technology Services, University of Michigan](https://its.umich.edu/) and
[Centre for Teaching, Learning and Technology, University of British Columbia](https://ctlt.ubc.ca/).
The back-end is written in Python using the Django framework,
and the front-end is written in JavaScript using React.
We welcome any kind of contribution, from code to improvements in documentation to suggestions for future development.

### Technology Overview

#### Front-end

The front end of MyLA is written in JavaScript using [React](https://reactjs.org/), with
[Material-UI](https://material-ui.com/) as the component library and [D3](https://d3js.org/) for the data visualizations.

The code for the front-end is located under `/assets/src/`.
MyLA uses functional components instead of class-based components and
uses [React hooks](https://reactjs.org/docs/hooks-intro.html) for state and side-effects.
[Jest](https://jestjs.io/) is used as the testing framework; see [Testing](testing.md) for more information.

[Standard](https://standardjs.com/) is the JavaScript linter.
Please ensure any new code is Standard-complaint by running the linter manually. It is installed as a dev dependency.
There are also [text editor plugins](https://standardjs.com/index.html#are-there-text-editor-plugins) available.
```
npm install
standard assets/src
```

#### Back-end

The MyLA backend is build using the [Django](https://www.djangoproject.com/) framework and
uses [MySQL](https://www.mysql.com/) for a database platform.

MyLA can only be run as an LTI tool. Previous versions of MyLA supported SAML,
but this has been removed with a preference on launching via LTI Advantage.

Included in the source code is a cron job ([`dashboard/cron.py`](../dashboard/cron.py)) that is used for
populating the Canvas context and event data in the MySQL database.
Each institution may need to configure various settings differently based on their infrastructure.
More info on various institutions' infrastructure set-up is
[here](https://github.com/tl-its-umich-edu/my-learning-analytics/wiki/Deploy:-Institution-Architectures).

### Create an issue

Before sending a pull request, please create an
[issue](https://github.com/tl-its-umich-edu/my-learning-analytics/issues/new)
describing either a problem (i.e. bug) in MyLA or a feature to be contributed.
We'll do our best to review the issue in a timely manner to discuss before starting work to address the issue.

### Creating pull requests

Once the issue has been discussed with one of the project maintainers, please follow these steps for making a
[pull request](https://github.com/tl-its-umich-edu/my-learning-analytics/pulls).

1. Fork [this project](https://github.com/tl-its-umich-edu/my-learning-analytics) on GitHub by pressing the
`Fork` button in the top-right hand corner of the repository's home page.
1. Clone the forked repository to the local machine.
    ```
    git clone https://github.com/{github-username}/my-learning-analytics.git
    ```
1. Add an `upstream` [remote](https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes) to the
main project repository.
    ```
    git remote add upstream https://github.com/{github-username}/my-learning-analytics.git
    ```
1. Create local branches to keep contributions organized - generally one branch for each issue.
    ```
    git checkout -b issue-xxx-fix-a-bug
    ```
1. Make changes and push to your fork (`origin` remote).
    ```
    git add .
    git commit -m 'Make some changes'
    git push origin issue-xxx-fix-a-bug
    ```
1. Once changes have been pushed to the branch on your fork,
GitHub will show a button to create a pull request from the forked repository to the main project repository.
Click this and provide details about the changes, making sure to mention (using #) the issue you want to resolve.
1. When your PR is merged (or when others are), pull from `upstream` to keep your local `master` branch up to date.
    ```
    git checkout master
    git pull upstream master
    ```

### Code review

All contributions must be code reviewed. Contributions may need to be changed before they can be accepted.
We really appreciate tests as well, so if at all possible please try to add tests.

### Tips for working with Git

When working with branches, we
[recommend](https://randyfay.com/content/simpler-rebasing-avoiding-unintentional-merge-commits)
using the options `git config --global branch.autosetuprebase always` and `git config --global pull.rebase true`.
It will make it so always use the `--rebase` flag when pulling changes from `master`.
This avoids unintentional merge commits, keeps the local branch clean,
and makes it easier to rebase the branch in the future.
These options can be changed at any time if they aren't working well for the situation.

Another great option that will save some time is `git config --global push.default current`.
This helps you avoid having to [set an upstream everytime](https://www.jvt.me/posts/2019/09/22/git-push-matching/)
and makes it easier to run `git push`.

Reference these GitHub guides on [Forking Projects](https://guides.github.com/activities/forking/) and
[Understanding the GitHub flow](https://guides.github.com/introduction/flow/) for further information.

### Development tips

1. Connect to the Docker container, and edit some files!

    `docker exec -it student_dashboard /bin/bash`

    then install a text editor like vim
    `apt-get -y install vim`

    Then files may be edited. (Most code is in`/code/dashboard`.)

1. Restart `gunicorn` to read the configuration. This is useful to avoid a redeploy.

    `docker exec student_dashboard pkill -HUP gunicorn`

1. VSCode debugging within Docker containers is supported via DEBUGPY (formerly PTVSD).
See this information [here](https://code.visualstudio.com/docs/python/debugging#_remote-debugging) for details.

    A few variables may be defined in the `env.hjson` file to configure this, but
    minimally `DEBUGPY_ENABLE` must be set to `true`.
    Currently `docker-compose.yml` opens two ports that can be used currently, 3000 and 3001.
    More may be opened, if needed. These can be configured with other variables.
    See `env_sample.hjson` for more details.

    When debugging the cron job, you'll need to use a different approach with a different port and settings.
    First, start the container as normal with `DEBUGPY_ENABLE` set to `false` in `env.hjson`.
    Then, issue the below command, which enters the container, sets some environment variables, then
    runs the cron. The job will start running when the debugger is attached in VSCODE.
    ```
    docker exec -it student_dashboard /bin/bash \
        -c "DEBUGPY_WAIT_FOR_ATTACH=True DEBUGPY_ENABLE=TRUE DEBUGPY_REMOTE_PORT=3001 \
        ./manage_debugpy.py runcrons --force"
    ```

### Database Upgrade in Development

While working on issues, MyLA's `docker-compose.yml` may need to be updated to use a newer version of MySQL.
Some new versions may cause MySQL to complain about using an older DB.

For example, MySQL's log may contain warnings like:

```txt
InnoDB: Table mysql/innodb_table_stats has length mismatch in the column name table_name.  Please run mysql_upgrade
```

This problem can be resolved by running the recommended upgrade in the MySQL container:

```sh
docker exec -it student_dashboard_mysql mysql_upgrade \
--user=root --password student_dashboard
```

When prompted, specify the password for the root MySQL user.
It should be found in the `MYSQL.ROOT_PASSWORD` property of `env.hjson`.
