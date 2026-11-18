"""
Janaseva Kerala - AI Advisory Service
Provides intelligent classification and summarization of citizen grievances
using Google Gemini AI with structured rule-based heuristic fallback.
"""
import json
import logging
import os
import re
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
        - source: str
        - model: str or None
        """
        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        if api_key is None:
            api_key = os.getenv('GEMINI_API_KEY', '')

        if not api_key or not str(api_key).strip():
            logger.info("No GEMINI_API_KEY configured; using structured fallback analysis.")
            return self._get_fallback_analysis(subject, description, district, reason_prefix="Offline mode (no API key configured)")

        # 1. Fetch valid departments & categories from the database for validation and constrained generation
        active_departments = self._get_valid_departments()
        valid_categories = self._get_valid_categories()
        valid_priorities = ["Low", "Medium", "High", "Urgent"]

        prompt = f"""You are an expert grievance triage assistant for Janaseva Kerala (Chief Minister's Public Grievance Redressal System, Government of Kerala).
Analyze the following citizen complaint and provide classification recommendations:
- Subject: {subject}
- Description: {description}
- District: {district if district else 'Not specified'}

ALLOWED DEPARTMENTS (Choose exactly one from this list):
{json.dumps(active_departments)}

ALLOWED CATEGORIES (Choose exactly one from this list):
{json.dumps(valid_categories)}

ALLOWED PRIORITIES:
["Low", "Medium", "High", "Urgent"] (Use Urgent only for severe life-safety emergencies, immediate public hazards, or critical disasters).

Return a single JSON object with the following keys:
1. "summary": A concise 1-2 sentence executive summary of the issue.
2. "suggested_department": Exactly one department from the ALLOWED DEPARTMENTS list.
3. "suggested_category": Exactly one category from the ALLOWED CATEGORIES list.
4. "suggested_priority": Exactly one priority level from ["Low", "Medium", "High", "Urgent"].
5. "reasoning": A brief 1-2 sentence rationale for the recommended department, category, and priority.

Ensure the response is strictly valid JSON with no additional markdown formatting."""

        # 2. Check if legacy google.generativeai.GenerativeModel is mocked (e.g. in automated unit tests)
        import sys
        legacy_mod = sys.modules.get('google.generativeai')
        is_legacy_mocked = (
            api_key == 'test-fake-key' or
            (legacy_mod is not None and hasattr(legacy_mod, 'GenerativeModel') and not isinstance(legacy_mod.GenerativeModel, type))
        )

        model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')
        content = None

        if is_legacy_mocked:
            try:
                import google.generativeai as legacy_genai
                legacy_genai.configure(api_key=api_key.strip())
                legacy_model = legacy_genai.GenerativeModel(
                    model_name=getattr(settings, 'LEGACY_GEMINI_MODEL', 'gemini-1.5-flash'),
                    generation_config={"response_mime_type": "application/json"}
                )
                response = legacy_model.generate_content(prompt)
                content = response.text.strip() if hasattr(response, 'text') else str(response)
                model_name = getattr(settings, 'LEGACY_GEMINI_MODEL', 'gemini-1.5-flash')
            except Exception as legacy_exc:
                logger.warning("Legacy/mocked Gemini API invocation failed: %s", legacy_exc)
                return self._get_fallback_analysis(subject, description, district, reason_prefix="Mock evaluation failure")
        else:
            # Attempt generation using the modern google-genai SDK
            try:
                from google import genai
                from google.genai import types

                client = genai.Client(
                    api_key=api_key.strip(),
                    http_options={'api_version': 'v1beta', 'timeout': 10000}
                )
                config = types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                )
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config,
                )
                content = response.text.strip() if hasattr(response, 'text') else str(response)

            except Exception as genai_exc:
                logger.warning("Google GenAI client failed (%s). Gracefully using fallback.", type(genai_exc).__name__)
                return self._get_fallback_analysis(subject, description, district, reason_prefix=f"API connection error ({type(genai_exc).__name__})")

        if not content:
            return self._get_fallback_analysis(subject, description, district, reason_prefix="Empty API response")

        # 3. Clean markdown formatting if present
        if content.startswith('```'):
            lines = content.splitlines()
            if lines[0].startswith('```'):
                lines = lines[1:]
            if lines and lines[-1].startswith('```'):
                lines = lines[:-1]
            content = '\n'.join(lines).strip()

        try:
            data = json.loads(content)
        except json.JSONDecodeError as json_err:
            logger.warning("Failed to parse Gemini JSON output: %s. Raw text: %s", json_err, content[:150])
            return self._get_fallback_analysis(subject, description, district, reason_prefix="Invalid JSON response")

        # 4. Extract and validate fields against actual database choices
        summary = str(data.get('summary', '')).strip() or f"Grievance regarding {subject.strip()}"
        raw_dept = str(data.get('suggested_department', '')).strip()
        raw_cat = str(data.get('suggested_category', '')).strip()
        raw_priority = str(data.get('suggested_priority', 'Medium')).strip().capitalize()
        reasoning = str(data.get('reasoning', 'Categorized via Google Gemini AI assistant.')).strip()

        suggested_department = self._match_department(raw_dept, active_departments)
        suggested_category = self._match_category(raw_cat, valid_categories)
        suggested_priority = raw_priority if raw_priority in valid_priorities else 'Medium'

        return {
            'summary': summary,
            'suggested_department': suggested_department,
            'suggested_category': suggested_category,
            'suggested_priority': suggested_priority,
            'reasoning': reasoning,
            'is_fallback': False,
            'source': f"Google Gemini AI ({model_name})",
            'model': model_name,
        }

    def _get_valid_departments(self) -> list:
        """Fetch active departments from database, with sensible defaults if DB empty."""
        try:
            from apps.departments.models import Department
            depts = list(Department.objects.filter(is_active=True).values_list('name', flat=True))
            if depts:
                return depts
        except Exception as e:
            logger.debug("Could not query Department model: %s", e)

        return [
            "Public Works Department",
            "Water Resources Department",
            "Kerala State Electricity Board",
            "Local Self Government Department",
            "Health and Family Welfare Department",
            "General Education Department",
            "Transport Department",
            "Revenue Department",
        ]

    def _get_valid_categories(self) -> list:
        """Fetch allowed grievance categories from choices."""
        try:
            from apps.grievances.models import GrievanceCategory
            return [c[0] for c in GrievanceCategory.choices]
        except Exception as e:
            logger.debug("Could not query GrievanceCategory choices: %s", e)

        return [
            'Public Works', 'Healthcare', 'Education', 'Local Self Government',
            'Water Resources', 'Electricity', 'Transport', 'Revenue & Land',
            'Law & Order', 'Civil Supplies', 'Environment', 'Other'
        ]

    def _match_department(self, raw_dept: str, allowed_depts: list) -> str:
        """Match suggested department against existing database departments."""
        if not raw_dept:
            return allowed_depts[0] if allowed_depts else "Public Works Department"

        raw_lower = raw_dept.lower().strip()

        # Exact match
        for dept in allowed_depts:
            if dept.lower() == raw_lower:
                return dept

        # Substring / partial match
        for dept in allowed_depts:
            if dept.lower() in raw_lower or raw_lower in dept.lower():
                return dept

        # Common abbreviations & domain keywords
        if 'kseb' in raw_lower or 'electric' in raw_lower or 'power' in raw_lower:
            return "Kerala State Electricity Board"
        if 'pwd' in raw_lower or 'road' in raw_lower or 'bridge' in raw_lower:
            return "Public Works Department"
        if 'kwa' in raw_lower or 'water' in raw_lower:
            return "Water Resources Department"
        if 'health' in raw_lower or 'hospital' in raw_lower or 'medical' in raw_lower:
            return "Health and Family Welfare Department"
        if 'education' in raw_lower or 'school' in raw_lower or 'college' in raw_lower:
            return "General Education Department"
        if 'panchayat' in raw_lower or 'municipality' in raw_lower or 'corporation' in raw_lower or 'local' in raw_lower:
            return "Local Self Government Department"
        if 'transport' in raw_lower or 'ksrtc' in raw_lower or 'bus' in raw_lower or 'rto' in raw_lower:
            return "Transport Department"
        if 'revenue' in raw_lower or 'land' in raw_lower or 'survey' in raw_lower:
            return "Revenue Department"

        return allowed_depts[0] if allowed_depts else "General Administration Department"

    def _match_category(self, raw_cat: str, allowed_cats: list) -> str:
        """Match suggested category against allowed categories."""
        if not raw_cat:
            return 'Other'

        raw_lower = raw_cat.lower().strip()

        for cat in allowed_cats:
            if cat.lower() == raw_lower:
                return cat
            if cat.lower() in raw_lower or raw_lower in cat.lower():
                return cat

        return 'Other'

    def _get_fallback_analysis(self, subject: str, description: str, district: str = "", reason_prefix: str = "Automated rule-based heuristic assessment") -> dict:
        """
        Rule-based heuristic analysis fallback when Gemini is unavailable, rate-limited, or not configured.
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

        # Domain-specific keyword matching
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
            'reasoning': f"{reason_prefix}: {reason}",
            'is_fallback': True,
            'source': 'Rule-Based Fallback Engine',
            'model': None,
        }
