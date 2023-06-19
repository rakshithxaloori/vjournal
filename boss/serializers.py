from rest_framework.serializers import ModelSerializer, SerializerMethodField


from video.models import Video
from video.utils import create_presigned_url


class VideoSerializer(ModelSerializer):
    audio_url = SerializerMethodField()

    class Meta:
        model = Video
        fields = [
            "id",
            "audio_url",
        ]

    def get_audio_url(self, obj):
        return create_presigned_url(obj.file_path.replace(".mpd", "_audio.mp4"))
