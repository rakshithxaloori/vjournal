from rest_framework.serializers import ModelSerializer, SerializerMethodField


from video.models import Video
from video.utils import create_presigned_url


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
            return create_presigned_url(obj.thumbnail.file_path)
        except:
            return None


class VideoLongSerializer(ModelSerializer):
    urls = SerializerMethodField()
    summary = SerializerMethodField()

    class Meta:
        model = Video
        fields = [
            "id",
            "created_at",
            "title",
            "duration_in_ms",
            "status",
            "urls",
            "summary",
        ]

    def get_urls(self, obj):
        if obj.file_path is None:
            return None
        return {
            "mpd": create_presigned_url(obj.file_path),
            "video": create_presigned_url(obj.file_path.replace(".mpd", "_video.mp4")),
            "audio": create_presigned_url(obj.file_path.replace(".mpd", "_audio.mp4")),
        }

    def get_summary(self, obj):
        if obj.summary is None:
            return None
        return obj.summary.text
