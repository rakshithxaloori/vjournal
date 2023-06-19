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
        return create_presigned_url(obj.thumbnail.file_path)


class VideoLongSerializer(ModelSerializer):
    urls = SerializerMethodField()

    class Meta:
        model = Video
        fields = [
            "id",
            "created_at",
            "title",
            "duration_in_ms",
            "status",
            "urls",
        ]

    def get_urls(self, obj):
        return {
            "mpd": create_presigned_url(obj.file_path),
            "video": create_presigned_url(obj.file_path.replace(".mpd", "_video.mp4")),
            "audio": create_presigned_url(obj.file_path.replace(".mpd", "_audio.mp4")),
        }
