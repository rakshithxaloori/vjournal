import boto3
import requests

from datetime import datetime


from django.conf import settings
from django.utils import timezone
from django.http import JsonResponse
from django.core.files.storage import default_storage

from rest_framework import status

from authentication.models import User


BAD_REQUEST_RESPONSE = JsonResponse(
    {"detail": "Something went wrong"}, status=status.HTTP_400_BAD_REQUEST
)


TESTING_ACCOUNTS = []


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
    return timezone.make_aware(datetime.fromtimestamp(timestamp))


def get_now_timestamp():
    return int(timezone.now().timestamp())


############################################################################################################

s3_client = boto3.client(
    service_name="s3",
    aws_access_key_id=settings.AWS_S3_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_S3_SECRET_ACCESS_KEY,
    region_name=settings.AWS_S3_REGION_NAME,
)

URL_EXPIRY_SECS = 600  # 10 minutes


def create_presigned_s3_url(file_size, file_type, file_path):
    fields = {
        "Content-Type": "multipart/form-data",
    }

    conditions = [
        ["content-length-range", file_size - 10, file_size + 10],
        {"content-type": "multipart/form-data"},
    ]
    expires_in = URL_EXPIRY_SECS

    url = s3_client.generate_presigned_post(
        Bucket=settings.AWS_STORAGE_BUCKET_NAME,
        Key=file_path,
        Fields=fields,
        Conditions=conditions,
        ExpiresIn=expires_in,
    )
    return url
