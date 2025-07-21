import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

cred = None

# 1. Path-based key
path = os.getenv("FIREBASE_CRED_PATH")
if path and Path(path).exists():
    cred = credentials.Certificate(path)
# 2. Inline JSON key
elif os.getenv("FIREBASE_CRED_JSON"):
    cred = credentials.Certificate(json.loads(os.getenv("FIREBASE_CRED_JSON")))
# 3. Fallback key
else:
    fallback = (
        Path(__file__).resolve().parent.parent
        / "secrets/firebase_admin_credentials.json"
    )
    if fallback.exists():
        cred = credentials.Certificate(str(fallback))
    else:
        raise FileNotFoundError("Firebase credentials missing.")

# Initialize once
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()
