from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('dashboard', '0015_auto_20200116_1408'),
    ]

    operations = [
        migrations.RunSQL(
            """
            CREATE TABLE `django_myla_cache` (
                cache_key varchar(255) CHARACTER SET utf8 COLLATE utf8_bin
                                       NOT NULL PRIMARY KEY,
                value longblob NOT NULL,
                value_type char(1) CHARACTER SET latin1 COLLATE latin1_bin
                                   NOT NULL DEFAULT 'p',
                expires BIGINT UNSIGNED NOT NULL
            );
            """,
            "DROP TABLE `django_myla_cache`"
        ),
    ]