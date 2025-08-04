from django.http import HttpResponse, HttpResponseForbidden

ALLOWED_FRONTEND_ORIGINS = [
    "https://www.theramind.site",
    "https://theramind.site",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


class EnforceAllowedOriginsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        origin = request.headers.get("Origin")

        if origin and any(origin.startswith(o) for o in ALLOWED_FRONTEND_ORIGINS):
            # ✅ Handle preflight OPTIONS properly
            if request.method == "OPTIONS":
                response = HttpResponse(status=200)
            else:
                response = self.get_response(request)

            # ✅ Always add CORS headers
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Credentials"] = "true"
            response["Access-Control-Allow-Methods"] = (
                "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            )
            response["Access-Control-Allow-Headers"] = (
                "Authorization, Content-Type, X-CSRFToken, Accept, Origin, User-Agent"
            )
            response["Vary"] = "Origin"
            return response

        return HttpResponseForbidden("Unauthorized or missing origin")
