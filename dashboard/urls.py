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
from django.contrib import admin
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required

from django.conf import settings
from django.conf.urls.static import static
from django.urls import include
from django.urls import path, re_path

from dashboard.graphql.view import DashboardGraphQLView

from django.views.decorators.cache import cache_page

from . import views

import watchman.views

# Disable the Django admin login page
admin.site.login = staff_member_required(admin.site.login, login_url=settings.LOGIN_URL)

urlpatterns = [
    path('', views.get_home_template, name = 'home'),
    path('status/', include('watchman.urls')),
    path('status/bare_status/', watchman.views.bare_status),

    path('admin/', admin.site.urls),

    # Note the absence of a trailing slash; adding one breaks the GraphQL implementation.
    path('graphql', DashboardGraphQLView.as_view(graphiql=settings.DEBUG)),

    # This is the courses catch-all. Most user-initiated requests will match the regular expression; then the React
    # front-end will manage any additional routing.
    re_path(r'^courses/', login_required(views.get_home_template,), name="courses"),
    # This path is used by Course.absolute_url to generate course links for the Admin interface.
    path('courses/<int:course_id>/', login_required(views.get_home_template,), name="courses"),

    # These URLs are data patterns
    # GET access patterns
    path('api/v1/courses/<int:course_id>/grade_distribution/',
        login_required(views.grade_distribution), name='grade_distribution'),
    path('api/v1/courses/<int:course_id>/resource_access_within_week/',
        login_required(views.resource_access_within_week), name='resource_access_within_week'),
    path('api/v1/courses/<int:course_id>/get_user_default_selection/',
        login_required(views.get_user_default_selection), name='get_user_default_selection'),
    path('api/v1/courses/<int:course_id>/info/',
        login_required(views.get_course_info), name='get_course_info'),
    # This is a public view of the courses we have enabled
    path('api/v1/courses_enabled/',
        cache_page(settings.CLIENT_CACHE_TIME)(views.courses_enabled), name='courses_enabled'),


    # PUT/POST access patterns
    path('api/v1/courses/<int:course_id>/set_user_default_selection/',
        login_required(views.update_user_default_selection_for_views), name='update_user_default_selection_for_views'),
    path('api/v1/courses/<int:course_id>/update_info/',
        login_required(views.update_course_info), name='update_course_info'),

    path('su/', include('django_su.urls')),

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


if settings.ENABLE_LTI:
    from . import lti_new
    urlpatterns += (
        path('lti/login/', lti_new.login, name='lti_login'),
        path('lti/launch/', lti_new.launch, name='lti_launch'),
        path('lti/jwks/', lti_new.get_jwks, name='lti_get_jwks'),
        path('lti/config/', lti_new.generate_config_json,
             name=lti_new.generate_config_json.__name__),
    )

if settings.ENABLE_BACKEND_LOGIN:
    from django.contrib.auth import views as auth_views
    # Login patterns for testing
    urlpatterns += (
        path('accounts/login/', auth_views.LoginView.as_view(), name='login'),
        path('accounts/logout/', auth_views.LogoutView.as_view(), name='logout'),
    )
