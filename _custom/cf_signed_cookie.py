import datetime
import json
import requests

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from botocore.signers import CloudFrontSigner

from video.models import Video

import os


CF_KEY_PAIR_ID = os.environ.get("CF_SIGNED_URL_KEY_PAIR_ID")
CF_PRIVATE_KEY = """
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3E6Bm+D+fa+fq
zaNF34F4YwKydox4VX5L4PHO1yhcvzy8jU7qAjXXz0kK2taHoqIznLPM/NJpSqsY
kKTlWYHtSrAvQzhBJ9CFBIdJ6sCU4rcQBmR1+LkWKKvBskpCgp7IYVTX6Fp+X/Oh
7F1Y1eu9nOoxf9JBkYpyuAAP4fk3DWJw+zKKuDnEnvGZ3E4Qn7Ved1q1TslMmFNO
YrmnYiVl9Bg8OkaA2J/dRCARhD0BsP1P8BCCPKatjKIMO1Q8ChdmcljoGFTZpcTR
Rv06Uw1e/GdkundoaqBcg/ebns6F7pSlZhAXhpIwGdy/8MbC4XIk/Bh6ckY182Zy
C/MSLh+nAgMBAAECggEATpyJ2s0sHJtsCUHlowI3COeS5+jJpn4nbhOYIVX4CeNA
BEK1KPxr/FAQsC2JwtINzhWyiwngm7+pOjIZ7DWD+c2BW7oEdM3Q1t077nxz1zqG
msXz60gyyZYLMnAJPQfzgF1y3gbynKM87UGeT6ADyvaPBVQ6h1ckWOAzfp5ssbs8
QSi+V9K3Fuxm4M/WWBqxIdbIr14jjeJARPvGR5g4eegLYx83AND3ObaubZMSIZ+8
6Ee1jaIV5ji7VyOOHXVwQKIYKBuQfkWaY2cZvL+cfKdmGFw68tbRLSnA/wtZEMZH
4bFgYdXUU4TEb8TRhB8hytSWjpRkAjOTTPQhN8xWCQKBgQD+LcoRmI3tuwQwIXir
VTZBdBY2U8JJ5LkGo0gJEAJlezQ7FVpa8+A9iCvjZVS9Bu5NZ0xTmW8BSwFeVKgc
EWdbqzAsNx7sg+dHalcvoASxs4RJ9DF3pAtcudLov5n1UTpg50JkTdn9+5Uduyii
qE5wdE0GeAyTsdZuo9ddbrPA5QKBgQC4Y2w6Rq0fWNXXxjePHo9wnhn68U+hSsNz
uEkVFUEg3PHLfjNrt/s7KdbM97a67mFvVCJAiAzm7SZkL4VFdQtjbQCmhGIQST5v
DlYNe8zuqFBFr+b4AbTgWbvkJDy9XifwGOqaxj4crQa5pYPkc8rMsO0QLeiuK+Am
UFpamXKxmwKBgC7ECfu2z9Y/pIOehO8xHGxqiXOxcXvbA1f/Ts+sDGTTiEaepSM6
37UyirCqAi9NSScgrGBtSIk6XaQXe16+rP+mvZRFCAGIO1Nec3AlxvdTCjH5JejX
W+fRoMaGCjOioFUX95Uw5bzfPw5bUxyqTtRN8aYRDG9YNxXgO03LgnMpAoGBAI+h
EqsKZsymPF0KEDkxyvYkkYRB+I9hV4KKqJL9rW/V65thwNhFxjM90g5zXymZithX
px6xW6t+S4t64MtL8wUN4ZXURTb+dt23QxzZtLaq8Wx3KulBGw4vmAaMm6u+7kk+
f3D0v2lC9pwh6+1GrVBo+SDDQh56Gu59ZQRxxz/FAoGBAMGYIc5KBF/shh2X1PNa
i8UrUSFbnS7uwu+kq5nxrTXtQoFOtSVQ6K1hYvmGJnomnkgF/ngo0klbovfP4MRI
czOndH1NqJonsPdwsHgQkyipeHCIXAh4nKUAdgIhXbaZQdtNEaWaCK4mii8UEOgA
NcOwQe+R9s0uhGvc7VRGQi+a
-----END PRIVATE KEY-----
"""


# Encode the private key as bytes
CF_PRIVATE_KEY = CF_PRIVATE_KEY.encode("utf-8")

# fix possible escaped newlines
CF_PRIVATE_KEY = CF_PRIVATE_KEY.replace(b"\\n", b"\n")

EXPIRATION_SECONDS = 600
CLOUDFRONT_BASE_URL = "https://d2nusch29puk5t.cloudfront.net"


def get_cf_sign(message):
    private_key = serialization.load_pem_private_key(
        CF_PRIVATE_KEY, password=None, backend=default_backend()
    )
    return private_key.sign(message, padding.PKCS1v15(), hashes.SHA1())


cloudfront_signer = CloudFrontSigner(CF_KEY_PAIR_ID, get_cf_sign)
from dateutil.tz import tzutc
from botocore.compat import OrderedDict


def datetime2timestamp(dt, default_timezone=None):
    epoch = datetime.datetime(1970, 1, 1)
    if dt.tzinfo is None:
        if default_timezone is None:
            default_timezone = tzutc()
        dt = dt.replace(tzinfo=default_timezone)
    d = dt.replace(tzinfo=None) - dt.utcoffset() - epoch
    if hasattr(d, "total_seconds"):
        return d.total_seconds()  # Works in Python 3.6+
    return (d.microseconds + (d.seconds + d.days * 24 * 3600) * 10**6) / 10**6


def build_policy(full_url, date_less_than):
    moment = int(datetime2timestamp(date_less_than))
    condition = OrderedDict({"DateLessThan": {"AWS:EpochTime": moment}})

    mpd_ordered_payload = [("Resource", full_url), ("Condition", condition)]
    custom_policy = {"Statement": [OrderedDict(mpd_ordered_payload)]}
    return json.dumps(custom_policy, separators=(",", ":"))


def get_signed_url(full_url):
    date_less_than = datetime.datetime.now() + datetime.timedelta(
        seconds=EXPIRATION_SECONDS
    )

    custom_policy = build_policy(full_url, date_less_than)
    signed_url = cloudfront_signer.generate_presigned_url(
        full_url, policy=custom_policy
    )

    return signed_url


def fetch_signed_url():
    file_path = Video.objects.first().file_path
    mpd_url = f"{CLOUDFRONT_BASE_URL}/{file_path}"
    video_url = f"{CLOUDFRONT_BASE_URL}/{file_path.replace('.mpd', '_video.mp4')}"
    audio_url = f"{CLOUDFRONT_BASE_URL}/{file_path.replace('.mpd', '_audio.mp4')}"

    # Replace ".mpd" with "*"
    full_url = mpd_url.replace(".mpd", "*")
    cf_signed_url = get_signed_url(full_url)

    query_string = cf_signed_url.split("?")[1]
    query_params = dict(qc.split("=") for qc in query_string.split("&"))
    # response = requests.get(audio_url, params=query_params, stream=True)
    # return response.content
    return query_params


# from _custom.cf_signed_cookie import *
