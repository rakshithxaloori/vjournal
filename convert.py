import os
import ffmpeg


def convert_to_mp3(file_path):
    # Convert the mp3 at file_path to an mp3 at mp3s directory
    file_name = os.path.basename(file_path).split(".")[0]
    output_file_path = os.path.join("mp3s", f"{file_name}.mp3")
    ffmpeg.input(file_path).output(output_file_path).run()
    return output_file_path
