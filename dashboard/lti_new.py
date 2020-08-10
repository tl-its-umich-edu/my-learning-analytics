import logging, string, random
import django.contrib.auth

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from collections import namedtuple

from pylti1p3.contrib.django import DjangoOIDCLogin, DjangoMessageLaunch, DjangoCacheDataStorage
from pylti1p3.tool_config import ToolConfDict

from dashboard.models import Course, CourseViewOption, User as mylaUser
from dashboard.common.db_util import canvas_id_to_incremented_id


logger = logging.getLogger(__name__)
INSTRUCTOR = 'http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor'
TA = 'http://purl.imsglobal.org/vocab/lis/v2/membership/Instructor#TeachingAssistant'
COURSE_MEMBERSHIP = 'http://purl.imsglobal.org/vocab/lis/v2/membership'
DUMMY_CACHE = 'DummyCache'


class LTIError:
    def __init__(self, msg):
        self.msg = msg

    def response_json(self):
        error_message = {
            'lti_error': f'Launch failed due to {self.msg}'
        }
        return JsonResponse(error_message, status=500)


def get_tool_conf():
    lti_config = settings.LTI_CONFIG
    try:
        tool_config = ToolConfDict(lti_config)
    except Exception as e:
        return e
    # There should be one key per platform and the name relay on platforms generic domain not institution specific
    platform_domain = list(lti_config.keys())[0]
    client_id = lti_config[platform_domain][0]['client_id']
    private_key_file_path = lti_config[platform_domain][0]['private_key_file']
    public_key_file_path = lti_config[platform_domain][0]['public_key_file']
    public_key = public_key_file_path if public_key_file_path else '/secret/public.key'
    private_key = private_key_file_path if private_key_file_path else '/secret/private.key'
    try:
        private_key_content = open(private_key, 'r').read()
        public_key_content = open(public_key, 'r').read()
    except OSError as e:
        return e
    tool_config.set_public_key(platform_domain, public_key_content, client_id=client_id)
    tool_config.set_private_key(platform_domain, private_key_content, client_id=client_id)
    return tool_config


def check_if_success_getting_tool_config(tool_config):
    if isinstance(tool_config, ToolConfDict):
        logger.info('Success in fetching LTI tool configuration')
        return True
    else:
        logger.error(tool_config)
        return False


def get_jwks(request):
    config = get_tool_conf()
    if not check_if_success_getting_tool_config(config):
        return LTIError(config).response_json()
    return JsonResponse(config.get_jwks())


def get_cache_config():
    CacheConfig = namedtuple('CacheConfig', ['is_dummy_cache', 'launch_data_storage', 'cache_lifetime'])
    is_dummy_cache = DUMMY_CACHE in settings.DB_CACHE_CONFIGS['BACKEND']
    launch_data_storage = DjangoCacheDataStorage(cache_name='default') if not is_dummy_cache else None
    cache_ttl = settings.DB_CACHE_CONFIGS['CACHE_TTL']
    cache_lifetime = cache_ttl if cache_ttl else 7200
    return CacheConfig(is_dummy_cache, launch_data_storage, cache_lifetime)


def check_if_instructor(roles, username, course_id):
    if INSTRUCTOR in roles:
        logger.info(f'user {username} is Instructor in the course {course_id}')
        return True
    return False


def course_user_roles(roles, username):
    user_membership_roles = set([role for role in roles if role.find(COURSE_MEMBERSHIP) == 0])
    if not user_membership_roles:
        logger.info(f'User {username} does not have course membership roles, must be admin {roles}')
    elif INSTRUCTOR in user_membership_roles and TA in user_membership_roles:
        logger.info(f'User {username} is a {TA} in the course')
        user_membership_roles.remove(INSTRUCTOR)
    return user_membership_roles


def short_user_role_list(roles):
    return [role.split('#')[1] for role in roles]


