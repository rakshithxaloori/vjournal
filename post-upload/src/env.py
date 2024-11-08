import os
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.


BOSS_ENDPOINT = os.environ["BOSS_ENDPOINT"]
BOSS_SECRET_KEY = os.environ["BOSS_SECRET_KEY"]
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]

AUDIO_GET_ENDPOINT = f"{BOSS_ENDPOINT}/audios/get/"
SUBTITLES_PRESIGNED_GET_ENDPOINT = f"{BOSS_ENDPOINT}/subtitles/post/"
