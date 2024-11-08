import requests
import datetime

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from botocore.signers import CloudFrontSigner


from django.utils import timezone
from django.http import JsonResponse
from django.conf import settings
from django.core.files.storage import default_storage

from rest_framework import status


from authentication.models import User


BAD_REQUEST_RESPONSE = JsonResponse(
    {"detail": "Something went wrong"}, status=status.HTTP_400_BAD_REQUEST
)


def get_cdn_url(file_key):
    return default_storage.url(file_key)


def get_ip_address(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0]
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip


def get_country_code(ip):
    r = requests.get("http://www.geoplugin.net/json.gp?ip={}".format(ip))
    if not r.ok:
        return User.DEFAULT_COUNTRY_CODE
    data = r.json()
    country_code = data["geoplugin_countryCode"]
    return country_code if country_code else User.DEFAULT_COUNTRY_CODE


def get_aware_datetime(timestamp):
    return timezone.make_aware(datetime.datetime.fromtimestamp(timestamp))


def get_now_timestamp():
    return int(timezone.now().timestamp())


############################################################################################################
# CloudFront Signed Cookie
AWS_CF_KEY_PAIR_ID = settings.AWS_CF_KEY_PAIR_ID
AWS_CF_PRIVATE_KEY = settings.AWS_CF_PRIVATE_KEY

AWS_CF_PRIVATE_KEY = AWS_CF_PRIVATE_KEY.encode("utf-8")
AWS_CF_PRIVATE_KEY = AWS_CF_PRIVATE_KEY.replace(b"\\n", b"\n")

AWS_OUTPUT_DOMAIN = settings.AWS_OUTPUT_DOMAIN
EXPIRATION_SECONDS = 60 * 60 * 3  # 3 hours


def get_cf_sign(message):
    private_key = serialization.load_pem_private_key(
        AWS_CF_PRIVATE_KEY, password=None, backend=default_backend()
    )
    return private_key.sign(message, padding.PKCS1v15(), hashes.SHA1())


cloudfront_signer = CloudFrontSigner(AWS_CF_KEY_PAIR_ID, get_cf_sign)


def get_out_access(file_path):
    mpd_url = f"https://{AWS_OUTPUT_DOMAIN}/{file_path}"

    # Replace ".mpd" with "*"
    full_url = mpd_url.replace(".mpd", "*")
    expires_at = datetime.datetime.now() + datetime.timedelta(
        seconds=EXPIRATION_SECONDS
    )

    policy = cloudfront_signer.build_policy(full_url, expires_at)
    cf_signed_url = cloudfront_signer.generate_presigned_url(full_url, policy=policy)

    query_string = cf_signed_url.split("?")[1]
    query_params = dict(qc.split("=") for qc in query_string.split("&"))

    cookie = {
        "CloudFront-Policy": query_params["Policy"],
        "CloudFront-Signature": query_params["Signature"],
        "CloudFront-Key-Pair-Id": query_params["Key-Pair-Id"],
    }
    return {
        "cookie": cookie,
        "query_params": query_params,
    }
