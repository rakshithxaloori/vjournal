import uuid
from datetime import datetime

from django.http import JsonResponse


from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)


from knox.auth import TokenAuthentication


from video.models import Video, Thumbnail
from video.utils import create_presigned_s3_post


@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_upload_view(request):
    """
    This view is responsible for returning a presigned post url
    to the client. The client will then use this url to upload
    the file directly to the S3 bucket.
    """
    # TODO limit to only one upload per day
    file_size = request.data.get("file_size")

    # Create a uuid for the video
    video_id = uuid.uuid4()
    file_path = f"videos/{request.user.username}/{video_id}"

    # Create a new video
    video = Video.objects.create(
        id=video_id,
        user=request.user,
        title=f"{request.user.username} on {datetime.now().strftime('%Y-%m-%d')}",
        file_path=file_path,
    )

    # Generate a presigned post url
    presigned_post = create_presigned_s3_post(file_size, file_path)

    # Return the presigned post url to the client
    return JsonResponse(
        {
            "details": "Upload the video journal",
            "payload": {
                "s3_urls": {
                    "video": presigned_post,
                    "thumbnail": None,
                },
                "video_id": video_id,
            },
        },
        status=status.HTTP_200_OK,
    )
