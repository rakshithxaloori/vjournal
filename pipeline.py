from src.download import get_audio_urls, download_video
from src.convert import convert_to_mp3
from src.transcribe import transcribe_audio
from src.token_count import get_token_count
from src.summary import get_summary
from src.post import post_subtitles


def pipeline():
    audio_urls = get_audio_urls()
    for audio in audio_urls:
        id = audio["id"]
        presigned_url = audio["audio_url"]
        # Download
        mp4_file_path = download_video(id, presigned_url)
        print(f"Downloaded {mp4_file_path}")

        # Convert
        mp3_file_path = convert_to_mp3(mp4_file_path)
        print(f"Converted {mp4_file_path} to {mp3_file_path}")

        # Transcribe
        subtitle_filepath, transcription, language = transcribe_audio(mp3_file_path)
        print(f"Transcribed {mp3_file_path} to {subtitle_filepath} in {language}")

        # Token Count
        token_count = get_token_count(transcription)
        print(f"Token count for {subtitle_filepath} is {token_count}")

        # Summary
        summary = get_summary(transcription, token_count)
        print(f"Summary for {subtitle_filepath} is '{summary}'")

        # Post
        response = post_subtitles(subtitle_filepath, token_count, language, summary)
        print(f"Posted {subtitle_filepath} to {response.url}")
