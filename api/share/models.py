import random
import string
import uuid

from django.db import models

from authentication.models import User
from video.models import Video


def generate_random_string(length=11):
    letters = string.ascii_lowercase
    random_string = "".join(random.choice(letters) for _ in range(length))
    return random_string


class Contact(models.Model):
    user = models.ForeignKey(User, related_name="contacts", on_delete=models.CASCADE)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Either `contact_user` or `contact_email` field must be set
    contact_user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    contact_name = models.CharField(max_length=255, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)

    def save(self, *args, **kwargs):
        # Ensure that either `user` or `email` field is set, but not both
        if self.contact_user and self.contact_email:
            raise ValueError(
                "Both `contact_user` and `contact_email` fields cannot be set at the same time."
            )
        elif not self.contact_user and not self.contact_email:
            raise ValueError(
                "Either `contact_user` or `contact_email` field must be set."
            )
        super().save(*args, **kwargs)

    def get_contact_name(self):
        if self.contact_user:
            return f"{self.contact_user.first_name} {self.contact_user.last_name}"
        return self.contact_name

    def __str__(self):
        return f"{self.user.get_full_name()}'s contact: {self.get_contact_name()}"


class Share(models.Model):
    user = models.ForeignKey(User, related_name="shares", on_delete=models.CASCADE)
    video = models.ForeignKey(Video, related_name="shares", on_delete=models.CASCADE)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    contact = models.ForeignKey(
        Contact, related_name="shares", on_delete=models.CASCADE, null=True, blank=True
    )
    code = models.CharField(default=generate_random_string, max_length=11)

    def __str__(self):
        return "{} shared {} to {}".format(
            self.user.get_full_name(),
            self.video.id,
            self.contact.get_contact_name(),
        )
