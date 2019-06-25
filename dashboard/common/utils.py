import logging
logger = logging.getLogger(__name__)
from django.conf import settings

def get_build_info():
    logger.debug(get_build_info.__name__)
    git_commit=settings.ENV.get("OPENSHIFT_BUILD_COMMIT", "")
    build_namespace=settings.ENV.get("OPENSHIFT_BUILD_NAMESPACE", "")
    git_branch=settings.ENV.get("OPENSHIFT_BUILD_REFERENCE", "master")
    build_source=settings.ENV.get("OPENSHIFT_BUILD_SOURCE", "")
    build_name=settings.ENV.get("OPENSHIFT_BUILD_NAME", "")
    return f'Build_Namespace:{build_namespace} Build_Name: {build_name} Git_Source: {build_source} Git_Branch: {git_branch} Git_Commit: {git_commit}'

