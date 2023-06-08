from django.conf import settings


from vjournal.celery import app as celery_app
from video.utils import s3_client


def is_object_exists(bucket, path):
    try:
        s3_client.head_object(
            Bucket=bucket,
            Key=path,
        )
        return True
    except (s3_client.exceptions.NoSuchKey, Exception):
        return False


@celery_app.task
def del_objects_from_s3_task(file_path):
    for bucket in [settings.AWS_INPUT_BUCKET_NAME, settings.AWS_OUTPUT_BUCKET_NAME]:
        # TODO in secret bucket we have to delete all files with the same prefix
        if is_object_exists(bucket, file_path):
            s3_client.delete_object(
                Bucket=settings.AWS_INPUT_BUCKET_NAME,
                Key=file_path,
            )
