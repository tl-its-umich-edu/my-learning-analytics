# Generated by Django 3.2.6 on 2021-09-03 15:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0020_submission_submitted_at'),
    ]

    operations = [
        migrations.AlterField(
            model_name='assignmentweightconsideration',
            name='consider_weight',
            field=models.BooleanField(blank=True, default=False, null=True, verbose_name='Consider Weight'),
        ),
    ]
