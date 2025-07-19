# Stage 1: Build dependencies
FROM python:3.10-slim AS builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --user -r requirements.txt

# Stage 2: Runtime
FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

COPY . .

CMD ["gunicorn", "theramind_backend.wsgi:application", "--bind", "0.0.0.0:8000"]
