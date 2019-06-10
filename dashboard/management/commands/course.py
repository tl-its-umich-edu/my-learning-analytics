from django.core.management.base import BaseCommand
from dashboard.models import Course, CourseViewOption, AcademicTerms
from dashboard.common.db_util import canvas_id_to_incremented_id

class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--course_id', dest='course_id', type=int, required=True)
        parser.add_argument('--term_id', dest='term_id', type=int, required=True)
        parser.add_argument('--name', dest='name', type=str, required=True)

    def handle(self, *args, **options):
        course_id = options.get('course_id')
        term_id = options.get('term_id')
        name = options.get('name')

        prefixed_course_id = canvas_id_to_incremented_id(course_id)
        prefixed_term_id = canvas_id_to_incremented_id(term_id)

        try:
            term_obj = AcademicTerms.objects.get(id=prefixed_term_id)
        except AcademicTerms.DoesNotExist:
            self.stdout.write (f"Error: Term {term_id} does not exists.")
            return

        is_new = False
        try:
            course_obj = Course.objects.get(id=prefixed_course_id)
            self.stdout.write (f"Updating course {course_id}")
        except Course.DoesNotExist:
            course_obj = Course(id=prefixed_course_id)
            self.stdout.write (f"Creating course {course_id}")
            is_new = True

        course_obj.canvas_id = course_id
        course_obj.name = name
        course_obj.term_id = term_obj
        course_obj.save()

        if is_new:
            self.stdout.write ("Creating course view options")
            course_view_obj = CourseViewOption(
                course_id=prefixed_course_id,
                show_files_accessed=True,
                show_assignment_planning=True,
                show_grade_distribution=True
            )
            course_view_obj.save()