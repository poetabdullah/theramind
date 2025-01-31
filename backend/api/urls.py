# api/urls.py

from django.urls import path
from .views import (
    get_articles,
    get_patient_stories,
    submit_content,
    create_article,
    create_patient_story,
    update_article,
    update_patient_story,
    delete_article,
    delete_patient_story,
)

urlpatterns = [
    path("get_articles/", get_articles, name="get_articles"),
    path("get_patient_stories/", get_patient_stories, name="get_patient_stories"),
    path("submit_content/", submit_content, name="submit_content"),
    path("create_article/", create_article, name="create_article"),
    path("create_patient_story/", create_patient_story, name="create_patient_story"),
    path("update_article/<str:article_id>/", update_article, name="update_article"),
    path(
        "update_patient_story/<str:story_id>/",
        update_patient_story,
        name="update_patient_story",
    ),
    path("delete_article/<str:article_id>/", delete_article, name="delete_article"),
    path(
        "delete_patient_story/<str:story_id>/",
        delete_patient_story,
        name="delete_patient_story",
    ),
]
