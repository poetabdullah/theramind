from django.db import models


class Article(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author_name = models.CharField(max_length=100)
    date_time = models.DateTimeField(auto_now_add=True)
    tags = models.JSONField()  # Or use another method to store tags as needed


class PatientStory(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author_name = models.CharField(max_length=100)
    date_time = models.DateTimeField(auto_now_add=True)
    tags = models.JSONField()  # Or another field type for tags


class Tag(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name
