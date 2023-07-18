# Generated by Django 4.2.2 on 2023-07-17 14:11

from django.db import migrations, models
import share.models


class Migration(migrations.Migration):

    dependencies = [
        ('share', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='share',
            name='code',
            field=models.CharField(default=share.models.generate_random_string, max_length=11),
        ),
    ]