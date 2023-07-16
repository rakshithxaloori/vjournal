import uuid

from django.conf import settings
from django.http import JsonResponse, HttpResponse


from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)


from knox.auth import TokenAuthentication


from vjournal.utils import BAD_REQUEST_RESPONSE
from authentication.models import User
from video.models import Video
from share.models import Share
from share.serializer import ShareSerializer


@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_shared_to_view(request):
    user_full_name = request.data.get("user_fullname", None)
    user_email = request.data.get("user_email", None)
    video_id = request.data.get("video_id", None)

    if None in [user_full_name, user_email, video_id]:
        return BAD_REQUEST_RESPONSE

    try:
        video = Video.objects.get(id=video_id)
        shared_to_user = User.objects.get(email=user_email)
        Share.objects.create(
            user=request.user,
            video=video,
            shared_to_user=shared_to_user,
        )

    except User.DoesNotExist:
        Share.objects.create(
            user=request.user,
            video=video,
            shared_to_name=user_full_name,
            shared_to_email=user_email,
        )
    except Video.DoesNotExist:
        return BAD_REQUEST_RESPONSE


@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def list_shared_to_view(request):
    video_id = request.data.get("video_id", None)
    if video_id is None:
        return BAD_REQUEST_RESPONSE

    try:
        video = Video.objects.get(id=video_id)
        shares = video.shares.all()
        serializer = ShareSerializer(shares, many=True)

        return JsonResponse(
            {
                "detail": "Shares retrieved successfully.",
                "payload": {
                    "shares": serializer.data,
                },
            },
            status=status.HTTP_200_OK,
        )
    except Video.DoesNotExist:
        return BAD_REQUEST_RESPONSE


@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_shared_to_view(request):
    share_id = request.data.get("share_id", None)
    if share_id is None:
        return BAD_REQUEST_RESPONSE

    try:
        share = Share.objects.get(id=share_id, user=request.user)
        share.delete()
        return JsonResponse(
            {
                "detail": "Share deleted successfully.",
            },
            status=status.HTTP_200_OK,
        )
    except Share.DoesNotExist:
        return BAD_REQUEST_RESPONSE
