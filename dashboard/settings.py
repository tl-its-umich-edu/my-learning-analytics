"""
Django settings for dashboard project.

Generated by 'django-admin startproject' using Django 1.9.4.

For more information on this file, see
https://docs.djangoproject.com/en/1.9/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.9/ref/settings/
"""

import os
import json

from decouple import config, Csv

from debug_toolbar import settings as dt_settings

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

APPLICATION_DIR = os.path.dirname(globals()['__file__'])

PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), ".."),
)

LOGOUT_URL = '/accounts/logout'

# Google Analytics ID
GA_ID = config('GA_ID', default='')

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.9/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('DJANGO_SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DJANGO_DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config("ALLOWED_HOSTS",default="127.0.0.1,localhost", cast=Csv())

WATCHMAN_TOKEN = config('DJANGO_WATCHMAN_TOKEN', default=None)

WATCHMAN_TOKEN_NAME = config('DJANGO_WATCHMAN_TOKEN_NAME', default='token')

# Only report on the default database
WATCHMAN_DATABASES = ('default',)

# Application definition

INSTALLED_APPS = [
    'django_su',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'whitenoise.runserver_nostatic',
    'django.contrib.staticfiles',
    'dashboard',
    'django_cron',
    'watchman',
    'macros',
    'debug_toolbar',
    'pinax.eventlog',
]

# The order of this is important. It says DebugToolbar should be on top but
# The tips has it on the bottom
MIDDLEWARE_CLASSES = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'debug_toolbar.middleware.DebugToolbarMiddleware',
]

CRON_CLASSES = [
    "dashboard.cron.DashboardCronJob",
]

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(APPLICATION_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'debug': config('DJANGO_TEMPLATE_DEBUG', default=DEBUG, cast=bool),
            'context_processors': [
                'django.contrib.auth.context_processors.auth',
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.messages.context_processors.messages',
                'django_su.context_processors.is_su',
                'django_settings_export.settings_export',
                'dashboard.context_processors.course_name',
                'dashboard.context_processors.current_user_course_id',
                'dashboard.context_processors.course_view_option',
                'dashboard.context_processors.last_updated',
                'dashboard.context_processors.get_build_info',
            ],
        },
    },
]

ROOT_URLCONF = 'dashboard.urls'

WSGI_APPLICATION = 'dashboard.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.9/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': config('MYSQL_ENGINE', default='django.db.backends.mysql'),
        'NAME': config('MYSQL_DATABASE', default='student_dashboard'),  # your mysql database name
        'USER': config('MYSQL_USER', default='student_dashboard_user'), # your mysql user for the database
        'PASSWORD': config('MYSQL_PASSWORD', default='student_dashboard_password'), # password for user
        'HOST': config('MYSQL_HOST', default='localhost'),
        'PORT': config('MYSQL_PORT', default=3306, cast=int),
    },
    'DATA_WAREHOUSE': {
        'ENGINE': config('DATA_WAREHOUSE_ENGINE', default='django.db.backends.postgresql'),
        'NAME': config('DATA_WAREHOUSE_DATABASE', default=''),
        'USER': config('DATA_WAREHOUSE_USER', default=''),
        'PASSWORD': config('DATA_WAREHOUSE_PASSWORD', default=''),
        'HOST': config('DATA_WAREHOUSE_HOST', default=''),
        'PORT': config('DATA_WAREHOUSE_PORT', default=5432, cast=int),
    }
}

# Internationalization
# https://docs.djangoproject.com/en/1.9/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = config("TIME_ZONE", default=config("TZ", "America/Detroit"))

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.9/howto/static-files/

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/var/www/example.com/static/"
STATIC_ROOT = os.path.join(PROJECT_ROOT, 'static')

# URL prefix for static files.
# Example: "http://example.com/static/", "http://static.example.com/"
STATIC_URL = '/static/'

