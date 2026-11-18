import datetime
from django.db import models, transaction
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class District(models.TextChoices):
    ALAPPUZHA = 'Alappuzha', _('Alappuzha')
    ERNAKULAM = 'Ernakulam', _('Ernakulam')
    IDUKKI = 'Idukki', _('Idukki')
    KANNUR = 'Kannur', _('Kannur')
    KASARAGOD = 'Kasaragod', _('Kasaragod')
    KOLLAM = 'Kollam', _('Kollam')
    KOTTAYAM = 'Kottayam', _('Kottayam')
    KOZHIKODE = 'Kozhikode', _('Kozhikode')
    MALAPPURAM = 'Malappuram', _('Malappuram')
    PALAKKAD = 'Palakkad', _('Palakkad')
    PATHANAMTHITTA = 'Pathanamthitta', _('Pathanamthitta')
    THIRUVANANTHAPURAM = 'Thiruvananthapuram', _('Thiruvananthapuram')
    THRISSUR = 'Thrissur', _('Thrissur')
    WAYANAD = 'Wayanad', _('Wayanad')


class GrievanceCategory(models.TextChoices):
    PUBLIC_WORKS = 'Public Works', _('Public Works & Roads')
    HEALTHCARE = 'Healthcare', _('Health & Medical Services')
    EDUCATION = 'Education', _('Education & Schools')
    LOCAL_GOVERNANCE = 'Local Self Government', _('Local Self Government & Sanitation')
    WATER_RESOURCES = 'Water Resources', _('Water Supply & Irrigation')
    ELECTRICITY = 'Electricity', _('Electricity & Power')
    TRANSPORT = 'Transport', _('Public Transport & Traffic')
    REVENUE = 'Revenue & Land', _('Revenue, Land & Registration')
    LAW_AND_ORDER = 'Law & Order', _('Police & Law Enforcement')
    CIVIL_SUPPLIES = 'Civil Supplies', _('Civil Supplies & Ration')
    ENVIRONMENT = 'Environment', _('Environment & Forest')
    OTHER = 'Other', _('Other Public Matters')


class GrievancePriority(models.TextChoices):
    LOW = 'Low', _('Low')
    MEDIUM = 'Medium', _('Medium')
    HIGH = 'High', _('High')
    URGENT = 'Urgent', _('Urgent')


class GrievanceStatus(models.TextChoices):
    SUBMITTED = 'Submitted', _('Submitted')
    UNDER_REVIEW = 'Under Review', _('Under Review')
    IN_PROGRESS = 'In Progress', _('In Progress')
    RESOLVED = 'Resolved', _('Resolved')
    REOPENED = 'Reopened', _('Reopened')


def generate_reference_number():
    """Generate unique human-readable grievance reference number: JK-YYYY-XXXXXX."""
    current_year = datetime.datetime.now().year
    prefix = f"JK-{current_year}-"
    
    with transaction.atomic():
        last_grievance = Grievance.objects.filter(
            reference_number__startswith=prefix
        ).order_by('-reference_number').select_for_update().first()

        if last_grievance and last_grievance.reference_number:
            try:
                last_seq = int(last_grievance.reference_number.split('-')[-1])
                new_seq = last_seq + 1
            except (ValueError, IndexError):
                new_seq = Grievance.objects.filter(reference_number__startswith=prefix).count() + 1
        else:
            new_seq = 1

        ref_number = f"{prefix}{new_seq:06d}"
        # Ensure absolute uniqueness
        while Grievance.objects.filter(reference_number=ref_number).exists():
            new_seq += 1
            ref_number = f"{prefix}{new_seq:06d}"

        return ref_number


class Grievance(models.Model):
    """Core Grievance model representing citizen complaints."""
    reference_number = models.CharField(
        _('reference number'),
        max_length=30,
        unique=True,
        db_index=True,
        editable=False
    )
    citizen = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='grievances',
        verbose_name=_('citizen')
    )
    district = models.CharField(
        _('district'),
        max_length=60,
        choices=District.choices,
        db_index=True
    )
    category = models.CharField(
        _('category'),
        max_length=60,
        choices=GrievanceCategory.choices,
        db_index=True
    )
    subject = models.CharField(_('subject'), max_length=255)
    description = models.TextField(_('description'))
    priority = models.CharField(
        _('priority'),
        max_length=20,
        choices=GrievancePriority.choices,
        default=GrievancePriority.MEDIUM,
        db_index=True
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=GrievanceStatus.choices,
        default=GrievanceStatus.SUBMITTED,
        db_index=True
    )

    # AI Advisory Suggestions
    ai_summary = models.TextField(_('AI summary'), blank=True, null=True)
    ai_suggested_department = models.CharField(_('AI suggested department'), max_length=150, blank=True, null=True)
    ai_suggested_category = models.CharField(_('AI suggested category'), max_length=100, blank=True, null=True)
    ai_suggested_priority = models.CharField(_('AI suggested priority'), max_length=50, blank=True, null=True)

    created_at = models.DateTimeField(_('created at'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    resolved_at = models.DateTimeField(_('resolved at'), null=True, blank=True)
    due_date = models.DateTimeField(_('due date'), null=True, blank=True)

    class Meta:
        verbose_name = _('grievance')
        verbose_name_plural = _('grievances')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['district', 'category']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.reference_number}: {self.subject} [{self.status}]"

    def save(self, *args, **kwargs):
        if not self.reference_number:
            self.reference_number = generate_reference_number()
        super().save(*args, **kwargs)

    @property
    def is_overdue(self):
        if self.due_date and self.status not in [GrievanceStatus.RESOLVED]:
            return datetime.datetime.now(self.due_date.tzinfo) > self.due_date
        return False


class GrievanceHistory(models.Model):
    """Audit trail of status transitions for a grievance."""
    grievance = models.ForeignKey(
        Grievance,
        on_delete=models.CASCADE,
        related_name='history',
        verbose_name=_('grievance')
    )
    previous_status = models.CharField(_('previous status'), max_length=50)
    new_status = models.CharField(_('new status'), max_length=50)
    remarks = models.TextField(_('remarks'), blank=True, default='')
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='status_changes',
        verbose_name=_('changed by')
    )
    created_at = models.DateTimeField(_('timestamp'), auto_now_add=True)

    class Meta:
        verbose_name = _('grievance history')
        verbose_name_plural = _('grievance histories')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.grievance.reference_number}: {self.previous_status} -> {self.new_status} at {self.created_at}"


