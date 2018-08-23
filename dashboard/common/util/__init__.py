from os import getenv

def getenv_bool(var, default='0'):
    return getenv(var, default).lower() in ('yes', 'on', 'true', '1', )
