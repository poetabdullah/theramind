# Use Python base image
FROM python:3.10

# Set workdir
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the rest of the code
COPY . .

# Expose port (ensure Django runs on this)
EXPOSE 8000

# Start Django server (no DB, so no migrations needed)
CMD ["gunicorn", "theramind_backend.wsgi:application", "--bind", "0.0.0.0:8000"]
