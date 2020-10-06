from enum import Enum


class KeyFileUtils:
    timestampFormat = '%Y%m%d%H%M%S'
    _keyFileBasePathName: str

    class KeyFileType(Enum):
        JWK = ('public key JWK', '_public-jwk.json')
        PRIVATE = ('private key', '_private.pem')
        PUBLIC = ('public key', '_public.pem')

        def __init__(self, description, fileSuffix):
            self.description = description
            self.fileSuffix = fileSuffix

    def writeKeyFile(self, keyFileType: KeyFileType, keyContent: str):
        keyFileName: str = f'{self.keyFileBasePathName}' \
                           f'{keyFileType.fileSuffix}'
        with open(keyFileName, 'w') as f:
            f.writelines((keyContent, '\n'))
        return (f'Success writing {keyFileType.description} to file '
                f'"{keyFileName}"...')

    @property
    def keyFileBasePathName(self):
        return self._keyFileBasePathName

    @keyFileBasePathName.setter
    def keyFileBasePathName(self, value: str):
        self._keyFileBasePathName = value
