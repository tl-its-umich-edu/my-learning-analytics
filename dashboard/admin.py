from django.contrib import admin
from django.conf import settings

from .models import CourseViewOption, Course

class CourseInline(admin.TabularInline):
    model = Course

class CourseViewOptionInline(admin.StackedInline):
    model = CourseViewOption

class CourseAdmin(admin.ModelAdmin):
    inlines = [CourseViewOptionInline,]

    # When saving the course, update the id based on canvas id
    def save_model(self, request, obj, form, change):
        obj.id = settings.UDW_ID_PREFIX + obj.canvas_id
        return super(CourseAdmin, self).save_model(request, obj, form, change)
        
admin.site.register (Course, CourseAdmin)