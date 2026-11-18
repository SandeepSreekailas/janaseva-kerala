from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from apps.accounts.permissions import IsCMOAdmin
from .models import Department
from .serializers import DepartmentSerializer, DepartmentListSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet for managing government departments.
    - list / retrieve: AllowAny (accessible to public and citizens)
    - create / update / partial_update / destroy: CMO admin only (IsCMOAdmin)
    """
    queryset = Department.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'created_at']
    ordering = ['name']

    def get_permissions(self):
        """
        Public access for list and retrieve actions;
        restricted to CMO Administrator for state-modifying actions.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsCMOAdmin]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        """
        Use lightweight DepartmentListSerializer for collection listing,
        and full DepartmentSerializer for details, creation, and updates.
        """
        if self.action == 'list':
            return DepartmentListSerializer
        return DepartmentSerializer
