FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1
ENV NLTK_DATA=/app/ml_models/nltk_data

WORKDIR /app
RUN pip install --upgrade pip setuptools wheel
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m nltk.downloader punkt wordnet omw-1.4

COPY . .

RUN python manage.py collectstatic --noinput || true

EXPOSE 8080
CMD ["gunicorn", "theramind_backend.wsgi:application", "--bind", "0.0.0.0:8080"]
