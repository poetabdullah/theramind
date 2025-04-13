# Since we won't use db.sqlite3, hence we can configure Django to use Firestore for database-like operations.
# Add a utility for interacting with Firestore:

from firebase_admin import firestore

# Firestore client instance
db = firestore.client()


def add_document(collection, document_id, data):
    """Add a document to Firestore."""
    db.collection(collection).document(document_id).set(data)


def get_document(collection, document_id):
    """Retrieve a document from Firestore."""
    doc = db.collection(collection).document(document_id).get()
    return doc.to_dict() if doc.exists else None


def update_document(collection, document_id, data):
    """Update an existing document in Firestore."""
    db.collection(collection).document(document_id).update(data)


def delete_document(collection, document_id):
    """Delete a document from Firestore."""
    db.collection(collection).document(document_id).delete()
