import logging, os
logger = logging.getLogger(__name__)

def get_build_info():
    logger.debug(get_build_info.__name__)
    git_commit=os.getenv("OPENSHIFT_BUILD_COMMIT", "")
    build_namespace=os.getenv("OPENSHIFT_BUILD_NAMESPACE", "")
    git_branch=os.getenv("OPENSHIFT_BUILD_REFERENCE", "master")
    build_source=os.getenv("OPENSHIFT_BUILD_SOURCE", "")
    build_name=os.getenv("OPENSHIFT_BUILD_NAME", "")
    return f'Build_Namespace:{build_namespace} Build_Name: {build_name} Git_Source: {build_source} Git_Branch: {git_branch} Git_Commit: {git_commit}'

def get_file_dict():
    file_types = config("FILE_TYPES", default="")
    file_types = file_types.split()
    file_dict = {}
    for counter, item in enumerate(file_types):
        temp_str = config(item, default="file_" + str(counter) + " " + str(counter))
        temp_str = temp_str.rsplit(" ", 1)
        file_dict[item] = temp_str
    return file_dict

def get_file_list():
    file_types = config("FILE_TYPES", default="")
    file_types = file_types.split()
    file_list = []
    for counter, item in enumerate(file_types):
        temp_str = config(item, default="file_" + str(counter) + " " + str(counter))
        temp_str = temp_str.rsplit(" ", 1)
        temp_dict = {}
        temp_dict["file_name"] = temp_str[0]
        temp_dict["file_value"] = temp_str[1]
        file_list.append(temp_dict)
    return file_list

def get_file_urls():
    file_dict = get_file_dict()
    file_dict2 = {}
    for file_key, file_value in file_dict.items():
        temp_prefix = file_key + "_PREFIX"
        temp_postfix = file_key + "_POSTFIX"
        temp_list = []
        temp_list.append(config(temp_prefix, default=""))
        temp_list.append(config(temp_postfix, default=""))
        file_dict2[file_value[1]] = temp_list
    return file_dict2