import whisper


# What if the audio is in a different language?
# prompt = "Umm, let me think like, hmm... Okay, here's what I'm, like, thinking."
model = whisper.load_model("small")


def transcibe(audio_file_path):
    result = model.transcribe(audio_file_path)
    # Save text to file
    # Save segments and language to database
    return result
