from __future__ import print_function #python 3 support

import random
import string
import logging

from django.contrib.auth import login
from django.urls import reverse
from django.conf import settings
from django.http import HttpResponseRedirect

from pylti.common import LTIException

from django.contrib.auth.models import User

logger = logging.getLogger(__name__)

RANDOM_PASSWORD_DEFAULT_LENGTH = 32

def valid_lti_request(user_payload, request):
    username = user_payload.get(settings.LTI_PERSON_SOURCED_ID_FIELD, None)
    email = user_payload.get(settings.LTI_EMAIL_FIELD,  None)
    canvas_course_id = user_payload.get(settings.LTI_CANVAS_COURSE_ID_FIELD, None)
    first_name = user_payload.get(settings.LTI_FIRST_NAME, None)
    last_name = user_payload.get(settings.LTI_LAST_NAME, None)

    if username:
        try:
            user_obj = User.objects.get(username=username)
        except User.DoesNotExist:
            password = ''.join(random.sample(string.ascii_letters, RANDOM_PASSWORD_DEFAULT_LENGTH))
            user_obj = User.objects.create_user(username=username, email=email, password=password, first_name=first_name, last_name=last_name)
        user_obj.backend = 'django.contrib.auth.backends.ModelBackend'
        login(request, user_obj)
    else:
        #handle no username from LTI launch
        raise LTIException("No username supplied in the launch, you should check your provider and/or settings.")

    url = reverse('home')
    if canvas_course_id:
        url = reverse('courses', kwargs={ 'course_id': canvas_course_id })

    return url

def invalid_lti_request(user_payload):
    logger.info(f"Invalid LTI request for {user_payload}")