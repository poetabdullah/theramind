from django.http import JsonResponse
from utils.firestore import add_document, get_document


def create_user(request):
    data = {
        "name": "John Doe",
        "email": "john.doe@example.com",
    }
    add_document("users", "user_id_123", data)
    return JsonResponse({"message": "User created successfully."})


def get_user(request, user_id):
    user = get_document("users", user_id)
    if user:
        return JsonResponse({"user": user})
    else:
        return JsonResponse({"error": "User not found."}, status=404)
