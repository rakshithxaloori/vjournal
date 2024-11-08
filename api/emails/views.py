from svix.webhooks import Webhook, WebhookVerificationError


from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt


from emails.models import Email


RESEND_WEBHOOK_SIGNING_KEY = settings.RESEND_WEBHOOK_SIGNING_KEY
RESEND_TYPE = {
    "email.sent": Email.SENT,
    "email.delivered": Email.DELIVERED,
    "email.delivery_delayed": Email.DELIVERY_DELAYED,
    "email.complained": Email.COMPLAINED,
    "email.bounced": Email.BOUNCED,
    "email.open": Email.OPENED,
    "email.clicked": Email.CLICKED,
}


@csrf_exempt
def resend_webhook_view(request):
    headers = request.headers
    payload = request.body
    try:
        wh = Webhook(RESEND_WEBHOOK_SIGNING_KEY)
        data = wh.verify(payload, headers)
        try:
            email = Email.objects.get(message_id=data["data"]["email_id"])
            email.status = RESEND_TYPE[data["type"]]
            email.save(update_fields=["status"])
        except (Exception, Email.DoesNotExist) as e:
            print("ERROR", e)
        return HttpResponse(status=200)
    except WebhookVerificationError as e:
        return HttpResponse(status=400)
