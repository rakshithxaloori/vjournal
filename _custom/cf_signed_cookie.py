import datetime
import requests

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from botocore.signers import CloudFrontSigner

from video.models import Video

import os


CF_KEY_PAIR_ID = os.environ.get("AWS_CF_KEY_PAIR_ID")
CF_PRIVATE_KEY = os.environ.get("AWS_CF_PRIVATE_KEY")


# Encode the private key as bytes
CF_PRIVATE_KEY = CF_PRIVATE_KEY.encode("utf-8")

# fix possible escaped newlines
CF_PRIVATE_KEY = CF_PRIVATE_KEY.replace(b"\\n", b"\n")

EXPIRATION_SECONDS = 600
AWS_OUTPUT_DOMAIN = os.environ["AWS_OUTPUT_DOMAIN"]
CLOUDFRONT_BASE_URL = f"https://{AWS_OUTPUT_DOMAIN}"


def get_cf_sign(message):
    private_key = serialization.load_pem_private_key(
        CF_PRIVATE_KEY, password=None, backend=default_backend()
    )
    return private_key.sign(message, padding.PKCS1v15(), hashes.SHA1())


cloudfront_signer = CloudFrontSigner(CF_KEY_PAIR_ID, get_cf_sign)


def fetch_signed_url():
    file_path = Video.objects.first().file_path
    mpd_url = f"{CLOUDFRONT_BASE_URL}/{file_path}"
    video_url = f"{CLOUDFRONT_BASE_URL}/{file_path.replace('.mpd', '_video.mp4')}"
    audio_url = f"{CLOUDFRONT_BASE_URL}/{file_path.replace('.mpd', '_audio.mp4')}"

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

    response = requests.get(audio_url, cookies=cookie, stream=True)

    if response.ok:
        return cookie
    else:
        print(response.reason)
        return None


# from _custom.cf_signed_cookie import *
