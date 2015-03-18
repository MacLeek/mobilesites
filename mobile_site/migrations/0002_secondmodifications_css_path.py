# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mobile_site', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='secondmodifications',
            name='css_path',
            field=models.CharField(default=0, max_length=300),
            preserve_default=False,
        ),
    ]
