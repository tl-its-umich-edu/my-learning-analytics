from django.contrib import admin
from .models import AcademicTerms, CourseViewOption, Course

class CourseInline(admin.TabularInline):
    model = Course

class CourseViewOptionInline(admin.StackedInline):
    model = CourseViewOption

class AcademicTermAdmin(admin.ModelAdmin):
    inlines = [CourseInline,]

class CourseAdmin(admin.ModelAdmin):
    inlines = [CourseViewOptionInline,]

admin.site.register (AcademicTerms, AcademicTermAdmin)
admin.site.register (Course, CourseAdmin)