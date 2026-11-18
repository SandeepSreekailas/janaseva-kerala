from django.db import models
from django.utils.translation import gettext_lazy as _

class ContactEnquiry(models.Model):
    """Citizen public enquiries and contact messages."""
    class Status(models.TextChoices):
        NEW = 'New', _('New')
        RESPONDED = 'Responded', _('Responded')
        ARCHIVED = 'Archived', _('Archived')

    name = models.CharField(_('name'), max_length=150)
    email = models.EmailField(_('email address'))
    subject = models.CharField(_('subject'), max_length=255)
    message = models.TextField(_('message'))
    created_at = models.DateTimeField(_('created at'), auto_now_add=True, db_index=True)
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
        db_index=True
    )

    class Meta:
        verbose_name = _('contact enquiry')
        verbose_name_plural = _('contact enquiries')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject} from {self.name} ({self.email})"