class DepartmentAssignment(models.Model):
    """Assignment record linking grievance to a government department and specific officer."""
    grievance = models.ForeignKey(
        Grievance,
        on_delete=models.CASCADE,
        related_name='assignments',
        verbose_name=_('grievance')
    )
    department = models.ForeignKey(
        'departments.Department',
        on_delete=models.CASCADE,
        related_name='assignments',
        verbose_name=_('department')
    )
    assigned_officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='officer_assignments',
        verbose_name=_('assigned officer')
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assignments_made',
        verbose_name=_('assigned by')
    )
    assignment_notes = models.TextField(_('assignment notes'), blank=True, default='')
    assigned_at = models.DateTimeField(_('assigned at'), auto_now_add=True)
    is_active = models.BooleanField(_('is active'), default=True)

    class Meta:
        verbose_name = _('department assignment')
        verbose_name_plural = _('department assignments')
        ordering = ['-assigned_at']

    def __str__(self):
        return f"{self.grievance.reference_number} assigned to {self.department.code}"


class Attachment(models.Model):
    """Supporting image or PDF documents uploaded by citizen or officer."""
    grievance = models.ForeignKey(
        Grievance,
        on_delete=models.CASCADE,
        related_name='attachments',
        verbose_name=_('grievance')
    )
    file = models.FileField(_('file'), upload_to='grievance_attachments/')
    original_filename = models.CharField(_('original filename'), max_length=255)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='attachments_uploaded',
        verbose_name=_('uploaded by')
    )
    uploaded_at = models.DateTimeField(_('uploaded at'), auto_now_add=True)

    class Meta:
        verbose_name = _('attachment')
        verbose_name_plural = _('attachments')
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"Attachment: {self.original_filename} ({self.grievance.reference_number})"


class ActionTakenReport(models.Model):
    """Investigation report submitted by department officer for CMO review."""
    class ReviewStatus(models.TextChoices):
        PENDING = 'Pending', _('Pending CMO Review')
        APPROVED = 'Approved', _('Approved by CMO')
        REJECTED = 'Rejected', _('Rejected / Re-investigate')
        REVISION_REQUESTED = 'Revision Requested', _('Revision Requested')

    grievance = models.ForeignKey(
        Grievance,
        on_delete=models.CASCADE,
        related_name='action_reports',
        verbose_name=_('grievance')
    )
    officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='action_reports',
        verbose_name=_('reporting officer')
    )
    report_text = models.TextField(_('action taken report'))
    attachment = models.FileField(_('supporting document'), upload_to='action_reports/', blank=True, null=True)
    submitted_at = models.DateTimeField(_('submitted at'), auto_now_add=True)
    cmo_review_status = models.CharField(
        _('CMO review status'),
        max_length=30,
        choices=ReviewStatus.choices,
        default=ReviewStatus.PENDING
    )
    cmo_remarks = models.TextField(_('CMO remarks'), blank=True, default='')
    reviewed_at = models.DateTimeField(_('reviewed at'), null=True, blank=True)

    class Meta:
        verbose_name = _('action taken report')
        verbose_name_plural = _('action taken reports')
        ordering = ['-submitted_at']

    def __str__(self):
        return f"ATR for {self.grievance.reference_number} by {self.officer.full_name} [{self.cmo_review_status}]"


class CitizenFeedback(models.Model):
    """Feedback submitted by citizen upon grievance resolution."""
    grievance = models.OneToOneField(
        Grievance,
        on_delete=models.CASCADE,
        related_name='feedback',
        verbose_name=_('grievance')
    )
    citizen = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='feedbacks',
        verbose_name=_('citizen')
    )
    rating = models.PositiveSmallIntegerField(_('rating (1-5)'))
    comments = models.TextField(_('comments'), blank=True, default='')
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        verbose_name = _('citizen feedback')
        verbose_name_plural = _('citizen feedbacks')
        ordering = ['-created_at']

    def __str__(self):
        return f"Feedback for {self.grievance.reference_number}: {self.rating}/5"


class InternalRemark(models.Model):
    """Confidential internal notes visible strictly to CMO Admins and authorized staff."""
    grievance = models.ForeignKey(
        Grievance,
        on_delete=models.CASCADE,
        related_name='internal_remarks',
        verbose_name=_('grievance')
    )
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='internal_remarks_added',
        verbose_name=_('administrator')
    )
    remark = models.TextField(_('internal confidential remark'))
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        verbose_name = _('internal remark')
        verbose_name_plural = _('internal remarks')
        ordering = ['-created_at']

    def __str__(self):
        return f"Internal note on {self.grievance.reference_number} by {self.admin.full_name}"
