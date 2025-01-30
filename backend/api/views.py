# backend/api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Article, PatientStory
from .serializers import ArticleSerializer, PatientStorySerializer
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from ..utils.firestore import add_document
from datetime import datetime
from firebase_admin import firestore
from rest_framework.response import Response
from rest_framework.decorators import api_view


db = firestore.client()  # Firestore database connection


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
