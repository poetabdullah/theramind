from django.db import models

"""
Models are Python classes that define the structure of your database tables in Django.
Currently we are using Firestore database, but we've still defined models here for the future.
"""


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
