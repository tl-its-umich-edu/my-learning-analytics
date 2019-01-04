from __future__ import print_function #python 3 support

import random
import string

from django.contrib.auth import login
from django.urls import reverse
from django.conf import settings
from django.http import HttpResponseRedirect

from django.contrib.auth.models import User

RANDOM_PASSWORD_DEFAULT_LENGTH = 32

def valid_lti_request(user_payload, request):
    username = user_payload.get(settings.LTI_PERSON_SOURCED_ID_FIELD, None)
    email = user_payload.get(settings.LTI_EMAIL_FIELD,  None)
    canvas_course_id = user_payload.get(settings.LTI_CANVAS_COURSE_ID_FIELD, None)

    if username:
        try:
            user_obj = User.objects.get(username=username)
        except User.DoesNotExist:
            password = ''.join(random.sample(string.ascii_letters, RANDOM_PASSWORD_DEFAULT_LENGTH))
            user_obj = User.objects.create_user(username=username, email=email, password=password)
        # TODO: might have to create an LTI backend since this seems hacky
        login(request, user_obj, backend=settings.AUTHENTICATION_BACKENDS[0])
    else:
        #handle no username from LTI launch
        return HttpResponseRedirect(reverse('django_lti_auth:denied'))

    url = reverse('home')
    if canvas_course_id:
        url = reverse('courses', kwargs={ 'course_id': canvas_course_id })

    return url

# def invalid_lti_request(user_payload):
#     pass