import os
import firebase_admin
from firebase_admin import credentials, firestore

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FIREBASE_CREDENTIAL_PATH = os.getenv(
    "FIREBASE_ADMIN_CREDENTIAL_PATH",
    os.path.join(BASE_DIR, "firebase_admin_credentials.json"),
)


def initialize_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate(FIREBASE_CREDENTIAL_PATH)
        firebase_admin.initialize_app(cred)


# Initialize Firebase and Firestore client here
initialize_firebase()
db = firestore.client()
