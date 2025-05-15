# backend/api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Article, PatientStory
from .serializers import ArticleSerializer, PatientStorySerializer
import json
import firebase_admin
from firebase_admin import firestore, credentials, initialize_app
from google.oauth2 import service_account

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime

# Libraries For Calendar & Email APIs
import datetime
import pytz
import smtplib
from email.mime.text import MIMEText
from google.oauth2 import service_account
from googleapiclient.discovery import build


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


# This ensures Firebase is only initialized once (even if views are imported multiple times)
if not firebase_admin._apps:
    credentials = service_account.Credentials.from_service_account_file(
        "C:/Users/user/VSCodeJSProjects/React/theramind/backend/firebase_admin_credentials.json"
    )
    firebase_admin.initialize_app(credentials)

db = firestore.client()


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


# Appointment code:
# ____________________________________________________________________________________

# Google API Setup (also not in views.py)
SCOPES = ["http://www.googleapis.com/auth/calendar"]
SERVICE_ACCOUNT_FILE = r"C:\Users\Computer World\theramind\backend\calendar_access.json"
calendar_credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)
calendar_service = build("calendar", "v3", credentials=calendar_credentials)


@csrf_exempt
def book_appointment(request):
    if request.method == "POST":
        data = json.loads(request.body)
        name = data["name"]
        email = data["email"]
        doctor_email = data["doctor"]
        datetime_str = data["datetime"]
        dt = datetime.datetime.fromisoformat(datetime_str)
        timezone = "Asia/Islamabad"
        start_time = dt.astimezone(pytz.timezone(timezone))
        end_time = start_time + datetime.timedelta(minutes=30)

        event = {
            "summary": f"Appointment with {name}",
            "description": f"TheraMind Therapy Session",
            "start": {"dateTime": start_time.isoformat(), "timeZone": timezone},
            "end": {"dateTime": end_time.isoformat(), "timeZone": timezone},
            "attendees": [{"email": doctor_email}, {"email": email}],
            "conferenceData": {
                "createRequest": {
                    "requestId": f"{email}-{dt.timestamp()}",
                    "conferenceSolutionKey": {"type": "hangoutsMeet"},
                }
            },
        }

        created_event = (
            calendar_service.events()
            .insert(calendarId="primary", body=event, conferenceDataVersion=1)
            .execute()
        )

        meet_link = created_event.get("hangoutLink")

        # Store in Firestore
        appointment_data = {
            "name": name,
            "email": email,
            "doctor": doctor_email,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "meet_link": meet_link,
        }
        db.collection("appointments").add(appointment_data)

        # Sending Email
        subject = "Appointment Confirmed"
        message = f"Hi {name}, \nYour appointment with the doctor has been scheduled. \n\nGoogle Meet Link: {meet_link}\nThanks,\nTheraMind"
        send_email(email, subject, message)
        send_email(doctor_email, "New Appointment Booked", message)

        return JsonResponse({"message": "Appointment booked", "meet_link": meet_link})
    return JsonResponse({"error": "Invalid request"}, status=400)


# not in view.py
def send_email(to_email, subject, body):
    from_email = "theramind.web@gmail.com"
    password = "TheraMind2024"

    message = MIMEText(body)
    message["Subject"] = subject
    message["From"] = from_email
    message["To"] = to_email
    server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
    server.login(from_email, password)
    server.sendmail(from_email, [to_email], message.as_string())
    server.quit()


# Cancel Appointment
@csrf_exempt
def cancel_appointment(request):
    if request.method == "POST":
        data = json.loads(request.body)
        event_id = data["event_id"]

        try:
            calendar_service.events().delete(
                calendarId="primary", eventId=event_id
            ).execute()
        except Exception as e:
            return JsonResponse(
                {"error": "Failed to delete from Google Calendar", "details": str(e)},
                status=500,
            )

        # Delete Record From Firestore Database
        appointments = (
            db.collection("appointments").where("event_id", "==, event_id").get()
        )
        for appointment in appointments:
            appointment.reference.delete()

        return JsonResponse({"message": "Appointment cancelled successfully"})
    return JsonResponse({"error": "Invalid request"}, status=400)


# Rescheduling Appointment
@csrf_exempt
def reschedule_appointment(request):
    if request.method == "POST":
        data = json.loads(request.body)
        event_id = data["event_id"]
        new_datetime = datetime.datetime.fromisoformat(data["new_dattime"])
        timezone = "Asia/Islamabad"
        start_time = new_datetime.astimezone(pytz.timezone(timezone))
        end_time = start_time + datetime.timedelta(minutes=30)

        try:
            updated_event = {
                "start": {"dateTime": start_time.isoformat(), "timeZone": timezone},
                "end": {"dateTime": end_time.isoformat(), "timeZone": timezone},
            }
            calendar_service.events().patch(
                calendarId="primary", eventId=event_id, body=updated_event
            ).execute()

            # Updating The Record In Firestore Database
            appointments = (
                db.collection("appointments").where("event_id", "==", event_id).get()
            )
            for appointment in appointments:
                appointment.reference.update(
                    {
                        "start_time": start_time.isoformat(),
                        "end_time": end_time.isoformat(),
                    }
                )
            return JsonResponse({"message": "Appointment Rescheduled Successfully"})
        except Exception as e:
            return JsonResponse(
                {"error": "Failed to reschedule", "details": str(e)}, status=500
            )
    return JsonResponse({"error": "Invalid request"}, status=400)
