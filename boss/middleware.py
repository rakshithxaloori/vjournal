import logging

from django.conf import settings
from django.http import HttpResponse

logger = logging.getLogger(__name__)

BOSS_SECRET_KEY = settings.BOSS_SECRET_KEY


class SecretKeyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.secret_key = BOSS_SECRET_KEY

    def __call__(self, request):
        secret_key_header = request.headers.get("X-BOSS-SECRET")

        if secret_key_header != self.secret_key:
            # Log the unauthorized access attempt
            logger.warning(
                "Unauthorized access attempt: %s %s", request.method, request.path
            )

            # Return a bad response
            response = HttpResponse("Unauthorized", status=401)
            return response

        response = self.get_response(request)
        return response
