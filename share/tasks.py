from share.models import Share
from emails.utils import send_email


def send_share_email_task(share_id):
    try:
        share = Share.objects.get(id=share_id)
        shared_by = share.user
        video = share.video

        dateStr = video.created_at.strftime("%B %d, %Y")
        html = str(share_html_template)
        plain = str(share_plain_template)

        to_email = (
            share.shared_to_user.email
            if share.shared_to_user
            else share.shared_to_email
        )
        send_email(
            from_email="VJournal <share@vjournal.me>",
            to_email=to_email,
            subject=f"{shared_by.first_name} {shared_by.last_name}'s entry | {dateStr}",
            html=html,
            plain=plain,
        )

    except Share.DoesNotExist:
        pass


share_html_template = """"""

share_plain_template = """"""
