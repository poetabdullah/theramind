from django.http import HttpResponseRedirect


def home(request):
    return HttpResponseRedirect(
        "http://localhost:3000"
    )  # Replace with your React app URL
