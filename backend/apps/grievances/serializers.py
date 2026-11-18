"""
Serializers for Janaseva Kerala Grievances Application.
Implements serializers for Citizens, CMO Admins, and Department Officers.
"""
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

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

User = get_user_model()


class UserBriefSerializer(serializers.ModelSerializer):
    """Inline brief serializer for nested user data."""
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'role']
        read_only_fields = fields


class DepartmentBriefSerializer(serializers.ModelSerializer):
    """Inline brief serializer for nested department data."""
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'contact_email']
        read_only_fields = fields


class GrievanceHistorySerializer(serializers.ModelSerializer):
    """Audit log of grievance status transitions and lifecycle events."""
    changed_by = UserBriefSerializer(read_only=True)

    class Meta:
        model = GrievanceHistory
        fields = [
            'id',
            'grievance',
            'previous_status',
            'new_status',
            'remarks',
            'changed_by',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class GrievanceTrackHistorySerializer(serializers.ModelSerializer):
    """Publicly visible status history without officer identity details."""
    class Meta:
        model = GrievanceHistory
        fields = ['previous_status', 'new_status', 'remarks', 'created_at']
        read_only_fields = fields


class DepartmentAssignmentSerializer(serializers.ModelSerializer):
    """Assignment record linking grievance to a department and assigned officer."""
    department = DepartmentBriefSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True,
        required=False
    )
    assigned_officer = UserBriefSerializer(read_only=True)
    assigned_officer_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.OFFICER),
        source='assigned_officer',
        write_only=True,
        required=False,
        allow_null=True
    )
    assigned_by = UserBriefSerializer(read_only=True)

    class Meta:
        model = DepartmentAssignment
        fields = [
            'id',
            'grievance',
            'department',
            'department_id',
            'assigned_officer',
            'assigned_officer_id',
            'assigned_by',
            'assignment_notes',
            'assigned_at',
            'is_active',
        ]
        read_only_fields = ['id', 'assigned_at', 'assigned_by']


class AttachmentSerializer(serializers.ModelSerializer):
    """Supporting document or image attachment."""
    uploaded_by = UserBriefSerializer(read_only=True)
    original_filename = serializers.CharField(required=False, max_length=255)

    class Meta:
        model = Attachment
        fields = [
            'id',
            'grievance',
            'file',
            'original_filename',
            'uploaded_by',
            'uploaded_at',
        ]
        read_only_fields = ['id', 'uploaded_at', 'uploaded_by']

    def create(self, validated_data):
        file_obj = validated_data.get('file')
        if file_obj and not validated_data.get('original_filename'):
            validated_data['original_filename'] = getattr(file_obj, 'name', 'attachment')
        return super().create(validated_data)


class ActionTakenReportSerializer(serializers.ModelSerializer):
    """Investigation report submitted by department officer."""
    officer = UserBriefSerializer(read_only=True)
    review_status_display = serializers.CharField(source='get_cmo_review_status_display', read_only=True)

    class Meta:
        model = ActionTakenReport
        fields = [
            'id',
            'grievance',
            'officer',
            'report_text',
            'attachment',
            'submitted_at',
            'cmo_review_status',
            'review_status_display',
            'cmo_remarks',
            'reviewed_at',
        ]
        read_only_fields = [
            'id',
            'officer',
            'submitted_at',
            'cmo_review_status',
            'review_status_display',
            'cmo_remarks',
            'reviewed_at',
        ]


class CitizenFeedbackSerializer(serializers.ModelSerializer):
    """Feedback submitted by citizen upon grievance resolution."""
    citizen = UserBriefSerializer(read_only=True)

    class Meta:
        model = CitizenFeedback
        fields = [
            'id',
            'grievance',
            'citizen',
            'rating',
            'comments',
            'created_at',
        ]
        read_only_fields = ['id', 'citizen', 'created_at']


class CitizenFeedbackCreateSerializer(serializers.ModelSerializer):
    """Input serializer for citizen feedback submission."""
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comments = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = CitizenFeedback
        fields = ['rating', 'comments']

    def validate(self, attrs):
        grievance = self.context.get('grievance')
        if grievance:
            if hasattr(grievance, 'feedback') and grievance.feedback:
                raise serializers.ValidationError({"detail": "Feedback has already been submitted for this grievance."})
            if grievance.status != GrievanceStatus.RESOLVED:
                raise serializers.ValidationError({"detail": "Feedback can only be submitted for resolved grievances."})
        return attrs


class InternalRemarkSerializer(serializers.ModelSerializer):
    """Confidential internal remarks visible to CMO administrators."""
    admin = UserBriefSerializer(read_only=True)

    class Meta:
        model = InternalRemark
        fields = [
            'id',
            'grievance',
            'admin',
            'remark',
            'created_at',
        ]
        read_only_fields = ['id', 'admin', 'created_at']


class InternalRemarkCreateSerializer(serializers.ModelSerializer):
    """Input serializer for CMO administrator adding an internal remark."""
    remark = serializers.CharField(required=True, allow_blank=False)

    class Meta:
        model = InternalRemark
        fields = ['remark']


