import re
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
from video.tasks import del_objects_from_s3_task, create_thumbnail_instance_task


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
    file_size = request.data.get("file_size", None)
    input_width_in_px = request.data.get("video_width", None)
    input_height_in_px = request.data.get("video_height", None)

    if None in [file_size, input_width_in_px, input_height_in_px]:
        return BAD_REQUEST_RESPONSE

    # Create a uuid for the video
    video_id = uuid.uuid4()
    file_path = f"videos/{request.user.username}/{video_id}"

    # Create a new video
    video = Video.objects.create(
        id=video_id,
        user=request.user,
        title=f"{request.user.username} on {datetime.now().strftime('%Y-%m-%d')}",
        file_path=file_path,
        input_width_in_px=input_width_in_px,
        input_height_in_px=input_height_in_px,
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


@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_video_detail_view(request):
    video_id = request.data.get("video_id", None)
    if video_id is None:
        return BAD_REQUEST_RESPONSE

    try:
        video = Video.objects.get(id=video_id)
        serializer = VideoLongSerializer(video)
        return JsonResponse(
            {
                "details": "Video retrieved successfully",
                "payload": {"video": serializer.data},
            },
            status=status.HTTP_200_OK,
        )
    except Video.DoesNotExist:
        return BAD_REQUEST_RESPONSE


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

    else:
        try:
            message = json.loads(json_data["Message"])

            job_id = message["detail"]["jobId"]
            video_id = message["detail"]["userMetadata"]["video_id"]
            video_output_group_details = message["detail"]["outputGroupDetails"][0]
            video_output_details = video_output_group_details["outputDetails"][0]
            video_details = video_output_details["videoDetails"]

            output_width_in_px = video_details["widthInPx"]
            output_height_in_px = video_details["heightInPx"]
            duration_in_ms = video_output_details["durationInMs"]
            video_file_path = video_output_group_details["playlistFilePaths"][0]
            thumbnail_file_path = message["detail"]["outputGroupDetails"][1][
                "outputDetails"
            ][0]["outputFilePaths"][0]

            # Remove s3://<bucket_name>/ using regex
            video_file_path = re.sub(r"s3:\/\/[a-zA-Z0-9\-]+\/", "", video_file_path)
            thumbnail_file_path = re.sub(
                r"s3:\/\/[a-zA-Z0-9\-]+\/", "", thumbnail_file_path
            )

            # Update the video
            try:
                # Delete the input video
                video = Video.objects.get(id=video_id, job_id=job_id)
                del_objects_from_s3_task.delay(video.file_path)
                # create_thumbnail_instance_task.delay(video_id, thumbnail_file_path)
                create_thumbnail_instance_task(video_id, thumbnail_file_path)
                video.file_path = video_file_path
                video.status = Video.READY
                video.duration_in_ms = duration_in_ms
                video.output_width_in_px = output_width_in_px
                video.output_height_in_px = output_height_in_px

                video.save(
                    update_fields=[
                        "file_path",
                        "status",
                        "duration_in_ms",
                        "output_width_in_px",
                        "output_height_in_px",
                    ]
                )

            except Video.DoesNotExist:
                print("Video.DoesNotExist", video_id, job_id)
        except Exception as e:
            print("Exception", e)

    return HttpResponse(status=status.HTTP_200_OK)


# print("MESSAGE", message)
# {
#     "version": "0",
#     "id": "3587f103-4968-c0fd-84b4-9ede4e38e586",
#     "detail-type": "MediaConvert Job State Change",
#     "source": "aws.mediaconvert",
#     "account": "662294483096",
#     "time": "2023-06-19T07:53:43Z",
#     "region": "us-east-1",
#     "resources": [
#         "arn:aws:mediaconvert:us-east-1:662294483096:jobs/1687161219181-jv2nya"
#     ],
#     "detail": {
#         "timestamp": 1687161223347,
#         "accountId": "662294483096",
#         "queue": "arn:aws:mediaconvert:us-east-1:662294483096:queues/Default",
#         "jobId": "1687161219181-jv2nya",
#         "status": "COMPLETE",
#         "userMetadata": {"video_id": "05c691ad-1fb1-43ab-878a-7b76e99a1239"},
#         "outputGroupDetails": [
#             {
#                 "outputDetails": [
#                     {
#                         "durationInMs": 17333,
#                         "videoDetails": {
#                             "widthInPx": 640,
#                             "heightInPx": 360,
#                             "averageBitrate": 811208,
#                             "qvbrAvgQuality": 8.0,
#                             "qvbrMinQuality": 7.67,
#                             "qvbrMaxQuality": 8.0,
#                             "qvbrMinQualityLocation": 1400,
#                             "qvbrMaxQualityLocation": 0,
#                         },
#                     },
#                     {"durationInMs": 17322},
#                 ],
#                 "playlistFilePaths": [
#                     "s3://vj-dev-output/videos/106732583620951074268/05c691ad-1fb1-43ab-878a-7b76e99a1239/05c691ad-1fb1-43ab-878a-7b76e99a1239.mpd"
#                 ],
#                 "type": "DASH_ISO_GROUP",
#             },
#             {
#                 "outputDetails": [
#                     {
#                         "outputFilePaths": [
#                             "s3://vj-dev-output/thumbnails/106732583620951074268/05c691ad-1fb1-43ab-878a-7b76e99a1239/05c691ad-1fb1-43ab-878a-7b76e99a1239_default.0000000.jpg"
#                         ],
#                         "durationInMs": 1000,
#                         "videoDetails": {
#                             "widthInPx": 640,
#                             "heightInPx": 360,
#                             "averageBitrate": 227296,
#                         },
#                     }
#                 ],
#                 "type": "FILE_GROUP",
#             },
#         ],
#         "paddingInserted": 0,
#         "blackVideoDetected": 0,
#     },
# }
