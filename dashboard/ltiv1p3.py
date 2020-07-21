import logging, string, random

import django.contrib.auth

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from pylti1p3.contrib.django import DjangoOIDCLogin, DjangoMessageLaunch, DjangoCacheDataStorage
from pylti1p3.tool_config import ToolConfDict
from django.contrib.auth.models import User
from dashboard.common.db_util import canvas_id_to_incremented_id
from django.core.exceptions import ObjectDoesNotExist
from dashboard.models import Course, CourseViewOption
from django.conf import settings


logger = logging.getLogger(__name__)


def get_tool_conf():
    ltiv1_p3 = settings.LTIV1P3
    try:
        tool_config = ToolConfDict(ltiv1_p3)
    except Exception as e:
        raise e
    # There should be one key per platform and the name relay on platforms generic domain not institution specific
    platform_domain = list(ltiv1_p3.keys())[0]
    client_id = ltiv1_p3[platform_domain][0]['client_id']
    private_key_file_path = ltiv1_p3[platform_domain][0]['private_key_file']
    public_key_file_path = ltiv1_p3[platform_domain][0]['public_key_file']
    public_key = public_key_file_path if public_key_file_path else '/secret/public.key'
    private_key = private_key_file_path if private_key_file_path else '/secret/private.key'
    try:
        private_key_content = open(private_key, 'r').read()
        public_key_content = open(public_key, 'r').read()
    except OSError as e:
        raise e
    tool_config.set_public_key(platform_domain, public_key_content, client_id=client_id)
    tool_config.set_private_key(platform_domain, private_key_content, client_id=client_id)
    return tool_config


def get_jwks(request):
    try:
        tool_conf = get_tool_conf()
    except (OSError, Exception) as e:
        error_message = {
            'lti_error_message': f'Fetching JWKS failed due to {e}'
        }
        return JsonResponse(error_message)
    return JsonResponse(tool_conf.get_jwks())


def check_if_instructor(roles, username, course_id):
    teaching_roles = [role for role in roles if "membership#Instructor" in role or
                      "membership/Instructor#TeachingAssistant" in role]
    if len(teaching_roles) == 0:
        logger.info(f"user {username} is not instructor in course {course_id}")
        return False

    ta = [teach_role for teach_role in teaching_roles if "membership/Instructor#TeachingAssistant" in teach_role]
    if len(ta) != 0:
        logger.info(f"user {username} is not a instructor of course {course_id}")
        return False
    else:
        logger.info(f"user {username} is instructor in course {course_id}")
        return True


def role_check(roles):
    course_roles = [role for role in roles if "membership" in role]
    logger.info(course_roles)
    user_roles = []
    if len(course_roles) == 0:
        institute_roles = [role for role in roles if "institution" in role]
        logger.info(f"user don't seems to have role in Course must be admin {institute_roles}")
        return user_roles

    for role in course_roles:
        split_ = role.split('#')
        user_roles.append(split_[1])
    logger.info(f"User role in course {user_roles}")
    # this step eliminates duplicates of multiple same roles in the course Like TA can be instructor in multiple sections
    user_roles = list(dict.fromkeys(user_roles))
    # A TA can be instructor in other sections of the course but not in Lecture course so default to single role
    user_roles = ['TeachingAssistant'] if not 'TeachingAssistant' else user_roles
    return user_roles


def extracting_launch_variables_for_tool_use(request, message_launch):
    launch_id = message_launch.get_launch_id()
    launch_data = message_launch.get_launch_data()
    custom_params = launch_data['https://purl.imsglobal.org/spec/lti/claim/custom']
    course_name = launch_data['https://purl.imsglobal.org/spec/lti/claim/context']['title']
    roles = launch_data['https://purl.imsglobal.org/spec/lti/claim/roles']
    username = custom_params['user_username']
    course_id = custom_params['canvas_course_id']
    email = launch_data['email']
    first_name = launch_data['given_name']
    last_name = launch_data['family_name']
    user_img = launch_data['picture']
    RANDOM_PASSWORD_DEFAULT_LENGTH = 32

    # Logging the user regardless course exits or not otherwise Django will show default login page
    try:
        user_obj = User.objects.get(username=username)
    except User.DoesNotExist:
        password = ''.join(random.sample(string.ascii_letters, RANDOM_PASSWORD_DEFAULT_LENGTH))
        user_obj = User.objects.create_user(username=username, email=email, password=password, first_name=first_name, last_name=last_name)
    user_obj.backend = 'django.contrib.auth.backends.ModelBackend'
    django.contrib.auth.login(request, user_obj)

    is_instructor = check_if_instructor(roles, username, course_id)
    user_role = role_check(roles)

    course_details = None
    lti_launch_first_time = False

    try:
        course_details = Course.objects.get(canvas_id=course_id)
    except ObjectDoesNotExist:
        if is_instructor or user_obj.is_superuser:
            lti_launch_first_time = True
            canvas_long_id = canvas_id_to_incremented_id(course_id)
            course_details = Course.objects.create(id=canvas_long_id, canvas_id=course_id, name=course_name)
            CourseViewOption.objects.create(course_id=canvas_long_id)

    if course_details is None or course_details.term_id is None:
        logger.info(f"Course {course_id} don't have a cron run yet")
    lti_globals = {
        "username": username,
        "launch_id": launch_id,
        "user_courses_info": {"course_id": course_id, "course_name": course_name},
        "role": user_role,
        "lti_launch_first_time": lti_launch_first_time,
        "is_superuser": user_obj.is_superuser,
        "login": settings.LOGIN_URL,
        "logout": settings.LOGOUT_URL,
        "user_image": user_img,
        "primary_ui_color": settings.PRIMARY_UI_COLOR,
        "help_url": settings.HELP_URL,
        "google_analytics_id": settings.GA_ID
    }
    return lti_globals


@csrf_exempt
def login(request):
    try:
        tool_conf = get_tool_conf()
    except (OSError, Exception) as e:
        error_message = {
            'lti_error_message': f'LTI Login failed due to {e}'
        }
        return JsonResponse(error_message)

    target_link_uri = request.POST.get('target_link_uri', request.GET.get('target_link_uri'))
    if not target_link_uri:
        error_message = {
            'lti_error_message': 'LTI Login failed due to missing "target_link_uri" param'
        }
        return JsonResponse(error_message)
    launch_data_storage = DjangoCacheDataStorage(cache_name='default')
    oidc_login = DjangoOIDCLogin(request, tool_conf, launch_data_storage=launch_data_storage)
    return oidc_login.enable_check_cookies().redirect(target_link_uri)


@require_POST
@csrf_exempt
def launch(request):
    try:
        tool_conf = get_tool_conf()
    except (OSError, Exception) as e:
        error_message = {
            'lti_error_message': f'LTI Launch failed due to {e}'
        }
        return JsonResponse(error_message)
    launch_data_storage = DjangoCacheDataStorage(cache_name='default')
    message_launch = DjangoMessageLaunch(request, tool_conf, launch_data_storage=launch_data_storage)
    # fetch platform's public key from cache instead of everytime calling the API will speep up the launch process
    cache_ttl = settings.DB_CACHE_CONFIGS['CACHE_TTL']
    cache_lifetime = cache_ttl if cache_ttl else 7200
    message_launch.set_public_key_caching(launch_data_storage, cache_lifetime=cache_lifetime)
    lti_globals = extracting_launch_variables_for_tool_use(request, message_launch)
    context = {
        'lti_globals': lti_globals
    }
    logger.info({'lti_globals': lti_globals })
    return render(request, 'frontend/index.html', context)
