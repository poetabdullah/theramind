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
    calculate_weekly_performance,
    create_treatment_plan,
    terminate_treatment_plan,
    delete_action_from_version,
    delete_goal_from_version,
    update_current_week_actions,
    get_treatment_plan_version,
    get_treatment_plan_versions,
    get_treatment_plans_by_user,
    mark_action_complete,
    get_treatment_plan,
    validate_content,
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
    path("articles/<str:article_id>/", get_article, name="get_article"),
    path("stories/<str:story_id>/", get_patient_story, name="get_patient_story"),
    path("articles/<str:article_id>/delete/", delete_article, name="delete_article"),
    path(
        "stories/<str:story_id>/delete/",
        delete_patient_story,
        name="delete_patient_story",
    ),
    path("test-cors/", test_cors, name="test-cors"),
    # -------ML Model-----------------
    path("validate-content/", validate_content, name="validate-content"),
    # ------ TREATMENT PLAN ----------
    # Create and manage treatment plans
    path("treatment/create/", create_treatment_plan, name="create_treatment_plan"),
    path(
        "treatment/<str:plan_id>/terminate/",
        terminate_treatment_plan,
        name="terminate-treatment",
    ),
    # Retrieve plans by user (doctor/patient)
    path(
        "treatment/user/<str:role>/<str:email>/",
        get_treatment_plans_by_user,
        name="get_treatment_plans_by_user",
    ),
    path(
        "treatment/<str:plan_id>/",
        get_treatment_plan,
        name="get_treatment_plan",
    ),
    # Plan versioning
    path(
        "treatment/<str:plan_id>/versions/",
        get_treatment_plan_versions,
        name="get_treatment_plan_versions",
    ),
    path(
        "treatment/<str:plan_id>/version/<str:version_id>/",
        get_treatment_plan_version,
        name="get_treatment_plan_version",
    ),
    path(
        "treatment/<str:plan_id>/version/<str:version_id>/update/",
        update_current_week_actions,
        name="update_current_week_actions",
    ),
    # Action management
    path(
        "treatment/<str:plan_id>/version/<str:version_id>/complete/",
        mark_action_complete,
        name="mark_action_complete",
    ),
    path(
        "treatment/<str:plan_id>/version/<str:version_id>/delete-action/",
        delete_action_from_version,
        name="delete_action_from_version",
    ),
    path(
        "treatment/<str:plan_id>/version/<str:version_id>/delete-goal/",
        delete_goal_from_version,
        name="delete_goal_from_version",
    ),
    # Performance
    path(
        "treatment/<str:plan_id>/version/<str:version_id>/calculate-score/",
        calculate_weekly_performance,
        name="calculate_weekly_performance",
    ),
]
