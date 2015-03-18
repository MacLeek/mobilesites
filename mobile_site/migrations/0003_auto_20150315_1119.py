# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mobile_site', '0002_secondmodifications_css_path'),
    ]

    operations = [
        migrations.AlterField(
            model_name='secondmodifications',
            name='js',
            field=models.TextField(null=True),
            preserve_default=True,
        ),
    ]
