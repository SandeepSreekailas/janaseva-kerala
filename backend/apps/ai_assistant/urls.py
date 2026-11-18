from django.urls import path
from .views import AnalyzeGrievanceView

urlpatterns = [
    path('analyze/', AnalyzeGrievanceView.as_view(), name='ai-analyze-grievance'),
    path('', AnalyzeGrievanceView.as_view(), name='ai-analyze'),
]
