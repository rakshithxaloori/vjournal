import os
import whisper
from whisper.utils import get_writer


# What if the audio is in a different language?
# prompt = "Umm, let me think like, hmm... Okay, here's what I'm, like, thinking."
model = whisper.load_model("small")


# Create directory for subtitles if it doesn't exist
output_dir = "subtitles"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)


def transcribe_audio(audio_file_path):
    result = model.transcribe(audio_file_path)
    # Save segments to file
    audio_filename = os.path.basename(audio_file_path)
    id = os.path.basename(audio_file_path).split(".")[0]
    subtitle_filename = f"{id}.srt"
    subtitle_file_path = os.path.join(output_dir, subtitle_filename)

    writer = get_writer("srt", output_dir)  # get srt writer for the current directory
    writer(result, audio_filename)  # add empty dictionary for 'options'

    return subtitle_file_path, result["text"], result["language"]


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
