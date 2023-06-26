import requests

from datetime import datetime


from django.utils import timezone
from django.http import JsonResponse
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
    return timezone.make_aware(datetime.fromtimestamp(timestamp))


def get_now_timestamp():
    return int(timezone.now().timestamp())


############################################################################################################
