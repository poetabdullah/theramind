# backend/api/urls.py
from django.urls import path
from .views import (
    ArticleDetailView,
    PatientStoryDetailView,
    submit_content,
    get_articles,
    get_patient_stories,
    get_article,
    get_patient_story,
    create_article,
    create_patient_story,
    update_article,
    update_patient_story,
    delete_article,
    delete_patient_story,
)

urlpatterns = [
    # Fetch a single article/story (article ID is an integer)
    path("article/<int:pk>/", ArticleDetailView.as_view(), name="article-detail"),
    path(
        "patient-story/<int:pk>/",
        PatientStoryDetailView.as_view(),
        name="patient-story-detail",
    ),
    # Fetch multiple articles/stories
    path("articles/", get_articles, name="get-articles"),
    path("patient-stories/", get_patient_stories, name="get-patient-stories"),
    # Fetch a specific article/story by ID (article ID and story ID are both strings)
    path("articles/get/<str:article_id>/", get_article, name="get-article"),
    path(
        "patient-stories/get/<str:story_id>/",
        get_patient_story,
        name="get-patient-story",
    ),
    # Create new articles/stories (Authenticated users only)
    path("articles/create/", create_article, name="create-article"),
    path("patient-stories/create/", create_patient_story, name="create-patient-story"),
    # Update articles/stories (Only the author can update)
    path("articles/update/<str:article_id>/", update_article, name="update-article"),
    path(
        "patient-stories/update/<str:story_id>/",
        update_patient_story,
        name="update-patient-story",
    ),
    # Delete articles/stories (Only the author can delete)
    path("articles/delete/<str:article_id>/", delete_article, name="delete-article"),
    path(
        "patient-stories/delete/<str:story_id>/",
        delete_patient_story,
        name="delete-patient-story",
    ),
]
