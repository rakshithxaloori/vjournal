import os
import openai


openai.api_key = os.getenv("OPENAI_API_KEY")


def summary(file_path, token_count):
    model_name = "gpt-3.5-turbo"
    if token_count >= 1024 * 3 and token_count <= 15 * 1024:
        model_name = "gpt-3.5-turbo-16k"

    with open(file_path, "r") as f:
        transcription = f.read()
        chat_completion = openai.ChatCompletion.create(
            model=model_name,
            messages=[
                {
                    "role": "system",
                    "content": "You will be provided with a journal entry (delimited with XML tags) about the user's day. Summarize the journal entry in not more than 3 sentences.",
                },
                {
                    "role": "user",
                    "content": f"<journal>{transcription}</journal>",
                },
            ],
        )
    return chat_completion.choices[0].text
