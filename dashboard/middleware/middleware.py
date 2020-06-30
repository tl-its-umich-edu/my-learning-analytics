import django, logging
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
logger = logging.getLogger(__name__)


class SameSiteMiddleware(MiddlewareMixin):

    def process_response(self, request, response):
        logger.info("********************* SameSiteMiddleware")
        django_support_samesite_none = django.VERSION[0] > 3 \
                                       or (django.VERSION[0] == 3 and django.VERSION[1] >= 1)
        if request.is_secure() and not django_support_samesite_none:
            session_cookie_samesite = getattr(settings, 'SESSION_COOKIE_SAMESITE', None)
            csrf_cookie_samesite = getattr(settings, 'CSRF_COOKIE_SAMESITE', None)
            session_cookie_name = getattr(settings, 'SESSION_COOKIE_NAME', None)
            csrf_cookie_name = getattr(settings, 'CSRF_COOKIE_NAME', None)
            if session_cookie_samesite is None and session_cookie_name in response.cookies:
                logger.info(f"Session cookie sessionid is in response for request {request.path} ")
                response.cookies[session_cookie_name]['samesite'] = 'None'
            if csrf_cookie_samesite is None and csrf_cookie_name in response.cookies:
                logger.info(f"csrf cookie csrftoken is in the response for request {request.path}")
                response.cookies[csrf_cookie_name]['samesite'] = 'None'
        return response
