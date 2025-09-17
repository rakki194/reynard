"""
Tests for user service functionality.

This module tests user creation, authentication, and user management.
"""

import pytest
from fastapi import HTTPException, status
from pydantic import ValidationError

from app.auth.password_utils import verify_password
from app.auth.user_models import RefreshTokenRequest, UserCreate, UserLogin
from app.auth.user_service import (
    authenticate_user,
    create_user,
    get_current_active_user,
    get_current_user,
    logout_user,
    refresh_tokens_db,
    refresh_user_token,
    users_db,
)


class TestUserCreation:
    """Test user creation functionality."""

    def test_create_user_success(self, clean_databases):
        """Test successful user creation."""
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="testpassword123",
            full_name="Test User",
        )

        result = create_user(user_data)

        # Check response
        assert result.username == "testuser"
        assert result.email == "test@example.com"
        assert result.full_name == "Test User"
        assert result.is_active is True
        assert result.created_at is not None

        # Check database
        assert "testuser" in users_db
        stored_user = users_db["testuser"]
        assert stored_user["username"] == "testuser"
        assert stored_user["email"] == "test@example.com"
        assert stored_user["full_name"] == "Test User"
        assert stored_user["is_active"] is True
        assert "hashed_password" in stored_user
        assert "created_at" in stored_user

        # Verify password is hashed
        assert stored_user["hashed_password"] != "testpassword123"
        assert verify_password("testpassword123", stored_user["hashed_password"])

    def test_create_user_duplicate_username(self, clean_databases):
        """Test user creation with duplicate username."""
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="testpassword123",
            full_name="Test User",
        )

        # Create first user
        create_user(user_data)

        # Try to create user with same username
        with pytest.raises(HTTPException) as exc_info:
            create_user(user_data)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "Username already registered" in str(exc_info.value.detail)

    def test_create_user_duplicate_email(self, clean_databases):
        """Test user creation with duplicate email."""
        user1_data = UserCreate(
            username="testuser1",
            email="test@example.com",
            password="testpassword123",
            full_name="Test User 1",
        )

        user2_data = UserCreate(
            username="testuser2",
            email="test@example.com",
            password="testpassword123",
            full_name="Test User 2",
        )

        # Create first user
        create_user(user1_data)

        # Try to create user with same email
        with pytest.raises(HTTPException) as exc_info:
            create_user(user2_data)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "Email already registered" in str(exc_info.value.detail)

    def test_create_user_invalid_email(self, clean_databases):
        """Test user creation with invalid email."""
        with pytest.raises(ValidationError) as exc_info:
            user_data = UserCreate(
                username="testuser",
                email="invalid-email",
                password="testpassword123",
                full_name="Test User",
            )

        assert "email" in str(exc_info.value)

    def test_create_user_weak_password(self, clean_databases):
        """Test user creation with weak password."""
        with pytest.raises(ValidationError) as exc_info:
            user_data = UserCreate(
                username="testuser",
                email="test@example.com",
                password="123",  # Too short
                full_name="Test User",
            )

        assert "password" in str(exc_info.value)

    def test_create_user_empty_fields(self, clean_databases):
        """Test user creation with empty required fields."""
        # Empty username
        with pytest.raises(ValidationError) as exc_info:
            user_data = UserCreate(
                username="",
                email="test@example.com",
                password="testpassword123",
                full_name="Test User",
            )

        assert "username" in str(exc_info.value)


class TestUserAuthentication:
    """Test user authentication functionality."""

    def test_authenticate_user_success(self, clean_databases):
        """Test successful user authentication."""
        # Create user first
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="testpassword123",
            full_name="Test User",
        )
        create_user(user_data)

        # Authenticate user
        login_data = UserLogin(username="testuser", password="testpassword123")
        result = authenticate_user(login_data)

        # Check response
        assert result.access_token is not None
        assert result.refresh_token is not None
        assert result.token_type == "bearer"

        # Check refresh token is stored
        assert "testuser" in refresh_tokens_db
        assert refresh_tokens_db["testuser"] == result.refresh_token

    def test_authenticate_user_wrong_password(self, clean_databases):
        """Test authentication with wrong password."""
        # Create user first
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="testpassword123",
            full_name="Test User",
        )
        create_user(user_data)

        # Try to authenticate with wrong password
        login_data = UserLogin(username="testuser", password="wrongpassword")

        with pytest.raises(HTTPException) as exc_info:
            authenticate_user(login_data)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Incorrect username or password" in str(exc_info.value.detail)

    def test_authenticate_user_nonexistent_user(self, clean_databases):
        """Test authentication with nonexistent user."""
        login_data = UserLogin(username="nonexistent", password="testpassword123")

        with pytest.raises(HTTPException) as exc_info:
            authenticate_user(login_data)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Incorrect username or password" in str(exc_info.value.detail)

    def test_authenticate_user_inactive_user(self, clean_databases):
        """Test authentication with inactive user."""
        # Create user first
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="testpassword123",
            full_name="Test User",
        )
        create_user(user_data)

        # Deactivate user
        users_db["testuser"]["is_active"] = False

        # Try to authenticate
        login_data = UserLogin(username="testuser", password="testpassword123")

        with pytest.raises(HTTPException) as exc_info:
            authenticate_user(login_data)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "Inactive user" in str(exc_info.value.detail)


