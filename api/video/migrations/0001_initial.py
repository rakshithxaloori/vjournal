# Generated by Django 4.2.2 on 2023-06-07 16:15

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Video',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('title', models.CharField(max_length=255)),
                ('file_path', models.URLField()),
                ('duration', models.PositiveIntegerField()),
                ('status', models.CharField(choices=[('E', 'Empty'), ('U', 'Uploading'), ('P', 'Processing'), ('R', 'Ready'), ('F', 'Failed')], default='E', max_length=1)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='videos', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Thumbnail',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('file_path', models.URLField()),
                ('status', models.CharField(choices=[('E', 'Empty'), ('U', 'Uploading'), ('P', 'Processing'), ('R', 'Ready'), ('F', 'Failed')], default='E', max_length=1)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='thumbnails', to=settings.AUTH_USER_MODEL)),
                ('video', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='thumbnail', to='video.video')),
            ],
        ),
        migrations.CreateModel(
            name='Subtitles',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('file_path', models.URLField()),
                ('language_code', models.CharField(max_length=2)),
                ('video', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='subtitles', to='video.video')),
            ],
        ),
    ]
