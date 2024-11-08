# Generated by Django 4.2.2 on 2023-06-26 14:20

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Email',
            fields=[
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('to', models.EmailField(max_length=254)),
                ('subject', models.CharField(max_length=255)),
                ('html_message', models.TextField()),
                ('plain_message', models.TextField()),
                ('sender', models.EmailField(max_length=254)),
                ('message_id', models.CharField(blank=True, max_length=255, null=True)),
                ('status', models.CharField(choices=[('q', 'Queued'), ('s', 'Sent'), ('d', 'Delivered'), ('dd', 'Delivery Delayed'), ('c', 'Complained'), ('b', 'Bounced'), ('o', 'Opened'), ('cl', 'Clicked')], default='q', max_length=2)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='emails', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'Emails',
                'ordering': ['-created_at'],
            },
        ),
    ]
