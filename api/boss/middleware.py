import logging

from django.conf import settings
from django.http import HttpResponse

logger = logging.getLogger(__name__)

BOSS_SECRET_KEY = settings.BOSS_SECRET_KEY


def secret_key_middleware(get_response):
    def middleware(request):
        secret_key_header = request.headers.get("X-BOSS-SECRET")

        if secret_key_header != BOSS_SECRET_KEY:
            # Log the unauthorized access attempt
            logger.warning(
                "Unauthorized access attempt: %s %s", request.method, request.path
            )

            # Return a bad response
            response = HttpResponse("Unauthorized", status=401)
            return response

        response = get_response(request)
        return response

    return middleware
