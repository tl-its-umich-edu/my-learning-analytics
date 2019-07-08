import logging, os, json
logger = logging.getLogger(__name__)

try:
    with open(os.getenv("ENV_FILE", "/code/config/env.json")) as f:
        ENV = json.load(f)
except FileNotFoundError as fnfe:
    print("Default config file or one defined in environment variable ENV_FILE not found. This is normal for the build, should define for operation")
    # Set ENV so collectstatic will still run in the build
    ENV = os.environ

def get_build_info():
    logger.debug(get_build_info.__name__)
    git_commit=os.getenv("OPENSHIFT_BUILD_COMMIT", "")
    build_namespace=os.getenv("OPENSHIFT_BUILD_NAMESPACE", "")
    git_branch=os.getenv("OPENSHIFT_BUILD_REFERENCE", "master")
    build_source=os.getenv("OPENSHIFT_BUILD_SOURCE", "")
    build_name=os.getenv("OPENSHIFT_BUILD_NAME", "")
    return f'Build_Namespace:{build_namespace} Build_Name: {build_name} Git_Source: {build_source} Git_Branch: {git_branch} Git_Commit: {git_commit}'


def get_resource_types():
    resource_types = ENV.get("RESOURCE_TYPES")
    return resource_types

def get_resource_urls():
    resource_urls = ENV.get("RESOURCE_URLS")
    return resource_urls

def get_resource_values():
    resource_types = get_resource_types()
    resource_values = []
    for dict_value in resource_types.values():
        resource_values.append(dict_value)
    return resource_values