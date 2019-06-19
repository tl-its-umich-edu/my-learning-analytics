"""dashboard URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.apps import apps
from django.conf.urls import url
from django.contrib import admin
from django.contrib.auth.decorators import login_required

from django.views.static import serve

from django.conf import settings
from django.conf.urls import include
from django.conf.urls.static import static

from django.views.decorators.cache import cache_page

from . import views

import watchman.views

urlpatterns = [
    url(r'^$', views.get_home_template, name='home'),
    url(r'^status/', include('watchman.urls')),
    url(r'^status/bare_status$', watchman.views.bare_status),

    url('admin', admin.site.urls),

    # These URL's are for views, the accept an empty id
    url(r'^courses/(?P<course_id>[0-9]+|)/?grades',
        login_required(views.get_grades_template), name="grades"),
    url(r'^courses/(?P<course_id>[0-9]+|)/?assignments',
        login_required(views.get_assignments_template), name="assignments"),
    url(r'^courses/(?P<course_id>[0-9]+|)/?view_file_access_within_week',
        login_required(views.get_files_template), name="view_file_access_within_week"),

    # This is the courses catch-all
    url(r'^courses/(?P<course_id>[0-9]+|)',
        login_required(views.get_course_template), name="courses"),

    # Thse URL's are data patterns
    # GET access patterns
    url(r'^api/v1/courses/(?P<course_id>[0-9]+)/grade_distribution', 
        login_required(views.grade_distribution), name='grade_distribution'),
    url(r'^api/v1/courses/(?P<course_id>[0-9]+)/file_access_within_week', 
        login_required(views.file_access_within_week), name='file_access_within_week'),
    url(r'^api/v1/courses/(?P<course_id>[0-9]+)/assignments', 
        login_required(views.assignments), name='assignments'),
    url(r'^api/v1/courses/(?P<course_id>[0-9]+)/get_user_default_selection', 
        login_required(views.get_user_default_selection), name='get_user_default_selection'),
    url(r'^api/v1/courses/(?P<course_id>[0-9]+)/info', 
        login_required(views.get_course_info), name='get_course_info'),
    # This is a public view of the courses we have enabled
    url(r'^api/v1/courses_enabled', 
        cache_page(settings.CLIENT_CACHE_TIME)(views.courses_enabled), name='courses_enabled'),

    # PUT/POST access patterns
    url(r'^api/v1/courses/(?P<course_id>[0-9]+)/set_user_default_selection', 
        login_required(views.update_user_default_selection_for_views), name='update_user_default_selection_for_views'),

    url(r'^su/', include('django_su.urls')),

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

if apps.is_installed('djangosaml2'):
    from djangosaml2.views import echo_attributes
    urlpatterns += (
        # This URL *does* need a trailing slash because of the include
        url(r'^accounts/', include('djangosaml2.urls')),
        url(r'^samltest', login_required(echo_attributes)),
        # Override auth_logout from djangosaml2 and registration for consistency
        url(r'^accounts/logout', views.logout, name='auth_logout')
    )
else:
    from django.contrib.auth import views as auth_views
    # Login patterns for testing, SAML should be installed in prod
    urlpatterns += (
        url(r'^accounts/login', auth_views.LoginView.as_view(), name='login'),
        url(r'^accounts/logout', auth_views.LoginView.as_view(), name='logout'),
     )

if apps.is_installed('django_lti_auth'):
    urlpatterns += (
        url(r'^lti/', include('django_lti_auth.urls')),
    )

if apps.is_installed('registration'):
    urlpatterns += (
        # This URL *does* need a trailing slash because of the include
        url(r'^accounts/', include('registration.backends.default.urls')),
    )

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += (
        url(r'^__debug__/', include(debug_toolbar.urls)),
        # For django versions after 2.0:
        #path('__debug__/', include(debug_toolbar.urls)),
    ) 
