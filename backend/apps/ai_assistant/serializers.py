from rest_framework import serializers


class AnalyzeGrievanceRequestSerializer(serializers.Serializer):
    """Request payload for AI grievance analysis."""
    subject = serializers.CharField(
        max_length=255,
        required=True,
        help_text="Brief subject or title of the grievance"
    )
    description = serializers.CharField(
        required=True,
        help_text="Detailed description of the grievance issue"
    )
    district = serializers.CharField(
        max_length=60,
        required=False,
        allow_blank=True,
        default="",
        help_text="District where the issue occurred (e.g. Thiruvananthapuram)"
    )


class AnalyzeGrievanceResponseSerializer(serializers.Serializer):
    """Response payload returned by AI grievance analysis."""
    summary = serializers.CharField(help_text="1-2 sentence concise summary of the grievance")
    suggested_department = serializers.CharField(help_text="Suggested Kerala Government department")
    suggested_category = serializers.CharField(help_text="Standard grievance category")
    suggested_priority = serializers.CharField(help_text="Suggested urgency priority (Low, Medium, High, Urgent)")
    reasoning = serializers.CharField(help_text="Explanation of the advisory recommendations")
    is_fallback = serializers.BooleanField(help_text="True if heuristic fallback was used instead of live Gemini API")
