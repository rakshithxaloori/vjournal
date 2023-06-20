from download import get_audio_urls, download_video
from convert import convert_to_mp3


def pipeline():
    audio_urls = get_audio_urls()
    for audio in audio_urls:
        id = audio["id"]
        presigned_url = audio["audio_url"]
        mp4_file_path = download_video(id, presigned_url)

        mp3_file_path = convert_to_mp3(mp4_file_path)
        print(f"Converted {mp4_file_path} to {mp3_file_path}")
