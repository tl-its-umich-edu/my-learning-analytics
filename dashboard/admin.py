from django.contrib import admin
from django import forms
from django.conf import settings
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.template.defaultfilters import linebreaksbr

from dashboard.common.db_util import canvas_id_to_incremented_id
from .models import CourseViewOption, Course

from django.forms.models import ModelForm
from typing import Tuple, Any
from typing_extensions import Protocol

from django.http import HttpRequest

# Always save the OneToOne Fields
# https://stackoverflow.com/a/3734700/3708872


# These two classes are needed for typing issues in admin
# https://github.com/python/mypy/issues/2087
class AdminAttributes(Protocol):
    short_description: str

def admin_attr_decorator(func: Any) -> AdminAttributes:
    return func

class AlwaysChangedModelForm(ModelForm):
    def has_changed(self) -> bool:
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

    def clean(self) -> str:
        canvas_id = self.cleaned_data.get('canvas_id')
        if not canvas_id or not str(canvas_id).isdigit():
            raise forms.ValidationError(
                f"Course ID {canvas_id} must be an integer value")
        return self.cleaned_data


class CourseAdmin(admin.ModelAdmin):
    inlines = [CourseViewOptionInline, ]
    form = CourseForm
    list_display = ('canvas_id', 'name', 'term', 'show_grade_counts', 'course_link', '_courseviewoption', 'show_grade_type')
    list_select_related = True
    readonly_fields = ('term',)

    # Need this method to correctly display the line breaks
    @staticmethod
    @admin_attr_decorator
    def _courseviewoption(obj: Course) -> mark_safe:
        return mark_safe(linebreaksbr(obj.courseviewoption))
    _courseviewoption.short_description = "Course View Option(s)"

    @staticmethod
    def course_link(obj: Course) -> format_html:
        return format_html('<a href="{}">Link</a>', obj.get_absolute_url())

    # When saving the course, update the id based on canvas id
    def save_model(self, request: HttpRequest, obj: Course, form: ModelForm, change: AlwaysChangedModelForm) -> super:
        obj.id = canvas_id_to_incremented_id(obj.canvas_id)
        return super(CourseAdmin, self).save_model(request, obj, form, change)


admin.site.register(Course, CourseAdmin)
