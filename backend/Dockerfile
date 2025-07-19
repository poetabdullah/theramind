# Use official Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create app directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy project
COPY . .

# Expose port (Cloud Run uses 8080)
EXPOSE 8080

# Run the app
CMD ["gunicorn", "theramind_backend.wsgi:application", "--bind", "0.0.0.0:8080"]
