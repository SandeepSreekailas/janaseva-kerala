"""
Views for Janaseva Kerala Grievances Application.
Implements Citizen, CMO Admin, and Department Officer endpoints.
"""
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

from apps.accounts.permissions import (
    IsCitizen,
    IsCMOAdmin,
    IsOfficer,
    IsOfficerOrCMOAdmin,
    IsCitizenOrCMOAdmin,
)
from apps.departments.models import Department
from .models import (
    District,
    GrievanceCategory,
    GrievancePriority,
    GrievanceStatus,
    Grievance,
    GrievanceHistory,
    DepartmentAssignment,
    Attachment,
    ActionTakenReport,
    CitizenFeedback,
    InternalRemark,
)
from .serializers import (
    UserBriefSerializer,
    DepartmentAssignmentSerializer,
    AttachmentSerializer,
    ActionTakenReportSerializer,
    CitizenFeedbackSerializer,
    CitizenFeedbackCreateSerializer,
    InternalRemarkSerializer,
    InternalRemarkCreateSerializer,
    AssignDepartmentSerializer,
    UpdateStatusSerializer,
    ReviewActionReportSerializer,
    EscalateGrievanceSerializer,
    GrievanceCreateSerializer,
    GrievanceListSerializer,
    GrievanceDetailSerializer,
    GrievanceHistorySerializer,
    GrievancePublicTrackSerializer,
)

User = get_user_model()


def send_notification(user, title, message, grievance=None):
    """Safely create an in-app notification without breaking transaction flow."""
    if not user:
        return
    try:
        from apps.notifications.models import Notification
        Notification.objects.create(
            user=user,
            title=title,
            message=message,
            grievance=grievance
        )
    except Exception:
        pass


# =============================================================================
# CITIZEN VIEWS
# =============================================================================

class CitizenGrievanceViewSet(
    viewsets.GenericViewSet,
    generics.ListCreateAPIView,
    generics.RetrieveAPIView
):
    """
    ViewSet for citizens to submit grievances, view their own history, and track status.
    Endpoints:
    - GET /api/grievances/ -> List authenticated citizen's grievances
    - POST /api/grievances/ -> Submit a new grievance
    - GET /api/grievances/<id>/ -> Retrieve full details of citizen's grievance
    """
    permission_classes = [permissions.IsAuthenticated, IsCitizen]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'district', 'category']
    search_fields = ['reference_number', 'subject', 'description']
    ordering_fields = ['created_at', 'updated_at', 'priority']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        return Grievance.objects.filter(citizen=user).prefetch_related(
            'assignments__department',
            'assignments__assigned_officer',
            'history__changed_by',
            'attachments__uploaded_by',
            'action_reports__officer',
            'feedback',
        ).order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return GrievanceCreateSerializer
        elif self.action == 'retrieve':
            return GrievanceDetailSerializer
        return GrievanceListSerializer

    def perform_create(self, serializer):
        grievance = serializer.save()
        send_notification(
            user=self.request.user,
            title=f"Grievance Submitted: {grievance.reference_number}",
            message=(
                f"Your grievance '{grievance.subject}' has been submitted successfully "
                f"with reference number {grievance.reference_number}."
            ),
            grievance=grievance
        )


