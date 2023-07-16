from django.urls import path

from share import views

urlpatterns = [
    path("create/", views.create_share_view, name="create share view"),
    path("list/", views.get_shares_view, name="get shares view"),
    path("delete/", views.delete_share_view, name="delete share view"),
]
