import json
import os
import shutil

from Crypto.PublicKey import RSA
from django.core.management.base import BaseCommand
from jwcrypto.jwk import JWK
from jwt.utils import merge_dict


class Command(BaseCommand):
    private_key_suffix = '-private.pem'
    public_key_suffix = '-public.pem'
    jwk_suffix = '-public-jwk.json'

    def handle(self, *args, **options):
        config_dir = os.path.dirname(os.getenv('ENV_FILE', '/secrets/env.json'))
        self.stdout.write(f'Key files written to directory "{config_dir}"...')

        self.stdout.write('Generating key...')
        key = RSA.generate(4096)

        self.stdout.write('Preparing private and public key strings...')
        private_key = key.exportKey()
        public_key = key.publickey().exportKey()

        self.stdout.write(
            f'Writing private key to file "{self.private_key_suffix}"...')
        with open(self.private_key_suffix, 'w') as f:
            f.writelines((private_key.decode('utf-8'), '\n'))

        self.stdout.write(
            f'Writing public key to file "{self.public_key_suffix}"...')
        with open(self.public_key_suffix, 'w') as f:
            f.writelines((public_key.decode('utf-8'), '\n'))

        jwk_obj = JWK.from_pem(public_key)
        public_jwk = {
            **json.loads(jwk_obj.export_public()),
            **{'alg': 'RS256', 'use': 'sig'}
        }

        self.stdout.write(
            f'Writing JWK to file "{self.jwk_suffix}"...')
        with open(self.jwk_suffix, 'w') as f:
            f.writelines((json.dumps(public_jwk), '\n'))