YARN_ROOT_PATH = BASE_DIR

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'yarn.finders.YarnFinder',
    # 'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    # Gunicorns logging format https://github.com/benoitc/gunicorn/blob/19.x/gunicorn/glogging.py
    'formatters': {
        "generic": {
            "format": "%(asctime)s [%(process)d] [%(levelname)s] %(message)s",
            "datefmt": "[%Y-%m-%d %H:%M:%S %z]",
            "class": "logging.Formatter",
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'generic',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'propagate': False,
            'level': config('DJANGO_LOG_LEVEL', default='INFO'),
        },
        '': {
            'level': 'WARNING',
            'handlers': ['console'],
        },

    },
    'root': {
        'level': config('ROOT_LOG_LEVEL', default='INFO'),
        'handlers': ['console']
    },
}


# IMPORT LOCAL SETTINGS
# =====================
try:
    from settings_local import *
except ImportError:
    pass

AUTHENTICATION_BACKENDS = ('django_su.backends.SuBackend',)

#Shib

# Give an opportunity to disable SAML
if config('STUDENT_DASHBOARD_SAML', default='True', cast=bool):
    import saml2

    SAML2_URL_PATH = '/accounts/'
    # modify to use port request comes
    SAML2_URL_BASE = config('DJANGO_SAML2_URL_BASE', default='/accounts/')
    SAML2_DEFAULT_IDP = config('DJANGO_SAML2_DEFAULT_IDP', default='')
    # Append the query parameter for idp to the default if it's set, otherwise do nothing
    if SAML2_DEFAULT_IDP:
        SAML2_DEFAULT_IDP = '?idp=%s' % SAML2_DEFAULT_IDP

    INSTALLED_APPS += ('djangosaml2',)
    AUTHENTICATION_BACKENDS += (
        'djangosaml2.backends.Saml2Backend',
    )
    LOGIN_URL = '%slogin/%s' % (SAML2_URL_PATH, SAML2_DEFAULT_IDP)
    SESSION_EXPIRE_AT_BROWSER_CLOSE = True

    BASEDIR = os.path.dirname(os.path.abspath(__file__))
    SAML2_FILES_BASE = config('SAML2_FILES_BASE', default='/saml/')
    SAML2_REMOTE_METADATA = config('SAML2_REMOTE_METADATA', default='')
    SAML2_REMOTE_PEM_FILE = config('SAML2_REMOTE_PEM_FILE', default='')

    SAML_CONFIG = {
        'xmlsec_binary': '/usr/bin/xmlsec1',
        'entityid': '%smetadata/' % SAML2_URL_BASE,

        # directory with attribute mapping
        # 'attribute_map_dir': path.join(BASEDIR, 'attribute-maps'),
        'name': 'Student Dashboard',
        # this block states what services we provide
        'service': {
            # we are just a lonely SP
            'sp': {
                'name': 'Student Dashboard',
                'name_id_format': ('urn:oasis:names:tc:SAML:2.0:'
                                   'nameid-format:transient'),
                'authn_requests_signed': 'true',
                'allow_unsolicited': True,
                'endpoints': {
                    # url and binding to the assetion consumer service view
                    # do not change the binding or service name
                    'assertion_consumer_service': [
                        ('%sacs/' % SAML2_URL_BASE, saml2.BINDING_HTTP_POST),
                    ],
                    # url and binding to the single logout service view+

                    # do not change the binding or service name
                    'single_logout_service': [
                        ('%sls/' % SAML2_URL_BASE, saml2.BINDING_HTTP_REDIRECT),
                        ('%sls/post' % SAML2_URL_BASE, saml2.BINDING_HTTP_POST),
                    ],
                },

                # attributes that this project need to identify a user
                'required_attributes': ['uid'],

                # attributes that may be useful to have but not required
                'optional_attributes': ['eduPersonAffiliation'],
            },
        },

        # where the remote metadata is stored
        'metadata': [{
            "class": "saml2.mdstore.MetaDataExtern",
            "metadata": [
                (SAML2_REMOTE_METADATA, SAML2_REMOTE_PEM_FILE)]
            }
        ],

        # set to 1 to output debugging information
        'debug': DEBUG,

        # certificate
        'key_file': os.path.join(SAML2_FILES_BASE, 'student-dashboard-saml.key'),  'cert_file': os.path.join(SAML2_FILES_BASE, 'student-dashboard-saml.pem'),
    }

    ACS_DEFAULT_REDIRECT_URL = config('DJANGO_ACS_DEFAULT_REDIRECT', default='/')
    LOGIN_REDIRECT_URL = config('DJANGO_LOGIN_REDIRECT_URL', default='/')

    LOGOUT_REDIRECT_URL = config('DJANGO_LOGOUT_REDIRECT_URL',default='/')

    SAML_CREATE_UNKNOWN_USER = True

    SAML_ATTRIBUTE_MAPPING = {
        'uid': ('username', ),
        'mail': ('email', ),
        'givenName': ('first_name', ),
        'sn': ('last_name', ),
    }
