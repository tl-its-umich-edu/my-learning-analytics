"""
    These were manually generated migrations to get a new primary key field
    into resources.

    First:id was altered to add an index and drop the primary key
    Second: id is renamed to resource_id
    Third: a new id AutoField is added as the primary key

"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0014_auto_20200116_1408'),
    ]

    operations = [
       migrations.AlterField(
            model_name='resource',
            name='id',
            field=models.CharField(db_index=True, blank=True, max_length=255, primary_key=False, verbose_name='Resource Id')
       ),
       migrations.RenameField(
            model_name='resource',
            old_name='id',
            new_name='resource_id',
       ),
       migrations.AddField(
            model_name='resource',
            name='id',
            field=models.AutoField(primary_key=True, serialize=False, verbose_name='Table Id'),
       ),
    ]
