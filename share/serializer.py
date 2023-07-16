from rest_framework.serializers import ModelSerializer, SerializerMethodField

from share.models import Share


class ShareSerializer(ModelSerializer):
    shared_to = SerializerMethodField()

    class Meta:
        model = Share
        fields = [
            "id",
            "created_at",
            "video",
            "shared_to",
        ]

    def get_shared_to(self, obj):
        if obj.shared_to_user:
            return {
                "name": f"{obj.shared_to_user.first_name} {obj.shared_to_user.last_name}",
                "email": obj.shared_to_user.email,
            }
        return {
            "name": obj.shared_to_name,
            "email": obj.shared_to_email,
        }
