"""
CMO Administrator URLs for Grievances API.
Base route: /api/cmo/
"""
from django.urls import path

from .views import (
    CMODashboardView,
    CMOGrievanceListView,
    CMOGrievanceDetailView,
    AssignDepartmentView,
    AddInternalRemarkView,
    ReviewActionReportView,
    EscalateGrievanceView,
    UpdateGrievanceStatusView,
)

urlpatterns = [
    # Dashboard
    path('dashboard/', CMODashboardView.as_view(), name='cmo-dashboard'),

    # Grievances Triage & Management
    path('grievances/', CMOGrievanceListView.as_view(), name='cmo-grievance-list'),
    path('grievances/<int:pk>/', CMOGrievanceDetailView.as_view(), name='cmo-grievance-detail'),
    path('grievances/<int:pk>/assign/', AssignDepartmentView.as_view(), name='cmo-assign-department'),
    path('grievances/<int:pk>/remark/', AddInternalRemarkView.as_view(), name='cmo-add-internal-remark'),
    path('grievances/<int:pk>/remarks/', AddInternalRemarkView.as_view(), name='cmo-add-internal-remarks'),
    path('grievances/<int:pk>/internal-remarks/', AddInternalRemarkView.as_view(), name='cmo-add-internal-remark-alt'),
    path('grievances/<int:pk>/status/', UpdateGrievanceStatusView.as_view(), name='cmo-update-status'),
    path('grievances/<int:pk>/update-status/', UpdateGrievanceStatusView.as_view(), name='cmo-update-status-alt'),
    path('grievances/<int:pk>/escalate/', EscalateGrievanceView.as_view(), name='cmo-escalate-grievance'),

    # Action Taken Report Review
    path('reports/<int:pk>/review/', ReviewActionReportView.as_view(), name='cmo-review-report'),
    path('action-reports/<int:pk>/review/', ReviewActionReportView.as_view(), name='cmo-review-action-report'),
    path('grievances/<int:pk>/review-action-report/', ReviewActionReportView.as_view(), name='cmo-review-grievance-atr'),
    path('grievances/<int:grievance_id>/action-reports/<int:pk>/review/', ReviewActionReportView.as_view(), name='cmo-review-grievance-action-report'),
]
