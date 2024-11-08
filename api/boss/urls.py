from django.urls import path

from boss import views

urlpatterns = [
    path("audios/get/", views.get_audio_urls_view, name="get-audio-urls"),
    path(
        "subtitles/post/",
        views.get_subtitles_presigned_view,
        name="get-subtitles-presigned",
    ),
]
