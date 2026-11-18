from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from .models import Department
from .serializers import DepartmentSerializer, DepartmentListSerializer


class DepartmentSerializerTestCase(TestCase):
    def setUp(self):
        self.dept = Department.objects.create(
            name='Health Department',
            code='HLT_TEST',
            description='Health and family care',
            contact_email='health_test@kerala.gov.in',
            is_active=True
        )

    def test_department_serializer_all_fields(self):
        serializer = DepartmentSerializer(instance=self.dept)
        expected_fields = {'id', 'name', 'code', 'description', 'contact_email', 'is_active', 'created_at'}
        self.assertEqual(set(serializer.data.keys()), expected_fields)

    def test_department_list_serializer_fields(self):
        serializer = DepartmentListSerializer(instance=self.dept)
        expected_fields = {'id', 'name', 'code', 'is_active'}
        self.assertEqual(set(serializer.data.keys()), expected_fields)


class DepartmentAPITestCase(TestCase):
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
        self.dept = Department.objects.create(
            name='Education Department',
            code='EDU_TEST',
            description='Primary and secondary education',
            contact_email='edu_test@kerala.gov.in',
            is_active=True
        )

    def test_public_can_list_departments(self):
        response = self.client.get('/api/departments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should use DepartmentListSerializer fields in list
        data = response.data['results'] if 'results' in response.data else response.data
        self.assertTrue(len(data) >= 1)
        first_item = data[0]
        self.assertEqual(set(first_item.keys()), {'id', 'name', 'code', 'is_active'})

    def test_public_can_retrieve_department(self):
        response = self.client.get(f'/api/departments/{self.dept.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['code'], 'EDU_TEST')
        self.assertIn('description', response.data)
        self.assertIn('contact_email', response.data)

    def test_unauthenticated_cannot_create_department(self):
        payload = {
            'name': 'Finance Department',
            'code': 'FIN_TEST',
            'contact_email': 'fin_test@kerala.gov.in'
        }
        response = self.client.post('/api/departments/', payload)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_citizen_cannot_create_department(self):
        self.client.force_authenticate(user=self.citizen)
        payload = {
            'name': 'Finance Department',
            'code': 'FIN_TEST',
            'contact_email': 'fin_test@kerala.gov.in'
        }
        response = self.client.post('/api/departments/', payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cmo_admin_can_create_department(self):
        self.client.force_authenticate(user=self.cmo_admin)
        payload = {
            'name': 'Finance Department',
            'code': 'FIN_TEST',
            'description': 'Fiscal management and treasury',
            'contact_email': 'fin_test@kerala.gov.in',
            'is_active': True
        }
        response = self.client.post('/api/departments/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['code'], 'FIN_TEST')
        self.assertTrue(Department.objects.filter(code='FIN_TEST').exists())

    def test_cmo_admin_can_update_department(self):
        self.client.force_authenticate(user=self.cmo_admin)
        response = self.client.patch(
            f'/api/departments/{self.dept.id}/',
            {'description': 'Updated education description'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.dept.refresh_from_db()
        self.assertEqual(self.dept.description, 'Updated education description')

    def test_cmo_admin_can_delete_department(self):
        self.client.force_authenticate(user=self.cmo_admin)
        response = self.client.delete(f'/api/departments/{self.dept.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Department.objects.filter(id=self.dept.id).exists())
