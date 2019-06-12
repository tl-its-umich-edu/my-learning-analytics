import logging
from decouple import config
logger = logging.getLogger(__name__)


def get_build_info():
    logger.debug(get_build_info.__name__)
    git_commit=config("OPENSHIFT_BUILD_COMMIT",default="")
    build_namespace=config("OPENSHIFT_BUILD_NAMESPACE",default="")
    git_branch=config("OPENSHIFT_BUILD_REFERENCE",default="master")
    build_source=config("OPENSHIFT_BUILD_SOURCE",default="")
    build_name=config("OPENSHIFT_BUILD_NAME",default="")
    return f'Build_Namespace:{build_namespace} Build_Name: {build_name} Git_Source: {build_source} Git_Branch: {git_branch} Git_Commit: {git_commit}'

def get_copyright_info():
    institutions={"umich": "The Regents of the University of Michigan", "iu": "The Trustees of Indiana University", "ubc": "UBC"}
    institution=config("INSTITUTION",default="")
    copyright_str="Copyright &copy "
    year=datetime.now().year
    copyright_str+=str(year)+institutions[institution]
    return f'Copyright © {year} {institutions[institution]}'