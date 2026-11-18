from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.departments.models import Department
from apps.grievances.models import (
    Grievance,
    District,
    GrievanceCategory,
    GrievancePriority,
    GrievanceStatus,
    DepartmentAssignment,
    CitizenFeedback,
)

User = get_user_model()


class AnalyticsAppTests(APITestCase):
    def setUp(self):
        # Create departments
        self.dept_pwd = Department.objects.create(
            name='Public Works Department',
            code='PWD',
            contact_email='pwd@kerala.gov.in'
        )
        self.dept_health = Department.objects.create(
            name='Health and Family Welfare Department',
            code='HLT',
            contact_email='health@kerala.gov.in'
        )

        # Create users with different roles
        self.cmo_admin = User.objects.create_user(
            email='cmo_admin@kerala.gov.in',
            password='AdminPassword123!',
            full_name='CMO Chief Admin',
            role=User.Role.CMO_ADMIN
        )
        self.officer = User.objects.create_user(
            email='officer_pwd@kerala.gov.in',
            password='OfficerPassword123!',
            full_name='PWD Officer',
            role=User.Role.OFFICER,
            department=self.dept_pwd
        )
        self.citizen = User.objects.create_user(
            email='citizen_user@example.com',
            password='Password123!',
            full_name='Citizen User',
            role=User.Role.CITIZEN
        )

        # Create grievances
        self.g1 = Grievance.objects.create(
            citizen=self.citizen,
            district=District.THIRUVANANTHAPURAM,
            category=GrievanceCategory.PUBLIC_WORKS,
            subject='Pothole on Main Road',
            description='Dangerous pothole in front of school',
            priority=GrievancePriority.HIGH,
            status=GrievanceStatus.RESOLVED
        )
        self.g2 = Grievance.objects.create(
            citizen=self.citizen,
            district=District.ERNAKULAM,
            category=GrievanceCategory.HEALTHCARE,
            subject='PHC Medicine Shortage',
            description='Essential medicines not available in primary health center',
            priority=GrievancePriority.URGENT,
            status=GrievanceStatus.IN_PROGRESS
        )

        # Department Assignment
        DepartmentAssignment.objects.create(
            grievance=self.g1,
            department=self.dept_pwd,
            assigned_by=self.cmo_admin,
            assigned_officer=self.officer
        )
        DepartmentAssignment.objects.create(
            grievance=self.g2,
            department=self.dept_health,
            assigned_by=self.cmo_admin
        )

        # Citizen Feedback
        CitizenFeedback.objects.create(
            grievance=self.g1,
            citizen=self.citizen,
            rating=5,
            comments='Resolved very quickly, thank you!'
        )

        self.dashboard_url = reverse('analytics-dashboard')

    def test_analytics_requires_authentication(self):
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_analytics_denies_citizen(self):
        self.client.force_authenticate(user=self.citizen)
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_analytics_denies_officer(self):
        self.client.force_authenticate(user=self.officer)
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_analytics_allows_cmo_admin(self):
        self.client.force_authenticate(user=self.cmo_admin)
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertIn('total_grievances', data)
        self.assertIn('by_status', data)
        self.assertIn('by_priority', data)
        self.assertIn('by_district', data)
        self.assertIn('by_category', data)
        self.assertIn('monthly_trend', data)
        self.assertIn('department_performance', data)

        self.assertEqual(data['total_grievances'], 2)

        # Check by_status
        status_dict = {item['status']: item['count'] for item in data['by_status']}
        self.assertEqual(status_dict.get('Resolved'), 1)
        self.assertEqual(status_dict.get('In Progress'), 1)

        # Check by_priority
        priority_dict = {item['priority']: item['count'] for item in data['by_priority']}
        self.assertEqual(priority_dict.get('High'), 1)
        self.assertEqual(priority_dict.get('Urgent'), 1)

        # Check by_district
        district_dict = {item['district']: item['count'] for item in data['by_district']}
        self.assertEqual(district_dict.get(District.THIRUVANANTHAPURAM), 1)
        self.assertEqual(district_dict.get(District.ERNAKULAM), 1)

        # Check monthly trend (6 months)
        self.assertEqual(len(data['monthly_trend']), 6)

        # Check department performance
        pwd_perf = next((d for d in data['department_performance'] if d['code'] == 'PWD'), None)
        self.assertIsNotNone(pwd_perf)
        self.assertEqual(pwd_perf['total_assigned'], 1)
        self.assertEqual(pwd_perf['resolved_count'], 1)
        self.assertEqual(pwd_perf['avg_rating'], 5.0)

    def test_analytics_filtering_by_district(self):
        self.client.force_authenticate(user=self.cmo_admin)
        url = f"{self.dashboard_url}?district={District.THIRUVANANTHAPURAM}"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_grievances'], 1)
