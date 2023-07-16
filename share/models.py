import uuid

from django.db import models

from authentication.models import User
from video.models import Video


class Share(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, related_name="shares", on_delete=models.CASCADE)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # Either `shared_to_user` or `shared_to_email` field must be set
    shared_to_user = models.ForeignKey(
        User, related_name="shared_to", on_delete=models.CASCADE
    )
    shared_to_name = models.CharField(max_length=255, blank=True, null=True)
    shared_to_email = models.EmailField()

    def save(self, *args, **kwargs):
        # Ensure that either `user` or `email` field is set, but not both
        if self.shared_to_user and self.shared_to_email:
            raise ValueError(
                "Both `shared_to_user` and `shared_to_email` fields cannot be set at the same time."
            )
        elif not self.shared_to_user and not self.shared_to_email:
            raise ValueError(
                "Either `shared_to_user` or `shared_to_email` field must be set."
            )
        super().save(*args, **kwargs)

    def __str__(self):
        return "{} shared {} to {}".format(self.user, self.video)
