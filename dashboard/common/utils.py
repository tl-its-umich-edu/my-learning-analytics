import logging
import json
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


def get_file_info():
    file_types = config("FILE_TYPES")
    file_types = file_types.split()
    file_dict = {}
    for counter, item in enumerate(file_types):
        temp_str = config(item, default="file_" + str(counter) + " " + str(counter))
        temp_str = temp_str.rsplit(" ", 1)
        file_dict[item] = temp_str
    return file_dict

def get_file_type_value():
    file_dict = get_file_info()
    for file_key, file_list in file_dict.items():
        file_dict[file_key] = file_list[1]
    return json.dumps(file_dict)

def get_file_type_label():
    file_dict = get_file_info()
    file_dict2 = {}
    for file_key, file_list in file_dict.items():
        file_key += "_LABEL"
        file_dict2[file_key] = file_list[0]
    return json.dumps(file_dict2)
    