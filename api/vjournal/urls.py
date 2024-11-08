"""
URL configuration for vjournal project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
import os
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


admin_url = "admin"
boss_url = os.environ["BOSS_URL"]

if os.environ["CI_CD_STAGE"] == "testing" or os.environ["CI_CD_STAGE"] == "production":
    admin_url = os.environ["ADMIN_URL"]


urlpatterns = [
    path("{}/".format(admin_url), admin.site.urls),
    path("authentication/", include("authentication.urls")),
    path("video/", include("video.urls")),
    path("subscription/", include("subscription.urls")),
    path("emails/", include("emails.urls")),
    path("account/", include("account.urls")),
    path("share/", include("share.urls")),
    path("ht/", include("health.urls")),
    path(f"{boss_url}/", include("boss.urls")),
]


if settings.DEBUG:
    urlpatterns = (
        urlpatterns
        + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
        + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    )
