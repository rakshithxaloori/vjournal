# Generated by Django 4.2.2 on 2023-06-09 09:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0004_video_input_height_video_input_width'),
    ]

    operations = [
        migrations.RenameField(
            model_name='video',
            old_name='duration',
            new_name='duration_in_ms',
        ),
    ]
