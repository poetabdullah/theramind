FROM python:3.11-slim-bookworm

ENV PYTHONUNBUFFERED=1
ENV NLTK_DATA=/app/ml_models/nltk_data
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/vertex_ai_credentials.json
ENV DJANGO_SETTINGS_MODULE=theramind_backend.settings

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --default-timeout=300 --no-cache-dir -r requirements.txt
RUN pip install google-genai gunicorn

# Download NLTK data
RUN python -m nltk.downloader punkt wordnet omw-1.4

# Copy credentials
COPY firebase_admin_credentials.json /app/firebase_admin_credentials.json
COPY vertex_ai_credentials.json /app/vertex_ai_credentials.json

# Copy project files
COPY ./ml_models ./ml_models
COPY ./api ./api
COPY ./utils ./utils
COPY ./theramind_backend ./theramind_backend
COPY manage.py .

# Expose the correct port
EXPOSE 8000

# Start using Gunicorn for concurrency
CMD ["gunicorn", "theramind_backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2", "--threads", "4", "--timeout", "300"]
