# Generated by Django 4.2.2 on 2023-06-07 16:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='video',
            name='duration',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
    ]