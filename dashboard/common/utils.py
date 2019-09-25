import logging, os
from dashboard.settings import SHA_ABBREV_LENGTH
logger = logging.getLogger(__name__)


def convert_github_url_from_ssh_to_https(github_url):
    ssh_base = "git@github.com"
    https_base = "https://github.com"
    # If the URL is formatted for SSH, convert, otherwise, do nothing
    if ssh_base in github_url:
        github_url = github_url.replace(":", "/").replace(".git", "").replace(ssh_base, https_base)
    return github_url


def get_build_info():
    logger.debug(get_build_info.__name__)

    commit = os.getenv("GIT_COMMIT", "")
    if commit != "":
        commit_abbrev = commit[:SHA_ABBREV_LENGTH]
    else:
        commit_abbrev = ""

    build = {
        "git_repo": convert_github_url_from_ssh_to_https(os.getenv("GIT_REPO", "")),
        "git_branch": os.getenv("GIT_BRANCH", ""),
        "git_commit": commit,
        "git_commit_abbrev": commit_abbrev,
        "build_namespace": os.getenv("OPENSHIFT_BUILD_NAMESPACE", None),
        "build_name": os.getenv("OPENSHIFT_BUILD_NAME", None),
    }
    return build


def look_up_key_for_value(myDict, searchFor):
    for key, value in myDict.items():
        for v in value:
            if searchFor in v:
                return key
    return None