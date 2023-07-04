from datetime import timedelta
from celery.schedules import crontab

from django.conf import settings
from django.utils import timezone
from django.core.files.storage import default_storage


from vjournal.celery import app as celery_app
from video.utils import s3_client
from video.models import Video, Thumbnail


def is_object_exists(bucket, path):
    try:
        s3_client.head_object(
            Bucket=bucket,
            Key=path,
        )
        return True
    except (s3_client.exceptions.NoSuchKey, Exception):
        return False


@celery_app.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour="*/3"),
        check_video_uploaded_task.s(),
        name="check video uploaded every 1 minute",
    )


@celery_app.task
def del_objects_from_s3_task(file_path):
    for bucket in [
        settings.AWS_INPUT_BUCKET_NAME,
        settings.AWS_OUTPUT_BUCKET_NAME,
        settings.AWS_CDN_BUCKET_NAME,
    ]:
        if is_object_exists(bucket, file_path):
            s3_client.delete_object(
                Bucket=bucket,
                Key=file_path,
            )


@celery_app.task
def create_thumbnail_instance_task(video_id, file_path):
    try:
        video = Video.objects.get(id=video_id)
        user = video.user
        if is_object_exists(settings.AWS_CDN_BUCKET_NAME, file_path):
            Thumbnail.objects.create(user=user, video=video, file_path=file_path)
    except Video.DoesNotExist:
        pass


@celery_app.task
def check_video_uploaded_task():
    # Videos older than 4 hours
    videos = Video.objects.filter(
        created_at__lte=timezone.now() - timedelta(hours=4), status=Video.EMPTY
    )
    for video in videos:
        if not is_object_exists(settings.AWS_INPUT_BUCKET_NAME, video.file_path):
            video.delete()
