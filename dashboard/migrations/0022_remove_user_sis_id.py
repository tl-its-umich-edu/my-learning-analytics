# Generated by Django 3.2.12 on 2022-04-07 19:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0021_alter_assignmentweightconsideration_consider_weight'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='sis_id',
        ),
    ]
