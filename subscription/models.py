import uuid

from django.db import models
from django.utils import timezone


from authentication.models import User


class Customer(models.Model):
    user = models.OneToOneField(
        User, related_name="stripe_customer", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(default=timezone.now)

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    stripe_customer_id = models.CharField(max_length=255)
    stripe_subscription_id = models.CharField(max_length=255)
    current_period_end = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} | {self.is_active}"
