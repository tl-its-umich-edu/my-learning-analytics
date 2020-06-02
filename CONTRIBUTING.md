# How to Contribute To My Learning Analytics
MyLA is fully open source and being actively developed by [Information and Technology Services, University of Michigan](https://its.umich.edu/) and [Centre for Teaching, Learning and Technology, University of British Columbia](https://ctlt.ubc.ca/). The back-end is written in Python using the Django framework, and the front-end is written in JavaScript using React. We welcome any kind of contribution, from code to improvements in documentation to suggestions for future development.

## Technology Overview
### Front-end
The front end of MyLA is written in JavaScript using [React](https://reactjs.org/), with [Material-UI](https://material-ui.com/) as the component library and [D3](https://d3js.org/) for the data visualizations. [Jest](https://jestjs.io/) is used as the testing framework - more information can be found below for running the tests.

The code for the front-end is located under `/assets/src/`. MyLA uses functional components instead of class-based components and uses [React hooks](https://reactjs.org/docs/hooks-intro.html) for state and side-effects.

[Standard](https://standardjs.com/) is the JavaScript linter. Please ensure that your code is Standard-complaint by 
running the linter manually. It is installed as a dev-dependency. 
1. you should be able to run it by simply typing `standard` too see any problems.
2. To fix this you should do `standard --fix`.

### Back-end
MyLA Backend is build using [Django](https://www.djangoproject.com/) Framework, [MySQL](https://www.mysql.com/) DataBase,
Cron schedule for getting the Canvas context and event data to the MySQL DB each institution might set this up differently based on the infrastruture support.
MyLA can be run as a stand alone tool with [SAML](https://developers.onelogin.com/saml) support and as LTI tool.

More info of various institutions infrastructure set up is [here](https://github.com/tl-its-umich-edu/my-learning-analytics/wiki/Myla-institutions-Architecture-flow).

## Create an issue
Before sending a pull request, please create an [issue](https://github.com/tl-its-umich-edu/my-learning-analytics/issues/new) describing either a problem (i.e. bug) in MyLA or a feature you would like to contribute. We'll do our best to review the issue in a timely manner to discuss before starting work to address the issue.

## Tips for working with Git

When working with branches it's [advisable](https://randyfay.com/content/simpler-rebasing-avoiding-unintentional-merge-commits) to use the options
`git config --global branch.autosetuprebase always` and `git config --global pull.rebase true`

To always do a `git pull --rebase` when merging back changes from master. This avoids unintentional merge commits, keeps your branch clean and makes it easier to rebase your branch in the future. These options can be changed at any time if you find they aren't working well for you.

Another great option that will save you some time is
`git config --global push.default current` 

This avoids you having to [set an upstream everytime](https://www.jvt.me/posts/2019/09/22/git-push-matching/) and just lets you run `git push`

Reference these github guides on [Forking Projects](https://guides.github.com/activities/forking/) and [Understanding the Github flow](https://guides.github.com/introduction/flow/) for further information. 


## Making a pull request
Once you have had a chance to discuss the issue with one of the project maintainers, please follow these steps for making a [pull request](https://github.com/tl-its-umich-edu/my-learning-analytics/pulls).

1. Fork [this project](https://github.com/tl-its-umich-edu/my-learning-analytics) on Github by pressing the `Fork` button on the top-right hand corner.
1. Clone the forked repository to your local machine. `git clone https://github.com/{github-username}/my-learning-analytics.git`.
1. Try to create local branches to keep your contributions organized - generally one branch for each issue.
1. Once you've pushed your changes to your fork, you should see a button on Github to create a pull request from your forked repository to the main project repository.


## Testing tips!

1. Connect to the docker and edit some files!

    `docker exec -it student_dashboard /bin/bash`

    then install a text editor like vim
    `apt-get -y install vim`

Then you can edit your files! (Probably in /code/dashboard)

2. Restart the gunicorn to read the configuration. This is useful to avoid a redeploy.

    `docker exec student_dashboard pkill -HUP gunicorn`

3. The django-debug-toolbar is available for debugging. For this to be displayed.
  - The environment needs to be DEBUG (set DJANGO_DEBUG=true in your .env)
  - You have to be authenticated and a "super user" account. See step #1
  - The method that controls this access is in show_debug_toolbar(request):
  - Configuration of the panels is in DEBUG_TOOLBAR_PANELS as described on https://django-debug-toolbar.readthedocs.io/en/latest/configuration.html#debug-toolbar-panels

4. VsCode is supported via PTVSD for debugging the code running in Docker. See this information here for details https://code.visualstudio.com/docs/python/debugging#_remote-debugging

    A few variables are available to be defined in the .env file to enable this but minimally you have to set PTVSD_ENABLE=True. Currently docker-compose.yml opens 2 ports that can be used current, 3000 and 3001. If you need more you can open them. You can configure these with other variables. See the .env.sample for examples.

    If you want to connect to the cron job you'll have to use a different port as Django uses 3000 by default and also wait for attach.

    Set your breakpoints then run this command in the docker instance! Then connect to the cron configuration. The job will start when you attach the debugger.
    `docker exec -it student_dashboard /bin/bash -c "PTVSD_WAIT_FOR_ATTACH=True PTVSD_ENABLE=TRUE PTVSD_REMOTE_PORT=3001 ./manage_ptvsd.py runcrons --force"`

## Running front-end tests
`docker exec -it webpack_watcher npm test` will run the test suite for the front-end React application. [Jest](https://jestjs.io/) is the testing framework used. More tests (including back-end tests) are planned for the future.

## Code Review
All contributions will be code reviewed and you may need to make some changes to your contribution. We really appreciate tests as well, so if at all possible please try to add tests.
