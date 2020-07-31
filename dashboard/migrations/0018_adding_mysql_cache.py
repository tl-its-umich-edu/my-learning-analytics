from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('dashboard', '0016_utf8_conversion'),
    ]

    operations = [
        migrations.RunSQL(
            """
            CREATE TABLE `django_myla_cache` (
                cache_key varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
                                       NOT NULL PRIMARY KEY,
                value longblob NOT NULL,
                value_type char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
                                   NOT NULL DEFAULT 'p',
                expires BIGINT UNSIGNED NOT NULL
            );
            """,
            "DROP TABLE `django_myla_cache`"
        ),
    ]
