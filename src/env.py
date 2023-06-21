import os
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.


AUDIO_GET_ENDPOINT = os.environ["AUDIO_GET_ENDPOINT"]
BOSS_SECRET_KEY = os.environ["BOSS_SECRET_KEY"]
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
SUBTITLES_PRESIGNED_GET_ENDPOINT = os.environ["SUBTITLES_PRESIGNED_GET_ENDPOINT"]
