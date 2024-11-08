import tiktoken


encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")


def get_token_count(text):
    tokens = encoding.encode(text)
    return len(tokens)
