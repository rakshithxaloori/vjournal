import os
import requests

from src.env import SUBTITLES_PRESIGNED_GET_ENDPOINT, BOSS_SECRET_KEY


def post_subtitles(file_path, token_count, language, summary, title):
    uuid = os.path.basename(file_path).split(".")[0]

    headers = {"X-BOSS-SECRET": BOSS_SECRET_KEY}
    json = {
        "video_id": uuid,
        "token_count": token_count,
        "language_code": language,
        "file_size": os.path.getsize(file_path),
        "summary": summary,
        "title": title,
    }

    response = requests.post(
        SUBTITLES_PRESIGNED_GET_ENDPOINT, headers=headers, json=json
    )

    post_url = response.json()["payload"]["presigned_url"]
    with open(file_path, "rb") as file:
        srt_data = file.read()

    files = {"file": (f"{uuid}.srt", srt_data)}
    response = requests.post(post_url["url"], data=post_url["fields"], files=files)

    return response
