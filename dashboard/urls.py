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
from django.views.generic.base import TemplateView

from django.conf import settings
from django.conf.urls import include
from django.conf.urls.static import static

from . import views
from . import cron

urlpatterns = [
    url(r'^$', TemplateView.as_view(template_name='home.html'), name = 'home'),
    url('status', include('watchman.urls')),

    url('admin', admin.site.urls),

    # These URL's are for views, the accept an empty id
    url(r'^courses/(?P<course_id>[0-9]+|)/?grades', login_required(TemplateView.as_view(template_name='grades.html')), name="grades"),
    url(r'^courses/(?P<course_id>[0-9]+|)/?assignments', login_required(TemplateView.as_view(template_name='assignments.html')), name="assignments"),
    url(r'^courses/(?P<course_id>[0-9]+|)/?view_file_access_within_week', login_required(TemplateView.as_view(template_name='view_file_access_within_week.html')), name="view_file_access_within_week"),

    # This is the courses catch-all
    url(r'^courses/(?P<course_id>[0-9]+|)', login_required(TemplateView.as_view(template_name='courses.html')), name="courses"),

    # Thse URL's are data patterns
    # get file access patterns
    url(r'^api/v1/courses/(?P<course_id>[0-9]+)/grade_distribution', login_required(views.grade_distribution), name='grade_distribution'),
    url(r'^api/v1/courses/(?P<course_id>[0-9]+)/file_access_within_week', login_required(views.file_access_within_week), name='file_access_within_week'),
    url(r'^api/v1/courses/(?P<course_id>[0-9]+)/assignment_view', login_required(views.assignment_view), name='assignment_view'),
    url(r'^api/v1/courses/(?P<course_id>[0-9]+)/assignment_progress', login_required(views.assignment_progress), name='assignment_progress'),
    url(r'^api/v1/get_current_week_number', login_required(views.get_current_week_number), name='get_current_week_number'),

    # These methods are all for loading test data
    # TODO: Move these to cron job
    # load data from UDW
    url(r'^update_with_udw_course', login_required(cron.update_with_udw_course), name='update_with_udw_course'),
    url(r'^update_with_udw_file', login_required(cron.update_with_udw_file), name='update_with_udw_file'),
    url(r'^update_with_bq_access', login_required(cron.update_with_bq_access), name='update_with_bq_access'),
    url(r'^update_with_udw_user', login_required(cron.update_with_udw_user), name='update_with_udw_user'),
    url(r'^update_assignment', login_required(cron.update_assignment), name='update_assignment'),
    url(r'^update_groups', login_required(cron.update_groups), name='update_groups'),
    url(r'^submission', login_required(cron.submission), name='submission'),
    url(r'^weight_consideration', login_required(cron.weight_consideration), name='weight_consideration'),
    url(r'^testloader', login_required(TemplateView.as_view(template_name='testloader.html')), name="testloader"),
    url(r'^su', include('django_su.urls')),

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

 
if apps.is_installed('registration'):
    urlpatterns += (
        # This URL *does* need a trailing slash because of the include
        url(r'^accounts/', include('registration.backends.default.urls')),
    )
