import uuid
import json
from datetime import datetime

from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt


from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)


from knox.auth import TokenAuthentication


from vjournal.utils import BAD_REQUEST_RESPONSE
from video.models import Video
from video.utils import create_presigned_s3_post, create_mediaconvert_job, sns_client
from video.serializer import VideoShortSerializer, VideoLongSerializer


@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def upload_video_view(request):
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


@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def process_video_view(request):
    video_id = request.data.get("video_id")
    if not video_id or not Video.objects.filter(id=video_id).exists():
        return BAD_REQUEST_RESPONSE

    create_mediaconvert_job(video_id)

    return JsonResponse(
        {
            "details": "Video uploaded successfully",
        },
        status=status.HTTP_200_OK,
    )


VIDEOS_FETCH_COUNT = 10


@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_videos_view(request):
    index = request.data.get("index", 0)
    videos = Video.objects.filter(user=request.user)[
        index * VIDEOS_FETCH_COUNT : (index + 1) * VIDEOS_FETCH_COUNT
    ]
    serializer = VideoShortSerializer(videos, many=True)
    return JsonResponse(
        {
            "details": "Videos retrieved successfully",
            "payload": {"videos": serializer.data},
        },
        status=status.HTTP_200_OK,
    )


@csrf_exempt
def mediaconvert_sns_view(request):
    json_data = json.loads(request.body)
    if json_data["Type"] == "SubscriptionConfirmation":
        # Confirm subscription
        response = sns_client.confirm_subscription(
            TopicArn=settings.AWS_SNS_TOPIC_ARN, Token=json_data["Token"]
        )
        if response["ResponseMetadata"]["HTTPStatusCode"] != 200:
            print("HTTPStatusCode != 200")
            print(response)

    else:
        try:
            message = json.loads(json_data["Message"])
            input_url = message["input_url"]
            jobID = message["jobID"]
            duration = message["fullDetails"]["outputGroupDetails"][0]["outputDetails"][
                0
            ]["durationInMs"]
            videoDetails = message["fullDetails"]["outputGroupDetails"][0][
                "outputDetails"
            ][0]["videoDetails"]

        except Exception as e:
            print("EXCEPTION", e)

    return HttpResponse(status=status.HTTP_200_OK)
