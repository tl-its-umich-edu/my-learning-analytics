from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from django.conf import settings


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--domain', dest='domain', type=str, required=True)
        parser.add_argument('--name', dest='name', type=str, required=True)
        # Adding a "--new" flag will create a new site record; the site's domain must be unique.
        # Omitting the flag will update the default record specified in settings.py with the provided values.
        parser.add_argument('--new', dest='new', action='store_true', required=False)

    def handle(self, *args, **options):
        domain = options.get('domain')
        name = options.get('name')
        new = options.get('new')

        if new:
            new_site = Site.objects.create(domain=domain, name=name)
            new_site.save()
        else:
            site_id = settings.SITE_ID
            default_site = Site.objects.get(id=site_id)
            default_site.domain = domain
            default_site.name = name
            default_site.save()