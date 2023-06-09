from rest_framework.serializers import ModelSerializer, SerializerMethodField


from video.models import Video
from video.utils import create_presigned_url


class VideoShortSerializer(ModelSerializer):
    class Meta:
        model = Video
        fields = ["id", "created_at", "title", "duration_in_ms", "status"]


class VideoLongSerializer(ModelSerializer):
    url = SerializerMethodField()

    class Meta:
        model = Video
        fields = ["id", "created_at", "title", "duration_in_ms", "status", "url"]

    def get_url(self, obj):
        return create_presigned_url(obj.file_path)
