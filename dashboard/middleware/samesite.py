import django, logging
from django.conf import settings
logger = logging.getLogger(__name__)

# https://docs.djangoproject.com/en/3.0/topics/http/middleware/#writing-your-own-middleware
# https://github.com/dmitry-viskov/pylti1.3-django-example/blob/master/game/game/middleware.py


class SameSiteMiddleware(object):

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        django_support_samesite_none = float(f'{django.VERSION[0]}.{django.VERSION[1]}') >= 3.1
        response = self.get_response(request)
        if request.is_secure() and not django_support_samesite_none:
            session_cookie_samesite = getattr(settings, 'SESSION_COOKIE_SAMESITE', None)
            csrf_cookie_samesite = getattr(settings, 'CSRF_COOKIE_SAMESITE', None)
            session_cookie_name = getattr(settings, 'SESSION_COOKIE_NAME', None)
            csrf_cookie_name = getattr(settings, 'CSRF_COOKIE_NAME', None)
            if session_cookie_samesite is None and session_cookie_name in response.cookies:
                response.cookies[session_cookie_name]['samesite'] = 'None'
            if csrf_cookie_samesite is None and csrf_cookie_name in response.cookies:
                response.cookies[csrf_cookie_name]['samesite'] = 'None'
        return response


