"""
Custom DRF permissions for Janaseva Kerala role-based access control.
"""
from rest_framework import permissions


class IsCMOAdmin(permissions.BasePermission):
    """
    Allows access only to Chief Minister's Office (CMO) administrators and superusers.
    """
    message = "Access restricted to Chief Minister's Office (CMO) administrators."

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return bool(
            getattr(user, 'role', None) == 'cmo_admin' or
            getattr(user, 'is_superuser', False)
        )


class IsOfficer(permissions.BasePermission):
    """
    Allows access only to authenticated Department Officers.
    """
    message = "Access restricted to Department Officers."

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return bool(getattr(user, 'role', None) == 'officer')


class IsCitizen(permissions.BasePermission):
    """
    Allows access only to authenticated Citizens.
    """
    message = "Access restricted to registered citizens."

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return bool(getattr(user, 'role', None) == 'citizen')


class IsAdminOrOfficer(permissions.BasePermission):
    """
    Allows access to CMO administrators or Department Officers.
    """
    message = "Access restricted to CMO administrators and Department Officers."

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return bool(
            getattr(user, 'role', None) in ('cmo_admin', 'officer') or
            getattr(user, 'is_superuser', False)
        )


# Alias for backward compatibility
IsOfficerOrCMOAdmin = IsAdminOrOfficer


class IsCitizenOrCMOAdmin(permissions.BasePermission):
    """
    Allows access to Citizens or CMO administrators.
    """
    message = "Access restricted to Citizens and CMO administrators."

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return bool(
            getattr(user, 'role', None) in ('citizen', 'cmo_admin') or
            getattr(user, 'is_superuser', False)
        )


class IsOwnerOrCMOAdmin(permissions.BasePermission):
    """
    Allows access to the owner of the object or CMO administrators.
    """
    def has_object_permission(self, request, view, obj):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        if getattr(user, 'role', None) == 'cmo_admin' or getattr(user, 'is_superuser', False):
            return True
        owner = getattr(obj, 'user', None) or getattr(obj, 'citizen', None)
        return owner == user
