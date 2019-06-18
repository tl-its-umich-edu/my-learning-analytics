import logging
from decouple import config
from datetime import datetime
logger = logging.getLogger(__name__)


def get_build_info():
    logger.debug(get_build_info.__name__)
    git_commit=config("OPENSHIFT_BUILD_COMMIT",default="")
    build_namespace=config("OPENSHIFT_BUILD_NAMESPACE",default="")
    git_branch=config("OPENSHIFT_BUILD_REFERENCE",default="master")
    build_source=config("OPENSHIFT_BUILD_SOURCE",default="")
    build_name=config("OPENSHIFT_BUILD_NAME",default="")
    return f'Build_Namespace:{build_namespace} Build_Name: {build_name} Git_Source: {build_source} Git_Branch: {git_branch} Git_Commit: {git_commit}'
