import boto3


from django.conf import settings


s3_client = boto3.client(
    service_name="s3",
    aws_access_key_id=settings.AWS_S3_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_S3_SECRET_ACCESS_KEY,
    region_name=settings.AWS_S3_REGION_NAME,
)

URL_EXPIRY_SECS = 600  # 10 minutes


def create_presigned_s3_post(file_size, file_path):
    fields = {
        "Content-Type": "multipart/form-data",
    }

    conditions = [
        ["content-length-range", file_size - 10, file_size + 10],
        {"content-type": "multipart/form-data"},
    ]
    expires_in = URL_EXPIRY_SECS

    url = s3_client.generate_presigned_post(
        Bucket=settings.AWS_STORAGE_BUCKET_NAME,
        Key=file_path,
        Fields=fields,
        Conditions=conditions,
        ExpiresIn=expires_in,
    )
    return url
