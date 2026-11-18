from django.urls import path
from .views import SubmitEnquiryView, EnquiryListView

urlpatterns = [
    path('', SubmitEnquiryView.as_view(), name='contact-submit'),
    path('submit/', SubmitEnquiryView.as_view(), name='submit-enquiry'),
    path('enquiries/', EnquiryListView.as_view(), name='enquiry-list'),
    path('list/', EnquiryListView.as_view(), name='contact-list'),
]
