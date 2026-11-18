"""
Comprehensive Test Suite for Janaseva Kerala Accounts App.
Tests serializers, views, permissions, token management, and edge cases.
"""
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.departments.models import Department
from .permissions import IsAdminOrOfficer, IsCitizen, IsCMOAdmin, IsOfficer

User = get_user_model()


class AccountsApiTests(APITestCase):
    def setUp(self):
        # Create department for officer testing
        self.department = Department.objects.create(
            name='Revenue Department',
            code='REV',
            contact_email='revenue@kerala.gov.in',
            description='Land revenue and survey'
        )

        # Create citizen user
        self.citizen = User.objects.create_user(
            email='citizen@example.com',
            password='Password123!',
            full_name='Citizen User',
            mobile='9876543210',
            role=User.Role.CITIZEN,
        )

        # Create CMO Admin user
        self.admin = User.objects.create_user(
            email='cmo@example.com',
            password='AdminPassword123!',
            full_name='CMO Admin',
            role=User.Role.CMO_ADMIN,
        )

        # Create Department Officer
        self.officer = User.objects.create_user(
            email='officer@example.com',
            password='OfficerPassword123!',
            full_name='Revenue Officer',
            role=User.Role.OFFICER,
            department=self.department,
        )

        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.logout_url = reverse('logout')
        self.me_url = reverse('current-user')
        self.change_password_url = reverse('change-password')
        self.refresh_url = reverse('token-refresh')

    def test_citizen_registration_success(self):
        """Test successful citizen self-registration."""
        payload = {
            'email': 'newcitizen@example.com',
            'full_name': 'New Citizen',
            'mobile': '9123456780',
            'password': 'SecurePassword123!',
            'password_confirm': 'SecurePassword123!',
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'newcitizen@example.com')
        self.assertEqual(response.data['user']['role'], User.Role.CITIZEN)

        # Verify in database
        created_user = User.objects.get(email='newcitizen@example.com')
        self.assertTrue(created_user.check_password('SecurePassword123!'))
        self.assertEqual(created_user.role, User.Role.CITIZEN)

    def test_registration_password_mismatch(self):
        """Test registration fails when passwords do not match."""
        payload = {
            'email': 'mismatch@example.com',
            'full_name': 'Mismatch User',
            'password': 'Password123!',
            'password_confirm': 'DifferentPassword123!',
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password_confirm', response.data)

    def test_registration_duplicate_email(self):
        """Test registration fails with already registered email."""
        payload = {
            'email': 'citizen@example.com',  # existing
            'full_name': 'Another Citizen',
            'password': 'Password123!',
            'password_confirm': 'Password123!',
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_registration_short_password(self):
        """Test registration fails with password shorter than minimum requirement."""
        payload = {
            'email': 'shortpwd@example.com',
            'full_name': 'Short Pwd',
            'password': '123',
            'password_confirm': '123',
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    def test_user_login_success(self):
        """Test successful login returns tokens and user data."""
        payload = {
            'email': 'citizen@example.com',
            'password': 'Password123!',
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'citizen@example.com')
        self.assertEqual(response.data['user']['role'], User.Role.CITIZEN)

    def test_officer_login_returns_nested_department(self):
        """Test officer login returns nested department details."""
        payload = {
            'email': 'officer@example.com',
            'password': 'OfficerPassword123!',
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        dept_data = response.data['user']['department']
        self.assertIsNotNone(dept_data)
        self.assertEqual(dept_data['code'], 'REV')
        self.assertEqual(dept_data['name'], 'Revenue Department')

    def test_login_invalid_password(self):
        """Test login fails with incorrect password."""
        payload = {
            'email': 'citizen@example.com',
            'password': 'WrongPassword!',
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_disabled_account(self):
        """Test login fails for disabled/inactive user."""
        self.citizen.is_active = False
        self.citizen.save()

        payload = {
            'email': 'citizen@example.com',
            'password': 'Password123!',
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_current_user_profile_get_unauthorized(self):
        """Test /api/auth/me/ requires authentication."""
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_current_user_profile_get_authenticated(self):
        """Test /api/auth/me/ returns current user profile."""
        self.client.force_authenticate(user=self.citizen)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.citizen.email)
        self.assertEqual(response.data['full_name'], self.citizen.full_name)
        self.assertEqual(response.data['role'], User.Role.CITIZEN)

    def test_current_user_profile_patch(self):
        """Test /api/auth/me/ partial update of profile."""
        self.client.force_authenticate(user=self.citizen)
        payload = {
            'full_name': 'Updated Citizen Name',
            'mobile': '9998887776',
            'role': User.Role.CMO_ADMIN,  # Read-only, should be ignored
        }
        response = self.client.patch(self.me_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], 'Updated Citizen Name')
        self.assertEqual(response.data['mobile'], '9998887776')
        # Role must NOT have changed
        self.citizen.refresh_from_db()
        self.assertEqual(self.citizen.role, User.Role.CITIZEN)

    def test_change_password_success(self):
        """Test changing password with valid old and new password."""
        self.client.force_authenticate(user=self.citizen)
        payload = {
            'old_password': 'Password123!',
            'new_password': 'BrandNewPassword456!',
        }
        response = self.client.post(self.change_password_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify old password no longer works
        self.citizen.refresh_from_db()
        self.assertFalse(self.citizen.check_password('Password123!'))
        self.assertTrue(self.citizen.check_password('BrandNewPassword456!'))

    def test_change_password_incorrect_old(self):
        """Test changing password fails with incorrect current password."""
        self.client.force_authenticate(user=self.citizen)
        payload = {
            'old_password': 'IncorrectOldPassword!',
            'new_password': 'BrandNewPassword456!',
        }
        response = self.client.post(self.change_password_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('old_password', response.data)

    def test_change_password_same_as_old(self):
        """Test changing password fails if new password is identical to old."""
        self.client.force_authenticate(user=self.citizen)
        payload = {
            'old_password': 'Password123!',
            'new_password': 'Password123!',
        }
        response = self.client.post(self.change_password_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('new_password', response.data)

    def test_logout_and_token_blacklist(self):
        """Test logout blacklists the refresh token."""
        refresh = RefreshToken.for_user(self.citizen)
        self.client.force_authenticate(user=self.citizen)

        payload = {'refresh': str(refresh)}
        response = self.client.post(self.logout_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Attempt to use the blacklisted refresh token to refresh access
        refresh_response = self.client.post(
            self.refresh_url,
            {'refresh': str(refresh)},
            format='json'
        )
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh_endpoint(self):
        """Test simplejwt TokenRefreshView functions correctly."""
        refresh = RefreshToken.for_user(self.citizen)
        response = self.client.post(
            self.refresh_url,
            {'refresh': str(refresh)},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)


class PermissionsClassTests(APITestCase):
    def setUp(self):
        self.citizen = User.objects.create_user(
            email='cit@example.com',
            password='Password123!',
            role=User.Role.CITIZEN
        )
        self.admin = User.objects.create_user(
            email='cmo_admin@example.com',
            password='Password123!',
            role=User.Role.CMO_ADMIN
        )
        self.officer = User.objects.create_user(
            email='off@example.com',
            password='Password123!',
            role=User.Role.OFFICER
        )

        class MockRequest:
            def __init__(self, user):
                self.user = user

        self.MockRequest = MockRequest

    def test_is_citizen_permission(self):
        perm = IsCitizen()
        self.assertTrue(perm.has_permission(self.MockRequest(self.citizen), None))
        self.assertFalse(perm.has_permission(self.MockRequest(self.admin), None))
        self.assertFalse(perm.has_permission(self.MockRequest(self.officer), None))

    def test_is_cmo_admin_permission(self):
        perm = IsCMOAdmin()
        self.assertFalse(perm.has_permission(self.MockRequest(self.citizen), None))
        self.assertTrue(perm.has_permission(self.MockRequest(self.admin), None))
        self.assertFalse(perm.has_permission(self.MockRequest(self.officer), None))

    def test_is_officer_permission(self):
        perm = IsOfficer()
        self.assertFalse(perm.has_permission(self.MockRequest(self.citizen), None))
        self.assertFalse(perm.has_permission(self.MockRequest(self.admin), None))
        self.assertTrue(perm.has_permission(self.MockRequest(self.officer), None))

    def test_is_admin_or_officer_permission(self):
        perm = IsAdminOrOfficer()
        self.assertFalse(perm.has_permission(self.MockRequest(self.citizen), None))
        self.assertTrue(perm.has_permission(self.MockRequest(self.admin), None))
        self.assertTrue(perm.has_permission(self.MockRequest(self.officer), None))
