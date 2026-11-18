from rest_framework import serializers
from .models import Department


class DepartmentSerializer(serializers.ModelSerializer):
    """
    Comprehensive Department serializer for retrieve, create, and update operations.
    Includes all model fields.
    """
    class Meta:
        model = Department
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class DepartmentListSerializer(serializers.ModelSerializer):
    """
    Lightweight Department serializer for list views and selection dropdowns.
    Exposes only essential identifying fields.
    """
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'is_active']
        read_only_fields = ['id', 'name', 'code', 'is_active']
