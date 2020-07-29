from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.conf import settings
import random, string


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--username', dest='username', type=str, required=True)
        parser.add_argument('--email', dest='email', type=str, required=True)
        parser.add_argument('--password', dest='password', type=str, required=False)
        parser.add_argument('--superuser', dest='superuser', action='store_true', required=False)

    def handle(self, *args, **options):
        username = options.get('username')
        password = options.get('password')
        if password is None:
            password = ''.join(random.sample(string.ascii_letters, settings.RANDOM_PASSWORD_DEFAULT_LENGTH))
            self.stderr.write ("Password not specified on command line generated password {}".format(password))

        email = options.get('email')
        superuser = options.get('superuser')

        try:
            user_obj = User.objects.get(username=username)
            user_obj.set_password(password)
            user_obj.save()
        except User.DoesNotExist:
            if superuser:
                self.stdout.write ("Creating superuser {}".format(username))
                User.objects.create_superuser(username=username, email=email, password=password)
            else:
                self.stdout.write ("Creating regular user {}".format(username))
                User.objects.create_user(username=username, email=email, password=password)

