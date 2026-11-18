import json
import logging
import os
from django.conf import settings

logger = logging.getLogger(__name__)


class GeminiService:
    """
    AI Advisory Service using Google Gemini to analyze public grievances
    and suggest department, category, priority, and summary.
    """

    def analyze_grievance(self, subject: str, description: str, district: str = "") -> dict:
        """
        Analyze a citizen grievance using Google Gemini.
        If the Gemini API key is missing or an error occurs, falls back to a structured rule-based response.

        Returns a dictionary with keys:
        - summary: str
        - suggested_department: str
        - suggested_category: str
        - suggested_priority: str
        - reasoning: str
        - is_fallback: bool
        """
        api_key = getattr(settings, 'GEMINI_API_KEY', None) or os.getenv('GEMINI_API_KEY', '')

        if not api_key or not str(api_key).strip():
            logger.info("No GEMINI_API_KEY provided; using structured fallback analysis.")
            return self._get_fallback_analysis(subject, description, district)

        try:
            import google.generativeai as genai

            genai.configure(api_key=api_key.strip())

            prompt = f"""You are an expert grievance triage assistant for Janaseva Kerala (Chief Minister's Public Grievance Redressal System, Government of Kerala).
Analyze the following citizen complaint and provide classification recommendations:
- Subject: {subject}
- Description: {description}
- District: {district if district else 'Not specified'}

Return a single JSON object with the following keys:
1. "summary": A concise 1-2 sentence executive summary of the issue.
2. "suggested_department": The most appropriate Kerala Government department (e.g. Public Works Department, Health and Family Welfare Department, General Education Department, Local Self Government Department, Water Resources Department, Kerala State Electricity Board, Transport Department, Revenue Department, Home Department).
3. "suggested_category": One of the exact categories: ["Public Works", "Healthcare", "Education", "Local Self Government", "Water Resources", "Electricity", "Transport", "Revenue & Land", "Law & Order", "Civil Supplies", "Environment", "Other"].
4. "suggested_priority": Exactly one priority level: ["Low", "Medium", "High", "Urgent"]. (Use Urgent only for severe life-safety emergencies, immediate public hazards, or critical disasters).
5. "reasoning": A brief 1-2 sentence rationale for the recommended department, category, and priority.

Ensure the response is strictly valid JSON with no additional markdown formatting."""

            model = genai.GenerativeModel(
                model_name='gemini-1.5-flash',
                generation_config={"response_mime_type": "application/json"}
            )
            response = model.generate_content(prompt)
            content = response.text.strip()

            # Clean markdown code block fences if present
            if content.startswith('```'):
                lines = content.splitlines()
                if lines[0].startswith('```'):
                    lines = lines[1:]
                if lines and lines[-1].startswith('```'):
                    lines = lines[:-1]
                content = '\n'.join(lines).strip()

            data = json.loads(content)

            summary = str(data.get('summary', '')).strip() or f"Grievance regarding {subject.strip()}"
            suggested_department = str(data.get('suggested_department', 'General Administration Department')).strip()
            suggested_category = str(data.get('suggested_category', 'Other')).strip()
            suggested_priority = str(data.get('suggested_priority', 'Medium')).strip()
            reasoning = str(data.get('reasoning', 'Categorized via Gemini AI assistant.')).strip()

            # Validate priority against accepted values
            valid_priorities = {'Low', 'Medium', 'High', 'Urgent'}
            if suggested_priority not in valid_priorities:
                suggested_priority = 'Medium'

            # Validate category against accepted choices
            valid_categories = {
                'Public Works', 'Healthcare', 'Education', 'Local Self Government',
                'Water Resources', 'Electricity', 'Transport', 'Revenue & Land',
                'Law & Order', 'Civil Supplies', 'Environment', 'Other'
            }
            if suggested_category not in valid_categories:
                suggested_category = 'Other'

            return {
                'summary': summary,
                'suggested_department': suggested_department,
                'suggested_category': suggested_category,
                'suggested_priority': suggested_priority,
                'reasoning': reasoning,
                'is_fallback': False,
            }

        except Exception as exc:
            logger.warning("Gemini AI grievance analysis encountered an error: %s. Using fallback.", exc)
            return self._get_fallback_analysis(subject, description, district)

    def _get_fallback_analysis(self, subject: str, description: str, district: str = "") -> dict:
        """
        Rule-based heuristic analysis fallback when Gemini is unavailable or not configured.
        """
        text_lower = f"{subject} {description}".lower()

        # Priority determination
        urgent_keywords = [
            'emergency', 'danger', 'hazard', 'electrocution', 'collapse',
            'death', 'casualty', 'life-threatening', 'sparking', 'fire disaster'
        ]
        high_keywords = [
            'urgent', 'hospital emergency', 'epidemic', 'fever outbreak',
            'contamination', 'sewage overflow', 'broken live wire', 'theft', 'assault'
        ]
        low_keywords = [
            'inquiry', 'information', 'delay in certificate', 'suggestion', 'routine'
        ]

        if any(kw in text_lower for kw in urgent_keywords):
            priority = "Urgent"
        elif any(kw in text_lower for kw in high_keywords):
            priority = "High"
        elif any(kw in text_lower for kw in low_keywords):
            priority = "Low"
        else:
            priority = "Medium"

        # Domain-specific keyword matching (prioritize specific technical utility domains before general road/civic terms)
        if any(kw in text_lower for kw in ['electricity', 'power', 'current', 'voltage', 'kseb', 'transformer', 'power cut', 'meter', 'wire', 'pole', 'electric']):
            department = "Kerala State Electricity Board"
            category = "Electricity"
            reason = "Pertains to power transmission, transformers, or electricity supply under KSEB."
        elif any(kw in text_lower for kw in ['water', 'pipe', 'leak', 'drinking water', 'tap', 'kwa', 'borewell', 'water supply', 'shortage']):
            department = "Water Resources Department"
            category = "Water Resources"
            reason = "Concerns drinking water supply, pipeline leakages, or water resources managed by KWA."
        elif any(kw in text_lower for kw in ['hospital', 'doctor', 'nurse', 'medicine', 'health', 'clinic', 'phc', 'chc', 'medical', 'ambulance', 'fever', 'dengue']):
            department = "Health and Family Welfare Department"
            category = "Healthcare"
            reason = "Relates to public health facilities, medical care, or epidemic management."
        elif any(kw in text_lower for kw in ['school', 'teacher', 'student', 'education', 'college', 'exam', 'class', 'syllabus']):
            department = "General Education Department"
            category = "Education"
            reason = "Involves school facilities, teachers, or educational affairs."
        elif any(kw in text_lower for kw in ['road', 'bridge', 'pothole', 'highway', 'tarring', 'pavement', 'pwd', 'culvert', 'flyover']):
            department = "Public Works Department"
            category = "Public Works"
            reason = "Mentions road, highway, or bridge infrastructure maintained by PWD."
        elif any(kw in text_lower for kw in ['garbage', 'waste', 'panchayat', 'municipality', 'corporation', 'street light', 'cleaning', 'sanitation', 'drainage']):
            department = "Local Self Government Department"
            category = "Local Self Government"
            reason = "Falls under local civic administration, waste disposal, or municipality/panchayat services."
        elif any(kw in text_lower for kw in ['bus', 'ksrtc', 'traffic', 'transport', 'conductor', 'fare', 'rto', 'driving license']):
            department = "Transport Department"
            category = "Transport"
            reason = "Concerns public bus transit, transport services, or road traffic regulation."
        elif any(kw in text_lower for kw in ['land', 'survey', 'patta', 'village office', 'tax', 'property', 'revenue', 'pokkuvaravu']):
            department = "Revenue Department"
            category = "Revenue & Land"
            reason = "Involves land records, revenue administration, or village office services."
        elif any(kw in text_lower for kw in ['police', 'theft', 'crime', 'harassment', 'safety', 'assault', 'complaint against', 'threat']):
            department = "Home Department"
            category = "Law & Order"
            reason = "Concerns public safety, crime reporting, or police assistance."
        elif any(kw in text_lower for kw in ['ration', 'supply', 'ration card', 'pds', 'subsidized food', 'civil supply']):
            department = "Civil Supplies & Consumer Affairs"
            category = "Civil Supplies"
            reason = "Concerns public distribution system (PDS) or civil supplies."
        elif any(kw in text_lower for kw in ['forest', 'animal', 'wildlife', 'elephant', 'tree cutting', 'pollution', 'river pollution']):
            department = "Environment & Forest Department"
            category = "Environment"
            reason = "Concerns environmental protection, forest resources, or human-wildlife conflict."
        else:
            department = "General Administration Department"
            category = "Other"
            reason = "General public issue assigned for administrative review."

        clean_sub = subject.strip()
        clean_desc = description.strip()
        if len(clean_desc) > 140:
            summary = f"{clean_sub}: {clean_desc[:137]}..."
        else:
            summary = f"{clean_sub}: {clean_desc}"

        return {
            'summary': summary,
            'suggested_department': department,
            'suggested_category': category,
            'suggested_priority': priority,
            'reasoning': f"Automated rule-based assessment: {reason}",
            'is_fallback': True,
        }
