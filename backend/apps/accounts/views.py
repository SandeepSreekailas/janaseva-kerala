"""
Views for Janaseva Kerala Accounts App.
Provides API endpoints for user registration, authentication, token management,
profile inspection/update, and password modification.
"""
from django.contrib.auth.models import update_last_login
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    ChangePasswordSerializer,
    UserLoginSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)


def get_tokens_for_user(user):
    """
    Generate JWT access and refresh tokens for a user.
    """
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(generics.CreateAPIView):
    """
    Register a new citizen user.
    Generates and returns JWT authentication tokens along with the new user profile.
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Authentication'],
        summary='Register citizen user',
        description='Creates a citizen account with email and password, and returns access/refresh JWT tokens.',
        responses={
            201: OpenApiResponse(
                description='Citizen registered successfully.',
                response=UserSerializer,
            )
        },
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user, context=self.get_serializer_context()).data

        return Response(
            {
                'message': _('Citizen registered successfully.'),
                'user': user_data,
                'tokens': tokens,
                'access': tokens['access'],
                'refresh': tokens['refresh'],
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    Authenticate user via email and password.
    Returns JWT access and refresh tokens along with user profile details.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = UserLoginSerializer

    @extend_schema(
        tags=['Authentication'],
        summary='User login',
        description='Authenticates a user and returns JWT access and refresh tokens with user data.',
        request=UserLoginSerializer,
        responses={
            200: OpenApiResponse(
                description='Authentication successful.',
                response=UserSerializer,
            )
        },
    )
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        # Update last login timestamp
        update_last_login(None, user)

        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user, context={'request': request}).data

        return Response(
            {
                'message': _('Login successful.'),
                'user': user_data,
                'tokens': tokens,
                'access': tokens['access'],
                'refresh': tokens['refresh'],
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """
    Log out user by blacklisting the provided refresh token.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Authentication'],
        summary='User logout',
        description='Blacklists the provided refresh token to invalidate future access.',
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'refresh': {'type': 'string', 'description': 'The refresh token to blacklist.'}
                },
                'required': ['refresh'],
            }
        },
        responses={
            200: OpenApiResponse(description='Successfully logged out.'),
            400: OpenApiResponse(description='Invalid or missing refresh token.'),
        },
    )
    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': _('Refresh token is required.')},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {'message': _('Successfully logged out.')},
                status=status.HTTP_200_OK,
            )
        except TokenError:
            return Response(
                {'error': _('Invalid or expired refresh token.')},
                status=status.HTTP_400_BAD_REQUEST,
            )


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update the currently authenticated user's profile.
    GET: Return user profile data.
    PATCH / PUT: Update user profile data (e.g. full_name, mobile).
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Accounts'],
        summary='Get current user profile',
        description='Returns profile details for the authenticated user.',
        responses={200: UserSerializer},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        tags=['Accounts'],
        summary='Update current user profile',
        description='Updates full name, mobile number or other editable profile fields of the current user.',
        responses={200: UserSerializer},
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @extend_schema(
        tags=['Accounts'],
        summary='Replace current user profile',
        description='Replaces profile fields of the current user.',
        responses={200: UserSerializer},
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """
    Change the authenticated user's password.
    Requires the current (old) password and a valid new password.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    @extend_schema(
        tags=['Accounts'],
        summary='Change password',
        description='Validates current password and updates to the new password for the current user.',
        request=ChangePasswordSerializer,
        responses={
            200: OpenApiResponse(description='Password changed successfully.'),
            400: OpenApiResponse(description='Validation error.'),
        },
    )
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        new_password = serializer.validated_data['new_password']

        request.user.set_password(new_password)
        request.user.save()

        return Response(
            {'message': _('Password changed successfully.')},
            status=status.HTTP_200_OK,
        )
