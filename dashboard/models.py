# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from __future__ import unicode_literals

from django.db import models
import logging
logger = logging.getLogger(__name__)

from datetime import datetime

class AcademicTermsQuerySet(models.QuerySet):
    def course_date_start(self, course_id):
        try:
            return self.get(course__id=str(course_id)).date_start
        except self.model.DoesNotExist:
            logger.debug(f"Could not find term for course {course_id}")
            return datetime.min

class AcademicTermsManager(models.Manager):
    def get_queryset(self):
        return AcademicTermsQuerySet(self.model, using=self._db)

    def course_date_start(self, course_id):
        return self.get_queryset().course_date_start(course_id)

class AcademicTerms(models.Model):
    id = models.BigIntegerField(primary_key=True, verbose_name="Term Id")
    canvas_id = models.BigIntegerField(verbose_name="Canvas Id")
    name = models.CharField(max_length=255, verbose_name="Name")
    date_start = models.DateField(verbose_name="Start Date")
    date_end = models.DateField(verbose_name="End Date")
    
    objects = AcademicTermsManager()

    def __str__(self):
        return self.name

    class Meta:
        managed = False
        db_table = 'academic_terms'
        verbose_name = "Academic Terms"
        verbose_name_plural = "Academic Terms"

class Assignment(models.Model):
    id = models.CharField(primary_key=True, max_length=255, verbose_name="Assignment Id")
    name = models.CharField(max_length=255, verbose_name="Name")
    due_date = models.DateTimeField(blank=True, null=True, verbose_name="Due DateTime")
    local_date = models.DateTimeField(blank=True, null=True, verbose_name="Local DateTime")
    points_possible = models.CharField(max_length=255, blank=True, null=True, verbose_name="Points Possible")
    course_id = models.CharField(max_length=255, verbose_name="Course Id")
    assignment_group_id = models.CharField(max_length=255, verbose_name="Assignment Group Id")

    def __str__(self):
        return self.name

    class Meta:
        managed = False
        db_table = 'assignment'


class AssignmentGroups(models.Model):
    id = models.CharField(primary_key=True, max_length=255, verbose_name="Assignment Group Id")
    name = models.CharField(max_length=255, verbose_name="Name")
    weight = models.CharField(max_length=255, blank=True, null=True, verbose_name="Weight")
    group_points = models.CharField(max_length=255, blank=True, null=True, verbose_name="Group Points")
    course_id = models.CharField(max_length=255, verbose_name="Course Id")
    drop_lowest = models.CharField(max_length=255, blank=True, null=True, verbose_name="Drop Lowest")
    drop_highest = models.CharField(max_length=255, blank=True, null=True, verbose_name="Drop Highest")

    def __str__(self):
        return self.name

    class Meta:
        managed = False
        db_table = 'assignment_groups'
        verbose_name = "Assignment Groups"
        verbose_name_plural = "Assignment Groups"


class AssignmentWeightConsideration(models.Model):
    course_id = models.CharField(primary_key=True, max_length=255, verbose_name="Course Id")
    consider_weight = models.IntegerField(blank=True, null=True, verbose_name="Consider Weight")

    class Meta:
        managed = False
        db_table = 'assignment_weight_consideration'

class CourseQuerySet(models.QuerySet):
    def get_supported_courses(self):
        """Returns the list of supported courses from the database
        
        :return: [List of supported course ids]
        :rtype: [list of str (possibly prefixed depending on parameter)]
        """
        try:
            return self.values_list('id', flat=True)
        except self.model.DoesNotExist:
            logger.info("Courses did not exist", exc_info = True)
        return []

class CourseManager(models.Manager):
    def get_queryset(self):
        return CourseQuerySet(self.model, using=self._db)

    def get_supported_courses(self):
        return self.get_queryset().get_supported_courses()


