import json
import os
from datetime import datetime
from enum import Enum

from Crypto.PublicKey import RSA
from Crypto.PublicKey.RSA import RsaKey
from django.core.management.base import BaseCommand, CommandParser
from jwcrypto.jwk import JWK


class Command(BaseCommand):
    baseNameOption = 'basename'
    timestampFormat = '%Y%m%d%H%M%S'
    _keyFileBasePathName: str

    class KeyFileType(Enum):
        JWK = ('JWK', '_public-jwk.json')
        PRIVATE = ('private key', '_private.pem')
        PUBLIC = ('public key', '_public.pem')

        def __init__(self, description, fileSuffix):
            self.description = description
            self.fileSuffix = fileSuffix

    def add_arguments(self, parser: CommandParser):
        parser.add_argument(
            f'--{self.baseNameOption}',
            default=datetime.now().strftime(self.timestampFormat),
            type=str,
            required=False,
            help='Base file name of the key files generated. Default: '
                 f'timestamp of "{self.timestampFormat.replace("%", "%%")}"',
            dest=self.baseNameOption)

    def _writeKeyFile(self, keyFileType: KeyFileType, keyContent: str):
        keyFileName: str = f'{self.keyFileBasePathName}' \
                           f'{keyFileType.fileSuffix}'
        self.stdout.write(
            f'Writing {keyFileType.description} to file '
            f'"{keyFileName}"...')
        with open(keyFileName, 'w') as f:
            f.writelines((keyContent, '\n'))
        self.stdout.write('File successfully written.')

    @property
    def keyFileBasePathName(self):
        return self._keyFileBasePathName

    @keyFileBasePathName.setter
    def keyFileBasePathName(self, value: str):
        self._keyFileBasePathName = value

    def handle(self, *args, **options: dict):
        configDir: str = os.path.dirname(
            os.getenv('ENV_FILE', '/secrets/env.json'))
        self.stdout.write('Key files will be written to '
                          f'directory "{configDir}"...')

        self.keyFileBasePathName = os.path.join(
            configDir, options.get(self.baseNameOption))

        self.stdout.write('Generating key...')
        key: RsaKey = RSA.generate(4096)

        self.stdout.write('Preparing private and public key strings...')
        privateKey: bytes = key.exportKey()
        publicKey: bytes = key.publickey().exportKey()

        jwk_obj: JWK = JWK.from_pem(publicKey)
        public_jwk: dict = {
            **json.loads(jwk_obj.export_public()),
            **{'alg': 'RS256', 'use': 'sig'}
        }

        self._writeKeyFile(self.KeyFileType.PRIVATE,
                           privateKey.decode('utf-8'))

        self._writeKeyFile(self.KeyFileType.PUBLIC,
                           publicKey.decode('utf-8'))

        self._writeKeyFile(self.KeyFileType.JWK,
                           json.dumps(public_jwk))
