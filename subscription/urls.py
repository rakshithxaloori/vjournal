from django.urls import path

from subscription import views

urlpatterns = [
    path(
        "subscription/check/", views.check_subscription_view, name="check subscription"
    ),
    path("webhook/", views.webhook, name="stripe webhook"),
]
