from django.urls import path

from share import views

urlpatterns = [
    path("create/", views.create_shared_to_view, name="create share view"),
    path("list/", views.list_shared_to_view, name="get shares view"),
    path("delete/", views.delete_shared_to_view, name="delete share view"),
]
