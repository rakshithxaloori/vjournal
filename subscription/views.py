import stripe
import datetime

from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import make_aware


from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)

from knox.auth import TokenAuthentication


from subscription.models import Customer
from subscription.tasks import del_customer_task
from authentication.models import User
from subscription.utils import get_subscription_info


stripe.api_key = settings.STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET = settings.STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID_USD = settings.STRIPE_PRICE_ID_USD
STRIPE_PRICE_ID_INR = settings.STRIPE_PRICE_ID_INR


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def check_subscription_view(request):
    payload = get_subscription_info(request.user)
    return JsonResponse(
        {"detail": "Subscription details", "payload": payload},
        status=status.HTTP_200_OK,
    )


@csrf_exempt
def webhook(request):
    # Retrieve the poll by verifying the signature using the raw body and secret if webhook signing is configured.
    try:
        signature = request.headers["STRIPE_SIGNATURE"]
        event = stripe.Webhook.construct_event(
            payload=request.body, sig_header=signature, secret=STRIPE_WEBHOOK_SECRET
        )
        # Get the type of webhook poll sent - used to check the status of PaymentIntents.
        poll_type = event.type
        subscription = event.data.object
    except Exception:
        return HttpResponse(status=400)

    if (
        poll_type == "customer.subscription.updated"
        and isinstance(subscription, stripe.Subscription)
        and subscription.status == "active"
        and subscription.plan.id in [STRIPE_PRICE_ID_INR, STRIPE_PRICE_ID_USD]
    ):
        try:
            stripe_customer = stripe.Customer.retrieve(subscription.customer)
            user = User.objects.get(email=stripe_customer.email)
            price_id = subscription.plan.id

            if price_id not in [STRIPE_PRICE_ID_INR, STRIPE_PRICE_ID_USD]:
                # Delete customer
                del_customer_task.delay(user.id)
            else:
                Customer.objects.update_or_create(
                    user=user,
                    defaults={
                        "stripe_customer_id": subscription.customer,
                        "stripe_subscription_id": subscription.id,
                        "current_period_end": make_aware(
                            datetime.datetime.fromtimestamp(
                                subscription.current_period_end
                            )
                        ),
                        "is_active": True,
                    },
                )
        except (Customer.DoesNotExist, User.DoesNotExist):
            del_customer_task.delay(subscription.customer, subscription.id)

    elif poll_type == "customer.subscription.deleted":
        try:
            tot_customer = Customer.objects.get(stripe_subscription_id=subscription.id)
            tot_customer.is_active = False
            tot_customer.save(update_fields=["is_active"])
        except Customer.DoesNotExist:
            del_customer_task.delay(subscription.customer, subscription.id)
    else:
        print("Unhandled poll type {}".format(poll_type))

    return HttpResponse(status=200)
