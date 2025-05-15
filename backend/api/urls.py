"""
Exposes the backend functionality (like CRUD for articles/stories) for frontend by defining the following for the views.py file:

- GET routes (fetching data)

- POST routes (creating data)

- PUT routes (updating data)

- DELETE routes (removing data)
"""

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
    get_article,
    get_patient_story,
    test_cors,
)
from . import views

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
    path("articles/<str:article_id>/", get_article, name="get_article"),
    path("stories/<str:story_id>/", get_patient_story, name="get_patient_story"),
    path("articles/<str:article_id>/delete/", delete_article, name="delete_article"),
    path(
        "stories/<str:story_id>/delete/",
        delete_patient_story,
        name="delete_patient_story",
    ),
    path("test-cors/", test_cors, name="test-cors"),
    # remove api, views. and book appointment will get an id
    path("api/book-appointment/", views.book_appointment, name="book-appointment"),
]
