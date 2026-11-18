from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from .models import ContactEnquiry
from .serializers import ContactEnquiryCreateSerializer, ContactEnquirySerializer


class ContactEnquirySerializerTestCase(TestCase):
    def setUp(self):
        self.enquiry = ContactEnquiry.objects.create(
            name='Kavitha Nair',
            email='kavitha@example.com',
            subject='Water pipeline damage',
            message='Damaged pipe near MG Road causing water loss.',
            status=ContactEnquiry.Status.NEW
        )

    def test_contact_enquiry_create_serializer_fields(self):
        serializer = ContactEnquiryCreateSerializer(instance=self.enquiry)
        expected_fields = {'name', 'email', 'subject', 'message'}
        self.assertEqual(set(serializer.data.keys()), expected_fields)

    def test_contact_enquiry_serializer_all_fields(self):
        serializer = ContactEnquirySerializer(instance=self.enquiry)
        expected_fields = {'id', 'name', 'email', 'subject', 'message', 'created_at', 'status'}
        self.assertEqual(set(serializer.data.keys()), expected_fields)


class ContactEnquiryAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cmo_admin = User.objects.create_user(
            email='cmo_admin@janaseva.gov.in',
            full_name='CMO Administrator',
            role=User.Role.CMO_ADMIN
        )
        self.citizen = User.objects.create_user(
            email='citizen@example.com',
            full_name='Citizen Tester',
            role=User.Role.CITIZEN
        )
        self.enquiry1 = ContactEnquiry.objects.create(
            name='Arun Varma',
            email='arun@example.com',
            subject='Streetlight not functioning',
            message='Streetlights out on Museum road for two weeks.',
            status=ContactEnquiry.Status.NEW
        )
        self.enquiry2 = ContactEnquiry.objects.create(
            name='Bina Joseph',
            email='bina@example.com',
            subject='Ration card category update query',
            message='Need clarification on AAY to PHH transition docs.',
            status=ContactEnquiry.Status.RESPONDED
        )

    def test_public_can_submit_enquiry_at_root(self):
        payload = {
            'name': 'Deepak Pillai',
            'email': 'deepak@example.com',
            'subject': 'Bus shelter maintenance',
            'message': 'Shelter roof broken at East Fort stop.'
        }
        response = self.client.post('/api/contact/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(ContactEnquiry.objects.filter(email='deepak@example.com').exists())
        created_obj = ContactEnquiry.objects.get(email='deepak@example.com')
        self.assertEqual(created_obj.status, ContactEnquiry.Status.NEW)

    def test_public_can_submit_enquiry_at_submit_url(self):
        payload = {
            'name': 'Meera Krishnan',
            'email': 'meera@example.com',
            'subject': 'Pension scheme doubt',
            'message': 'Eligibility query for Sevana pension scheme.'
        }
        response = self.client.post('/api/contact/submit/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(ContactEnquiry.objects.filter(email='meera@example.com').exists())

    def test_unauthenticated_cannot_list_enquiries(self):
        response = self.client.get('/api/contact/enquiries/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_citizen_cannot_list_enquiries(self):
        self.client.force_authenticate(user=self.citizen)
        response = self.client.get('/api/contact/enquiries/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cmo_admin_can_list_enquiries(self):
        self.client.force_authenticate(user=self.cmo_admin)
        response = self.client.get('/api/contact/enquiries/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        count = response.data['count'] if 'count' in response.data else len(response.data)
        self.assertEqual(count, 2)

    def test_cmo_admin_filter_enquiries_by_status(self):
        self.client.force_authenticate(user=self.cmo_admin)
        response = self.client.get('/api/contact/enquiries/?status=New')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results'] if 'results' in response.data else response.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['status'], 'New')

    def test_cmo_admin_search_enquiries(self):
        self.client.force_authenticate(user=self.cmo_admin)
        response = self.client.get('/api/contact/enquiries/?search=Museum')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results'] if 'results' in response.data else response.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['subject'], 'Streetlight not functioning')
