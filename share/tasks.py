from vjournal.celery import app as celery_app

from vjournal.utils import get_cdn_url
from share.models import Share
from emails.utils import send_email


@celery_app.task
def send_share_email_task(share_id):
    try:
        share = Share.objects.get(id=share_id)
        contact = share.contact
        shared_by = share.user
        video = share.video

        brand_logo_url = get_cdn_url("logo.png")
        thumbnail_img_url = get_cdn_url(video.thumbnail.file_path)
        name = shared_by.get_full_name()
        date_str = video.created_at.strftime("%B %d, %Y")
        title = video.title
        summary = video.summary.text

        html = str(share_html_template)
        plain = str(share_plain_template)

        entry_url = f"https://vjournal.me/entry/{video.id}?c={share.code}"

        html = html.format(
            brand_logo_url=brand_logo_url,
            thumbnail_img_url=thumbnail_img_url,
            name=name,
            date_str=date_str,
            title=title,
            summary=summary,
            entry_url=entry_url,
        )
        plain = plain.format(
            name=name,
            date_str=date_str,
            title=title,
            summary=summary,
            entry_url=entry_url,
        )

        to_email = (
            contact.contact_user.email
            if contact.contact_user
            else contact.contact_email
        )
        send_email(
            username=shared_by.username,
            from_email="VJournal <share@vjournal.me>",
            to_email=to_email,
            subject=f"{shared_by.get_full_name()}'s entry | {date_str}",
            html=html,
            plain=plain,
        )

    except Share.DoesNotExist:
        pass


share_html_template = """
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en">

  <head data-id="__react-email-head">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  </head>
  <div id="__react-email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">VJournal Entry<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div>
  </div>

  <body data-id="__react-email-body" style="padding:12px;background-color:#000;font-family:-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif">
    <table align="center" width="100%" data-id="react-email-section" style="padding:12px;background-color:#000;font-family:-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif" border="0" cellPadding="0" cellSpacing="0" role="presentation">
      <tbody>
        <tr>
          <td>
            <table align="center" width="100%" data-id="__react-email-container" role="presentation" cellSpacing="0" cellPadding="0" border="0" style="max-width:37.5em;margin:0 auto;padding:20px 0 48px;width:580px">
              <tbody>
                <tr style="width:100%">
                  <td>
                    <table align="center" width="100%" data-id="react-email-section" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                      <tbody>
                        <tr>
                          <td><img data-id="react-email-img" alt="VJournal" src="{brand_logo_url}" width="48" style="display:block;outline:none;border:none;text-decoration:none;margin:0 auto;margin-bottom:16px;border-radius:50%" /></td>
                        </tr>
                      </tbody>
                    </table>
                    <table align="center" width="100%" data-id="react-email-section" style="padding-bottom:20px" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                      <tbody>
                        <tr>
                          <td>
                            <table align="center" width="100%" data-id="react-email-row" role="presentation" cellSpacing="0" cellPadding="0" border="0">
                              <tbody style="width:100%">
                                <tr style="width:100%">
                                  <p data-id="react-email-text" style="font-size:32px;line-height:1.3;margin:16px 0;font-weight:700;color:#fff;margin-bottom:20px">{name}'s entry on {date_str}</p>
                                  <p data-id="react-email-text" style="font-size:27px;line-height:24px;margin:16px 0;color:#bdbdbd">{title}</p><img data-id="react-email-img" alt="Entry&#x27;s Thumbnail" src="{thumbnail_img_url}" width="100%" style="display:block;outline:none;border:none;text-decoration:none;margin:0 auto;margin-bottom:16px;border-radius:10px" />
                                  <p data-id="react-email-text" style="font-size:18px;line-height:1.4;margin:16px 0;color:#fff;padding-top:24px;padding-bottom:24px;border-radius:4px">&quot;{summary}&quot;</p><a href="{entry_url}" data-id="react-email-button" target="_blank" style="background-color:#fff;border-radius:3px;color:#000;font-size:18px;text-decoration:none;text-align:center;display:inline-block;width:100%;line-height:100%;max-width:100%;padding:19px 0px"><span><!--[if mso]><i style="letter-spacing: 0px;mso-font-width:-100%;mso-text-raise:28.5" hidden>&nbsp;</i><![endif]--></span><span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:14.25px">Watch Entry</span><span><!--[if mso]><i style="letter-spacing: 0px;mso-font-width:-100%" hidden>&nbsp;</i><![endif]--></span></a>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>

</html>
"""

share_plain_template = """
{name}'s entry on {date_str}

{title}

"{summary}"

Watch Entry [{entry_url}]
"""
