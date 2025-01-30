# backend/api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Article, PatientStory
from .serializers import ArticleSerializer, PatientStorySerializer


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
