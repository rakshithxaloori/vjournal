from django.urls import path

from boss import views

urlpatterns = [
    path("audios/get/", views.get_audio_urls_view, name="get-audio-urls"),
]
