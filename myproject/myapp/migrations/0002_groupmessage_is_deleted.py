# Generated by Django 5.1.5 on 2025-03-27 06:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='groupmessage',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
    ]
