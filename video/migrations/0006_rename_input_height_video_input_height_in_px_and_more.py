# Generated by Django 4.2.2 on 2023-06-09 09:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0005_rename_duration_video_duration_in_ms'),
    ]

    operations = [
        migrations.RenameField(
            model_name='video',
            old_name='input_height',
            new_name='input_height_in_px',
        ),
        migrations.RenameField(
            model_name='video',
            old_name='input_width',
            new_name='input_width_in_px',
        ),
    ]
