from django.urls import path

from authentication import views

urlpatterns = [
    path("signout/", views.logout_view, name="signout"),
    path("signin/", views.user_signup_view, name="signin"),
    path("open/", views.last_open_view, name="last open"),
]
