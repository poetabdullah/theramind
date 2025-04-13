# backend/api/serializers.py
from rest_framework import serializers
from .models import Article, PatientStory

"""
Serializers are part of Django REST Framework (DRF) and are used to convert Django model instances to JSON, and vice versa.

Converts complex data such as in the models → JSON (for API responses).
Serializers are also implemented for potential future use.
"""


class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = [
            "id",
            "title",
            "content",
            "author_name",
            "author_email",
            "date_time",
            "tags",
        ]


class PatientStorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientStory
        fields = [
            "id",
            "title",
            "content",
            "author_name",
            "author_email",
            "date_time",
            "tags",
        ]
