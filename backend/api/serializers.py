# backend/api/serializers.py
from rest_framework import serializers
from .models import Article, PatientStory, TreatmentPlan, Goal, Action

"""
Serializers are part of Django REST Framework (DRF) and are used to convert Django model instances to JSON, and vice versa.

Converts complex data such as in the models → JSON (for API responses).
Serializers are also implemented for potential future use.
"""

# ------ Education based serializers ------


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


# ------ Treatment plan based serializers ------
class ActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Action
        fields = [
            "id",
            "goal",
            "description",
            "is_done",
        ]


class GoalSerializer(serializers.ModelSerializer):
    actions = ActionSerializer(many=True, read_only=True)

    class Meta:
        model = Goal
        fields = [
            "id",
            "treatment",
            "description",
            "is_completed",
            "actions",
        ]


class TreatmentPlanSerializer(serializers.ModelSerializer):
    goals = GoalSerializer(many=True, read_only=True)

    class Meta:
        model = TreatmentPlan
        fields = [
            "id",
            "name",
            "patient_name",
            "patient_email",
            "doctor_name",
            "doctor_email",
            "start_date",
            "end_date",
            "last_updated",
            "progress",
            "goals",
        ]
