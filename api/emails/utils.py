import resend

from django.conf import settings


from authentication.models import User
from emails.models import Email

resend.api_key = settings.RESEND_API_KEY


def send_email(username, from_email, to_email, subject, html, plain):
    # Create an Email instance
    Email.objects.create(
        user=User.objects.get(username=username),
        to=to_email,
        subject=subject,
        html_message=html,
        plain_message=plain,
        sender=from_email,
    )
