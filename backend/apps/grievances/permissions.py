"""
Permissions module for Grievances application.
Re-exports core account role permissions and defines grievance-specific object permissions.
"""
from django.db import models
from rest_framework import permissions
from apps.accounts.permissions import (
    IsCitizen,
    IsCMOAdmin,
    IsOfficer,
    IsOfficerOrCMOAdmin,
    IsCitizenOrCMOAdmin,
)

__all__ = [
    'IsCitizen',
    'IsCMOAdmin',
    'IsOfficer',
    'IsOfficerOrCMOAdmin',
    'IsCitizenOrCMOAdmin',
    'IsGrievanceOwnerOrStaff',
]


class IsGrievanceOwnerOrStaff(permissions.BasePermission):
    """
    Object-level permission allowing the citizen owner, assigned officer, or CMO admin.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # CMO admin has access to all grievances
        if getattr(request.user, 'is_cmo_admin', False) or request.user.is_superuser:
            return True

        # Citizen owner
        if getattr(obj, 'citizen', None) == request.user:
            return True

        # Department officer assigned
        if getattr(request.user, 'is_officer', False):
            # Check direct officer assignment or department match
            if hasattr(obj, 'assignments'):
                is_assigned = obj.assignments.filter(
                    is_active=True
                ).filter(
                    models.Q(assigned_officer=request.user) |
                    models.Q(department=request.user.department)
                ).exists()
                return is_assigned

        return False
