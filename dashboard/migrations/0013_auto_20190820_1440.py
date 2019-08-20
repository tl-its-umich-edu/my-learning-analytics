# -*- coding: utf-8 -*-
# Generated by Django 1.11.23 on 2019-08-20 18:40
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0012_auto_20190820_0850'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='CourseTemp',
            new_name='Course',
        ),
        migrations.RenameModel(
            old_name='CourseViewOptionTemp',
            new_name='CourseViewOption',
        ),
        migrations.AlterModelOptions(
            name='course',
            options={'verbose_name': 'Course'},
        ),
        migrations.AlterModelOptions(
            name='courseviewoption',
            options={'verbose_name': 'Course View Option'},
        ),
        migrations.AlterModelTable(
            name='course',
            table='course',
        ),
        migrations.AlterModelTable(
            name='courseviewoption',
            table='course_view_option',
        ),
    ]