def extracting_launch_variables_for_tool_use(request, message_launch):
    launch_id = message_launch.get_launch_id()
    launch_data = message_launch.get_launch_data()
    logger.debug(f'lti launch data {launch_data}')
    custom_params = launch_data['https://purl.imsglobal.org/spec/lti/claim/custom']
    logger.debug(f'lti_custom_param {custom_params}')
    if not custom_params:
        raise Exception(
            f'You need to have custom parameters configured on your LTI Launch. Please see the LTI installation guide on the Github Wiki for more information.'
        )
    course_name = launch_data['https://purl.imsglobal.org/spec/lti/claim/context']['title']
    roles = launch_data['https://purl.imsglobal.org/spec/lti/claim/roles']
    username = custom_params['user_username']
    course_id = custom_params['canvas_course_id']
    canvas_course_long_id = canvas_id_to_incremented_id(course_id)
    canvas_user_id = custom_params['canvas_user_id']
    canvas_user_long_id = canvas_id_to_incremented_id(canvas_user_id)
    email = launch_data['email']
    first_name = launch_data['given_name']
    last_name = launch_data['family_name']
    user_name = launch_data['name']
    user_img = launch_data['picture']
    user_sis_id = launch_data['https://purl.imsglobal.org/spec/lti/claim/lis']['person_sourcedid']

    # Add user to DB if not there; avoids Django redirection to login page
    try:
        user_obj = User.objects.get(username=username)
    except User.DoesNotExist:
        password = ''.join(random.sample(string.ascii_letters, settings.RANDOM_PASSWORD_DEFAULT_LENGTH))
        user_obj = User.objects.create_user(username=username, email=email, password=password, first_name=first_name,
                                            last_name=last_name)
    user_obj.backend = 'django.contrib.auth.backends.ModelBackend'
    django.contrib.auth.login(request, user_obj)
    user_roles = course_user_roles(roles, username)
    is_instructor = check_if_instructor(user_roles, username, course_id)

    course_details = None
    is_course_data_loaded = False

    try:
        course_details = Course.objects.get(canvas_id=course_id)
    except ObjectDoesNotExist:
        if is_instructor or user_obj.is_staff:
            course_details = Course.objects.create(id=canvas_course_long_id, canvas_id=course_id, name=course_name)
            CourseViewOption.objects.create(course_id=canvas_course_long_id)
        if is_instructor:
            mylaUser.objects.create(name=user_name, sis_name=username,
                                                course_id=canvas_course_long_id,
                                                user_id=canvas_user_long_id, sis_id=user_sis_id,
                                                enrollment_type=mylaUser.ENROLLMENT_TYPES.TeacherEnrollment)

    if course_details is None:
        logger.info(f'Course {course_id} data has not yet been loaded')
    elif course_details.term_id is not None:
        logger.info(f'Course {course_id} data is ready')
        is_course_data_loaded = True

    myla_globals = {
        'username': username,
        'is_superuser': user_obj.is_staff,
        'login': settings.LOGIN_URL,
        'logout': settings.LOGOUT_URL,
        'user_image': user_img,
        'primary_ui_color': settings.PRIMARY_UI_COLOR,
        'help_url': settings.HELP_URL,
        'view_help_urls': { 
            'ra':settings.URL_VIEW_RESOURCES_ACCESSED,
            'apv1':settings.URL_VIEW_ASSIGNMENT_PLANNING_V1,
            'ap':settings.URL_VIEW_ASSIGNMENT_PLANNING_V2,
            'gd':settings.URL_VIEW_GRADE_DISTRIBUTION 
        }  ,
        'google_analytics_id': settings.GA_ID,
        'user_courses_info': [
            {'course_id': course_id, 'course_name': course_name, 'enrollment_types': short_user_role_list(user_roles)}],
        'lti_launch_id': launch_id,
        'lti_is_course_data_loaded': is_course_data_loaded,
    }
    return myla_globals


@csrf_exempt
def login(request):
    config = get_tool_conf()
    if not check_if_success_getting_tool_config(config):
        return LTIError(config).response_json()
    target_link_uri = request.POST.get('target_link_uri', request.GET.get('target_link_uri'))
    if not target_link_uri:
        error_message = 'LTI Login failed due to missing "target_link_uri" param'
        return LTIError(error_message).response_json()
    CacheConfig = get_cache_config()
    oidc_login = DjangoOIDCLogin(request, config, launch_data_storage=CacheConfig.launch_data_storage)
    return oidc_login.enable_check_cookies().redirect(target_link_uri)


@require_POST
@csrf_exempt
def launch(request):
    config = get_tool_conf()
    if not check_if_success_getting_tool_config(config):
        return LTIError(config).response_json()
    CacheConfig = get_cache_config()
    message_launch = DjangoMessageLaunch(request, config, launch_data_storage=CacheConfig.launch_data_storage)
    if not CacheConfig.is_dummy_cache:
        # fetch platform's public key from cache instead of calling the API will speed up the launch process
        message_launch.set_public_key_caching(CacheConfig.launch_data_storage, cache_lifetime=CacheConfig.cache_lifetime)
    else:
        logger.info('DummyCache is set up, recommended atleast to us Mysql DB cache for LTI advantage services')

    try:
       myla_globals = extracting_launch_variables_for_tool_use(request, message_launch)
    except Exception as e:
        return LTIError(e).response_json()
    context = {
        'myla_globals': myla_globals
    }
    logger.info(f'MyLA Globals from LTI launch {context}')
    return render(request, 'frontend/index.html', context)
