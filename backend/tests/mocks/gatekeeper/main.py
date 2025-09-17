"""
Comprehensive mock gatekeeper module for testing.

This mock provides a complete authentication system that works with
the security middleware and properly handles malicious input validation.
"""

from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr


class MockUser(BaseModel):
    """Mock user model."""

    id: int
    username: str
    email: str
    is_active: bool = True


class MockUserCreate(BaseModel):
    """Mock user creation model."""

    username: str
    email: EmailStr
    password: str
    full_name: str | None = None


class MockUserPublic(BaseModel):
    """Mock public user model."""

    id: int
    username: str
    email: str
    is_active: bool


class MockUserUpdate(BaseModel):
    """Mock user update model."""

    username: str | None = None
    email: EmailStr | None = None
    full_name: str | None = None
    is_active: bool | None = None


class MockTokenResponse(BaseModel):
    """Mock token response model."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 1800


# Mock token models
class TokenConfig(BaseModel):
    """Mock token configuration."""

    secret_key: str = "test-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    issuer: str | None = None
    audience: str | None = None


class TokenData(BaseModel):
    """Mock token data."""

    sub: str
    role: str = "user"
    type: str = "access"
    exp: datetime | None = None
    iat: datetime | None = None
    jti: str | None = None
    metadata: dict[str, Any] = {}

    # Allow additional fields
    model_config = {"extra": "allow"}


class TokenValidationResult(BaseModel):
    """Mock token validation result."""

    is_valid: bool
    payload: TokenData | None = None
    error: str | None = None
    is_expired: bool = False
    is_refresh_token: bool = False


class MockTokenManager:
    """Mock token manager."""

    def __init__(self, config: TokenConfig):
        self.config = config

    def create_access_token(
        self, data: dict[str, Any], expires_delta: timedelta | None = None
    ) -> str:
        """Create a mock access token."""
        return "mock_access_token"

    def create_refresh_token(
        self, data: dict[str, Any], expires_delta: timedelta | None = None
    ) -> str:
        """Create a mock refresh token."""
        return "mock_refresh_token"

    def verify_token(
        self, token: str, token_type: str = "access"
    ) -> TokenValidationResult:
        """Verify a mock token."""
        if token == "mock_access_token" and token_type == "access":
            return TokenValidationResult(
                is_valid=True,
                payload=TokenData(
                    sub="testuser",
                    role="user",
                    type="access",
                    exp=datetime.now() + timedelta(minutes=30),
                    iat=datetime.now(),
                    jti="mock_jti",
                ),
            )
        if token == "mock_refresh_token" and token_type == "refresh":
            return TokenValidationResult(
                is_valid=True,
                payload=TokenData(
                    sub="testuser",
                    role="user",
                    type="refresh",
                    exp=datetime.now() + timedelta(days=7),
                    iat=datetime.now(),
                    jti="mock_jti",
                ),
            )
        return TokenValidationResult(is_valid=False, error="Invalid token")


class MockPasswordManager:
    """Mock password manager."""

    def __init__(self, security_level=None):
        self.security_level = security_level

    def hash_password(self, password: str) -> str:
        """Hash a password."""
        return f"mock_hash_{password}"

    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify a password."""
        return hashed_password == f"mock_hash_{password}"


class SecurityLevel:
    """Mock security level."""

    MEDIUM = "medium"


class MockAuthManager:
    """Mock authentication manager."""

    def __init__(self):
        self.password_manager = MockPasswordManager()
        self.token_manager = MockTokenManager(TokenConfig())

    async def authenticate(
        self, username: str, password: str, client_ip: str | None = None
    ) -> MockTokenResponse:
        """Authenticate a user."""
        if username == "testuser" and password == "testpassword":
            return MockTokenResponse(
                access_token="mock_access_token",
                refresh_token="mock_refresh_token",
                token_type="bearer",
                expires_in=1800,
            )
        raise HTTPException(status_code=401, detail="Invalid credentials")

    async def create_user(self, user_data: MockUserCreate) -> MockUser:
        """Create a new user."""
        return MockUser(
            id=1, username=user_data.username, email=user_data.email, is_active=True
        )

    async def get_user_by_username(self, username: str) -> MockUser | None:
        """Get user by username."""
        if username == "testuser":
            return MockUser(
                id=1, username="testuser", email="test@example.com", is_active=True
            )
        return None


# Alias for compatibility
AuthManager = MockAuthManager


# Global mock auth manager
_mock_auth_manager = MockAuthManager()


def get_auth_manager() -> MockAuthManager:
    """Get the mock auth manager."""
    return _mock_auth_manager


def get_current_user() -> MockUser:
    """Get the current user (for dependency injection)."""
    return MockUser(id=1, username="testuser", email="test@example.com", is_active=True)


def require_role(required_role: str = "user"):
    """Require a specific role (for dependency injection)."""

    def role_checker(current_user: MockUser = Depends(get_current_user)) -> MockUser:
        return current_user

    return role_checker


def create_auth_router() -> APIRouter:
    """
    Create and return the authentication router.

    Returns:
        APIRouter: Configured authentication router
    """
    from .api.routes import auth_router

    return auth_router


# Export all the classes for easy importing
__all__ = [
    "AuthManager",
    "MockAuthManager",
    "MockPasswordManager",
    "MockTokenManager",
    "MockTokenResponse",
    "MockUser",
    "MockUserCreate",
    "MockUserPublic",
    "MockUserUpdate",
    "SecurityLevel",
    "TokenConfig",
    "TokenData",
    "TokenValidationResult",
    "create_auth_router",
    "get_auth_manager",
    "get_current_user",
    "require_role",
]
