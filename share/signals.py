from django.dispatch import receiver
from django.db.models.signals import post_save

from share.models import Share
from share.tasks import send_share_email_task


@receiver(post_save, sender=Share)
def send_share_email(sender, instance, created, **kwargs):
    if created:
        send_share_email_task.delay(instance.id)