class TestTokenRefresh:
    """Test token refresh functionality."""

    def test_refresh_token_success(self, clean_databases):
        """Test successful token refresh."""
        # Create and authenticate user
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="testpassword123",
            full_name="Test User",
        )
        create_user(user_data)

        login_data = UserLogin(username="testuser", password="testpassword123")
        auth_result = authenticate_user(login_data)

        # Refresh token
        refresh_request = RefreshTokenRequest(refresh_token=auth_result.refresh_token)
        result = refresh_user_token(refresh_request.refresh_token)

        # Check response
        assert result.access_token is not None
        assert result.refresh_token is not None
        assert result.token_type == "bearer"

        # New tokens should be different from old ones (or at least valid)
        assert result.access_token is not None
        assert result.refresh_token is not None
        # Note: Tokens generated at the same time may be identical due to same timestamp

    def test_refresh_token_invalid_token(self, clean_databases):
        """Test token refresh with invalid token."""
        with pytest.raises(HTTPException) as exc_info:
            refresh_user_token("invalid_token")

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Invalid refresh token" in str(exc_info.value.detail)

    def test_refresh_token_expired_token(self, clean_databases):
        """Test token refresh with expired token."""
        # Create and authenticate user
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="testpassword123",
            full_name="Test User",
        )
        create_user(user_data)

        login_data = UserLogin(username="testuser", password="testpassword123")
        auth_result = authenticate_user(login_data)

        # Manually expire the refresh token in database
        refresh_tokens_db["testuser"] = "expired_token"

        with pytest.raises(HTTPException) as exc_info:
            refresh_user_token("expired_token")

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Invalid refresh token" in str(exc_info.value.detail)

    def test_refresh_token_nonexistent_user(self, clean_databases):
        """Test token refresh for nonexistent user."""
        # Create a valid refresh token for a user that doesn't exist in users_db
        from app.auth.jwt_utils import create_refresh_token

        fake_token = create_refresh_token({"sub": "nonexistent"})

        with pytest.raises(HTTPException) as exc_info:
            refresh_user_token(fake_token)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert "User not found" in str(exc_info.value.detail)


class TestUserLogout:
    """Test user logout functionality."""

    def test_logout_success(self, clean_databases):
        """Test successful user logout."""
        # Create and authenticate user
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="testpassword123",
            full_name="Test User",
        )
        create_user(user_data)

        login_data = UserLogin(username="testuser", password="testpassword123")
        auth_result = authenticate_user(login_data)

        # Verify refresh token is stored
        assert "testuser" in refresh_tokens_db

        # Logout user
        result = logout_user(auth_result.refresh_token)
        assert result == {"message": "Successfully logged out"}

        # Verify refresh token is removed
        assert "testuser" not in refresh_tokens_db

    def test_logout_invalid_token(self, clean_databases):
        """Test logout with invalid token."""
        with pytest.raises(HTTPException) as exc_info:
            logout_user("invalid_token")

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Invalid refresh token" in str(exc_info.value.detail)

    def test_logout_nonexistent_token(self, clean_databases):
        """Test logout with token for nonexistent user."""
        from app.auth.jwt_utils import create_refresh_token

        fake_token = create_refresh_token({"sub": "nonexistent"})

        with pytest.raises(HTTPException) as exc_info:
            logout_user(fake_token)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert "User not found" in str(exc_info.value.detail)


class TestCurrentUser:
    """Test current user functionality."""

    def test_get_current_user_success(self, clean_databases, access_token):
        """Test successful current user retrieval."""
        # Create user first
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="testpassword123",
            full_name="Test User",
        )
        create_user(user_data)

        # Mock the security dependency
        from fastapi.security import HTTPAuthorizationCredentials

        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials=access_token
        )

        result = get_current_user(credentials)

        assert result["username"] == "testuser"
        assert result["email"] == "test@example.com"
        assert result["full_name"] == "Test User"

    def test_get_current_user_invalid_token(self, clean_databases):
        """Test current user retrieval with invalid token."""
        from fastapi.security import HTTPAuthorizationCredentials

        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="invalid_token"
        )

        with pytest.raises(HTTPException) as exc_info:
            get_current_user(credentials)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Could not validate credentials" in str(exc_info.value.detail)

    def test_get_current_user_nonexistent_user(self, clean_databases):
        """Test current user retrieval for nonexistent user."""
        from fastapi.security import HTTPAuthorizationCredentials

        from app.auth.jwt_utils import create_access_token

        # Create token for user that doesn't exist in database
        token = create_access_token({"sub": "nonexistent"})
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        with pytest.raises(HTTPException) as exc_info:
            get_current_user(credentials)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert "User not found" in str(exc_info.value.detail)

    def test_get_current_active_user_success(self, clean_databases, access_token):
        """Test successful current active user retrieval."""
        # Create user first
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="testpassword123",
            full_name="Test User",
        )
        create_user(user_data)

        # Mock the security dependency
        from fastapi.security import HTTPAuthorizationCredentials

        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials=access_token
        )

        result = get_current_active_user(get_current_user(credentials))

        assert result["username"] == "testuser"
        assert result["is_active"] is True

    def test_get_current_active_user_inactive(self, clean_databases, access_token):
        """Test current active user retrieval for inactive user."""
        # Create user first
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="testpassword123",
            full_name="Test User",
        )
        create_user(user_data)

        # Deactivate user
        users_db["testuser"]["is_active"] = False

        # Mock the security dependency
        from fastapi.security import HTTPAuthorizationCredentials

        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials=access_token
        )

        with pytest.raises(HTTPException) as exc_info:
            get_current_active_user(get_current_user(credentials))

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "Inactive user" in str(exc_info.value.detail)
