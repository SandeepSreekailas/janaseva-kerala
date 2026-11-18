from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """
    List all notifications for the authenticated user, ordered from newest to oldest.
    Optionally filter by read status (?is_read=true or ?is_read=false).
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="List user notifications",
        description="Retrieve all notifications for the authenticated user, optionally filtered by `is_read` status.",
        parameters=[
            OpenApiParameter(
                name='is_read',
                description='Filter notifications by read status (true/false)',
                required=False,
                type=bool
            )
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user).select_related('grievance')
        is_read_param = self.request.query_params.get('is_read')
        if is_read_param is not None:
            if is_read_param.lower() in ('true', '1'):
                queryset = queryset.filter(is_read=True)
            elif is_read_param.lower() in ('false', '0'):
                queryset = queryset.filter(is_read=False)
        return queryset


class MarkReadView(APIView):
    """
    Mark one or more notifications as read.
    Supports:
    - POST / PATCH /api/notifications/<pk>/read/ (single notification)
    - POST / PATCH /api/notifications/mark-read/ (with optional notification_ids list or marks all)
    - POST / PATCH /api/notifications/mark-all-read/ (marks all unread as read)
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Mark notification(s) as read",
        description="Mark a specific notification or all notifications as read for the authenticated user.",
        responses={200: OpenApiResponse(description="Notification(s) successfully marked as read")}
    )
    def post(self, request, pk=None, *args, **kwargs):
        return self._mark_read(request, pk)

    @extend_schema(
        summary="Mark notification(s) as read (partial update)",
        description="Mark a specific notification or all notifications as read for the authenticated user.",
        responses={200: OpenApiResponse(description="Notification(s) successfully marked as read")}
    )
    def patch(self, request, pk=None, *args, **kwargs):
        return self._mark_read(request, pk)

    def _mark_read(self, request, pk=None):
        if pk is not None:
            notification = get_object_or_404(Notification, pk=pk, user=request.user)
            notification.is_read = True
            notification.save(update_fields=['is_read'])
            serializer = NotificationSerializer(notification)
            return Response({
                'message': 'Notification marked as read.',
                'notification': serializer.data
            }, status=status.HTTP_200_OK)

        notification_ids = request.data.get('notification_ids')
        if isinstance(notification_ids, list):
            updated_count = Notification.objects.filter(
                id__in=notification_ids,
                user=request.user
            ).update(is_read=True)
            return Response({
                'message': f'{updated_count} notification(s) marked as read.',
                'updated_count': updated_count
            }, status=status.HTTP_200_OK)

        # Mark all unread for user
        updated_count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)
        return Response({
            'message': 'All notifications marked as read.',
            'updated_count': updated_count
        }, status=status.HTTP_200_OK)


class UnreadCountView(APIView):
    """
    Get the total count of unread notifications for the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Get unread notification count",
        description="Return the number of unread notifications for the authenticated user.",
        responses={200: OpenApiResponse(description="Unread notification count returned")}
    )
    def get(self, request, *args, **kwargs):
        unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({
            'unread_count': unread_count,
            'count': unread_count
        }, status=status.HTTP_200_OK)
