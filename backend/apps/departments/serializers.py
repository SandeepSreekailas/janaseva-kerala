from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Department

User = get_user_model()


class DepartmentOfficerBriefSerializer(serializers.ModelSerializer):
    """Brief officer information nested in Department serializer."""
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'mobile']
        read_only_fields = fields


class DepartmentSerializer(serializers.ModelSerializer):
    """
    Comprehensive Department serializer for retrieve, create, and update operations.
    Includes all model fields and active officers.
    """
    officers = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = [
            'id',
            'name',
            'code',
            'description',
            'contact_email',
            'is_active',
            'created_at',
            'officers',
        ]
        read_only_fields = ['id', 'created_at']

    def get_officers(self, obj):
        officers_qs = obj.officers.filter(role=User.Role.OFFICER, is_active=True).order_by('full_name')
        return DepartmentOfficerBriefSerializer(officers_qs, many=True).data


class DepartmentListSerializer(serializers.ModelSerializer):
    """
    Lightweight Department serializer for list views and selection dropdowns.
    Exposes identifying fields and associated active officers for assignment triage.
    """
    officers = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'is_active', 'officers']
        read_only_fields = ['id', 'name', 'code', 'is_active', 'officers']

    def get_officers(self, obj):
        officers_qs = obj.officers.filter(role=User.Role.OFFICER, is_active=True).order_by('full_name')
        return DepartmentOfficerBriefSerializer(officers_qs, many=True).data
