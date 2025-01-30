# backend/api/serializers.py
from rest_framework import serializers
from .models import Article, PatientStory


class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ["id", "title", "content", "author_name", "date_time", "tags"]


class PatientStorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientStory
        fields = ["id", "title", "content", "author_name", "date_time", "tags"]
