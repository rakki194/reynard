"""Mock gatekeeper module for testing.
"""

from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


class User(BaseModel):
    """Mock user model."""

    id: str
    username: str
    email: str
    is_active: bool = True


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
        self, data: dict[str, Any], expires_delta: timedelta | None = None,
    ) -> str:
        """Create a mock access token."""
        return "mock_access_token"

    def create_refresh_token(
        self, data: dict[str, Any], expires_delta: timedelta | None = None,
    ) -> str:
        """Create a mock refresh token."""
        return "mock_refresh_token"

    def verify_token(
        self, token: str, token_type: str = "access",
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
    """Mock auth manager."""

    def __init__(self):
        self.token_manager = MockTokenManager(TokenConfig())
        self.password_manager = MockPasswordManager()


# Alias for compatibility
AuthManager = MockAuthManager


# Global mock auth manager
_mock_auth_manager = MockAuthManager()


def get_auth_manager() -> MockAuthManager:
    """Get the mock auth manager."""
    return _mock_auth_manager


def set_auth_manager(auth_manager: MockAuthManager) -> None:
    """Set the mock auth manager."""
    global _mock_auth_manager
    _mock_auth_manager = auth_manager


class MockUserService:
    """Mock user service."""

    def __init__(self):
        self.users: dict[str, User] = {}

    def get_user(self, user_id: str) -> User | None:
        """Get user by ID."""
        return self.users.get(user_id)

    def create_user(self, username: str, email: str, password: str) -> User:
        """Create a new user."""
        user_id = f"user_{len(self.users) + 1}"
        user = User(id=user_id, username=username, email=email)
        self.users[user_id] = user
        return user


# Global mock user service
_mock_user_service = MockUserService()


def get_current_user() -> User:
    """Mock dependency to get current user."""
    # Return a default test user
    return User(
        id="test_user_1", username="testuser", email="test@example.com", is_active=True,
    )


def require_active_user() -> User:
    """Mock dependency to require active user."""
    user = get_current_user()
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is not active")
    return user


def create_auth_router() -> APIRouter:
    """Create mock auth router."""
    router = APIRouter(prefix="/auth", tags=["auth"])

    @router.post("/register")
    async def register(username: str, email: str, password: str):
        """Mock registration endpoint."""
        user = _mock_user_service.create_user(username, email, password)
        return {"user": user, "message": "User created successfully"}

    @router.post("/login")
    async def login(username: str, password: str):
        """Mock login endpoint."""
        return {"access_token": "mock_token", "token_type": "bearer"}

    return router


# Mock gatekeeper API routes
class MockGatekeeperAPI:
    """Mock gatekeeper API."""

    @staticmethod
    def create_auth_router():
        return create_auth_router()


# Mock backends module
class MockMemoryBackend:
    """Mock memory backend."""

    def __init__(self):
        self.data = {}

    def get(self, key):
        return self.data.get(key)

    def set(self, key, value):
        self.data[key] = value

    def delete(self, key):
        if key in self.data:
            del self.data[key]


# Create mock module structure
api = MockGatekeeperAPI()
routes = MockGatekeeperAPI()


# Mock core module
class MockCore:
    """Mock core module."""

    class MockTokenManager:
        def __init__(self, config):
            self.config = config

        def create_access_token(self, data, expires_delta=None):
            return "mock_access_token"

        def create_refresh_token(self, data, expires_delta=None):
            return "mock_refresh_token"

        def verify_token(self, token, token_type="access"):
            return TokenValidationResult(
                is_valid=True,
                payload=TokenData(
                    sub="testuser",
                    role="user",
                    type=token_type,
                    exp=datetime.now() + timedelta(minutes=30),
                    iat=datetime.now(),
                    jti="mock_jti",
                ),
            )

    class MockPasswordManager:
        def __init__(self, security_level=None):
            self.security_level = security_level

        def hash_password(self, password):
            return f"mock_hash_{password}"

        def verify_password(self, password, hashed_password):
            return hashed_password == f"mock_hash_{password}"

    token_manager = MockTokenManager
    password_manager = MockPasswordManager


# Mock models module
class MockModels:
    """Mock models module."""

    class MockToken:
        TokenConfig = TokenConfig
        TokenData = TokenData
        TokenValidationResult = TokenValidationResult

    token = MockToken()


# Mock backends module
class MockBackends:
    """Mock backends module."""

    class MockMemoryBackend:
        def __init__(self):
            self.data = {}

        def get(self, key):
            return self.data.get(key)

        def set(self, key, value):
            self.data[key] = value

        def delete(self, key):
            if key in self.data:
                del self.data[key]

    class MockPostgreSQLBackend:
        def __init__(self, connection_string=None):
            self.connection_string = connection_string
            self.data = {}

        def get(self, key):
            return self.data.get(key)

        def set(self, key, value):
            self.data[key] = value

        def delete(self, key):
            if key in self.data:
                del self.data[key]

    memory = MockMemoryBackend
    postgresql = MockPostgreSQLBackend


# Create module structure
core = MockCore()
models = MockModels()
backends = MockBackends()

# Add backends to the module for direct import
MemoryBackend = MockBackends.MockMemoryBackend
PostgreSQLBackend = MockBackends.MockPostgreSQLBackend
