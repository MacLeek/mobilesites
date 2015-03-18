# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='IndexModifications',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('js', models.TextField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='NavBlock',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('url', models.CharField(max_length=250)),
                ('name', models.CharField(max_length=50)),
                ('father_id', models.IntegerField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='SecondModifications',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('js', models.TextField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Site',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=100)),
                ('domain_name', models.CharField(unique=True, max_length=50)),
                ('is_active', models.BooleanField(default=False)),
                ('index', models.ForeignKey(to='mobile_site.IndexModifications', null=True)),
                ('nav_first', models.ManyToManyField(to='mobile_site.NavBlock')),
                ('second', models.ForeignKey(to='mobile_site.SecondModifications', null=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
