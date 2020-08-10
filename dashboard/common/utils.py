import logging, os

from django.conf import settings

from dashboard.common.db_util import get_user_courses_info
from dashboard.models import Course


logger = logging.getLogger(__name__)


def find_earliest_start_datetime_of_courses():
    sorted_courses = sorted(Course.objects.all(), key=lambda course: course.course_date_range.start)

    earliest_start = None
    if len(sorted_courses) > 0:
        earliest_course = sorted_courses[0]
        earliest_start = earliest_course.course_date_range.start
        logger.info(f"Earliest start datetime for all courses: {earliest_start.isoformat()} found in course {earliest_course.canvas_id}")
    else:
        logger.info(f"No course listed. Return None as the earliest_start_datetime_of_course. ")
    return earliest_start


def format_github_url_using_https(github_url):
    ssh_base = "git@"
    https_base = "https://"
    # If the URL is formatted for SSH, convert, otherwise, do nothing
    if ssh_base == github_url[:len(ssh_base)]:
        github_url = github_url.replace(":", "/").replace(".git", "").replace(ssh_base, https_base)
    return github_url


def get_git_version_info():
    logger.debug(get_git_version_info.__name__)

    commit = os.getenv("GIT_COMMIT", "")
    if commit != "":
        commit_abbrev = commit[:settings.SHA_ABBREV_LENGTH]
    else:
        commit_abbrev = ""

    # Only include the branch name and not remote info
    branch = os.getenv("GIT_BRANCH", "").split('/')[-1]

    git_version = {
        "repo": format_github_url_using_https(os.getenv("GIT_REPO", "")),
        "commit": commit,
        "commit_abbrev": commit_abbrev,
        "branch": branch
    }
    return git_version


def search_key_for_resource_value(my_dict, search_for):
    for key, value in my_dict.items():
        for resource_types in value["types"]:
            if search_for in resource_types:
                return key
    return None


def get_myla_globals(current_user):
    username = ""
    user_courses_info = []
    login_url = ""
    logout_url = ""
    google_analytics_id = ""

    is_superuser = current_user.is_staff
    if current_user.is_authenticated:
        username = current_user.get_username()
        user_courses_info = get_user_courses_info(username)

    if settings.LOGIN_URL:
        login_url = settings.LOGIN_URL
    if settings.LOGOUT_URL:
        logout_url = settings.LOGOUT_URL
    if settings.GA_ID:
        google_analytics_id = settings.GA_ID
    primary_ui_color = settings.PRIMARY_UI_COLOR
    help_url = settings.HELP_URL

    myla_globals = {
        "username" : username,
        "is_superuser": is_superuser,
        "user_courses_info": user_courses_info,
        "login": login_url,
        "logout": logout_url,
        "primary_ui_color": primary_ui_color,
        "google_analytics_id": google_analytics_id,
        "help_url": help_url,
        "view_help_urls": { 
            'ra':settings.URL_VIEW_RESOURCES_ACCESSED,
            'apv1':settings.URL_VIEW_ASSIGNMENT_PLANNING_V1,
            'ap':settings.URL_VIEW_ASSIGNMENT_PLANNING_V2,
            'gd':settings.URL_VIEW_GRADE_DISTRIBUTION 
        }      

    }
    return myla_globals
