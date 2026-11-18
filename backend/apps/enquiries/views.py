from rest_framework import generics, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from apps.accounts.permissions import IsCMOAdmin
from .models import ContactEnquiry
from .serializers import ContactEnquiryCreateSerializer, ContactEnquirySerializer


class SubmitEnquiryView(generics.CreateAPIView):
    """
    Public endpoint for citizens to submit contact enquiries.
    Permission: AllowAny.
    """
    queryset = ContactEnquiry.objects.all()
    serializer_class = ContactEnquiryCreateSerializer
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        """
        Delegate GET requests to EnquiryListView when accessed at the root contact endpoint.
        """
        return EnquiryListView.as_view()(
            request._request if hasattr(request, '_request') else request,
            *args,
            **kwargs
        )


class EnquiryListView(generics.ListAPIView):
    """
    CMO Admin endpoint to list, search, and filter citizen contact enquiries.
    Permission: IsCMOAdmin.
    """
    queryset = ContactEnquiry.objects.all()
    serializer_class = ContactEnquirySerializer
    permission_classes = [IsCMOAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['name', 'email', 'subject', 'message']
    ordering_fields = ['created_at', 'status', 'name']
    ordering = ['-created_at']
