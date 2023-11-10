from django.core.management.base import BaseCommand
from dashboard.models import Course, CourseViewOption, AcademicTerms
from dashboard.common.db_util import canvas_id_to_incremented_id
from datetime import datetime
from zoneinfo import ZoneInfo 

class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--course_id', dest='course_id', type=int, required=True)
        parser.add_argument('--term_id', dest='term_id', type=int, required=False)
        parser.add_argument('--name', dest='name', type=str, required=True)
        parser.add_argument('--date_start', dest='date_start', type=str, required=False)
        parser.add_argument('--date_end', dest='date_end', type=str, required=False)

    def handle(self, *args, **options):
        course_id = options.get('course_id')
        term_id = options.get('term_id')
        name = options.get('name')
        date_start = options.get('date_start')
        if date_start is not None:
            date_start = datetime.strptime(date_start, '%Y-%m-%d %H:%M:%S').replace(tzinfo=ZoneInfo('UTC'))
        date_end = options.get('date_end')
        if date_end is not None:
            date_end = datetime.strptime(date_end, '%Y-%m-%d %H:%M:%S').replace(tzinfo=ZoneInfo('UTC'))

        prefixed_course_id = canvas_id_to_incremented_id(course_id)
        if term_id is not None:
            prefixed_term_id = canvas_id_to_incremented_id(term_id)
            try:
                term_obj = AcademicTerms.objects.get(id=prefixed_term_id)
            except AcademicTerms.DoesNotExist:
                self.stdout.write (f"Error: Term {term_id} does not exists.")
                return
        else:
            term_obj = None

        is_new = False
        try:
            course_obj = Course.objects.get(id=prefixed_course_id)
            self.stdout.write (f"Updating course {course_id}")
        except Course.DoesNotExist:
            course_obj = Course(id=prefixed_course_id)
            self.stdout.write (f"Creating course {course_id}")
            is_new = True

        course_obj.canvas_id = course_id
        course_obj.term = term_obj
        course_obj.name = name
        course_obj.date_start = date_start
        course_obj.date_end = date_end
        course_obj.save()

        if is_new:
            self.stdout.write ("Creating course view options")
            course_view_obj = CourseViewOption(
                course_id=prefixed_course_id,
                show_resources_accessed=True,
                show_assignment_planning=True,
                show_grade_distribution=True
            )
            course_view_obj.save()