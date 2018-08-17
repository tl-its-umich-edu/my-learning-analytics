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
from django.conf.urls import url
from django.contrib import admin
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
    url(r'^files/', TemplateView.as_view(
        template_name='files.html'), name="files",
    ),
    url(r'^grades/', TemplateView.as_view(
        template_name='grades.html'), name="grades",
    ),
    url(r'^small_multiples_files_bar_chart/', TemplateView.as_view(
        template_name='small_multiples_files_bar_chart.html'), name="small_multiples_files_bar_chart",
    ),
    # get file access patterns
    url(r'^file_access/', views.file_access, name='file_access'),
    url(r'^file_access_within_week/', views.file_access_within_week, name='file_access_within_week'),
    url(r'^view_file_access_within_week', TemplateView.as_view(
      template_name='file_access_within_week.html'), name="view_file_access_within_week",
      ),
    url(r'^grade_distribution', views.grade_distribution, name='grade_distribution'),

    # load file information
    url(r'^load_data', views.load_data, name='load_data'),

    # load data from UDW
    url(r'^update_with_udw_file', cron.update_with_udw_file, name='update_with_udw_file'),
    url(r'^update_with_bq_access', cron.update_with_bq_access, name='update_with_bq_access'),
    url(r'^update_with_udw_user', cron.update_with_udw_user, name='update_with_udw_user'),
    url(r'^update_assignment', cron.update_assignment, name='update_assignment'),
    url(r'^update_groups', cron.update_groups, name='update_groups'),
    url(r'^submission', cron.submission, name='submission'),
    url(r'^weight_consideration', cron.weight_consideration, name='weight_consideration'),
    url(r'^testloader', TemplateView.as_view(
        template_name='testloader.html'), name="testloader",
    ),
    url(r'^$', serve, {
        'path': '/home.html',
        'document_root': '.',
    }),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

if 'djangosaml2' in settings.INSTALLED_APPS:
    urlpatterns += (
        url(r'^accounts/', include('djangosaml2.urls')),
    )
elif 'registration' in settings.INSTALLED_APPS:
    urlpatterns += (
        url(r'^accounts/', include('registration.backends.default.urls')),
    )

# Override auth_logout from djangosaml2 and registration for consistant
# behavior
# urlpatterns.append(url(r'^accounts/logout', views.logout, name='auth_logout'))
