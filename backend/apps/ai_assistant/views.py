from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .serializers import AnalyzeGrievanceRequestSerializer, AnalyzeGrievanceResponseSerializer
from .services import GeminiService


class AnalyzeGrievanceView(APIView):
    """
    AI Advisory Endpoint for Grievance Triage.
    Analyzes citizen complaint text using Google Gemini (or rule-based fallback)
    to suggest summary, government department, category, and urgency priority.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Analyze grievance with AI",
        description="Submit a grievance subject and description to get AI-suggested department, category, priority, and summary.",
        request=AnalyzeGrievanceRequestSerializer,
        responses={
            200: OpenApiResponse(response=AnalyzeGrievanceResponseSerializer, description="Analysis completed successfully"),
            400: OpenApiResponse(description="Invalid request payload (missing subject or description)"),
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = AnalyzeGrievanceRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        subject = serializer.validated_data['subject']
        description = serializer.validated_data['description']
        district = serializer.validated_data.get('district', '')

        service = GeminiService()
        result = service.analyze_grievance(
            subject=subject,
            description=description,
            district=district
        )

        return Response(result, status=status.HTTP_200_OK)
