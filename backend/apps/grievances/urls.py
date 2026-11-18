"""
Citizen URLs for Grievances API.
Base route: /api/grievances/
"""
from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CitizenGrievanceViewSet,
    TrackGrievanceView,
    GrievanceHistoryView,
    UploadAttachmentView,
    SubmitFeedbackView,
)

router = DefaultRouter()
router.register(r'', CitizenGrievanceViewSet, basename='citizen-grievance')

urlpatterns = [
    # Public Tracking (AllowAny)
    path('track/', TrackGrievanceView.as_view(), name='track-grievance'),
    path('track/<str:ref>/', TrackGrievanceView.as_view(), name='track-grievance-param'),

    # Grievance Sub-resources
    path('<int:pk>/history/', GrievanceHistoryView.as_view(), name='grievance-history'),
    path('<int:pk>/attachments/', UploadAttachmentView.as_view(), name='upload-attachment'),
    path('<int:pk>/feedback/', SubmitFeedbackView.as_view(), name='submit-feedback'),
] + router.urls
