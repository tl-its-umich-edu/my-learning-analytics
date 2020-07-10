import logging, string, random
import django.contrib.auth

from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import redirect, render
from django.urls import reverse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from pylti1p3.contrib.django import DjangoOIDCLogin, DjangoMessageLaunch, DjangoCacheDataStorage
from pylti1p3.tool_config import ToolConfDict
from dashboard.settings import LTIV1P3
from django.contrib.auth.models import User
from dashboard.common.db_util import canvas_id_to_incremented_id
from django.core.exceptions import ObjectDoesNotExist
from dashboard.models import Course, CourseViewOption
from django.utils.decorators import method_decorator
from django.views.decorators.clickjacking import xframe_options_exempt


logger = logging.getLogger(__name__)


def get_tool_conf():
    tool_config = ToolConfDict(LTIV1P3)
    key = list(LTIV1P3.keys())[0]
    logger.info(key)
    client_id = LTIV1P3[key][0]['client_id']
    private_key = LTIV1P3[key][0]['private_key_file']
    public_key = LTIV1P3[key][0]['public_key_file']
    logger.info(client_id)
    logger.info(private_key)
    tool_config.set_public_key(key, client_id, public_key)
    tool_config.set_private_key(key, client_id, public_key)
    return tool_config


def get_launch_url(request):
    target_link_uri = request.POST.get('target_link_uri', request.GET.get('target_link_uri'))
    if not target_link_uri:
        raise Exception('Missing "target_link_uri" param')
    return target_link_uri


def get_jwks(request):
    logger.info("************** get_jwks() ")
    tool_conf = get_tool_conf()
    return JsonResponse(tool_conf.get_jwks(), safe=False)


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


def validate_lti_1_3_request(request, message_launch_data):
    url = reverse('home')
    custom_params = message_launch_data['https://purl.imsglobal.org/spec/lti/claim/custom']
    course_name = message_launch_data['https://purl.imsglobal.org/spec/lti/claim/context']['title']
    roles = message_launch_data['https://purl.imsglobal.org/spec/lti/claim/roles']
    username = custom_params['user_username']
    course_id = custom_params['canvas_course_id']
    email = message_launch_data['email']
    first_name = message_launch_data['given_name']
    last_name = message_launch_data['family_name']
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

    try:
        course_details = Course.objects.get(canvas_id=course_id)
    except ObjectDoesNotExist:
        if is_instructor:
            canvas_long_id = canvas_id_to_incremented_id(course_id)
            course_details = Course.objects.create(id=canvas_long_id, canvas_id=course_id, name=course_name)
            CourseViewOption.objects.create(course_id=canvas_long_id)

    if course_details.term_id is None:
        logger.info(f"Course {course_id} don't have a cron run yet")

    if course_id:
        url = reverse('courses', kwargs={'course_id': course_id})
        logger.info(f"Course URL for LTI launch {url}")
    return url


@csrf_exempt
def login(request):
    logger.info("LTI Login called...........")
    tool_conf = get_tool_conf()
    launch_data_storage = DjangoCacheDataStorage(cache_name='default')
    oidc_login = DjangoOIDCLogin(request, tool_conf, launch_data_storage=launch_data_storage)
    target_link_uri = get_launch_url(request)
    return oidc_login.enable_check_cookies().redirect(target_link_uri)


@require_POST
@method_decorator(xframe_options_exempt, name='dispatch')
@method_decorator(csrf_exempt, name='dispatch')
def launch(request):
    logger.info("LTI Launch of the tool")
    tool_conf = get_tool_conf()
    launch_data_storage = DjangoCacheDataStorage(cache_name='default')
    message_launch = DjangoMessageLaunch(request, tool_conf, launch_data_storage=launch_data_storage)
    message_launch_data = message_launch.get_launch_data()
    launch_id = message_launch.get_launch_id()
    logger.info(f"Launch_id: {launch_id}")
    url = validate_lti_1_3_request(request, message_launch_data)
    return redirect(url)
