from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Notification model with related grievance reference.
    """
    grievance_reference = serializers.CharField(
        source='grievance.reference_number',
        read_only=True,
        default=None
    )

    class Meta:
        model = Notification
        fields = [
            'id',
            'user',
            'title',
            'message',
            'grievance',
            'grievance_reference',
            'is_read',
            'created_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'grievance_reference']
