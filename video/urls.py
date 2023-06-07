from django.urls import path

from video import views

urlpatterns = [path("upload/", views.get_upload_view, name="get upload view")]
