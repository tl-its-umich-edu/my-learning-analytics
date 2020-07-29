# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from __future__ import unicode_literals

from django.db import models
from django.db.models import Q

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.urls import reverse

from collections import namedtuple
from datetime import datetime, timedelta
import pytz

import logging
logger = logging.getLogger(__name__)

from model_utils import Choices


class AcademicTerms(models.Model):
    id = models.BigIntegerField(primary_key=True, verbose_name="Term Id")
    canvas_id = models.BigIntegerField(verbose_name="Canvas Id")
    name = models.CharField(max_length=255, verbose_name="Name")
    date_start = models.DateTimeField(verbose_name="Start Date and Time", blank=True, null=True)
    date_end = models.DateTimeField(verbose_name="End Date and Time", blank=True, null=True)

    def __str__(self):
        return self.name

    # # Replace the year in the end date with start date (Hack to get around far out years)
    # # This should be replaced in the future via an API call so the terms have correct end years, or Canvas data adjusted
    def get_correct_date_end(self):
        if (self.date_end.year - self.date_start.year) > 1:
            logger.info(f'{self.date_end.year} - {self.date_start.year} greater than 1 so setting end year to match start year.')
            return self.date_end.replace(year=self.date_start.year)
        else:
            return self.date_end

    class Meta:
        db_table = 'academic_terms'
        verbose_name = "Academic Terms"
        verbose_name_plural = "Academic Terms"


class UserDefaultQuerySet(models.QuerySet):
    def get_user_defaults(self, course_id, sis_user_name, default_view_type):
        try:
            return self.get(course_id=course_id,
                            user_sis_name=str(sis_user_name),
                            default_view_type=str(default_view_type)).default_view_value
        except (self.model.DoesNotExist, Exception) as e:
            logger.debug(f"""Couldn't get the default value for default_view_type: {default_view_type}
                in course: {course_id} for user: {sis_user_name}: {e} """)
            return None

    def set_user_default(self, course_id, sis_user_name, default_view_type, default_view_value):
        try:
            return self.update_or_create(course_id=course_id, user_sis_name=sis_user_name, default_view_type=default_view_type,
                                         defaults={'default_view_value': default_view_value})
        except (self.model.DoesNotExist, Exception) as e:
            logger.error(f"""Error when updating or creating default setting in course: {course_id} for user: {sis_user_name}
                             with default_view_type: {default_view_type} and value: {default_view_value} due to {e} """)
            raise e


class UserDefaultManager(models.Manager):
    def get_queryset(self):
        return UserDefaultQuerySet(self.model, using=self._db)

    def get_user_defaults(self, course_id, sis_user_name, default_view_type):
        return self.get_queryset().get_user_defaults(course_id, sis_user_name, default_view_type)

    def set_user_defaults(self, course_id, sis_user_name, default_view_type, default_view_value):
        return self.get_queryset().set_user_default(course_id, sis_user_name, default_view_type, default_view_value)


class UserDefaultSelection(models.Model):
    id = models.AutoField(primary_key=True, verbose_name="Table Id")
    course_id = models.BigIntegerField(blank=True, null=True, verbose_name="Course Id")
    user_sis_name = models.CharField(max_length=255,blank=True, null=True, verbose_name="User Id")
    default_view_type = models.CharField(max_length=255, blank=True, null=True, verbose_name="Default Type")
    default_view_value = models.TextField(blank=True, null=True, verbose_name="Default Value")

    objects = UserDefaultManager()

    class Meta:
        db_table = 'user_default_selection'
        unique_together = (('user_sis_name', 'course_id', 'default_view_type'),)


class Assignment(models.Model):
    id = models.BigIntegerField(primary_key=True, verbose_name="Assignment Id")
    name = models.CharField(max_length=255, verbose_name="Name", default='')
    due_date = models.DateTimeField(blank=True, null=True, verbose_name="Due DateTime")
    local_date = models.DateTimeField(blank=True, null=True, verbose_name="Local DateTime")
    points_possible = models.FloatField(blank=True, null=True, verbose_name="Points Possible")
    course_id = models.BigIntegerField(verbose_name="Course Id")
    assignment_group_id = models.BigIntegerField(verbose_name="Assignment Group Id")

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'assignment'


class AssignmentGroups(models.Model):
    id = models.BigIntegerField(primary_key=True, verbose_name="Assignment Group Id")
    name = models.CharField(max_length=255, verbose_name="Name", default='')
    weight = models.FloatField(blank=True, null=True, verbose_name="Weight")
    group_points = models.FloatField(blank=True, null=True, verbose_name="Group Points")
    course_id = models.BigIntegerField(verbose_name="Course Id")
    drop_lowest = models.IntegerField(blank=True, null=True, verbose_name="Drop Lowest")
    drop_highest = models.IntegerField(blank=True, null=True, verbose_name="Drop Highest")

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'assignment_groups'
        verbose_name = "Assignment Groups"
        verbose_name_plural = "Assignment Groups"


