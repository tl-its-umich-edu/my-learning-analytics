from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
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
        password = ''.join(random.sample(string.ascii_letters, 8)) if password is None else password
        email = options.get('email')
        superuser = options.get('superuser')

        try:
            user_obj = User.objects.get(username=username)
            user_obj.set_password(password)
            user_obj.save()
        except User.DoesNotExist:
            if superuser:
                print ("Creating superuser")
                User.objects.create_superuser(username=username, email=email, password=password)
            else:
                print ("Creating regular user")
                User.objects.create_user(username=username, email=email, password=password)

        print ("No password specified on command line, setting password for user {} to {}".format(username, password))
