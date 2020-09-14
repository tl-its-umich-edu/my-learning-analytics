import json
import os
from datetime import datetime

from Crypto.PublicKey import RSA
from django.core.management.base import BaseCommand, CommandParser
from jwcrypto.jwk import JWK


class Command(BaseCommand):
    privateKeyFileSuffix = '_private.pem'
    publicKeyFileSuffix = '_public.pem'
    jwkFileSuffix = '_public-jwk.json'
    baseNameOption = 'basename'
    timestampFormat = '%Y%m%d%H%M%S'

    def add_arguments(self, parser: CommandParser):
        parser.add_argument(
            f'--{self.baseNameOption}',
            default=datetime.now().strftime(self.timestampFormat),
            type=str,
            required=False,
            help='Base file name of the key files generated. Default: '
                 f'timestamp of "{self.timestampFormat.replace("%", "%%")}"',
            dest=self.baseNameOption)

    def handle(self, *args, **options: dict):
        configDir = os.path.dirname(os.getenv('ENV_FILE', '/secrets/env.json'))
        self.stdout.write('Key files will be written to '
                          f'directory "{configDir}"...')

        keyFileBasePathName = os.path.join(
            configDir, options.get(self.baseNameOption))

        self.stdout.write('Generating key...')
        key = RSA.generate(4096)

        self.stdout.write('Preparing private and public key strings...')
        privateKey = key.exportKey()
        publicKey = key.publickey().exportKey()

        privateKeyFileName = f'{keyFileBasePathName}{self.privateKeyFileSuffix}'
        self.stdout.write(
            f'Writing private key to file "{privateKeyFileName}"...')
        with open(privateKeyFileName, 'w') as f:
            f.writelines((privateKey.decode('utf-8'), '\n'))

        publicKeyFileName = f'{keyFileBasePathName}{self.publicKeyFileSuffix}'
        self.stdout.write(
            f'Writing public key to file "{publicKeyFileName}"...')
        with open(publicKeyFileName, 'w') as f:
            f.writelines((publicKey.decode('utf-8'), '\n'))

        jwk_obj = JWK.from_pem(publicKey)
        public_jwk = {
            **json.loads(jwk_obj.export_public()),
            **{'alg': 'RS256', 'use': 'sig'}
        }

        jwkFileName = f'{keyFileBasePathName}{self.jwkFileSuffix}'
        self.stdout.write(
            f'Writing JWK to file "{jwkFileName}"...')
        with open(jwkFileName, 'w') as f:
            f.writelines((json.dumps(public_jwk), '\n'))
