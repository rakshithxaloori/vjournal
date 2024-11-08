from django.contrib import admin


from video.models import Video, Thumbnail, Subtitles, Summary

admin.site.register(Video)
admin.site.register(Thumbnail)
admin.site.register(Subtitles)
admin.site.register(Summary)
