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

# If djangosaml2 is installed, then import the login decorator
# It's possible some other auth decorator could also be used

# Otherwise for now provide a login_required that does nothing if this
# decorator is not available

if apps.is_installed('djangosaml2'):
    from django.contrib.auth.decorators import login_required
    from djangosaml2.views import echo_attributes
else:
    def login_required(func):
        return func

from django.views.static import serve
from django.views.generic.base import TemplateView

from django.conf import settings
from django.conf.urls import include
from django.conf.urls.static import static

from . import views
from . import cron

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', views.home, name='home'),
    url(r'^files/', login_required(TemplateView.as_view(
        template_name='files.html')), name="files",
    ),
    url(r'^grades/', login_required(TemplateView.as_view(
        template_name='grades.html')), name="grades",
    ),
    # get file access patterns
    url(r'^file_access/', login_required(views.file_access), name='file_access'),

    url(r'^file_access_within_week/', login_required(views.file_access_within_week), name='file_access_within_week'),
    url(r'^view_file_access_within_week', login_required(TemplateView.as_view(template_name='view_file_access_within_week.html')), name="view_file_access_within_week",
      ),
    url(r'^grade_distribution', login_required(views.grade_distribution), name='grade_distribution'),

    url(r'^assignment_view/', login_required(views.assignment_view), name='assignment_view'),
    url(r'^assignments', login_required(TemplateView.as_view(template_name='assignments.html')), name="assignments"),

    # load file information
    url(r'^load_data', login_required(views.load_data), name='load_data'),

    # load data from UDW
    url(r'^update_with_udw_file', login_required(cron.update_with_udw_file), name='update_with_udw_file'),
    url(r'^update_with_bq_access', login_required(cron.update_with_bq_access), name='update_with_bq_access'),
    url(r'^update_with_udw_user', login_required(cron.update_with_udw_user), name='update_with_udw_user'),
    url(r'^update_assignment', login_required(cron.update_assignment), name='update_assignment'),
    url(r'^update_groups', login_required(cron.update_groups), name='update_groups'),
    url(r'^submission', login_required(cron.submission), name='submission'),
    url(r'^weight_consideration', login_required(cron.weight_consideration), name='weight_consideration'),
    url(r'^testloader', login_required(TemplateView.as_view(
        template_name='testloader.html')), name="testloader",
    ),
    url(r'^$', serve, {
        'path': '/home.html',
        'document_root': '.',
    }),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

if apps.is_installed('djangosaml2'):
    urlpatterns += (
        url(r'^accounts/', include('djangosaml2.urls')),
        url(r'^samltest/', login_required(echo_attributes)),
        # Override auth_logout from djangosaml2 and registration for consistency
        url(r'^accounts/logout', views.logout, name='auth_logout')
    )
elif apps.is_installed('registration'):
    urlpatterns += (
        url(r'^accounts/', include('registration.backends.default.urls')),
    )
