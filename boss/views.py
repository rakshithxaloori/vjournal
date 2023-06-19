from django.conf import settings
from django.http import JsonResponse


from rest_framework import status
from rest_framework.decorators import api_view

from vjournal.utils import BAD_REQUEST_RESPONSE
from video.models import Video, Subtitles
from boss.serializers import VideoSerializer
from boss.utils import create_presigned_s3_post


@api_view(["GET"])
def get_audio_urls_view(request):
    # Get all videos that don't have subtitles
    videos = Video.objects.filter(subtitle__isnull=True)
    serializer = VideoSerializer(videos, many=True)
    return JsonResponse(
        {
            "details": "Videos retrieved successfully",
            "payload": {"videos": serializer.data},
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
def get_subtitles_presigned_view(request):
    video_id = request.data.get("video_id", None)
    if video_id is None:
        return BAD_REQUEST_RESPONSE

    video = Video.objects.filter(id=video_id).first()
    if video is None:
        return BAD_REQUEST_RESPONSE

    language_code = request.data.get("language_code", None)
    file_size = request.data.get("file_size", None)
    if language_code is None:
        return BAD_REQUEST_RESPONSE

    subtitles_file_path = (
        f"subtitles/{video.user.username}/{video_id}.vtt"  # TODO check file extension
    )
    Subtitles.objects.create(
        user=video.user,
        video=video,
        file_path=subtitles_file_path,
        language_code=language_code,
    )

    presigned_post = create_presigned_s3_post(file_size, subtitles_file_path)

    return JsonResponse(
        {
            "details": "Subtitles presigned successfully",
            "payload": {"presigned_url": presigned_post},
        },
        status=status.HTTP_200_OK,
    )
