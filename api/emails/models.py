import uuid

from django.db import models
from django.utils import timezone


from authentication.models import User


class Email(models.Model):
    QUEUED = "q"
    # Resend types https://resend.com/docs/webhooks
    SENT = "s"
    DELIVERED = "d"
    DELIVERY_DELAYED = "dd"
    COMPLAINED = "c"
    BOUNCED = "b"
    OPENED = "o"
    CLICKED = "cl"

    STATUS_CHOICES = (
        (QUEUED, "Queued"),
        (SENT, "Sent"),
        (DELIVERED, "Delivered"),
        (DELIVERY_DELAYED, "Delivery Delayed"),
        (COMPLAINED, "Complained"),
        (BOUNCED, "Bounced"),
        (OPENED, "Opened"),
        (CLICKED, "Clicked"),
    )

    user = models.ForeignKey(User, related_name="emails", on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    to = models.EmailField()
    subject = models.CharField(max_length=255)
    html_message = models.TextField()
    plain_message = models.TextField()
    sender = models.EmailField()

    message_id = models.CharField(
        max_length=255, null=True, blank=True
    )  # Provided by the email service
    status = models.CharField(max_length=2, choices=STATUS_CHOICES, default=QUEUED)

    def __str__(self) -> str:
        return f"To: {self.to} | {self.user.username} | Status: {self.status}"

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Emails"
