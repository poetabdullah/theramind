FROM python:3.11-slim

# Set working directory
WORKDIR /backend

# Copy requirements.txt from the backend dir
COPY requirements.txt .

# Install requirements (with timeout fix)
# This will install tensorflow==2.19.0 and its bundled Keras 3.x
RUN pip install --default-timeout=300 --no-cache-dir -r requirements.txt

# Download NLTK punkt tokenizer (moved before copying app code, good practice)
RUN python -m nltk.downloader punkt

# Copy model-related and Django app directories
COPY ./ml_models ./ml_models
COPY ./api ./api
COPY ./utils ./utils
COPY ./theramind_backend ./theramind_backend
COPY manage.py .

# Expose the port
EXPOSE 8000

# Start Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

