import resend
from celery.schedules import crontab

from django.conf import settings


from vjournal.celery import app as celery_app
from emails.models import Email


resend.api_key = settings.RESEND_API_KEY


@celery_app.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(minute=5),
        send_emails_task.s(),
        name="send emails every 5 minutes",
    )


@celery_app.task
def send_emails_task():
    queued_emails = Email.objects.filter(status=Email.QUEUED)
    for email in queued_emails:
        params = {
            "from": email.sender,
            "to": email.to,
            "subject": email.subject,
            "html": email.html_message,
            "text": email.plain_message,
        }
        r = resend.Emails.send(params)
        email.message_id = r["id"]
        email.status = Email.SENT
        email.save(update_fields=["message_id", "status"])
