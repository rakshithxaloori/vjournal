from django.urls import path

from account import views

urlpatterns = [
    path("get/", views.get_account_view, name="get account view"),
]
