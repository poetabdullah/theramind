import pyrebase

# Firebase configuration (matches the `firebaseConfig.js` file)
firebase_config = {
    "apiKey": "AIzaSyCI_qHj3Ou0jlICgsKkeLzqwR9NTl0Tkqo",
    "authDomain": "thera-mind.firebaseapp.com",
    "projectId": "thera-mind",
    "storageBucket": "thera-mind.firebasestorage.app",
    "messagingSenderId": "996770367618",
    "appId": "1:996770367618:web:4cb475e35a7de6a4094c9b",
    "measurementId": "G-0N9P4B7GKZ",
}

firebase = pyrebase.initialize_app(firebase_config)
auth = firebase.auth()


def sign_in_with_email_and_password(email, password):
    """Sign in using email and password."""
    user = auth.sign_in_with_email_and_password(email, password)
    return user


def create_user_with_email_and_password(email, password):
    """Create a new user."""
    user = auth.create_user_with_email_and_password(email, password)
    return user
