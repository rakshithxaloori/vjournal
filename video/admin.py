from django.contrib import admin


from video.models import Video, Thumbnail, Subtitles

admin.site.register(Video)
admin.site.register(Thumbnail)
admin.site.register(Subtitles)
