import json
from unittest.mock import patch, MagicMock
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .services import GeminiService

User = get_user_model()


class AIAssistantAppTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='citizen@example.com',
            password='Password123!',
            full_name='AIAssistant Citizen',
            role=User.Role.CITIZEN
        )
        self.analyze_url = reverse('ai-analyze-grievance')

    def test_gemini_service_fallback_structure(self):
        service = GeminiService()
        result = service.analyze_grievance(
            subject="Dangerous live electric wire fallen on school road",
            description="A high voltage electric wire has fallen near the primary school. Sparks are flying.",
            district="Kollam"
        )
        self.assertTrue(result['is_fallback'])
        self.assertIn('summary', result)
        self.assertIn('suggested_department', result)
        self.assertIn('suggested_category', result)
        self.assertIn('suggested_priority', result)
        self.assertIn('reasoning', result)

        # Keyword heuristics should map power/wire/spark to Electricity / KSEB and Urgent
        self.assertEqual(result['suggested_department'], "Kerala State Electricity Board")
        self.assertEqual(result['suggested_category'], "Electricity")
        self.assertIn(result['suggested_priority'], ["High", "Urgent"])

    def test_gemini_service_road_fallback(self):
        service = GeminiService()
        result = service.analyze_grievance(
            subject="Massive pothole on national highway",
            description="The bridge approach road has huge potholes causing severe traffic jams.",
            district="Ernakulam"
        )
        self.assertTrue(result['is_fallback'])
        self.assertEqual(result['suggested_department'], "Public Works Department")
        self.assertEqual(result['suggested_category'], "Public Works")

    def test_gemini_service_with_mocked_gemini(self):
        service = GeminiService()
        mock_response = MagicMock()
        mock_response.text = json.dumps({
            "summary": "Sewage water leak impacting hospital road.",
            "suggested_department": "Water Resources Department",
            "suggested_category": "Water Resources",
            "suggested_priority": "High",
            "reasoning": "Pipeline leak requires urgent repair by KWA."
        })

        with patch('django.conf.settings.GEMINI_API_KEY', 'test-fake-key'):
            with patch('google.generativeai.GenerativeModel') as mock_model_cls:
                mock_model_instance = MagicMock()
                mock_model_instance.generate_content.return_value = mock_response
                mock_model_cls.return_value = mock_model_instance

                result = service.analyze_grievance(
                    subject="Water pipe burst",
                    description="Severe drinking water pipeline leak flooding the main road.",
                    district="Alappuzha"
                )

                self.assertFalse(result['is_fallback'])
                self.assertEqual(result['suggested_category'], "Water Resources")
                self.assertEqual(result['suggested_priority'], "High")
                self.assertEqual(result['summary'], "Sewage water leak impacting hospital road.")

    def test_analyze_view_unauthenticated(self):
        response = self.client.post(self.analyze_url, {
            'subject': 'Test Subject',
            'description': 'Test Description'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_analyze_view_validation_errors(self):
        self.client.force_authenticate(user=self.user)

        # Missing description
        res1 = self.client.post(self.analyze_url, {'subject': 'Only Subject'})
        self.assertEqual(res1.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('description', res1.data)

        # Missing subject
        res2 = self.client.post(self.analyze_url, {'description': 'Only Description'})
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('subject', res2.data)

    def test_analyze_view_success(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'subject': 'Drinking water pipeline damage',
            'description': 'The drinking water pipe has burst and water is flooding the street.',
            'district': 'Thrissur'
        }
        response = self.client.post(self.analyze_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data

        self.assertIn('summary', data)
        self.assertIn('suggested_department', data)
        self.assertIn('suggested_category', data)
        self.assertIn('suggested_priority', data)
        self.assertIn('reasoning', data)
        self.assertIn('is_fallback', data)
