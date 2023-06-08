from django.dispatch import receiver
from django.db.models.signals import pre_delete


from video.models import Video, Thumbnail, Subtitles
from video.tasks import del_objects_from_s3_task


@receiver(pre_delete, sender=Video)
def delete_video_from_s3(sender, instance, **kwargs):
    del_objects_from_s3_task.delay(instance.file_path)


@receiver(pre_delete, sender=Thumbnail)
def delete_thumbnail_from_s3(sender, instance, **kwargs):
    del_objects_from_s3_task.delay(instance.file_path)


@receiver(pre_delete, sender=Subtitles)
def delete_subtitles_from_s3(sender, instance, **kwargs):
    del_objects_from_s3_task.delay(instance.file_path)
