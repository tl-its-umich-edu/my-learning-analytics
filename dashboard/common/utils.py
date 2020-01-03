import logging, os
from dashboard.settings import SHA_ABBREV_LENGTH
logger = logging.getLogger(__name__)


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
        commit_abbrev = commit[:SHA_ABBREV_LENGTH]
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