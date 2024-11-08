from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


from rest_framework import status
from rest_framework.decorators import api_view

from vjournal.utils import BAD_REQUEST_RESPONSE
from video.models import Video, Subtitles, Summary
from boss.serializers import AudioURLsSerializer
from boss.utils import create_presigned_s3_post
from boss.middleware import secret_key_middleware
from boss.utils import send_entry_email


@csrf_exempt
@secret_key_middleware
@api_view(["GET"])
def get_audio_urls_view(request):
    # Get all videos that don't have subtitles
    videos = Video.objects.filter(subtitles__isnull=True, status=Video.READY)
    serializer = AudioURLsSerializer(videos, many=True)
    return JsonResponse(
        {
            "details": "Videos retrieved successfully",
            "payload": {"audios": serializer.data},
        },
        status=status.HTTP_200_OK,
    )


@csrf_exempt
@secret_key_middleware
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
    token_count = request.data.get("token_count", None)
    summary = request.data.get("summary", None)
    title = request.data.get("title", None)
    if None in [language_code, file_size, token_count, summary, title]:
        return BAD_REQUEST_RESPONSE

    user = video.user

    subtitles_file_path = f"subtitles/{user.username}/{video_id}.srt"
    Subtitles.objects.create(
        user=user,
        video=video,
        file_path=subtitles_file_path,
        language_code=language_code,
        token_count=token_count,
    )
    Summary.objects.create(
        user=user,
        video=video,
        text=summary,
    )
    video.title = title
    video.save(update_fields=["title"])

    send_entry_email(video)

    presigned_post = create_presigned_s3_post(file_size, subtitles_file_path)

    return JsonResponse(
        {
            "details": "Subtitles presigned successfully",
            "payload": {"presigned_url": presigned_post},
        },
        status=status.HTTP_200_OK,
    )
