# pull the official base image
FROM public.ecr.aws/s3b3n2t2/python-3.9:latest

# set work directory
WORKDIR /usr/src/app

###########################
# set environment variables
ARG SECRET_KEY
ENV SECRET_KEY "$SECRET_KEY"
ARG ADMIN_URL
ENV ADMIN_URL "$ADMIN_URL"

ARG RDS_USERNAME
ENV RDS_USERNAME "$RDS_USERNAME"
ARG RDS_PASSWORD
ENV RDS_PASSWORD "$RDS_PASSWORD"
ARG RDS_HOSTNAME
ENV RDS_HOSTNAME "$RDS_HOSTNAME"

ARG GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_ID "$GOOGLE_CLIENT_ID"
ARG GOOGLE_CLIENT_SECRET
ENV GOOGLE_CLIENT_SECRET "$GOOGLE_CLIENT_SECRET"

ARG AWS_S3_ACCESS_KEY_ID
ENV AWS_S3_ACCESS_KEY_ID "$AWS_S3_ACCESS_KEY_ID"
ARG AWS_S3_SECRET_ACCESS_KEY
ENV AWS_S3_SECRET_ACCESS_KEY "$AWS_S3_SECRET_ACCESS_KEY"

ARG AWS_MEDIACONVERT_ACCESS_KEY_ID
ENV AWS_MEDIACONVERT_ACCESS_KEY_ID "$AWS_MEDIACONVERT_ACCESS_KEY_ID"
ARG AWS_MEDIACONVERT_SECRET_ACCESS_KEY
ENV AWS_MEDIACONVERT_SECRET_ACCESS_KEY "$AWS_MEDIACONVERT_SECRET_ACCESS_KEY"
ARG AWS_MEDIACONVERT_ROLE_ARN
ENV AWS_MEDIACONVERT_ROLE_ARN "$AWS_MEDIACONVERT_ROLE_ARN"

ARG AWS_SNS_ACCESS_KEY_ID
ENV AWS_SNS_ACCESS_KEY_ID "$AWS_SNS_ACCESS_KEY_ID"
ARG AWS_SNS_SECRET_ACCESS_KEY
ENV AWS_SNS_SECRET_ACCESS_KEY "$AWS_SNS_SECRET_ACCESS_KEY"
ARG AWS_SNS_TOPIC_ARN
ENV AWS_SNS_TOPIC_ARN "$AWS_SNS_TOPIC_ARN"

ARG BOSS_URL
ENV BOSS_URL "$BOSS_URL"
ARG BOSS_SECRET_KEY
ENV BOSS_SECRET_KEY "$BOSS_SECRET_KEY"

ARG STRIPE_SECRET_KEY
ENV STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY"
ARG STRIPE_WEBHOOK_SECRET
ENV STRIPE_WEBHOOK_SECRET "$STRIPE_WEBHOOK_SECRET"
ARG STRIPE_PRICE_ID_USD
ENV STRIPE_PRICE_ID_USD "$STRIPE_PRICE_ID_USD"
ARG STRIPE_PRICE_ID_INR
ENV STRIPE_PRICE_ID_INR "$STRIPE_PRICE_ID_INR"

ARG RESEND_API_KEY
ENV RESEND_API_KEY "$RESEND_API_KEY"
ARG RESEND_WEBHOOK_SIGNING_KEY
ENV RESEND_WEBHOOK_SIGNING_KEY "$RESEND_WEBHOOK_SIGNING_KEY"

ARG CI_CD_STAGE
ENV CI_CD_STAGE "$CI_CD_STAGE"
ARG RDS_DB_NAME
ENV RDS_DB_NAME "$RDS_DB_NAME"
ARG RDS_PORT
ENV RDS_PORT "$RDS_PORT"
ARG AWS_S3_REGION_NAME
ENV AWS_S3_REGION_NAME "$AWS_S3_REGION_NAME"
ARG AWS_S3_CUSTOM_DOMAIN
ENV AWS_S3_CUSTOM_DOMAIN "$AWS_S3_CUSTOM_DOMAIN"
ARG AWS_CDN_BUCKET_NAME
ENV AWS_CDN_BUCKET_NAME "$AWS_CDN_BUCKET_NAME"
ARG AWS_INPUT_BUCKET_NAME
ENV AWS_INPUT_BUCKET_NAME "$AWS_INPUT_BUCKET_NAME"
ARG AWS_OUTPUT_BUCKET_NAME
ENV AWS_OUTPUT_BUCKET_NAME "$AWS_OUTPUT_BUCKET_NAME"
ARG MC_REGION_NAME
ENV MC_REGION_NAME "$MC_REGION_NAME"
ARG MC_ENDPOINT_URL
ENV MC_ENDPOINT_URL "$MC_ENDPOINT_URL"
ARG SNS_REGION_NAME
ENV SNS_REGION_NAME "$SNS_REGION_NAME"
ARG REDIS_URL
ENV REDIS_URL "$REDIS_URL"

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install dependencies
RUN pip3 install --upgrade pip
COPY requirements.txt /usr/src/app/
RUN pip3 install -r requirements.txt

# copy project
COPY . /usr/src/app/

CMD ["celery", "-A", "vjournal", "beat", "-l", "INFO"]
