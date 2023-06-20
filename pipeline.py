from src.download import get_audio_urls, download_video
from src.convert import convert_to_mp3
from src.transcribe import transcribe_audio


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
        subtitle_filepath, language = transcribe_audio(mp3_file_path)
        print(f"Transcribed {mp3_file_path} to {subtitle_filepath} in {language}")
