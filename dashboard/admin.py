from typing import Tuple

from django import forms
from django.conf import settings
from django.contrib import admin
from django.forms.models import ModelForm
from django.template.defaultfilters import linebreaksbr
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from pinax.eventlog.admin import LogAdmin
from pinax.eventlog.models import Log
from django_cron.admin import CronJobLogAdmin
from django_cron.models import CronJobLog

from import_export.admin import ExportMixin
from import_export import resources

from dashboard.common.db_util import canvas_id_to_incremented_id
from dashboard.models import AcademicTerms, Course, CourseViewOption


# Always save the OneToOne Fields
# https://stackoverflow.com/a/3734700/3708872


class AlwaysChangedModelForm(ModelForm):
    def has_changed(self):
        if not self.instance.pk:
            return True
        return super(AlwaysChangedModelForm, self).has_changed()


class CourseViewOptionInline(admin.StackedInline):
    model = CourseViewOption
    form = AlwaysChangedModelForm

    exclude: Tuple[str, ...] = ()

    # exclude disabled views
    for view in CourseViewOption.VIEWS:
        if view in settings.VIEWS_DISABLED:
            exclude += (view,)


class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        exclude = ()

    def clean(self):
        canvas_id = self.cleaned_data.get('canvas_id')
        if not canvas_id or not str(canvas_id).isdigit():
            raise forms.ValidationError(
                f"Course ID {canvas_id} must be an integer value")
        return self.cleaned_data


class TermAdmin(admin.ModelAdmin):
    exclude = ('id',)
    list_display = ('canvas_id', 'name', 'date_start', 'date_end')
    readonly_fields = ('canvas_id', 'name')

    def has_add_permission(self, request):
        return False


class CourseAdmin(admin.ModelAdmin):
    inlines = [CourseViewOptionInline, ]
    form = CourseForm
    list_display = ('canvas_id', 'name', 'term', 'show_grade_counts', 'course_link', '_courseviewoption', 'show_grade_type')
    list_select_related = True
    readonly_fields = ('term', 'data_last_updated',)

    # Need this method to correctly display the line breaks
    def _courseviewoption(self, obj):
        return mark_safe(linebreaksbr(obj.courseviewoption))

    # Known mypy issue: https://github.com/python/mypy/issues/708
    _courseviewoption.short_description = "Course View Option(s)" # type: ignore[attr-defined]

    def course_link(self, obj):
        return format_html('<a href="{}">Link</a>', obj.absolute_url)

    # When saving the course, update the id based on canvas id
    def save_model(self, request, obj, form, change):
        obj.id = canvas_id_to_incremented_id(obj.canvas_id)
        return super(CourseAdmin, self).save_model(request, obj, form, change)

class LogResource(resources.ModelResource):
    class Meta:
        model = Log

# This is a local class for logs that adds in Export and disables some actions on the admin
class MyLALogAdmin(ExportMixin, LogAdmin):
    resource_class = LogResource
    # Remove adding and editing for logs
    @staticmethod
    def has_add_permission(request):
        return False
    @staticmethod
    def has_change_permission(request):
        return False
    @staticmethod
    def has_delete_permission(request):
        return False

# This is local class for Cron that disables add
class MyLACronJobLogAdmin(CronJobLogAdmin):
    # Remove adding and editing for cron logs
    @staticmethod
    def has_add_permission(request):
        return False
    @staticmethod
    def has_change_permission(request):
        return False
    @staticmethod
    def has_delete_permission(request):
        return False

admin.site.register(AcademicTerms, TermAdmin)
admin.site.register(Course, CourseAdmin)

# Remove the pinax LogAdmin and add ours
admin.site.unregister(Log)
admin.site.register(Log, MyLALogAdmin)

# Remove the pinax cron and add ours
admin.site.unregister(CronJobLog)
admin.site.register(CronJobLog,MyLACronJobLogAdmin)