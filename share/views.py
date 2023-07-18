import uuid

from django.http import JsonResponse


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
from share.models import Contact, Share
from share.serializer import ShareSerializer


MAX_CONTACTS = 200


@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_shared_to_view(request):
    contact_fullname = request.data.get("contact_fullname", None)
    contact_email = request.data.get("contact_email", None)
    video_id = request.data.get("video_id", None)

    if None in [contact_fullname, contact_email, video_id]:
        return BAD_REQUEST_RESPONSE

    if contact_email == request.user.email:
        return JsonResponse(
            {
                "detail": "Haha funny! You cannot share to yourself.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if Contact.objects.filter(user=request.user).count() >= MAX_CONTACTS:
        return JsonResponse(
            {
                "detail": "You have reached the maximum number of contacts.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        contact = Contact.objects.get(user=request.user, contact_email=contact_email)
    except Contact.DoesNotExist:
        # Create contact
        try:
            contact_user = User.objects.get(email=contact_email)
            contact = Contact.objects.create(
                user=request.user,
                contact_user=contact_user,
            )
        except User.DoesNotExist:
            contact = Contact.objects.create(
                user=request.user,
                contact_name=contact_fullname,
                contact_email=contact_email,
            )

    try:
        video = Video.objects.get(id=video_id)
        share = Share.objects.get_or_create(
            user=request.user,
            video=video,
            contact=contact,
        )
        serializer = ShareSerializer(share)

        return JsonResponse(
            {
                "detail": "Entry shared successfully.",
                "payload": {
                    "share": serializer.data,
                },
            },
            status=status.HTTP_200_OK,
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
