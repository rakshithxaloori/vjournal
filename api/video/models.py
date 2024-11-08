import uuid

from django.db import models


from authentication.models import User


# Video model
class Video(models.Model):
    EMPTY = "E"
    UPLOADING = "U"
    PROCESSING = "P"
    READY = "R"
    FAILED = "F"
    STATUS_CHOICES = [
        (EMPTY, "Empty"),
        (UPLOADING, "Uploading"),
        (PROCESSING, "Processing"),
        (READY, "Ready"),
        (FAILED, "Failed"),
    ]

    user = models.ForeignKey(User, related_name="videos", on_delete=models.CASCADE)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    title = models.CharField(max_length=255)
    file_path = models.URLField()
    status = models.CharField(
        max_length=1,
        choices=STATUS_CHOICES,
        default=EMPTY,
        # db_index=True
    )

    input_width_in_px = models.PositiveIntegerField()
    input_height_in_px = models.PositiveIntegerField()

    job_id = models.CharField(max_length=255, null=True, blank=True)
    duration_in_ms = models.PositiveIntegerField(null=True, blank=True)
    output_width_in_px = models.PositiveIntegerField(null=True, blank=True)
    output_height_in_px = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self) -> str:
        return f"{self.user.first_name} {self.user.last_name} | {self.title} | {self.status}"

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Videos"


# Thumbnail model
class Thumbnail(models.Model):
    user = models.ForeignKey(User, related_name="thumbnails", on_delete=models.CASCADE)
    video = models.OneToOneField(
        Video, related_name="thumbnail", on_delete=models.CASCADE
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    file_path = models.URLField()

    def __str__(self) -> str:
        return f"{self.video}"

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Thumbnails"


# Subtitles model
class Subtitles(models.Model):
    user = models.ForeignKey(User, related_name="subtitles", on_delete=models.CASCADE)
    video = models.OneToOneField(
        Video, related_name="subtitles", on_delete=models.CASCADE
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    file_path = models.URLField()
    # https://en.wikipedia.org/wiki/ISO_639-1
    language_code = models.CharField(max_length=2)
    token_count = models.PositiveIntegerField()

    def __str__(self) -> str:
        return f"{self.video} - {self.language_code}"

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Subtitles"


# Summary model
class Summary(models.Model):
    user = models.ForeignKey(User, related_name="summaries", on_delete=models.CASCADE)
    video = models.OneToOneField(
        Video, related_name="summary", on_delete=models.CASCADE
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    text = models.TextField()

    def __str__(self) -> str:
        return f"{self.video} {self.created_at}"

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Summaries"