class AssignDepartmentSerializer(serializers.Serializer):
    """Serializer for assigning grievance to a department and optional officer."""
    department_id = serializers.IntegerField(required=True)
    officer_id = serializers.IntegerField(required=False, allow_null=True)
    assignment_notes = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_department_id(self, value):
        if not Department.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Active department with this ID does not exist.")
        return value

    def validate_officer_id(self, value):
        if value is not None:
            officer = User.objects.filter(id=value, is_active=True).first()
            if not officer:
                raise serializers.ValidationError("User with this ID does not exist.")
            if getattr(officer, 'role', '') != User.Role.OFFICER and not getattr(officer, 'is_officer', False):
                raise serializers.ValidationError("Selected user does not have the officer role.")
        return value

    def validate(self, attrs):
        department_id = attrs.get('department_id')
        officer_id = attrs.get('officer_id')
        if officer_id and department_id:
            officer = User.objects.filter(id=officer_id).first()
            if officer and officer.department_id and officer.department_id != department_id:
                raise serializers.ValidationError({
                    "officer_id": f"Officer '{officer.full_name}' is not assigned to department ID {department_id}."
                })
        return attrs


class UpdateStatusSerializer(serializers.Serializer):
    """Serializer for updating status of a grievance."""
    status = serializers.ChoiceField(choices=GrievanceStatus.choices)
    remarks = serializers.CharField(required=False, allow_blank=True, default='')


class ReviewActionReportSerializer(serializers.Serializer):
    """Serializer for CMO admin review on an Action Taken Report."""
    cmo_review_status = serializers.ChoiceField(choices=ActionTakenReport.ReviewStatus.choices)
    cmo_remarks = serializers.CharField(required=False, allow_blank=True, default='')


class EscalateGrievanceSerializer(serializers.Serializer):
    """Serializer for escalating grievance priority."""
    priority = serializers.ChoiceField(
        choices=GrievancePriority.choices,
        default=GrievancePriority.URGENT,
        required=False
    )
    remarks = serializers.CharField(
        required=False,
        allow_blank=True,
        default='Grievance escalated to Urgent priority by CMO Admin.'
    )


class GrievanceCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for citizen grievance submission.
    Auto-assigns citizen and creates initial GrievanceHistory.
    """
    reference_number = serializers.CharField(read_only=True)
    status = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Grievance
        fields = [
            'id',
            'reference_number',
            'district',
            'category',
            'subject',
            'description',
            'priority',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'reference_number', 'status', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request')
        citizen = request.user if request and request.user.is_authenticated else validated_data.get('citizen')
        validated_data['citizen'] = citizen
        validated_data['status'] = GrievanceStatus.SUBMITTED

        with transaction.atomic():
            grievance = Grievance.objects.create(**validated_data)
            GrievanceHistory.objects.create(
                grievance=grievance,
                previous_status='',
                new_status=GrievanceStatus.SUBMITTED,
                remarks='Grievance submitted by citizen',
                changed_by=citizen
            )
        return grievance


class GrievanceListSerializer(serializers.ModelSerializer):
    """Compact serializer for grievance lists and dashboard overviews."""
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Grievance
        fields = [
            'id',
            'reference_number',
            'subject',
            'district',
            'category',
            'priority',
            'status',
            'created_at',
            'updated_at',
            'is_overdue',
        ]
        read_only_fields = fields


class GrievanceDetailSerializer(serializers.ModelSerializer):
    """
    Comprehensive serializer for detailed grievance view.
    Includes nested citizen, assignments, history, attachments, action reports,
    feedback, and internal remarks (internal remarks masked for non-CMO users).
    """
    citizen = UserBriefSerializer(read_only=True)
    assignments = DepartmentAssignmentSerializer(many=True, read_only=True)
    history = GrievanceHistorySerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    action_reports = ActionTakenReportSerializer(many=True, read_only=True)
    feedback = CitizenFeedbackSerializer(read_only=True)
    internal_remarks = InternalRemarkSerializer(many=True, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Grievance
        fields = [
            'id',
            'reference_number',
            'citizen',
            'district',
            'category',
            'subject',
            'description',
            'priority',
            'status',
            'ai_summary',
            'ai_suggested_department',
            'ai_suggested_category',
            'ai_suggested_priority',
            'created_at',
            'updated_at',
            'resolved_at',
            'due_date',
            'is_overdue',
            'assignments',
            'history',
            'attachments',
            'action_reports',
            'feedback',
            'internal_remarks',
        ]
        read_only_fields = fields

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        is_cmo = False
        if request and request.user.is_authenticated:
            is_cmo = bool(
                getattr(request.user, 'is_cmo_admin', False)
                or getattr(request.user, 'role', '') == 'cmo_admin'
                or request.user.is_superuser
            )

        # Protect confidential internal remarks from citizen and officer eyes
        if not is_cmo:
            data.pop('internal_remarks', None)

        return data


class GrievancePublicTrackSerializer(serializers.ModelSerializer):
    """Public read-only tracking serializer for citizens tracking with reference number."""
    history = GrievanceTrackHistorySerializer(many=True, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Grievance
        fields = [
            'reference_number',
            'subject',
            'category',
            'district',
            'priority',
            'status',
            'created_at',
            'updated_at',
            'resolved_at',
            'is_overdue',
            'history',
        ]
        read_only_fields = fields
