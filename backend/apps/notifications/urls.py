from django.urls import path
from .views import NotificationListView, MarkReadView, UnreadCountView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('unread-count/', UnreadCountView.as_view(), name='notification-unread-count'),
    path('mark-all-read/', MarkReadView.as_view(), name='notification-mark-all-read'),
    path('mark-read/', MarkReadView.as_view(), name='notification-mark-read-bulk'),
    path('mark-read/<int:pk>/', MarkReadView.as_view(), name='notification-mark-read-alt'),
    path('<int:pk>/read/', MarkReadView.as_view(), name='notification-mark-read'),
]
