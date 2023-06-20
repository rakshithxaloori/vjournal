import os
import whisper


# What if the audio is in a different language?
# prompt = "Umm, let me think like, hmm... Okay, here's what I'm, like, thinking."
model = whisper.load_model("small")


# Create directory for subtitles if it doesn't exist
if not os.path.exists("subtitles"):
    os.makedirs("subtitles")


def transcribe_audio(audio_file_path):
    result = model.transcribe(audio_file_path)
    # Save segments to file
    id = os.path.basename(audio_file_path).split(".")[0]
    subtitle_file_path = os.path.join("subtitles", f"{id}.srt")
    with open(subtitle_file_path, "w") as file:
        for segment in result["segments"]:
            file.write(
                f"{segment['id']}\n"
                f"{segment['start']} --> {segment['end']}\n"
                f"{segment['text'].strip()}\n\n"
            )

    return subtitle_file_path, result["language"]


# print(result)
# {
#     "text": " Hmm, okay, I forgot to do the migrations, so hopefully now it has refixed. Let's see, I think it should work now.",
#     "segments": [
#         {
#             "id": 0,
#             "seek": 0,
#             "start": 0.0,
#             "end": 10.0,
#             "text": " Hmm, okay, I forgot to do the migrations, so hopefully now it has refixed.",
#             "tokens": [
#                 50364,
#                 8239,
#                 11,
#                 1392,
#                 11,
#                 286,
#                 5298,
#                 281,
#                 360,
#                 264,
#                 6186,
#                 12154,
#                 11,
#                 370,
#                 4696,
#                 586,
#                 309,
#                 575,
#                 1895,
#                 40303,
#                 13,
#                 50864,
#             ],
#             "temperature": 0.0,
#             "avg_logprob": -0.3743502034081353,
#             "compression_ratio": 1.1414141414141414,
#             "no_speech_prob": 0.11348733305931091,
#         },
#         {
#             "id": 1,
#             "seek": 0,
#             "start": 10.0,
#             "end": 13.0,
#             "text": " Let's see, I think it should work now.",
#             "tokens": [
#                 50864,
#                 961,
#                 311,
#                 536,
#                 11,
#                 286,
#                 519,
#                 309,
#                 820,
#                 589,
#                 586,
#                 13,
#                 51014,
#             ],
#             "temperature": 0.0,
#             "avg_logprob": -0.3743502034081353,
#             "compression_ratio": 1.1414141414141414,
#             "no_speech_prob": 0.11348733305931091,
#         },
#     ],
#     "language": "en",
# }
