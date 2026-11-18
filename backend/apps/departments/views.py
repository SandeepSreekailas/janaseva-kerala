from rest_framework import viewsets, filters, permissions, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from apps.accounts.permissions import IsCMOAdmin
from .models import Department
from .serializers import DepartmentSerializer, DepartmentListSerializer, DepartmentOfficerBriefSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet for managing government departments.
    - list / retrieve: AllowAny (accessible to public and citizens)
    - create / update / partial_update / destroy: CMO admin only (IsCMOAdmin)
    """
    queryset = Department.objects.prefetch_related('officers').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'created_at']
    ordering = ['name']

    def get_permissions(self):
        """
        Public access for list, retrieve and officers actions;
        restricted to CMO Administrator for state-modifying actions.
        """
        if self.action in ['list', 'retrieve', 'officers']:
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

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def officers(self, request, pk=None):
        """Return list of active officers assigned to this department."""
        department = self.get_object()
        officers_qs = department.officers.filter(role='officer', is_active=True).order_by('full_name')
        serializer = DepartmentOfficerBriefSerializer(officers_qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
