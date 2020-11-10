import os
from datetime import datetime

from Crypto.PublicKey import RSA
from Crypto.PublicKey.RSA import RsaKey
from django.core.management.base import BaseCommand, CommandParser

from dashboard.common.keyfileutils import KeyFileUtils


class Command(BaseCommand):
    help = 'Generate a private/public key pair and write them to PEM files.'
    baseNameOption = 'basename'

    def add_arguments(self, parser: CommandParser):
        parser.add_argument(
            f'--{self.baseNameOption}',
            default=datetime.now().strftime(KeyFileUtils.timestampFormat),
            type=str,
            required=False,
            help='Base file name of the key file(s) generated. '
                 'Default: timestamp of '
                 f'"{KeyFileUtils.timestampFormat.replace("%", "%%")}"',
            dest=self.baseNameOption)

    def handle(self, *args, **options: dict):
        configDir: str = os.path.dirname(
            os.getenv('ENV_FILE', '/secrets/env.json'))
        self.stdout.write('Key files will be written to '
                          f'directory "{configDir}"...')

        keyFileUtils = KeyFileUtils()
        keyFileUtils.keyFileBasePathName = os.path.join(
            configDir, options.get(self.baseNameOption))

        self.stdout.write('Generating key...')
        key: RsaKey = RSA.generate(4096)

        self.stdout.write('Preparing private and public key strings...')
        privateKey: bytes = key.exportKey()
        publicKey: bytes = key.publickey().exportKey()

        result: str

        result = keyFileUtils.writeKeyFile(
            keyFileUtils.KeyFileType.PRIVATE,
            privateKey.decode('utf-8'))
        self.stdout.write(result)

        result = keyFileUtils.writeKeyFile(
            keyFileUtils.KeyFileType.PUBLIC,
            publicKey.decode('utf-8'))
        self.stdout.write(result)
