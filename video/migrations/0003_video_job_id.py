# Generated by Django 4.2.2 on 2023-06-08 07:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0002_alter_video_duration'),
    ]

    operations = [
        migrations.AddField(
            model_name='video',
            name='job_id',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
