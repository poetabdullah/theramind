from django.db import models

"""
Models are Python classes that define the structure of your database tables in Django.
Currently we are using Firestore database, but we've still defined models here for the future.
"""


# ----- Education based models: ------------
class Article(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author_name = models.CharField(max_length=100)
    date_time = models.DateTimeField(auto_now_add=True)
    author_email = models.EmailField()
    tags = models.JSONField()


class PatientStory(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author_name = models.CharField(max_length=100)
    date_time = models.DateTimeField(auto_now_add=True)
    author_email = models.EmailField()
    tags = models.JSONField()


class Tag(models.Model):
    name = models.CharField(
        max_length=255, unique=True
    )  # The unique=True constraint ensures no duplicate tag names.

    def __str__(self):
        return self.name


# ------ Treatment plan based models: ----------


class TreatmentPlan(models.Model):
    name = models.CharField(max_length=200)
    patient_name = models.CharField(max_length=100)
    patient_email = models.EmailField()
    doctor_name = models.CharField(max_length=100)
    doctor_email = models.EmailField()
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    progress = models.FloatField(default=0.0)

    def __str__(self):
        return f"TreatmentPlan: {self.name} for {self.patient_name}"


class Goal(models.Model):
    treatment = models.ForeignKey(
        TreatmentPlan, related_name="goals", on_delete=models.CASCADE
    )
    description = models.TextField()
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Goal for {self.treatment.name}: {self.description[:30]}"


class Action(models.Model):
    goal = models.ForeignKey(Goal, related_name="actions", on_delete=models.CASCADE)
    description = models.TextField()
    is_done = models.BooleanField(default=False)

    def __str__(self):
        return f"Action for goal {self.goal.id}: {self.description[:30]}"