class AssignmentWeightConsideration(models.Model):
    course_id = models.BigIntegerField(primary_key=True, verbose_name="Course Id")
    consider_weight = models.NullBooleanField(blank=True, default=False, verbose_name="Consider Weight")

    class Meta:
        db_table = 'assignment_weight_consideration'


class CourseQuerySet(models.QuerySet):
    def get_supported_courses(self):
        """Returns the list of supported courses from the database

        :return: [List of supported course ids]
        :rtype: [list of str (possibly incremented depending on parameter)]
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
    id = models.BigIntegerField(primary_key=True, verbose_name="Course Id", db_column='id', editable=False)
    canvas_id = models.BigIntegerField(verbose_name="Canvas Course Id", db_column='canvas_id')
    term = models.ForeignKey(AcademicTerms, verbose_name="Term", on_delete=models.SET_NULL, db_column="term_id", null=True, db_constraint=False)
    name = models.CharField(max_length=255, verbose_name="Name")
    date_start = models.DateTimeField(verbose_name="Start Date and Time", null=True, blank=True)
    date_end = models.DateTimeField(verbose_name="End Date and Time", null=True, blank=True)
    show_grade_counts = models.BooleanField(blank=False, null=False, default=False, verbose_name=
                                         "Show Grade Counts")
    GRADING_CHOICES = [('Percent', 'Percent'), ('Point', 'Point'), ]
    show_grade_type = models.CharField(verbose_name="Show Grade Type", max_length=255,
                                         choices=GRADING_CHOICES, default='Percent')

    objects = CourseManager()

    def __str__(self):
        return self.name

    @property
    def course_date_range(self):
        if self.date_start is not None:
            start = self.date_start
        elif self.term is not None and self.term.date_start is not None:
            start = self.term.date_start
        else:
            logger.warning("No date_start value was found for course or term; setting to current date and time")
            start = datetime.now(pytz.UTC)
        if self.date_end is not None:
            end = self.date_end
        elif self.term is not None and self.term.date_end is not None:
            end = self.term.get_correct_date_end()
        else:
            logger.warning("No date_end value was found for course or term; setting to two weeks from now")
            end = start + timedelta(weeks=2)
        DateRange = namedtuple("DateRange", ["start", "end"])
        return DateRange(start, end)

    @property
    def absolute_url(self):
        return reverse('courses', kwargs={'course_id': self.canvas_id})

    def get_absolute_url(self):
        return self.absolute_url

    class Meta:
        db_table = "course"
        verbose_name = "Course"


class CourseViewOption(models.Model):
    course = models.OneToOneField(Course, on_delete=models.CASCADE, primary_key=True, verbose_name="Course View Option Id")
    show_resources_accessed = models.BooleanField(blank=False, null=False, default=True, verbose_name="Show Resources Accessed View")
    show_assignment_planning_v1 = models.BooleanField(blank=False, null=False, default=True, verbose_name="Show Assignment Planning v1 View")
    show_assignment_planning = models.BooleanField(blank=False, null=False, default=True, verbose_name="Show Assignment Planning View")
    show_grade_distribution = models.BooleanField(blank=False, null=False, default=True, verbose_name="Show Grade Distribution View")

    VIEWS = ['show_resources_accessed', 'show_assignment_planning_v1', 'show_assignment_planning', 'show_grade_distribution']

    def __str__(self):
        retval = ""
        if self.show_resources_accessed and 'show_resources_accessed' not in settings.VIEWS_DISABLED: retval += "Resources Accessed\n"
        if self.show_assignment_planning_v1 and 'show_assignment_planning_v1' not in settings.VIEWS_DISABLED: retval += "Assignment Planning v1\n"
        if self.show_assignment_planning and 'show_assignment_planning' not in settings.VIEWS_DISABLED: retval += "Assignment Planning\n"
        if self.show_grade_distribution and 'show_grade_distribution' not in settings.VIEWS_DISABLED: retval += "Grade Distribution\n"
        return retval

    class Meta:
        db_table = 'course_view_option'
        verbose_name = "Course View Option"

    def json(self, include_id=True):
        """Format the json output that we want for this record

        :param include_id: Whether or not to include the id in the return
        This should be of the format canvas_id : {options}
        :return: JSON formatted CourseViewOption
        :rtype: Dict
        """

        try:
            options = {'ra': int(self.show_resources_accessed and 'show_resources_accessed'
                                 not in settings.VIEWS_DISABLED),
                       'apv1': int(self.show_assignment_planning_v1 and 'show_assignment_planning_v1'
                                 not in settings.VIEWS_DISABLED),
                       'ap': int(self.show_assignment_planning and 'show_assignment_planning'
                                 not in settings.VIEWS_DISABLED),
                       'gd': int(self.show_grade_distribution and 'show_grade_distribution'
                                 not in settings.VIEWS_DISABLED),}
            if include_id:
                return {self.course.canvas_id: options}
            else:
                return options
        except ObjectDoesNotExist:
            logger.warning(f"CourseViewOption does not exist in Course table, skipping")
            return ""


class ResourceQuerySet(models.QuerySet):
    def get_course_resource_type(self, course_id):
        """
        Return a list of resources type data collected in the course
        :return:
        """
        try:
            return list(self.values_list('resource_type', flat=True).distinct().filter(course_id=course_id))
        except(self.model.DoesNotExist, Exception) as e:
            logger.error(f"Couldn't fetch Resource list in Course {course_id} due to: {e}")
            return None


class ResourceManager(models.Manager):
    def get_queryset(self):
        return ResourceQuerySet(self.model, using=self._db)

    def get_course_resource_type(self, course_id):
        return self.get_queryset().get_course_resource_type(course_id)


class Resource(models.Model):
    id = models.AutoField(primary_key=True, verbose_name="Table Id")
    resource_type = models.CharField(max_length=255, verbose_name="Resource Type")
    resource_id = models.CharField(unique=True, db_index=True, max_length=255, verbose_name="Resource Id")
    name = models.TextField(verbose_name="Resource Name")

    objects = ResourceManager()

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'resource'

class ResourceAccess(models.Model):
    id = models.AutoField(primary_key=True, verbose_name="Table Id")
    resource_id = models.ForeignKey(Resource, on_delete=models.CASCADE, to_field='resource_id', db_column='resource_id')
    course_id = models.ForeignKey(Course, null=True, default=None, on_delete=models.CASCADE, db_column='course_id')
    user_id = models.BigIntegerField(blank=True, null=False, verbose_name='User Id')
    access_time = models.DateTimeField(verbose_name="Access Time")

    def __str__(self):
        return f"Resource {self.resource_id} accessed by {self.user_id}"

    class Meta:
        db_table = 'resource_access'

class Submission(models.Model):
    id = models.BigIntegerField(primary_key=True, verbose_name="Submission Id")
    assignment_id = models.BigIntegerField(verbose_name="Assignment Id")
    course_id = models.BigIntegerField(verbose_name="Course Id")
    user_id = models.BigIntegerField(verbose_name="User Id")
    score = models.FloatField(blank=True, null=True, verbose_name="Score")
    graded_date = models.DateTimeField(blank=True, null=True, verbose_name="Graded DateTime")
    # This is used for tracking of grade posted date and not used in Assignment view hence making it CharField
    grade_posted_local_date = models.CharField(max_length=255,blank=True, null=True, verbose_name="Posted Grade in local DateTime")
    avg_score = models.FloatField(blank=True, null=True, verbose_name="Average Grade")

    def __str__(self):
        return f"Submission Id {self.id} for assignment id {self.assignment_id} for course id {self.course_id} for user id {self.user_id}"

    class Meta:
        db_table = 'submission'


class UnizinMetadata(models.Model):
    pkey = models.CharField(primary_key=True, max_length=20, verbose_name="Key")
    pvalue = models.CharField(max_length=100, blank=True, null=True, verbose_name="Value")

    class Meta:
        db_table = 'unizin_metadata'


class UserQuerySet(models.query.QuerySet):
    def get_user_in_course(self, user, course):
        return self.get_user_in_course_id(user, course.id)

    def get_user_in_course_id(self, user, course_id):
        return self.filter(
            Q(sis_name=user.get_username()) | Q(sis_id=user.get_username()),
            course_id=course_id
        )

class User(models.Model):
    ENROLLMENT_TYPES = Choices(
        ('StudentEnrollment', 'Student'),
        #('StudentViewEnrollment', 'Student View'),
        ('TaEnrollment', 'Teaching Assistant'),
        ('TeacherEnrollment', 'Instructor'),
        #('DesignerEnrollment', 'Designer'),
        #('ObserverEnrollment', 'Observer'),
    )

    id = models.AutoField(primary_key=True, verbose_name="Table Id")
    user_id = models.BigIntegerField(null=False, blank=False, verbose_name="User Id")
    name = models.CharField(max_length=255, verbose_name="Name")
    sis_id = models.CharField(max_length=255, blank=True, null=True, verbose_name="SIS Id")
    sis_name = models.CharField(max_length=255, blank=True, null=True, verbose_name="SIS Name")
    course_id = models.BigIntegerField(blank=True, null=True, verbose_name="Course Id")
    current_grade = models.FloatField(blank=True, null=True, verbose_name="Current Grade")
    final_grade = models.FloatField(blank=True, null=True, verbose_name="Final Grade")
    enrollment_type = models.CharField(max_length=50, choices=ENROLLMENT_TYPES, blank=True, null=True, verbose_name="Enrollment Type")

    objects = UserQuerySet.as_manager()

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'user'
        unique_together = (('id', 'course_id'),)