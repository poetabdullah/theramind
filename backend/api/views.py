# backend/api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Article, PatientStory
from .serializers import ArticleSerializer, PatientStorySerializer

from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from theramind_backend.config import db, initialize_firebase
from google.cloud import firestore
import firebase_admin


from datetime import datetime


from firebase_admin import firestore
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from utils.firestore import add_document


from firebase_admin import credentials
from firebase_admin import credentials, initialize_app
from google.oauth2 import service_account
from django.views.decorators.csrf import csrf_exempt

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from utils.ml_model import final_mh_decision

import traceback
from google.oauth2 import service_account

from google.auth.transport.requests import Request
import requests
import json

import traceback
import os

import logging

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from google.auth import default as google_auth_default

from dotenv import load_dotenv

from google import genai
from google.genai import types
import base64  # Not explicitly used in your snippet, but keep if needed elsewhere


load_dotenv()


logger = logging.getLogger(__name__)

# This ensures Firebase is only initialized once (even if views are imported multiple times)
if not firebase_admin._apps:
    cred_path = os.environ.get(
        "FIREBASE_APPLICATION_CREDENTIALS", "secrets/firebase_admin_credentials.json"
    )
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

    firebase_admin.initialize_app(credentials)

db = firestore.client()


@api_view(["POST"])
def validate_content(request):
    html = request.data.get("content", "").strip()

    if not html:
        return Response({"error": "No content."}, status=400)

    try:
        res = final_mh_decision(html)
        if not isinstance(res, dict):
            raise ValueError("Model response is not a dictionary")

        required_keys = [
            "valid",
            "confidence_score",
            "confidence_pass",
            "tta_pass",
            "override_pass",
            "votes",
            "note",
        ]
        for key in required_keys:
            if key not in res:
                raise KeyError(f"Missing key in model response: {key}")

        return Response(res, status=200 if res["valid"] else 422)

    except Exception as e:
        # Print to console/logs
        print("❌ AI validation error:", str(e))
        traceback.print_exc()  # <- This will show full traceback in logs
        return JsonResponse({"error": str(e)}, status=500)


# Opens up the detail view of the specific article / patient story
class ArticleDetailView(APIView):
    def get(self, request, pk, format=None):
        try:
            article = Article.objects.get(id=pk)
            serializer = ArticleSerializer(article)
            return Response(serializer.data)
        except Article.DoesNotExist:
            return Response(
                {"error": "Article not found"}, status=status.HTTP_404_NOT_FOUND
            )


class PatientStoryDetailView(APIView):
    def get(self, request, pk, format=None):
        try:
            patient_story = PatientStory.objects.get(id=pk)
            serializer = PatientStorySerializer(patient_story)
            return Response(serializer.data)
        except PatientStory.DoesNotExist:
            return Response(
                {"error": "Patient Story not found"}, status=status.HTTP_404_NOT_FOUND
            )


