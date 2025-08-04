from django.http import HttpResponseForbidden

ALLOWED_FRONTEND_ORIGINS = [
    "https://theramind.site",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


class EnforceAllowedOriginsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        origin = request.headers.get("Origin") or request.headers.get("Referer")
        if origin and any(origin.startswith(o) for o in ALLOWED_FRONTEND_ORIGINS):
            response = self.get_response(request)

            # Add CORS headers for allowed origins — especially for redirects
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Credentials"] = "true"
            response["Vary"] = "Origin"

            return response

        return HttpResponseForbidden("Unauthorized or missing origin")
