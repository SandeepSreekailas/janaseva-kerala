from django.db import models
from django.utils.translation import gettext_lazy as _

class Department(models.Model):
    """Government Department model."""
    name = models.CharField(_('department name'), max_length=150, unique=True)
    code = models.CharField(_('code'), max_length=30, unique=True, db_index=True)
    description = models.TextField(_('description'), blank=True, default='')
    contact_email = models.EmailField(_('contact email'))
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        verbose_name = _('department')
        verbose_name_plural = _('departments')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"
