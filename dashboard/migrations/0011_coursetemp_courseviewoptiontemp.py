# -*- coding: utf-8 -*-
# Generated by Django 1.11.23 on 2019-08-19 21:21
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0010_auto_20190812_0924'),
    ]

    operations = [
        migrations.CreateModel(
            name='CourseTemp',
            fields=[
                ('id', models.AutoField(db_column='id', primary_key=True, serialize=False, verbose_name='Course Id')),
                ('canvas_id', models.BigIntegerField(db_column='canvas_id', verbose_name='Canvas Course Id')),
                ('warehouse_id', models.BigIntegerField(db_column='warehouse_id', editable=False, verbose_name='Warehouse Course Id')),
                ('name', models.CharField(max_length=255, verbose_name='Name')),
                ('date_start', models.DateTimeField(blank=True, null=True, verbose_name='Start Date and Time')),
                ('date_end', models.DateTimeField(blank=True, null=True, verbose_name='End Date and Time')),
                ('term', models.ForeignKey(db_column='term_id', db_constraint=False, null=True, on_delete=django.db.models.deletion.SET_NULL, to='dashboard.AcademicTerms', verbose_name='Term')),
            ],
            options={
                'verbose_name': 'CourseTemp',
                'db_table': 'course_temp',
            },
        ),
        migrations.CreateModel(
            name='CourseViewOptionTemp',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False, verbose_name='Course View Option Id')),
                ('show_resources_accessed', models.BooleanField(default=True, verbose_name='Show Resources Accessed View')),
                ('show_assignment_planning', models.BooleanField(default=True, verbose_name='Show Assignment Planning View')),
                ('show_grade_distribution', models.BooleanField(default=True, verbose_name='Show Grade Distribution View')),
                ('course', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='dashboard.CourseTemp', verbose_name='Course Id')),
            ],
            options={
                'verbose_name': 'Course View Option Temp',
                'db_table': 'course_view_option_temp',
            },
        ),
    ]