@api_view(["POST"])
def submit_content(request):
    """
    Handles submission of articles by doctors and patient stories by patients.
    """
    try:
        user_email = request.data.get("email")
        title = request.data.get("title")
        content = request.data.get("content")
        tags = request.data.get("tags", [])

        if not user_email or not title or not content:
            return Response({"error": "Missing required fields."}, status=400)

        # Check if user is logged in
        user_doc = db.collection("logged_in_users").document(user_email).get()
        if not user_doc.exists:
            return Response({"error": "User not logged in."}, status=403)

        user_data = user_doc.to_dict()
        author_name = user_data.get("name", "Unknown Author")

        # Check if the user is a doctor
        doctor_doc = db.collection("doctors").document(user_email).get()
        if doctor_doc.exists:
            collection = "articles"
            message = "Article submitted successfully."
        else:
            # Check if the user is a patient
            patient_doc = db.collection("patients").document(user_email).get()
            if patient_doc.exists:
                collection = "patient_stories"
                message = "Patient story submitted successfully."
            else:
                return Response(
                    {"error": "User is neither a doctor nor a patient."}, status=403
                )

        # Prepare document data
        content_data = {
            "title": title,
            "content": content,
            "tags": tags,
            "author_name": author_name,
            "author_email": user_email,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

        # Store in Firestore
        db.collection(collection).document().set(content_data)

        return Response({"message": message, "collection": collection}, status=201)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# Custom Pagination that limits the 10 articles/stories per page for better readability
class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


# Request to get the articles by recency in paginated format for the list page
@api_view(["GET"])
def get_articles(request):
    """Retrieve paginated articles, with optional filtering by tag."""
    print(f"Received request: {request.GET}")
    tag = request.GET.get("tag", None)
    page = int(request.GET.get("page", 1))
    page_size = int(request.GET.get("page_size", 10))

    articles_ref = db.collection("articles").order_by(
        "date_time", direction=firestore.Query.DESCENDING
    )

    if tag:
        articles_ref = articles_ref.where("tags", "array_contains", tag)

    docs = articles_ref.stream()
    articles = [doc.to_dict() | {"id": doc.id} for doc in docs]

    total_pages = (len(articles) + page_size - 1) // page_size  # Manual pagination
    start_index = (page - 1) * page_size
    end_index = start_index + page_size

    return Response(
        {
            "results": articles[start_index:end_index],
            "total_pages": total_pages,
            "current_page": page,
        }
    )


# # Request to get the patient stories by recency in paginated format for the list page
@api_view(["GET"])
def get_patient_stories(request):
    """Retrieve paginated patient stories, with optional filtering by tag."""
    print(f"Received request: {request.GET}")
    tag = request.GET.get("tag", None)
    page = int(request.GET.get("page", 1))
    page_size = int(request.GET.get("page_size", 10))

    stories_ref = db.collection("patient_stories").order_by(
        "date_time", direction=firestore.Query.DESCENDING
    )

    if tag:
        stories_ref = stories_ref.where("tags", "array_contains", tag)

    docs = stories_ref.stream()
    stories = [doc.to_dict() | {"id": doc.id} for doc in docs]

    total_pages = (len(stories) + page_size - 1) // page_size  # Manual pagination
    start_index = (page - 1) * page_size
    end_index = start_index + page_size

    return Response(
        {
            "results": stories[start_index:end_index],
            "total_pages": total_pages,
            "current_page": page,
        }
    )


# Get an individual article requested
@api_view(["GET"])
def get_article(request, article_id):
    """Retrieve a single article by ID."""
    article_ref = db.collection("articles").document(article_id)
    article = article_ref.get()

    if article.exists:
        return Response(article.to_dict())
    return Response({"error": "Article not found"}, status=404)


# Get an individual patient story requested
@api_view(["GET"])
@csrf_exempt
def get_patient_story(request, story_id):
    """Retrieve a single patient story by ID."""
    try:
        story_ref = db.collection("patient_stories").document(story_id)
        story = story_ref.get()

        if story.exists:
            data = story.to_dict()
            response = JsonResponse(data)
            response["Access-Control-Allow-Origin"] = "http://localhost:3000"
            response["Access-Control-Allow-Credentials"] = "true"
            return response
        return JsonResponse({"error": "Story not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# Create a new article
@api_view(["POST"])
def create_article(request):
    """Create a new article."""
    data = request.data
    new_article_ref = db.collection("articles").document()

    article_data = {
        "title": data.get("title"),
        "content": data.get("content"),
        "author_name": data.get("author_name"),
        "author_email": data.get("author_email"),
        "date_time": firestore.SERVER_TIMESTAMP,
        "tags": data.get("tags", []),
    }

    new_article_ref.set(article_data)
    return Response(
        {"message": "Article created successfully", "id": new_article_ref.id}
    )


# Create a new patient story
@api_view(["POST"])
def create_patient_story(request):
    """Create a new patient story."""
    data = request.data
    new_story_ref = db.collection("patient_stories").document()

    story_data = {
        "title": data.get("title"),
        "content": data.get("content"),
        "author_name": data.get("author_name"),
        "author_email": data.get("author_email"),
        "date_time": firestore.SERVER_TIMESTAMP,
        "tags": data.get("tags", []),
    }

    new_story_ref.set(story_data)
    return Response({"message": "Story created successfully", "id": new_story_ref.id})


# Update the existing article from the DB
@api_view(["PUT"])
def update_article(request, article_id):
    """Update an article."""
    article_ref = db.collection("articles").document(article_id)
    article = article_ref.get()

    if not article.exists:
        return Response({"error": "Article not found"}, status=404)

    updated_data = request.data
    article_ref.update(updated_data)

    return Response({"message": "Article updated successfully"})


# Update the existing patient stroy from the DB
@api_view(["PUT"])
def update_patient_story(request, story_id):
    """Update a patient story."""
    story_ref = db.collection("patient_stories").document(story_id)
    story = story_ref.get()

    if not story.exists:
        return Response({"error": "Story not found"}, status=404)

    updated_data = request.data
    story_ref.update(updated_data)

    return Response({"message": "Story updated successfully"})


# Delete the specific article on the author's request
@api_view(["DELETE"])
def delete_article(request, article_id):
    """Delete an article."""
    article_ref = db.collection("articles").document(article_id)
    article = article_ref.get()

    if not article.exists:
        return Response({"error": "Article not found"}, status=404)

    article_ref.delete()
    return Response({"message": "Article deleted successfully"})


# Delete the specific patient story on the author's request
@api_view(["DELETE"])
def delete_patient_story(request, story_id):
    """Delete a patient story."""
    story_ref = db.collection("patient_stories").document(story_id)
    story = story_ref.get()

    if not story.exists:
        return Response({"error": "Story not found"}, status=404)

    story_ref.delete()
    return Response({"message": "Story deleted successfully"})


@api_view(["GET"])
def test_cors(request):
    return Response({"message": "CORS is working!"})


# --------------------------- TREATMENT PLAN VIEWS --------------------------------


@api_view(["POST"])
def create_treatment_plan(request):
    """
    Create a new treatment plan with initial version, or edit existing active plan if exists.
    Conditions:
    - If an active treatment plan exists for the patient (is_terminated == False), do NOT create new.
    - Instead, only allow editing if the doctor_email matches the creator.
    - When editing, create a new version with updated goals, set end_date of previous version.
    """
    data = request.data
    try:
        doctor_email = data.get("doctor_email")
        doctor_name = data.get("doctor_name")
        patient_email = data.get("patient_email")
        patient_name = data.get("patient_name")
        goals = data.get("goals", [])

        if not all([doctor_email, doctor_name, patient_email, patient_name, goals]):
            return Response({"error": "Missing required fields"}, status=400)

        # Check if active plan exists for this patient
        plans_query = (
            db.collection("treatment_plans")
            .where("patient_email", "==", patient_email)
            .where("is_terminated", "==", False)
            .limit(1)
            .stream()
        )
        active_plans = list(plans_query)

        if active_plans:
            # Active plan exists
            plan_doc = active_plans[0]
            plan_id = plan_doc.id
            plan_data = plan_doc.to_dict()

            # Check if current doctor is the creator
            if plan_data.get("doctor_email") != doctor_email:
                return Response(
                    {
                        "error": "Only the doctor who created the active plan can edit it."
                    },
                    status=403,
                )

            # Fetch last version to close it (set end_date)
            versions_ref = (
                db.collection("treatment_plans")
                .document(plan_id)
                .collection("versions")
            )
            last_version_query = (
                versions_ref.order_by(
                    "start_date", direction=firestore.Query.DESCENDING
                )
                .limit(1)
                .stream()
            )
            last_versions = list(last_version_query)
            if not last_versions:
                return Response(
                    {"error": "No versions found for this plan"}, status=404
                )
            last_version = last_versions[0]
            last_version_id = last_version.id
            last_version_data = last_version.to_dict()

            now = datetime.utcnow()
            # Update end_date of last version to now, marking it as closed
            versions_ref.document(last_version_id).update({"end_date": now})

            # Create new version with updated goals and start_date = now
            new_version_ref = versions_ref.document()
            new_version_ref.set(
                {
                    "start_date": now,
                    "end_date": now,  # will update on next edit or termination
                    "weekly_score": 0,
                    "goals": goals,
                }
            )

            return Response(
                {
                    "message": "Existing active plan updated with new version",
                    "plan_id": plan_id,
                    "version_id": new_version_ref.id,
                }
            )

        else:
            # No active plan, create a new one
            plan_ref = db.collection("treatment_plans").document()
            version_ref = plan_ref.collection("versions").document()

            now = datetime.utcnow()
            plan_ref.set(
                {
                    "doctor_email": doctor_email,
                    "doctor_name": doctor_name,
                    "patient_email": patient_email,
                    "patient_name": patient_name,
                    "is_terminated": False,
                    "created_at": now,
                }
            )

            version_ref.set(
                {
                    "start_date": now,
                    "end_date": now,
                    "weekly_score": 0,
                    "goals": goals,
                }
            )

            return Response(
                {
                    "message": "Treatment plan created",
                    "plan_id": plan_ref.id,
                    "version_id": version_ref.id,
                }
            )

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
def terminate_treatment_plan(request, plan_id):
    """
    Terminates the treatment plan, making it non-editable.
    """
    try:
        plan_ref = db.collection("treatment_plans").document(plan_id)
        plan_ref.update({"is_terminated": True})
        return Response({"message": "Plan terminated successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
def get_treatment_plan_versions(request, plan_id):
    """
    Retrieve all plan versions by date for one treatment plan.
    Each treatment plan has a version before it is updated. A newly updated treatment plan will be stored in a new version.
    """
    try:
        versions = (
            db.collection("treatment_plans")
            .document(plan_id)
            .collection("versions")
            .order_by("start_date")
            .stream()
        )
        result = [{**v.to_dict(), "version_id": v.id} for v in versions]

        return Response(result)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
def get_treatment_plan_version(request, plan_id, version_id):
    """
    Return full treatment plan version including goals/actions.
    """
    try:
        version_ref = (
            db.collection("treatment_plans")
            .document(plan_id)
            .collection("versions")
            .document(version_id)
        )
        version = version_ref.get()
        if version.exists:
            return Response(version.to_dict())
        return Response({"error": "Version not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
def get_treatment_plan(request, plan_id):
    """
    Return the top‐level treatment plan document,
    including doctor_name, patient info, created_at, is_terminated, etc.
    """
    try:
        plan_ref = db.collection("treatment_plans").document(plan_id)
        plan_doc = plan_ref.get()
        if not plan_doc.exists:
            return Response({"error": "Plan not found"}, status=404)

        plan_data = plan_doc.to_dict()
        # Optionally add the plan_id back into the payload
        plan_data["plan_id"] = plan_id

        return Response(plan_data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["PUT"])
def update_current_week_actions(request, plan_id, version_id):
    """
    Allows updating actions/goals in the current version only.
    """
    try:
        updated_goals = request.data.get("goals", [])
        version_ref = (
            db.collection("treatment_plans")
            .document(plan_id)
            .collection("versions")
            .document(version_id)
        )

        version = version_ref.get()
        if not version.exists:
            return Response({"error": "Version not found"}, status=404)

        version_ref.update({"goals": updated_goals, "end_date": datetime.utcnow()})

        return Response({"message": "Plan version updated"})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
def mark_action_complete(request, plan_id, version_id):
    """
    Mark an action as completed or uncompleted by doctor or patient (based on role).
    Request should include:
    - goal_id: str
    - action_id: str
    - role: "doctor" or "patient"
    - is_completed: bool (optional, defaults to True)
    """
    try:
        goal_id = request.data.get("goal_id")
        action_id = request.data.get("action_id")
        role = request.data.get("role")  # Expected: "doctor" or "patient"
        # honor the incoming flag if provided, otherwise default to True
        status_flag = request.data.get("is_completed", True)

        if not all([goal_id, action_id, role]):
            return Response({"error": "Missing required fields"}, status=400)

        # Get the version document
        version_ref = (
            db.collection("treatment_plans")
            .document(plan_id)
            .collection("versions")
            .document(version_id)
        )
        version_doc = version_ref.get()

        if not version_doc.exists:
            return Response({"error": "Version not found"}, status=404)

        version_data = version_doc.to_dict()
        goals = version_data.get("goals", [])
        goal_found = False
        action_updated = False

        # Update only the relevant goal/action pair
        for goal in goals:
            if goal.get("id") == goal_id:
                goal_found = True
                for action in goal.get("actions", []):
                    if action.get("id") == action_id:
                        if action.get("assigned_to") != role:
                            return Response(
                                {
                                    "error": "Permission denied: cannot complete this action"
                                },
                                status=403,
                            )
                        action["is_completed"] = bool(status_flag)
                        action_updated = True

        if not goal_found:
            return Response({"error": "Goal not found in this version"}, status=404)
        if not action_updated:
            return Response({"error": "Action not found or not permitted"}, status=404)

        version_ref.update({"goals": goals})
        return Response(
            {
                "message": f"Action marked as {'complete' if status_flag else 'incomplete'}"
            }
        )

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
def calculate_weekly_performance(request, plan_id, version_id):
    """
    Calculates and stores weekly score based on completed actions.
    """
    try:
        version_ref = (
            db.collection("treatment_plans")
            .document(plan_id)
            .collection("versions")
            .document(version_id)
        )
        version_doc = version_ref.get()

        if not version_doc.exists:
            return Response({"error": "Version not found"}, status=404)

        version_data = version_doc.to_dict()
        goals = version_data.get("goals", [])

        total_points = 0
        earned_points = 0

        for goal in goals:
            for action in goal.get("actions", []):
                weight = int(action.get("priority", 1))  # default to 1 if missing
                total_points += weight
                if action.get("is_completed"):
                    earned_points += weight

        score = (earned_points / total_points) * 100 if total_points > 0 else 0
        version_ref.update({"weekly_score": round(score, 2)})

        return Response({"weekly_score": round(score, 2)})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
def get_treatment_plans_by_user(request, role, email):
    """
    Get all plans for a doctor or patient by email.
    role: "doctor" or "patient"
    """
    try:
        query = db.collection("treatment_plans").where(f"{role}_email", "==", email)
        docs = query.stream()
        plans = [{**doc.to_dict(), "plan_id": doc.id} for doc in docs]

        return Response(plans)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
def delete_action_from_version(request, plan_id, version_id):
    """
    Delete a specific action from a goal in the current version.
    """
    try:
        goal_id = request.data.get("goal_id")
        action_id = request.data.get("action_id")

        version_ref = (
            db.collection("treatment_plans")
            .document(plan_id)
            .collection("versions")
            .document(version_id)
        )
        version_doc = version_ref.get()
        if not version_doc.exists:
            return Response({"error": "Version not found"}, status=404)

        data = version_doc.to_dict()
        updated_goals = []

        for goal in data["goals"]:
            if goal["id"] == goal_id:
                goal["actions"] = [a for a in goal["actions"] if a["id"] != action_id]
            updated_goals.append(goal)

        version_ref.update({"goals": updated_goals})
        return Response({"message": "Action deleted"})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
def delete_goal_from_version(request, plan_id, version_id):
    """
    Delete an entire goal (and its actions) from the version.
    """
    try:
        goal_id = request.data.get("goal_id")

        version_ref = (
            db.collection("treatment_plans")
            .document(plan_id)
            .collection("versions")
            .document(version_id)
        )
        version_doc = version_ref.get()
        if not version_doc.exists:
            return Response({"error": "Version not found"}, status=404)

        data = version_doc.to_dict()
        updated_goals = [g for g in data["goals"] if g["id"] != goal_id]

        version_ref.update({"goals": updated_goals})
        return Response({"message": "Goal deleted"})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# ------ TheraChat ------

# ---- Constants ----
PROJECT_ID = "996770367618"
LOCATION = "us-central1"
VERTEX_AI_MODEL_ENDPOINT = (
    "projects/996770367618/locations/us-central1/endpoints/3658854739354845184"
)

# ---- Initialize Vertex AI client globally ----
genai_client = genai.Client(
    vertexai=True,
    project=PROJECT_ID,
    location=LOCATION,
)


@method_decorator(csrf_exempt, name="dispatch")
class TheraChatView(APIView):
    def get(self, request):
        return Response(
            {
                "message": "TheraChat API is running. Send a POST request with a 'prompt'."
            }
        )

    def post(self, request):
        user_input = request.data.get("prompt")
        if not user_input:
            return Response(
                {"error": "No prompt provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # ---- Prepare content ----
            contents = [
                types.Content(
                    role="user",
                    parts=[types.Part(text=user_input)],
                )
            ]

            generation_config = types.GenerateContentConfig(
                temperature=0.7,
                top_p=0.95,
                max_output_tokens=1024,
            )

            # ---- Streaming generation (official way to call fine-tuned endpoints) ----
            stream = genai_client.models.generate_content_stream(
                model=VERTEX_AI_MODEL_ENDPOINT,
                contents=contents,
                config=generation_config,
            )

            # ---- Combine stream text ----
            generated_text = ""
            for chunk in stream:
                if hasattr(chunk, "text"):
                    generated_text += chunk.text

            if not generated_text.strip():
                return Response(
                    {"error": "No content returned from the model."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            return Response({"response": generated_text})

        except Exception as e:
            import traceback

            print(
                f"Error during TheraChat generation for prompt: '{user_input}'\n",
                traceback.format_exc(),
            )
            return Response(
                {"error": f"Internal server error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
