import os
import ffmpeg

# Create directory for mp3s if it doesn't exist
output_dir = "mp3s"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)


def convert_to_mp3(file_path):
    # Convert the mp3 at file_path to an mp3 at mp3s directory
    file_name = os.path.basename(file_path).split(".")[0]
    output_file_path = os.path.join(output_dir, f"{file_name}.mp3")
    ffmpeg.input(file_path).output(output_file_path).run(overwrite_output=True)
    return output_file_path
