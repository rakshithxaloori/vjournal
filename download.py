import os
import requests


from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.


AUDIO_GET_ENDPOINT = os.environ["AUDIO_GET_ENDPOINT"]
BOSS_SECRET_KEY = os.environ["BOSS_SECRET_KEY"]


def download_video(uuid, presigned_url):
    file_name = f"{uuid}.mp4"
    file_path = os.path.join("mp4s", file_name)

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
