from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.grievances.models import Grievance, District, GrievanceCategory, GrievancePriority, GrievanceStatus
from .models import Notification
from .serializers import NotificationSerializer

User = get_user_model()


class NotificationAppTests(APITestCase):
    def setUp(self):
        # Create users
        self.citizen1 = User.objects.create_user(
            email='citizen1@example.com',
            password='Password123!',
            full_name='Citizen One',
            role=User.Role.CITIZEN
        )
        self.citizen2 = User.objects.create_user(
            email='citizen2@example.com',
            password='Password123!',
            full_name='Citizen Two',
            role=User.Role.CITIZEN
        )

        # Create grievance
        self.grievance = Grievance.objects.create(
            citizen=self.citizen1,
            district=District.THIRUVANANTHAPURAM,
            category=GrievanceCategory.PUBLIC_WORKS,
            subject='Broken road near Secretariat',
            description='Potholes on the main road',
            priority=GrievancePriority.HIGH,
            status=GrievanceStatus.SUBMITTED
        )

        # Create notifications for citizen1
        self.notif1 = Notification.objects.create(
            user=self.citizen1,
            title='Grievance Submitted',
            message='Your grievance JK-2026-000001 has been registered.',
            grievance=self.grievance,
            is_read=False
        )
        self.notif2 = Notification.objects.create(
            user=self.citizen1,
            title='Status Updated',
            message='Your grievance is under review.',
            grievance=self.grievance,
            is_read=False
        )

        # Notification for citizen2
        self.notif_other = Notification.objects.create(
            user=self.citizen2,
            title='Welcome',
            message='Welcome to Janaseva Kerala.',
            is_read=False
        )

    def test_notification_serializer(self):
        serializer = NotificationSerializer(instance=self.notif1)
        data = serializer.data
        self.assertEqual(data['id'], self.notif1.id)
        self.assertEqual(data['title'], 'Grievance Submitted')
        self.assertEqual(data['grievance_reference'], self.grievance.reference_number)
        self.assertFalse(data['is_read'])

    def test_notification_list_authenticated(self):
        self.client.force_authenticate(user=self.citizen1)
        response = self.client.get(reverse('notification-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only see citizen1's notifications
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 2)
        notif_ids = [n['id'] for n in results]
        self.assertIn(self.notif1.id, notif_ids)
        self.assertIn(self.notif2.id, notif_ids)
        self.assertNotIn(self.notif_other.id, notif_ids)

    def test_notification_list_unauthenticated(self):
        response = self.client.get(reverse('notification-list'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_notification_filter_by_is_read(self):
        self.notif1.is_read = True
        self.notif1.save()

        self.client.force_authenticate(user=self.citizen1)
        # Filter is_read=true
        response = self.client.get(reverse('notification-list') + '?is_read=true')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], self.notif1.id)

        # Filter is_read=false
        response = self.client.get(reverse('notification-list') + '?is_read=false')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], self.notif2.id)

    def test_unread_count(self):
        self.client.force_authenticate(user=self.citizen1)
        response = self.client.get(reverse('notification-unread-count'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['unread_count'], 2)

        # Mark one read
        self.notif1.is_read = True
        self.notif1.save()

        response = self.client.get(reverse('notification-unread-count'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['unread_count'], 1)

    def test_mark_single_read(self):
        self.client.force_authenticate(user=self.citizen1)
        url = reverse('notification-mark-read', kwargs={'pk': self.notif1.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notif1.refresh_from_db()
        self.assertTrue(self.notif1.is_read)

    def test_cannot_mark_other_user_notification_read(self):
        self.client.force_authenticate(user=self.citizen1)
        url = reverse('notification-mark-read', kwargs={'pk': self.notif_other.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_mark_all_read(self):
        self.client.force_authenticate(user=self.citizen1)
        url = reverse('notification-mark-all-read')
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.notif1.refresh_from_db()
        self.notif2.refresh_from_db()
        self.assertTrue(self.notif1.is_read)
        self.assertTrue(self.notif2.is_read)

        # Other user's notification remains unread
        self.notif_other.refresh_from_db()
        self.assertFalse(self.notif_other.is_read)

    def test_mark_specific_ids_read(self):
        self.client.force_authenticate(user=self.citizen1)
        url = reverse('notification-mark-read-bulk')
        response = self.client.post(url, {'notification_ids': [self.notif1.id]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.notif1.refresh_from_db()
        self.notif2.refresh_from_db()
        self.assertTrue(self.notif1.is_read)
        self.assertFalse(self.notif2.is_read)
