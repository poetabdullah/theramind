# backend/api/urls.py
from django.urls import path
from .views import ArticleDetailView, PatientStoryDetailView
from .views import submit_content

urlpatterns = [
    path("article/<int:pk>/", ArticleDetailView.as_view(), name="article-detail"),
    path(
        "patient-story/<int:pk>/",
        PatientStoryDetailView.as_view(),
        name="patient-story-detail",
    ),
    path("submit-content/", submit_content, name="submit_content"),
]
