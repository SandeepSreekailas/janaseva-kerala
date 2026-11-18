"""
Serializers for Janaseva Kerala Accounts App.
Handles user registration, authentication, profile management, and password changes.
"""
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from apps.departments.models import Department
from .models import User


class DepartmentNestedSerializer(serializers.ModelSerializer):
    """
    Lightweight nested representation of a Department for User profiles.
    """
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description', 'contact_email', 'is_active']
        read_only_fields = fields


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for citizen user self-registration.
    Validates email uniqueness and password confirmation.
    Always assigns the CITIZEN role.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        validators=[validate_password],
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
    )

    class Meta:
        model = User
        fields = ['email', 'full_name', 'mobile', 'password', 'password_confirm']
        extra_kwargs = {
            'email': {'required': True},
            'full_name': {'required': True},
            'mobile': {'required': False, 'allow_blank': True},
        }

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError(_('A user with this email address already exists.'))
        return normalized

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({'password_confirm': _('Passwords do not match.')})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        return User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name', ''),
            mobile=validated_data.get('mobile', ''),
            role=User.Role.CITIZEN,
        )


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for authenticating users via email and password.
    Returns authenticated user instance on successful validation.
    """
    email = serializers.EmailField(write_only=True, required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        trim_whitespace=False,
    )

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        password = attrs.get('password')

        request = self.context.get('request')
        user = authenticate(request=request, email=email, password=password)
        if not user:
            user = authenticate(request=request, username=email, password=password)

        if not user:
            raise serializers.ValidationError(_('Invalid email or password.'))

        if not user.is_active:
            raise serializers.ValidationError(_('User account is disabled.'))

        attrs['user'] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for reading and updating user profile information.
    Role, email, department, and active status are read-only for self-service profile updates.
    """
    department = DepartmentNestedSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'mobile',
            'role',
            'department',
            'designation',
            'employee_id',
            'address',
            'is_active',
            'created_at',
        ]
        read_only_fields = ['id', 'email', 'role', 'department', 'is_active', 'created_at']

    def update(self, instance, validated_data):
        # Prevent non-admin users from altering administrative attributes
        if instance.role == User.Role.CITIZEN:
            validated_data.pop('designation', None)
            validated_data.pop('employee_id', None)
        return super().update(instance, validated_data)


class CMOOfficerSerializer(serializers.ModelSerializer):
    """
    Serializer for listing, retrieving and updating department officers by CMO administrators.
    Includes department details, assigned grievances count, and active status.
    """
    department = DepartmentNestedSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True,
        required=False,
        allow_null=True
    )
    assigned_grievances_count = serializers.SerializerMethodField()
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        style={'input_type': 'password'},
        validators=[validate_password],
    )

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'mobile',
            'role',
            'department',
            'department_id',
            'designation',
            'employee_id',
            'is_active',
            'assigned_grievances_count',
            'password',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'role', 'created_at', 'updated_at', 'assigned_grievances_count']

    def get_assigned_grievances_count(self, obj):
        if hasattr(obj, 'assigned_grievances_count'):
            return obj.assigned_grievances_count
        return obj.officer_assignments.filter(is_active=True).values('grievance_id').distinct().count()

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        validated_data['role'] = User.Role.OFFICER
        return super().update(instance, validated_data)


class CMOOfficerCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for registering a new department officer by CMO Administrator.
    Validates required fields: full_name, email, department, temporary password.
    Automatically assigns the OFFICER role and hashes the temporary password.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        validators=[validate_password],
    )
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.filter(is_active=True),
        source='department',
        required=True,
        error_messages={'does_not_exist': _('Selected department does not exist or is inactive.')}
    )

    class Meta:
        model = User
        fields = [
            'id',
            'full_name',
            'email',
            'mobile',
            'department_id',
            'designation',
            'employee_id',
            'password',
            'is_active',
        ]
        extra_kwargs = {
            'email': {'required': True},
            'full_name': {'required': True},
            'mobile': {'required': False, 'allow_blank': True},
            'designation': {'required': False, 'allow_blank': True},
            'employee_id': {'required': False, 'allow_blank': True},
            'is_active': {'required': False, 'default': True},
        }

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError(_('A user with this email address already exists.'))
        return normalized

    def create(self, validated_data):
        password = validated_data.pop('password')
        department = validated_data.pop('department')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=password,
            full_name=validated_data['full_name'],
            mobile=validated_data.get('mobile', ''),
            role=User.Role.OFFICER,
            department=department,
            designation=validated_data.get('designation', ''),
            employee_id=validated_data.get('employee_id', ''),
            is_active=validated_data.get('is_active', True),
        )
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing current user's password.
    Requires current password validation and password policy compliance.
    """
    old_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        validators=[validate_password],
    )

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(_('Current password is incorrect.'))
        return value

    def validate(self, attrs):
        if attrs.get('old_password') == attrs.get('new_password'):
            raise serializers.ValidationError(
                {'new_password': _('New password cannot be the same as the current password.')}
            )
        return attrs
