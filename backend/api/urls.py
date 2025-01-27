from django.urls import path
from .views import create_user, get_user

urlpatterns = [
    path("create_user/", create_user, name="create_user"),
    path("get_user/<str:user_id>/", get_user, name="get_user"),
]
