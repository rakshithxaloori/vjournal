from django.utils import timezone
from django.http import JsonResponse

from rest_framework import status


from subscription.utils import get_subscription_info


def subscription_middleware(get_response):
    # Check if the user has a valid subscription
    def middleware(request):
        user = request.user
        if user.is_authenticated:
            payload = get_subscription_info(user)
            if (
                not payload["is_beta"]
                or not payload["is_active"]
                or payload["current_period_end"] < timezone.now()
            ):
                # You can't create new entries
                return JsonResponse(
                    {"detail": "Subscription required"},
                    status=status.HTTP_402_PAYMENT_REQUIRED,
                )
            else:
                response = get_response(request)
                return response

        else:
            return JsonResponse(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

    return middleware
