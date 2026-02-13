import logging, os, re
from typing import Optional, TypedDict, Union

from django.conf import settings
from constance import config

from dashboard.common import db_util
from dashboard.models import Course, ResourceAccess


logger = logging.getLogger(__name__)

def format_github_url_using_https(github_url: str):
    ssh_base = "git@"
    https_base = "https://"
    # If the URL is formatted for SSH, convert, otherwise, replace .git extension with ""
    if ssh_base == github_url[:len(ssh_base)]:
        github_url = github_url.replace(":", "/").replace(".git", "").replace(ssh_base, https_base)
    else:
        github_url = github_url.replace(".git", "")
    return github_url


class GitInfo(TypedDict):
    repo: str
    branch: str
    commit: str
    commit_abbrev: str


def get_git_version_info() -> Optional[GitInfo]:
    logger.debug(get_git_version_info.__name__)

    repo = os.getenv("GIT_REPO", None)
    branch = os.getenv("GIT_BRANCH", None)
    commit = os.getenv("GIT_COMMIT", None)

    if not repo or not branch or not commit:
        return None

    # Only include the branch name and not remote info
    branch = branch.split('/')[-1]

    commit_abbrev = (
        commit[:settings.SHA_ABBREV_LENGTH]
        if len(commit) > settings.SHA_ABBREV_LENGTH else commit
    )

    return {
        "repo": format_github_url_using_https(repo),
        "branch": branch,
        "commit": commit,
        "commit_abbrev": commit_abbrev
    }


def search_key_for_resource_value(my_dict, search_for):
    for key, value in my_dict.items():
        for resource_types in value["types"]:
            if search_for in resource_types:
                return key
    return None


def get_course_id_from_request_url(path: str) -> Union[None, int]:
    course_id = None
    if settings.ENABLE_LTI:
        # Looking for an matching pattern like this /courses/123455
        course_id_from_path = re.findall(r'/courses/(\d+)\/?', path)
        if len(course_id_from_path) == 1:
            course_id = int(course_id_from_path[0])
            logger.debug(f'course_id from path: {course_id}')
    return course_id


def get_myla_globals(request):
    current_user = request.user
    username = ""
    display_name = ""
    initials = ""
    user_courses_info = []
    login_url = ""
    logout_url = ""
    google_analytics_id = ""
    course_id = get_course_id_from_request_url(request.path)

    is_admin = current_user.is_staff
    if current_user.is_authenticated:
        username = current_user.get_username()
        user_courses_info = db_util.get_user_courses_info(username, course_id)

        display_name = current_user.get_full_name()
        # if full name blank, use username instead
        if display_name.strip() == '':
            display_name = username

        # get first initial only
        initials = display_name[:1].upper()

    if settings.SHOW_LOGOUT_LINK:
        login_url = settings.LOGIN_URL
        logout_url = settings.LOGOUT_URL

    google_analytics_id = settings.GA_ID if settings.GA_ID else ""
    primary_ui_color = settings.PRIMARY_UI_COLOR

    myla_globals = {
        "username" : username,
        "display_name" : display_name,
        "initials" : initials,
        "is_admin": is_admin,
        "user_courses_info": user_courses_info,
        "login": login_url,
        "logout": logout_url,
        "primary_ui_color": primary_ui_color,
        "google_analytics_id": google_analytics_id,
        "view_help_urls": {
            'ra': settings.URL_VIEW_RESOURCES_ACCESSED,
            'ap': settings.URL_VIEW_ASSIGNMENT_PLANNING,
            'gd': settings.URL_VIEW_GRADE_DISTRIBUTION,
            'home': settings.HELP_URL
        },
        "survey_link": {
            "url": config.SURVEY_URL,
            "text": config.SURVEY_TEXT
        }
    }
    return myla_globals
