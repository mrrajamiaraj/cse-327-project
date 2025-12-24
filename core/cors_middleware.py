"""
Custom CORS middleware to ensure CORS headers are always added
"""

class CustomCorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Handle preflight requests
        if request.method == 'OPTIONS':
            response = self.handle_preflight(request)
        else:
            response = self.get_response(request)
        
        # Add CORS headers to all responses
        self.add_cors_headers(response, request)
        return response

    def handle_preflight(self, request):
        from django.http import HttpResponse
        response = HttpResponse()
        response.status_code = 200
        return response

    def add_cors_headers(self, response, request):
        origin = request.META.get('HTTP_ORIGIN')
        
        # Allow all origins in development
        if origin:
            response['Access-Control-Allow-Origin'] = origin
        else:
            response['Access-Control-Allow-Origin'] = '*'
        
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = (
            'accept, accept-encoding, authorization, content-type, dnt, '
            'origin, user-agent, x-csrftoken, x-requested-with'
        )
        response['Access-Control-Max-Age'] = '86400'
        
        return response