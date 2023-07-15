from django.conf import settings
from rest_framework.serializers import ModelSerializer, SerializerMethodField


from video.models import Video
from vjournal.utils import get_cdn_url, get_out_access


AWS_OUTPUT_DOMAIN = settings.AWS_OUTPUT_DOMAIN


class VideoShortSerializer(ModelSerializer):
    thumbnail_url = SerializerMethodField()

    class Meta:
        model = Video
        fields = [
            "id",
            "created_at",
            "title",
            "duration_in_ms",
            "status",
            "thumbnail_url",
        ]

    def get_thumbnail_url(self, obj):
        # Check if thumbnail exists
        try:
            return get_cdn_url(obj.thumbnail.file_path)
        except:
            return None


class VideoLongSerializer(ModelSerializer):
    url = SerializerMethodField()
    access = SerializerMethodField()
    summary = SerializerMethodField()

    class Meta:
        model = Video
        fields = [
            "id",
            "created_at",
            "title",
            "duration_in_ms",
            "status",
            "url",
            "access",
            "summary",
        ]

    def get_url(self, obj):
        if obj.file_path is None:
            return None
        return f"https://{AWS_OUTPUT_DOMAIN}/{obj.file_path}"

    def get_access(self, obj):
        if obj.file_path is None:
            return None
        return get_out_access(obj.file_path)

    def get_summary(self, obj):
        if obj.summary is None:
            return None
        return obj.summary.text
