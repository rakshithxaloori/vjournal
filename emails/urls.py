from django.urls import path

from emails import views

urlpatterns = [
    path("webhook/", views.resend_webhook_view, name="resend webhook"),
]
