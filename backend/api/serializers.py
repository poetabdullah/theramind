# backend/api/serializers.py
from rest_framework import serializers
from .models import Article, PatientStory


from rest_framework import serializers
from .models import Article


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


from rest_framework import serializers
from .models import PatientStory


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
