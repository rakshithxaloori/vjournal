import boto3


from django.conf import settings


from video.models import Video
from video.job import job_settings

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
        Bucket=settings.AWS_CDN_BUCKET_NAME,
        Key=file_path,
        Fields=fields,
        Conditions=conditions,
        ExpiresIn=expires_in,
    )
    return url


############################################################################################################
mediaconvert_client = boto3.client(
    service_name="mediaconvert",
    aws_access_key_id=settings.AWS_MEDIACONVERT_KEY_ID,
    aws_secret_access_key=settings.AWS_MEDIACONVERT_SECRET_ACCESS_KEY,
    region_name=settings.AWS_MEDIACONVERT_REGION_NAME,
    endpoint_url=settings.AWS_MEDIACONVERT_ENDPOINT_URL,
    verify=False,
)


def create_mediaconvert_job(video_id):
    video = Video.objects.get(id=video_id)

    source_path = f"s3://{settings.AWS_CDN_BUCKET_NAME}/{video.file_path}"
    destination_path = f"s3://{settings.AWS_SECRET_BUCKET_NAME}/{video.file_path}/"

    job_settings["Inputs"][0]["FileInput"] = source_path
    job_settings["OutputGroups"][0]["OutputGroupSettings"]["DashIsoGroupSettings"][
        "Destination"
    ] = destination_path

    response = mediaconvert_client.create_job(
        Role=settings.AWS_MEDIACONVERT_ROLE_ARN,
        Settings=job_settings,
        UserMetadata={"video_id": video_id},
    )

    video.job_id = response["Job"]["Id"]
    video.status = Video.PROCESSING
    video.save(update_fields=["job_id", "status"])
