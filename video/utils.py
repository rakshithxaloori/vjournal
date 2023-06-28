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


def create_presigned_s3_post(file_size, file_path):
    EXPIRES_IN = 60 * 60
    fields = {
        "Content-Type": "multipart/form-data",
    }

    conditions = [
        ["content-length-range", file_size - 10, file_size + 10],
        {"content-type": "multipart/form-data"},
    ]

    url = s3_client.generate_presigned_post(
        Bucket=settings.AWS_INPUT_BUCKET_NAME,
        Key=file_path,
        Fields=fields,
        Conditions=conditions,
        ExpiresIn=EXPIRES_IN,
    )
    return url


def create_presigned_url(file_path):
    EXPIRES_IN = 2 * 60 * 60
    url = s3_client.generate_presigned_url(
        ClientMethod="get_object",
        Params={"Bucket": settings.AWS_OUTPUT_BUCKET_NAME, "Key": file_path},
        ExpiresIn=EXPIRES_IN,
    )
    return url


############################################################################################################
mediaconvert_client = boto3.client(
    service_name="mediaconvert",
    aws_access_key_id=settings.AWS_MEDIACONVERT_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_MEDIACONVERT_SECRET_ACCESS_KEY,
    region_name=settings.AWS_MEDIACONVERT_REGION_NAME,
    endpoint_url=settings.AWS_MEDIACONVERT_ENDPOINT_URL,
    verify=False,
)


def create_mediaconvert_job(video_id):
    video = Video.objects.get(id=video_id)

    source = f"s3://{settings.AWS_INPUT_BUCKET_NAME}/{video.file_path}"
    video_destination = f"s3://{settings.AWS_OUTPUT_BUCKET_NAME}/{video.file_path}/"

    thumbnail_path = video.file_path.replace("videos", "thumbnails")
    thumbnail_destination = f"s3://{settings.AWS_CDN_BUCKET_NAME}/{thumbnail_path}/"

    job_settings["Inputs"][0]["FileInput"] = source
    job_settings["OutputGroups"][0]["OutputGroupSettings"]["DashIsoGroupSettings"][
        "Destination"
    ] = video_destination
    job_settings["OutputGroups"][1]["OutputGroupSettings"]["FileGroupSettings"][
        "Destination"
    ] = thumbnail_destination

    iw = video.input_width_in_px
    ih = video.input_height_in_px

    if iw / ih <= 16 / 9:
        ow = iw
        oh = iw * 9 / 16
        x_offset = 0
        y_offset = int((ih - oh) / 2 // 2 * 2)  # Ensure y_offset is a multiple of 2

    elif iw / ih > 16 / 9:
        ow = ih * 16 / 9
        oh = ih
        x_offset = int((iw - ow) / 2 // 2 * 2)
        y_offset = 0

    ow = int(ow)
    oh = int(oh)
    x_offset = int(x_offset)
    y_offset = int(y_offset)

    resolution = {
        "Width": ow,
        "Height": oh,
    }

    job_settings["OutputGroups"][0]["Outputs"][0]["VideoDescription"].update(resolution)
    job_settings["OutputGroups"][1]["Outputs"][0]["VideoDescription"].update(resolution)

    crop = {
        "Width": ow,
        "Height": oh,
        "X": x_offset,
        "Y": y_offset,
    }
    job_settings["OutputGroups"][0]["Outputs"][0]["VideoDescription"]["Crop"].update(
        crop
    )
    job_settings["OutputGroups"][1]["Outputs"][0]["VideoDescription"]["Crop"].update(
        crop
    )

    response = mediaconvert_client.create_job(
        Role=settings.AWS_MEDIACONVERT_ROLE_ARN,
        Settings=job_settings,
        UserMetadata={"video_id": video_id},
    )

    video.job_id = response["Job"]["Id"]
    video.status = Video.PROCESSING
    video.save(update_fields=["job_id", "status"])


############################################################################################################
sns_client = boto3.client(
    service_name="sns",
    aws_access_key_id=settings.AWS_SNS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SNS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_SNS_REGION_NAME,
)
