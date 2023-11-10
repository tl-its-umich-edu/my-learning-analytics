from django.core.management.base import BaseCommand
from dashboard.models import AcademicTerms
from dashboard.common.db_util import canvas_id_to_incremented_id
from datetime import datetime
from zoneinfo import ZoneInfo 

class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--term_id', dest='term_id', type=int, required=True)
        parser.add_argument('--name', dest='name', type=str, required=True)
        parser.add_argument('--date_start', dest='date_start', type=str, required=True)
        parser.add_argument('--date_end', dest='date_end', type=str, required=True)

    def handle(self, *args, **options):
        term_id = options.get('term_id')
        name = options.get('name')
        date_start = datetime.strptime(options.get('date_start'), '%Y-%m-%d %H:%M:%S').replace(tzinfo=ZoneInfo('UTC'))
        date_end = datetime.strptime(options.get('date_end'), '%Y-%m-%d %H:%M:%S').replace(tzinfo=ZoneInfo('UTC'))

        prefixed_term_id = canvas_id_to_incremented_id(term_id)

        try:
            term_obj = AcademicTerms.objects.get(id=prefixed_term_id)
            self.stdout.write (f"Updating term {term_id}")
        except AcademicTerms.DoesNotExist:
            term_obj = AcademicTerms(id=prefixed_term_id)
            self.stdout.write (f"Creating term {term_id}")

        term_obj.canvas_id = term_id
        term_obj.name = name
        term_obj.date_start = date_start
        term_obj.date_end = date_end
        term_obj.save()

