from django.http import HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse


def home(request):
    return HttpResponseRedirect("http://localhost:3000")

@csrf_exempt
def book_appointment(request):
    if request.method == 'POST':
        return JsonResponse({'message': 'Appointment booked successfully'})
    return JsonResponse({'error': 'Only POST method allowed'}, status=405)
