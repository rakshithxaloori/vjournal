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
from subscription.utils import get_subscription_info


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_account_view(request):
    """
    This view is responsible for returning the user's account
    information.
    """
    user = request.user
    subscription_info = get_subscription_info(user)
    return JsonResponse(
        {
            "details": "{}'s account details".format(user.username),
            "payload": {
                "name": "{} {}".format(user.first_name, user.last_name),
                "email": user.email,
                "subscription": subscription_info,
            },
        },
        status=status.HTTP_200_OK,
    )
