import logging, os
logger = logging.getLogger(__name__)


def get_build_info():
    logger.debug(get_build_info.__name__)

    commit = os.getenv("OPENSHIFT_BUILD_COMMIT", ""),
    if commit != "" and len(commit) > 7:
        commit_abbrev = commit[:7]
    else:
        commit_abbrev = ""

    build = {
        "build_namespace": os.getenv("OPENSHIFT_BUILD_NAMESPACE", ""),
        "build_name": os.getenv("OPENSHIFT_BUILD_NAME", ""),
        "git_source": os.getenv("OPENSHIFT_BUILD_SOURCE", ""),
        "git_branch": os.getenv("OPENSHIFT_BUILD_REFERENCE", "master"),
        "git_commit": commit,
        "git_commit_abbrev": commit_abbrev
    }
    return build


def look_up_key_for_value(myDict, searchFor):
    for key, value in myDict.items():
        for v in value:
            if searchFor in v:
                return key
    return None
