"""
Department Officer URLs for Grievances API.
Base route: /api/officer/
"""
from django.urls import path

from .views import (
    OfficerDashboardView,
    OfficerGrievanceListView,
    OfficerGrievanceDetailView,
    OfficerUpdateStatusView,
    SubmitActionReportView,
)

urlpatterns = [
    # Officer Dashboard
    path('dashboard/', OfficerDashboardView.as_view(), name='officer-dashboard'),

    # Officer Assigned Grievances
    path('grievances/', OfficerGrievanceListView.as_view(), name='officer-grievance-list'),
    path('grievances/<int:pk>/', OfficerGrievanceDetailView.as_view(), name='officer-grievance-detail'),
    path('grievances/<int:pk>/status/', OfficerUpdateStatusView.as_view(), name='officer-status'),
    path('grievances/<int:pk>/update-status/', OfficerUpdateStatusView.as_view(), name='officer-update-status'),
    path('grievances/<int:pk>/report/', SubmitActionReportView.as_view(), name='officer-report'),
    path('grievances/<int:pk>/action-report/', SubmitActionReportView.as_view(), name='officer-submit-action-report'),
]
