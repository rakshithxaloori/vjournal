import resend

from django.conf import settings


from authentication.models import User
from emails.models import Email

resend.api_key = settings.RESEND_API_KEY


def send_email(from_email, to_email, subject, html, plain):
    # Create an Email instance
    try:
        email = Email.objects.create(
            user=User.objects.get(email=to_email),
            to=to_email,
            subject=subject,
            html_message=html,
            plain_message=plain,
            sender=from_email,
        )
        params = {
            "from": from_email,
            "to": to_email,
            "subject": subject,
            "html": html,
            "text": plain,
        }
        r = resend.Emails.send(params)
        email.message_id = r["id"]
        email.save(update_fields=["message_id"])
        print(r)
    except Exception as e:
        print(e)