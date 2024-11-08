import os
import requests

from src.env import AUDIO_GET_ENDPOINT, BOSS_SECRET_KEY


# Create directory for mp4s if it doesn't exist
output_dir = "mp4s"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)


def download_video(uuid, presigned_url):
    file_name = f"{uuid}.mp4"
    file_path = os.path.join(output_dir, file_name)

    response = requests.get(presigned_url)
    with open(file_path, "wb") as file:
        file.write(response.content)

    return file_path


def get_audio_urls():
    headers = {
        "X-BOSS-SECRET": BOSS_SECRET_KEY,
    }

    response = requests.get(AUDIO_GET_ENDPOINT, headers=headers)
    audios = response.json()["payload"]["audios"]

    return audios