else:
    AUTHENTICATION_BACKENDS += ('django.contrib.auth.backends.ModelBackend',)
    LOGIN_REDIRECT_URL = '/'

# Give an opportunity to disable LTI
if config('STUDENT_DASHBOARD_LTI', default='False', cast=bool):
    INSTALLED_APPS += ('django_lti_auth',)

    PYLTI_CONFIG = {
        "consumers": json.loads(config("PYLTI_CONFIG_CONSUMERS", default="{}", cast=str)),
        "method_hooks":{
            "valid_lti_request": "dashboard.lti.valid_lti_request",
            #"invalid_lti_request": "dashboard.lti.invalid_lti_request"
        },
        "next_url": "home"
    }
    LTI_PERSON_SOURCED_ID_FIELD = config('LTI_PERSON_SOURCED_ID_FIELD',
        default="lis_person_sourcedid", cast=str)
    LTI_EMAIL_FIELD = config('LTI_EMAIL_FIELD',
        default="lis_person_contact_email_primary", cast=str)
    LTI_CANVAS_COURSE_ID_FIELD = config('LTI_CANVAS_COURSE_ID_FIELD',
        default="custom_canvas_course_id", cast=str)

# controls whether Unizin specific features/data is available from the Canvas Data source
DATA_WAREHOUSE_IS_UNIZIN = config("DATA_WAREHOUSE_IS_UNIZIN", default=True, cast=bool)

# This is fixed from DATA_WAREHOUSE
DATA_WAREHOUSE_ID_PREFIX = config("DATA_WAREHOUSE_ID_PREFIX", default="17700000000", cast=str)

# This is fixed from DATA_WAREHOUSE
DATA_WAREHOUSE_FILE_ID_PREFIX = config("DATA_WAREHOUSE_FILE_ID_PREFIX", default="1770000000")

# Allow enabling/disabling the View options globally
VIEWS_DISABLED = config('VIEWS_DISABLED', default='', cast=Csv())

# This is to set a date so that MyLA will track all terms with start date after this date.

EARLIEST_TERM_DATE = config('EARLIEST_TERM_DATE', default='2016-11-15')

# Time to run cron
RUN_AT_TIMES = config('RUN_AT_TIMES', default="", cast= Csv())

# Add any settings you need to be available to templates in this array
SETTINGS_EXPORT = ['LOGIN_URL','LOGOUT_URL','DEBUG', 'GA_ID', 'DATA_WAREHOUSE_ID_PREFIX']

# Method to show the user, if they're authenticated and superuser
def show_debug_toolbar(request):
    return DEBUG and request.user and request.user.is_authenticated and request.user.is_superuser

DEBUG_TOOLBAR_PANELS = dt_settings.PANELS_DEFAULTS

DEBUG_TOOLBAR_CONFIG = {
    "SHOW_TOOLBAR_CALLBACK" : show_debug_toolbar,
}

# Number of weeks max to allow by default. some begin/end dates in Canvas aren't correct
MAX_DEFAULT_WEEKS = config("MAX_DEFAULT_WEEKS", default=16, cast=int)

CLIENT_CACHE_TIME = config("CLIENT_CACHE_TIME", default=3600, cast=int)

CRON_BQ_IN_LIMIT = config("CRON_BQ_IN_LIMIT", default=20, cast=int)