class Course(models.Model):
    id = models.CharField(primary_key=True, max_length=255, verbose_name="Unizin Course Id", db_column='id', editable=False)
    canvas_id = models.CharField(max_length=255, verbose_name="Canvas Course Id", db_column='canvas_id')
    term_id = models.ForeignKey(AcademicTerms, verbose_name="Term Id", on_delete=models.SET_NULL, db_column='term_id', null=True)
    name = models.CharField(max_length=255, verbose_name="Name")
    
    objects = CourseManager()

    def __str__(self):
        return self.name

    class Meta:
        managed = False
        db_table = 'course'
        verbose_name = "Course"


class CourseViewOption(models.Model):
    course = models.OneToOneField(Course, on_delete=models.CASCADE, primary_key=True, verbose_name="Course View Option Id")
    show_files_accessed = models.BooleanField(blank=False, null=False, verbose_name="Show Files Accessed View")
    show_assignment_planning = models.BooleanField(blank=False, null=False, verbose_name="Show Assignment Planning View")
    show_grade_distribution = models.BooleanField(blank=False, null=False, verbose_name="Show Grade Distribution View")

    def __str__(self):
        return f"Course options for {self.course}"

    class Meta:
        managed = False
        db_table = 'course_view_option'
    
    def json(self):
        """Format the json output that we want for this record
        
        This should be of the format canvas_id : {options}
        :return: JSON formatted CourseViewOption
        :rtype: Dict
        """

        return {
            self.course.canvas_id: {
                'course_name': self.course.name, 
                'show_files_accessed': self.show_files_accessed,
                'show_assignment_planning': self.show_assignment_planning,
                'show_grade_distribution': self.show_grade_distribution
            }
        }

class File(models.Model):
    id = models.CharField(primary_key=True, max_length=255, verbose_name="File Id")
    name = models.TextField(verbose_name="File Name")
    course_id = models.CharField(max_length=255, verbose_name="Course Id")

    def __str__(self):
        return self.name

    class Meta:
        managed = False
        db_table = 'file'


class Submission(models.Model):
    id = models.CharField(primary_key=True, max_length=255, verbose_name="Submission Id")
    assignment_id = models.CharField(max_length=255, verbose_name="Assignment Id")
    course_id = models.CharField(max_length=255, verbose_name="Course Id")
    user_id = models.CharField(max_length=255, verbose_name="User Id")
    score = models.CharField(max_length=255, blank=True, null=True, verbose_name="Score")
    graded_date = models.DateTimeField(blank=True, null=True, verbose_name="Graded DateTime")

    def __str__(self):
        return f"Submission Id {self.id} for assignment id {self.assignment_id} for course id {self.course_id} for user id {self.user_id}"

    class Meta:
        managed = False
        db_table = 'submission'


class UnizinMetadata(models.Model):
    pkey = models.CharField(primary_key=True, max_length=20, verbose_name="Key")
    pvalue = models.CharField(max_length=100, blank=True, null=True, verbose_name="Value")

    class Meta:
        managed = False
        db_table = 'unizin_metadata'


class User(models.Model):
    id = models.CharField(primary_key=True, max_length=255, verbose_name="User Id")
    name = models.CharField(max_length=255, verbose_name="Name")
    sis_id = models.CharField(max_length=255, blank=True, null=True, verbose_name="SIS Id")
    sis_name = models.CharField(max_length=255, blank=True, null=True, verbose_name="SIS Name")
    course_id = models.CharField(max_length=255, verbose_name="Course Id")
    current_grade = models.CharField(max_length=255, blank=True, null=True, verbose_name="Current Grade")
    final_grade = models.CharField(max_length=255, blank=True, null=True, verbose_name="Final Grade")

    def __str__(self):
        return self.name

    class Meta:
        managed = False
        db_table = 'user'
        unique_together = (('id', 'course_id'),)

class FileAccess(models.Model):
    file_id = models.OneToOneField(File, on_delete=models.CASCADE, primary_key=True, verbose_name="File")
    user_id = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, verbose_name="User")
    access_time = models.DateTimeField(verbose_name="Access Time")

    def __str__(self):
        return f"File {self.file_id} accessed by {self.user_id}"

    class Meta:
        managed = False
        db_table = 'file_access'
        unique_together = (('file_id', 'user_id'),)
