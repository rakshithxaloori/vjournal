import tiktoken


encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")


def token_count(file_path):
    with open(file_path, "r") as f:
        text = f.read()
    tokens = encoding.encode(text)
    return len(tokens)
