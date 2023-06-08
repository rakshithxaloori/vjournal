from django.urls import path

from video import views

urlpatterns = [
    path("upload/", views.upload_video_view, name="get upload view"),
    path("process/", views.process_video_view, name="process video view"),
]