class TrackGrievanceView(APIView):
    """
    Public endpoint to track grievance status by reference number.
    Accessible by anyone (citizens, guests, officials) without authentication.
    Usage: GET /api/grievances/track/?ref=JK-YYYY-XXXXXX
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='ref',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Grievance reference number (e.g. JK-2026-000001)',
                required=True,
            )
        ],
        responses={200: GrievancePublicTrackSerializer}
    )
    def get(self, request, *args, **kwargs):
        ref = kwargs.get('ref') or request.query_params.get('ref') or request.query_params.get('reference_number')
        if not ref:
            return Response(
                {"detail": "Reference number parameter '?ref=...' is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        grievance = Grievance.objects.filter(
            reference_number__iexact=ref.strip()
        ).prefetch_related('history').first()

        if not grievance:
            return Response(
                {"detail": f"No grievance found with reference number '{ref.strip()}'."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = GrievancePublicTrackSerializer(grievance)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GrievanceHistoryView(APIView):
    """
    Retrieve chronological audit trail of status transitions for a grievance.
    Citizen can view history for their own grievance; CMO Admins and assigned officers have full access.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        grievance = get_object_or_404(Grievance, pk=pk)

        # Access check
        user = request.user
        is_owner = (grievance.citizen == user)
        is_cmo = getattr(user, 'is_cmo_admin', False) or user.is_superuser
        is_officer = getattr(user, 'is_officer', False) and grievance.assignments.filter(
            is_active=True
        ).filter(
            Q(assigned_officer=user) | Q(department=user.department)
        ).exists()

        if not (is_owner or is_cmo or is_officer):
            return Response(
                {"detail": "You do not have permission to view this grievance's history."},
                status=status.HTTP_403_FORBIDDEN
            )

        history_records = grievance.history.select_related('changed_by').order_by('-created_at')
        serializer = GrievanceHistorySerializer(history_records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UploadAttachmentView(APIView):
    """
    Upload supporting PDF or image document for a grievance.
    Accessible to grievance owner citizen, assigned officers, and CMO admins.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk, *args, **kwargs):
        grievance = get_object_or_404(Grievance, pk=pk)
        user = request.user

        # Access check
        is_owner = (grievance.citizen == user)
        is_cmo = getattr(user, 'is_cmo_admin', False) or user.is_superuser
        is_officer = getattr(user, 'is_officer', False) and grievance.assignments.filter(
            is_active=True
        ).filter(
            Q(assigned_officer=user) | Q(department=user.department)
        ).exists()

        if not (is_owner or is_cmo or is_officer):
            return Response(
                {"detail": "You do not have permission to attach documents to this grievance."},
                status=status.HTTP_403_FORBIDDEN
            )

        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response(
                {"detail": "No file was provided. Please include a 'file' parameter in the form."},
                status=status.HTTP_400_BAD_REQUEST
            )

        filename = request.data.get('original_filename') or file_obj.name
        attachment = Attachment.objects.create(
            grievance=grievance,
            file=file_obj,
            original_filename=filename,
            uploaded_by=user
        )

        serializer = AttachmentSerializer(attachment, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SubmitFeedbackView(APIView):
    """
    Submit citizen satisfaction rating and comments once a grievance is marked Resolved.
    """
    permission_classes = [permissions.IsAuthenticated, IsCitizen]

    def post(self, request, pk, *args, **kwargs):
        grievance = get_object_or_404(Grievance, pk=pk)

        if grievance.citizen != request.user:
            return Response(
                {"detail": "You can only submit feedback for your own grievances."},
                status=status.HTTP_403_FORBIDDEN
            )

        if grievance.status != GrievanceStatus.RESOLVED:
            return Response(
                {"detail": "Feedback can only be submitted for grievances that are marked as Resolved."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if hasattr(grievance, 'feedback') and grievance.feedback:
            return Response(
                {"detail": "Feedback has already been submitted for this grievance."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CitizenFeedbackCreateSerializer(
            data=request.data,
            context={'grievance': grievance, 'request': request}
        )
        serializer.is_valid(raise_exception=True)

        feedback = CitizenFeedback.objects.create(
            grievance=grievance,
            citizen=request.user,
            rating=serializer.validated_data['rating'],
            comments=serializer.validated_data.get('comments', '')
        )

        response_serializer = CitizenFeedbackSerializer(feedback)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


# =============================================================================
# CMO ADMINISTRATOR VIEWS
# =============================================================================

class CMODashboardView(APIView):
    """
    Chief Minister's Office Executive Dashboard.
    Returns high-level portal metrics:
    - Total grievances
    - Breakdown by status, priority, district, and category
    - Recent grievances
    - Overdue grievances count and list
    - Pending Action Taken Reports count
    """
    permission_classes = [permissions.IsAuthenticated, IsCMOAdmin]

    def get(self, request, *args, **kwargs):
        now = timezone.now()

        # Total count
        total_grievances = Grievance.objects.count()

        # By status
        status_counts = {choice[0]: 0 for choice in GrievanceStatus.choices}
        status_qs = Grievance.objects.values('status').annotate(count=Count('id'))
        for item in status_qs:
            status_counts[item['status']] = item['count']

        # By priority
        priority_counts = {choice[0]: 0 for choice in GrievancePriority.choices}
        priority_qs = Grievance.objects.values('priority').annotate(count=Count('id'))
        for item in priority_qs:
            priority_counts[item['priority']] = item['count']

        # By district
        district_counts = {choice[0]: 0 for choice in District.choices}
        district_qs = Grievance.objects.values('district').annotate(count=Count('id'))
        for item in district_qs:
            if item['district'] in district_counts:
                district_counts[item['district']] = item['count']

        # By category
        category_counts = {choice[0]: 0 for choice in GrievanceCategory.choices}
        category_qs = Grievance.objects.values('category').annotate(count=Count('id'))
        for item in category_qs:
            if item['category'] in category_counts:
                category_counts[item['category']] = item['count']

        # Overdue grievances
        overdue_qs = Grievance.objects.filter(
            due_date__isnull=False,
            due_date__lt=now
        ).exclude(
            status=GrievanceStatus.RESOLVED
        )
        overdue_count = overdue_qs.count()

        # Pending ATRs count
        pending_atr_count = ActionTakenReport.objects.filter(
            cmo_review_status=ActionTakenReport.ReviewStatus.PENDING
        ).count()

        # Recent 5 grievances
        recent_grievances = Grievance.objects.all().order_by('-created_at')[:5]
        recent_serializer = GrievanceListSerializer(recent_grievances, many=True)

        return Response({
            'total': total_grievances,
            'by_status': status_counts,
            'by_priority': priority_counts,
            'by_district': district_counts,
            'by_category': category_counts,
            'overdue': {
                'count': overdue_count,
            },
            'pending_atr_count': pending_atr_count,
            'recent': recent_serializer.data,
        }, status=status.HTTP_200_OK)


class CMOGrievanceListView(generics.ListAPIView):
    """
    Comprehensive list of all grievances across Kerala for CMO review and triage.
    Supports filtering by status, priority, district, category, overdue state, and full-text search.
    """
    permission_classes = [permissions.IsAuthenticated, IsCMOAdmin]
    serializer_class = GrievanceListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'district', 'category']
    search_fields = [
        'reference_number',
        'subject',
        'description',
        'citizen__full_name',
        'citizen__email',
    ]
    ordering_fields = ['created_at', 'updated_at', 'priority', 'status', 'due_date']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Grievance.objects.all().select_related('citizen')

        # Custom filter: overdue
        is_overdue = self.request.query_params.get('is_overdue')
        if is_overdue and is_overdue.lower() in ('true', '1'):
            qs = qs.filter(
                due_date__isnull=False,
                due_date__lt=timezone.now()
            ).exclude(status=GrievanceStatus.RESOLVED)

        # Custom filter: department
        dept_id = self.request.query_params.get('department_id')
        if dept_id:
            qs = qs.filter(assignments__department_id=dept_id, assignments__is_active=True)

        # Custom filter: unassigned
        unassigned = self.request.query_params.get('unassigned')
        if unassigned and unassigned.lower() in ('true', '1'):
            qs = qs.filter(Q(assignments__isnull=True) | Q(assignments__is_active=False))

        return qs.distinct().order_by('-created_at')


class CMOGrievanceDetailView(generics.RetrieveAPIView):
    """
    Full detail view of a grievance for CMO administrators.
    Includes confidential internal notes, all assignments, history, and action reports.
    """
    permission_classes = [permissions.IsAuthenticated, IsCMOAdmin]
    serializer_class = GrievanceDetailSerializer

    def get_queryset(self):
        return Grievance.objects.all().select_related('citizen').prefetch_related(
            'assignments__department',
            'assignments__assigned_officer',
            'assignments__assigned_by',
            'history__changed_by',
            'attachments__uploaded_by',
            'action_reports__officer',
            'feedback__citizen',
            'internal_remarks__admin',
        )


class AssignDepartmentView(APIView):
    """
    Assign a grievance to a government department and optionally a specific officer.
    Updates the grievance status to 'Under Review' and records an audit log entry.
    """
    permission_classes = [permissions.IsAuthenticated, IsCMOAdmin]

    def post(self, request, pk, *args, **kwargs):
        grievance = get_object_or_404(Grievance, pk=pk)

        serializer = AssignDepartmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        department_id = serializer.validated_data['department_id']
        officer_id = serializer.validated_data.get('officer_id')
        assignment_notes = serializer.validated_data.get('assignment_notes', '')

        department = Department.objects.get(id=department_id)
        officer = User.objects.filter(id=officer_id).first() if officer_id else None

        with transaction.atomic():
            # Deactivate previous active assignments
            DepartmentAssignment.objects.filter(
                grievance=grievance,
                is_active=True
            ).update(is_active=False)

            # Create new department assignment
            assignment = DepartmentAssignment.objects.create(
                grievance=grievance,
                department=department,
                assigned_officer=officer,
                assigned_by=request.user,
                assignment_notes=assignment_notes,
                is_active=True
            )

            # Update status to Under Review
            previous_status = grievance.status
            grievance.status = GrievanceStatus.UNDER_REVIEW
            grievance.save()

            # Record history
            hist_remarks = f"Assigned to {department.name} ({department.code})"
            if officer:
                hist_remarks += f" - Assigned Officer: {officer.full_name}"
            if assignment_notes:
                hist_remarks += f". Note: {assignment_notes}"

            GrievanceHistory.objects.create(
                grievance=grievance,
                previous_status=previous_status,
                new_status=GrievanceStatus.UNDER_REVIEW,
                remarks=hist_remarks,
                changed_by=request.user
            )

            # Notifications
            if officer:
                send_notification(
                    user=officer,
                    title=f"New Grievance Assignment: {grievance.reference_number}",
                    message=f"You have been assigned to handle grievance '{grievance.subject}'.",
                    grievance=grievance
                )

            send_notification(
                user=grievance.citizen,
                title=f"Grievance Under Review: {grievance.reference_number}",
                message=f"Your grievance has been assigned to {department.name} and is now under review.",
                grievance=grievance
            )

        resp_serializer = DepartmentAssignmentSerializer(assignment)
        return Response(resp_serializer.data, status=status.HTTP_201_CREATED)


class AddInternalRemarkView(APIView):
    """
    Add a confidential internal remark strictly visible to CMO Administrators.
    """
    permission_classes = [permissions.IsAuthenticated, IsCMOAdmin]

    def post(self, request, pk, *args, **kwargs):
        grievance = get_object_or_404(Grievance, pk=pk)

        serializer = InternalRemarkCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        remark_obj = InternalRemark.objects.create(
            grievance=grievance,
            admin=request.user,
            remark=serializer.validated_data['remark']
        )

        resp_serializer = InternalRemarkSerializer(remark_obj)
        return Response(resp_serializer.data, status=status.HTTP_201_CREATED)


class ReviewActionReportView(APIView):
    """
    CMO review of an Action Taken Report (ATR) submitted by a department officer.
    Outcomes:
    - Approved: Grievance is marked Resolved.
    - Rejected: Grievance requires re-investigation.
    - Revision Requested: Officer must update report.
    """
    permission_classes = [permissions.IsAuthenticated, IsCMOAdmin]

    def patch(self, request, pk, *args, **kwargs):
        return self.post(request, pk, *args, **kwargs)

    def post(self, request, pk, *args, **kwargs):
        # Support reviewing by ATR pk or by grievance pk with latest pending/associated ATR
        atr = ActionTakenReport.objects.filter(pk=pk).select_related('grievance', 'officer').first()
        if not atr:
            atr = ActionTakenReport.objects.filter(grievance_id=pk).select_related('grievance', 'officer').order_by('-submitted_at').first()
        if not atr:
            return Response(
                {"detail": "Action Taken Report not found for the given identifier."},
                status=status.HTTP_404_NOT_FOUND
            )
        grievance = atr.grievance

        serializer = ReviewActionReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        review_status = serializer.validated_data['cmo_review_status']
        cmo_remarks = serializer.validated_data.get('cmo_remarks', '')

        with transaction.atomic():
            atr.cmo_review_status = review_status
            atr.cmo_remarks = cmo_remarks
            atr.reviewed_at = timezone.now()
            atr.save()

            if review_status == ActionTakenReport.ReviewStatus.APPROVED:
                prev_status = grievance.status
                grievance.status = GrievanceStatus.RESOLVED
                grievance.resolved_at = timezone.now()
                grievance.save()

                GrievanceHistory.objects.create(
                    grievance=grievance,
                    previous_status=prev_status,
                    new_status=GrievanceStatus.RESOLVED,
                    remarks=f"Action Taken Report Approved by CMO. {cmo_remarks}".strip(),
                    changed_by=request.user
                )

                send_notification(
                    user=grievance.citizen,
                    title=f"Grievance Resolved: {grievance.reference_number}",
                    message="Your grievance has been resolved. You can now view the resolution report and provide your feedback.",
                    grievance=grievance
                )

                send_notification(
                    user=atr.officer,
                    title=f"ATR Approved: {grievance.reference_number}",
                    message="Your Action Taken Report has been approved by the CMO.",
                    grievance=grievance
                )

            elif review_status == ActionTakenReport.ReviewStatus.REJECTED:
                GrievanceHistory.objects.create(
                    grievance=grievance,
                    previous_status=grievance.status,
                    new_status=grievance.status,
                    remarks=f"Action Taken Report Rejected by CMO. Re-investigation required. {cmo_remarks}".strip(),
                    changed_by=request.user
                )

                send_notification(
                    user=atr.officer,
                    title=f"ATR Rejected: {grievance.reference_number}",
                    message=f"Your Action Taken Report was rejected. Re-investigation required. CMO remarks: {cmo_remarks}",
                    grievance=grievance
                )

            elif review_status == ActionTakenReport.ReviewStatus.REVISION_REQUESTED:
                GrievanceHistory.objects.create(
                    grievance=grievance,
                    previous_status=grievance.status,
                    new_status=grievance.status,
                    remarks=f"Action Taken Report Revision Requested by CMO. {cmo_remarks}".strip(),
                    changed_by=request.user
                )

                send_notification(
                    user=atr.officer,
                    title=f"ATR Revision Requested: {grievance.reference_number}",
                    message=f"The CMO has requested revisions on your report. Remarks: {cmo_remarks}",
                    grievance=grievance
                )

        resp_serializer = ActionTakenReportSerializer(atr)
        return Response(resp_serializer.data, status=status.HTTP_200_OK)


class EscalateGrievanceView(APIView):
    """
    Escalate a grievance's priority to Urgent or specified level and record audit trail.
    """
    permission_classes = [permissions.IsAuthenticated, IsCMOAdmin]

    def post(self, request, pk, *args, **kwargs):
        grievance = get_object_or_404(Grievance, pk=pk)

        serializer = EscalateGrievanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_priority = serializer.validated_data.get('priority', GrievancePriority.URGENT)
        remarks = serializer.validated_data.get('remarks', 'Grievance escalated by CMO Admin.')
        old_priority = grievance.priority

        with transaction.atomic():
            grievance.priority = new_priority
            grievance.save()

            GrievanceHistory.objects.create(
                grievance=grievance,
                previous_status=grievance.status,
                new_status=grievance.status,
                remarks=f"Priority escalated from {old_priority} to {new_priority}. {remarks}".strip(),
                changed_by=request.user
            )

            # Notify active assigned officer
            active_assignment = grievance.assignments.filter(is_active=True).first()
            if active_assignment and active_assignment.assigned_officer:
                send_notification(
                    user=active_assignment.assigned_officer,
                    title=f"URGENT Escalation: {grievance.reference_number}",
                    message=f"Grievance {grievance.reference_number} has been escalated to {new_priority} priority by CMO.",
                    grievance=grievance
                )

        detail_serializer = GrievanceDetailSerializer(grievance, context={'request': request})
        return Response(detail_serializer.data, status=status.HTTP_200_OK)


class UpdateGrievanceStatusView(APIView):
    """
    CMO Admin update of grievance status with audit trail logging and citizen notification.
    """
    permission_classes = [permissions.IsAuthenticated, IsCMOAdmin]

    def patch(self, request, pk, *args, **kwargs):
        return self.post(request, pk, *args, **kwargs)

    def post(self, request, pk, *args, **kwargs):
        grievance = get_object_or_404(Grievance, pk=pk)

        serializer = UpdateStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        remarks = serializer.validated_data.get('remarks', '')
        previous_status = grievance.status

        with transaction.atomic():
            grievance.status = new_status
            if new_status == GrievanceStatus.RESOLVED:
                grievance.resolved_at = timezone.now()
            elif previous_status == GrievanceStatus.RESOLVED and new_status != GrievanceStatus.RESOLVED:
                grievance.resolved_at = None

            grievance.save()

            GrievanceHistory.objects.create(
                grievance=grievance,
                previous_status=previous_status,
                new_status=new_status,
                remarks=remarks or f"Status changed to {new_status} by CMO Admin",
                changed_by=request.user
            )

            send_notification(
                user=grievance.citizen,
                title=f"Grievance Status Updated: {grievance.reference_number}",
                message=f"Your grievance status is now '{new_status}'. {remarks}".strip(),
                grievance=grievance
            )

        detail_serializer = GrievanceDetailSerializer(grievance, context={'request': request})
        return Response(detail_serializer.data, status=status.HTTP_200_OK)


# =============================================================================
# DEPARTMENT OFFICER VIEWS
# =============================================================================

class OfficerDashboardView(APIView):
    """
    Dashboard metrics for Department Officers:
    - Total grievances assigned to officer's department / officer
    - Pending action count (Submitted, Under Review, In Progress)
    - Resolved count
    - Overdue count
    - Breakdown by priority
    - Recent assigned grievances list
    - Pending action reports count
    """
    permission_classes = [permissions.IsAuthenticated, IsOfficer]

    def get(self, request, *args, **kwargs):
        officer = request.user
        now = timezone.now()

        # Build assignment query: assigned directly or via department
        q = Q(assignments__assigned_officer=officer, assignments__is_active=True)
        if officer.department:
            q |= Q(assignments__department=officer.department, assignments__is_active=True)

        assigned_qs = Grievance.objects.filter(q).distinct()

        total_assigned = assigned_qs.count()

        pending_action = assigned_qs.filter(
            status__in=[
                GrievanceStatus.SUBMITTED,
                GrievanceStatus.UNDER_REVIEW,
                GrievanceStatus.IN_PROGRESS,
                GrievanceStatus.REOPENED,
            ]
        ).count()

        resolved = assigned_qs.filter(status=GrievanceStatus.RESOLVED).count()

        overdue_count = assigned_qs.filter(
            due_date__isnull=False,
            due_date__lt=now
        ).exclude(
            status=GrievanceStatus.RESOLVED
        ).count()

        # By priority
        priority_counts = {choice[0]: 0 for choice in GrievancePriority.choices}
        priority_qs = assigned_qs.values('priority').annotate(count=Count('id'))
        for item in priority_qs:
            priority_counts[item['priority']] = item['count']

        # By status
        status_counts = {choice[0]: 0 for choice in GrievanceStatus.choices}
        status_qs = assigned_qs.values('status').annotate(count=Count('id'))
        for item in status_qs:
            status_counts[item['status']] = item['count']

        # Pending reports submitted by this officer
        pending_reports = ActionTakenReport.objects.filter(
            officer=officer,
            cmo_review_status=ActionTakenReport.ReviewStatus.PENDING
        ).count()

        # Recent 5 assigned
        recent_qs = assigned_qs.order_by('-created_at')[:5]
        recent_serializer = GrievanceListSerializer(recent_qs, many=True)

        return Response({
            'total_assigned': total_assigned,
            'pending_action': pending_action,
            'resolved': resolved,
            'overdue': overdue_count,
            'by_priority': priority_counts,
            'by_status': status_counts,
            'pending_reports': pending_reports,
            'recent_assigned': recent_serializer.data,
        }, status=status.HTTP_200_OK)


class OfficerGrievanceListView(generics.ListAPIView):
    """
    List grievances assigned to the department officer's jurisdiction.
    Supports filtering by status, priority, district, category, and search.
    """
    permission_classes = [permissions.IsAuthenticated, IsOfficer]
    serializer_class = GrievanceListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'district', 'category']
    search_fields = ['reference_number', 'subject', 'description']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'status', 'due_date']
    ordering = ['-created_at']

    def get_queryset(self):
        officer = self.request.user
        q = Q(assignments__assigned_officer=officer, assignments__is_active=True)
        if officer.department:
            q |= Q(assignments__department=officer.department, assignments__is_active=True)

        return Grievance.objects.filter(q).distinct().order_by('-created_at')


class OfficerGrievanceDetailView(generics.RetrieveAPIView):
    """
    Retrieve full details of an assigned grievance for the department officer.
    Internal confidential remarks are filtered out.
    """
    permission_classes = [permissions.IsAuthenticated, IsOfficer]
    serializer_class = GrievanceDetailSerializer

    def get_queryset(self):
        officer = self.request.user
        q = Q(assignments__assigned_officer=officer, assignments__is_active=True)
        if officer.department:
            q |= Q(assignments__department=officer.department, assignments__is_active=True)

        return Grievance.objects.filter(q).distinct().prefetch_related(
            'assignments__department',
            'assignments__assigned_officer',
            'history__changed_by',
            'attachments__uploaded_by',
            'action_reports__officer',
            'feedback',
        )


class OfficerUpdateStatusView(APIView):
    """
    Officer status update on an assigned grievance (e.g. marking In Progress).
    """
    permission_classes = [permissions.IsAuthenticated, IsOfficer]

    def patch(self, request, pk, *args, **kwargs):
        return self.post(request, pk, *args, **kwargs)

    def post(self, request, pk, *args, **kwargs):
        officer = request.user
        q = Q(assignments__assigned_officer=officer, assignments__is_active=True)
        if officer.department:
            q |= Q(assignments__department=officer.department, assignments__is_active=True)

        grievance = get_object_or_404(Grievance.objects.filter(q).distinct(), pk=pk)

        serializer = UpdateStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        remarks = serializer.validated_data.get('remarks', '')
        previous_status = grievance.status

        with transaction.atomic():
            grievance.status = new_status
            if new_status == GrievanceStatus.RESOLVED:
                grievance.resolved_at = timezone.now()
            elif previous_status == GrievanceStatus.RESOLVED and new_status != GrievanceStatus.RESOLVED:
                grievance.resolved_at = None

            grievance.save()

            GrievanceHistory.objects.create(
                grievance=grievance,
                previous_status=previous_status,
                new_status=new_status,
                remarks=remarks or f"Status updated to {new_status} by Officer {officer.full_name}",
                changed_by=officer
            )

            send_notification(
                user=grievance.citizen,
                title=f"Grievance Status Updated: {grievance.reference_number}",
                message=f"Your grievance status has been updated to '{new_status}'. {remarks}".strip(),
                grievance=grievance
            )

        resp_serializer = GrievanceDetailSerializer(grievance, context={'request': request})
        return Response(resp_serializer.data, status=status.HTTP_200_OK)


class SubmitActionReportView(APIView):
    """
    Department Officer submits an Action Taken Report (ATR) upon completing field investigation.
    Sets report to 'Pending CMO Review'.
    """
    permission_classes = [permissions.IsAuthenticated, IsOfficer]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, pk, *args, **kwargs):
        officer = request.user
        q = Q(assignments__assigned_officer=officer, assignments__is_active=True)
        if officer.department:
            q |= Q(assignments__department=officer.department, assignments__is_active=True)

        grievance = get_object_or_404(Grievance.objects.filter(q).distinct(), pk=pk)

        report_text = request.data.get('report_text')
        if not report_text or not report_text.strip():
            return Response(
                {"detail": "Field 'report_text' is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        attachment_file = request.FILES.get('attachment')

        with transaction.atomic():
            atr = ActionTakenReport.objects.create(
                grievance=grievance,
                officer=officer,
                report_text=report_text.strip(),
                attachment=attachment_file,
                cmo_review_status=ActionTakenReport.ReviewStatus.PENDING
            )

            # Move status to In Progress if currently Submitted or Under Review
            if grievance.status in [GrievanceStatus.SUBMITTED, GrievanceStatus.UNDER_REVIEW]:
                prev_status = grievance.status
                grievance.status = GrievanceStatus.IN_PROGRESS
                grievance.save()

                GrievanceHistory.objects.create(
                    grievance=grievance,
                    previous_status=prev_status,
                    new_status=GrievanceStatus.IN_PROGRESS,
                    remarks=f"Action Taken Report submitted by Officer {officer.full_name}. Awaiting CMO review.",
                    changed_by=officer
                )
            else:
                GrievanceHistory.objects.create(
                    grievance=grievance,
                    previous_status=grievance.status,
                    new_status=grievance.status,
                    remarks=f"Action Taken Report submitted by Officer {officer.full_name}. Awaiting CMO review.",
                    changed_by=officer
                )

            # Notify CMO administrators
            cmo_admins = User.objects.filter(
                Q(role=User.Role.CMO_ADMIN) | Q(is_superuser=True),
                is_active=True
            )
            for admin_user in cmo_admins:
                send_notification(
                    user=admin_user,
                    title=f"New ATR Submitted: {grievance.reference_number}",
                    message=f"Officer {officer.full_name} submitted an Action Taken Report for {grievance.reference_number}.",
                    grievance=grievance
                )

        resp_serializer = ActionTakenReportSerializer(atr)
        return Response(resp_serializer.data, status=status.HTTP_201_CREATED)
