from rest_framework import serializers
from .models import ContactEnquiry


class ContactEnquiryCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for citizen public contact enquiry submissions.
    Restricted to user-submittable fields: name, email, subject, and message.
    """
    class Meta:
        model = ContactEnquiry
        fields = ['name', 'email', 'subject', 'message']


class ContactEnquirySerializer(serializers.ModelSerializer):
    """
    Full ContactEnquiry serializer for administrative review by CMO administrators.
    Includes all fields such as id, status, and created_at.
    """
    class Meta:
        model = ContactEnquiry
        fields = '__all__'
        read_only_fields = ['id', 'created_at']
