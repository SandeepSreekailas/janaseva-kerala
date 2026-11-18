"""
Janaseva Kerala Root URL Configuration
Chief Minister's Public Grievance Redressal Portal
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView
)

def health_check(request):
    """System health check endpoint for monitoring and cloud readiness."""
    return JsonResponse({
        'status': 'healthy',
        'service': 'Janaseva Kerala Grievance Redressal Portal API',
        'version': '1.0.0',
        'disclaimer': 'Demonstration recruitment prototype for WhiteMatrix Software Solutions. Not affiliated with Government of Kerala.'
    })


def api_root(request):
    """Root entrypoint and API index for testing and status checks."""
    return JsonResponse({
        'service': 'Janaseva Kerala Grievance Redressal Portal API',
        'status': 'online',
        'version': '1.0.0',
        'health_check': '/api/health/',
        'documentation': '/api/docs/',
        'schema': '/api/schema/',
        'admin': '/admin/',
        'endpoints': {
            'auth': '/api/auth/',
            'departments': '/api/departments/',
            'grievances': '/api/grievances/',
            'cmo': '/api/cmo/',
            'officer': '/api/officer/',
            'ai_assistant': '/api/ai/',
            'contact': '/api/contact/',
            'notifications': '/api/notifications/',
            'analytics': '/api/analytics/',
        }
    })


urlpatterns = [
    # Root entrypoints
    path('', api_root, name='root'),
    path('api/', api_root, name='api-root'),

    # Administration
    path('admin/', admin.site.urls),

    # Health Check
    path('api/health/', health_check, name='health-check'),

    # OpenAPI 3 / DRF Spectacular Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # API Modules
    path('api/auth/', include('apps.accounts.urls')),
    path('api/departments/', include('apps.departments.urls')),
    path('api/grievances/', include('apps.grievances.urls')),
    path('api/cmo/', include('apps.grievances.cmo_urls')),
    path('api/officer/', include('apps.grievances.officer_urls')),
    path('api/ai/', include('apps.ai_assistant.urls')),
    path('api/contact/', include('apps.enquiries.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
