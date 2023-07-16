from rest_framework.serializers import ModelSerializer, SerializerMethodField

from share.models import Contact, Share


class ContactSerializer(ModelSerializer):
    name = SerializerMethodField()
    email = SerializerMethodField()

    class Meta:
        model = Contact
        fields = ["id", "name", "email"]

    def get_name(self, obj):
        if obj.contact_user:
            return f"{obj.contact_user.first_name} {obj.contact_user.last_name}"
        return obj.contact_name

    def get_email(self, obj):
        if obj.contact_user:
            return obj.contact_user.email
        return obj.contact_email


class ShareSerializer(ModelSerializer):
    contact = ContactSerializer()

    class Meta:
        model = Share
        fields = [
            "id",
            "created_at",
            "video",
            "contact",
        ]
