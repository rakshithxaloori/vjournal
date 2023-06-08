from django.urls import path

from video import views

urlpatterns = [
    path("upload/", views.upload_video_view, name="get upload view"),
    path("process/", views.process_video_view, name="process video view"),
    path("list/", views.get_videos_view, name="get videos view"),
    # path(
    #     "detail/<str:video_id>/",
    #     views.get_video_detail_view,
    #     name="get video detail view",
    # ),
    path("sns/", views.mediaconvert_sns_view, name="mediaconvert sns view"),
]
