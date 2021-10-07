import json
import os
from datetime import datetime

from django.core.management.base import BaseCommand, CommandParser

from dashboard import lti_new
from dashboard.common.keyfileutils import KeyFileUtils


class Command(BaseCommand):
    help = 'Generate public key JWK as JSON using ' \
           'the currently configured public key.'
    baseNameOption = 'basename'
    dumpOption = 'dump'

    def add_arguments(self, parser: CommandParser):
        group = parser.add_mutually_exclusive_group()
        group.add_argument(
            f'--{self.baseNameOption}',
            default=datetime.now().strftime(KeyFileUtils.timestampFormat),
            type=str,
            required=False,
            help='Base file name of the key file(s) generated. '
                 'Default: timestamp of '
                 f'"{KeyFileUtils.timestampFormat.replace("%", "%%")}"',
            dest=self.baseNameOption)
        group.add_argument(
            f'--{self.dumpOption}',
            action='store_true',
            default=False,
            required=False,
            help='Dump the JWK JSON to stdout instead of writing it to a file',
            dest=self.dumpOption)

    def handle(self, *args, **options: dict):
        jwks = lti_new.generate_jwks()
        jwksJson = json.dumps(jwks['keys'][0])

        if options.get(self.dumpOption) is True:
            self.stdout.write(jwksJson)
        else:
            configDir: str = os.path.dirname(
                os.getenv('ENV_FILE', '/secrets/env.hjson'))
            self.stdout.write('Key files will be written to '
                              f'directory "{configDir}"...')

            keyFileUtils = KeyFileUtils()
            keyFileUtils.keyFileBasePathName = os.path.join(
                configDir, options.get(self.baseNameOption))
            result: str = keyFileUtils.writeKeyFile(
                keyFileUtils.KeyFileType.JWK,
                jwksJson)
            self.stdout.write(result)
