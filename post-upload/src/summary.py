import os
import json
import openai


openai.api_key = os.getenv("OPENAI_API_KEY")


def get_summary(transcription, token_count):
    model_name = "gpt-3.5-turbo"
    if token_count >= 1024 * 3 and token_count <= 15 * 1024:
        model_name = "gpt-3.5-turbo-16k"

    chat_completion = openai.ChatCompletion.create(
        model=model_name,
        messages=[
            {
                "role": "system",
                "content": """
                You will be provided with your journal entry (delimited with XML tags) about your day. Summarize the journal entry in not more than 3 sentences. And also generate a title of not more than 100 characters. Make the summary in first person as "I".

                Produce the output as JSON. The format should be as follows:
                ```
                {
                summary: "The text summary in not more than 3 sentences.",
                title: "The title of the entry in not more than 100 characters"
                }
                ```
                """,
            },
            {
                "role": "user",
                "content": f"<journal>{transcription}</journal>",
            },
        ],
    )
    json_data = json.loads(chat_completion["choices"][0]["message"]["content"])
    return json_data["summary"], json_data["title"]


# print(chat_completion)
# {
#     "id": "chatcmpl-7TYhRNIH0YePTnyYSsEmTKloKC8Ap",
#     "object": "chat.completion",
#     "created": 1687279253,
#     "model": "gpt-3.5-turbo-0301",
#     "usage": {"prompt_tokens": 90, "completion_tokens": 22, "total_tokens": 112},
#     "choices": [
#         {
#             "message": {
#                 "role": "assistant",
#                 "content": "The user forgot to do migrations but managed to fix the issue. They tested to confirm if it worked successfully.",
#             },
#             "finish_reason": "stop",
#             "index": 0,
#         }
#     ],
# }
