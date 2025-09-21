"""
Gatekeeper configuration for Reynard Basic Backend
Configures the authentication system using the Reynard standard gatekeeper library
"""

import os

from gatekeeper import AuthManager, SecurityLevel, TokenConfig
from gatekeeper.backends.memory import MemoryBackend
from gatekeeper.backends.postgresql import PostgreSQLBackend
from gatekeeper.backends.sqlite import SQLiteBackend
from gatekeeper.backends.base import UserBackend

# Detect reload mode for optimization
IS_RELOAD_MODE = os.environ.get("UVICORN_RELOAD_PROCESS") == "1"


class GatekeeperConfig:
    """Configuration for Gatekeeper authentication system"""

    def __init__(self):
        # Token configuration
        self.secret_key = os.getenv(
            "GATEKEEPER_SECRET_KEY",
            "reynard-basic-backend-secret-key-change-in-production",
        )
        self.algorithm = os.getenv("GATEKEEPER_ALGORITHM", "HS256")
        self.access_token_expire_minutes = int(
            os.getenv("GATEKEEPER_ACCESS_TOKEN_EXPIRE_MINUTES", "30")
        )
        self.refresh_token_expire_days = int(
            os.getenv("GATEKEEPER_REFRESH_TOKEN_EXPIRE_DAYS", "7")
        )
        self.issuer = os.getenv("GATEKEEPER_ISSUER", "reynard-basic-backend")
        self.audience = os.getenv("GATEKEEPER_AUDIENCE", "reynard-users")

        # Password security level
        security_level_str = os.getenv("GATEKEEPER_PASSWORD_SECURITY_LEVEL", "MEDIUM")
        self.password_security_level = getattr(
            SecurityLevel, security_level_str.upper(), SecurityLevel.MEDIUM
        )

        # Database configuration
        self.database_url = os.getenv(
            "DATABASE_URL",
            "postgresql://promptnote_user:promptnote_password@localhost:5432/promptnote_db",
        )
        self.use_memory_backend = (
            os.getenv("GATEKEEPER_USE_MEMORY_BACKEND", "false").lower() == "true"
        )

        # Backend configuration
        self.backend_pool_size = int(os.getenv("GATEKEEPER_BACKEND_POOL_SIZE", "5"))
        self.backend_max_overflow = int(
            os.getenv("GATEKEEPER_BACKEND_MAX_OVERFLOW", "10")
        )

    def get_token_config(self) -> TokenConfig:
        """Get token configuration"""
        return TokenConfig(
            secret_key=self.secret_key,
            algorithm=self.algorithm,
            access_token_expire_minutes=self.access_token_expire_minutes,
            refresh_token_expire_days=self.refresh_token_expire_days,
            issuer=self.issuer,
            audience=self.audience,
        )

    def get_backend(self) -> "UserBackend":
        """Get the appropriate backend based on configuration"""
        if self.use_memory_backend:
            print("[INFO] Using MemoryBackend for authentication")
            return MemoryBackend()
        # Check database type and use appropriate backend
        if self.database_url.startswith("sqlite"):
            print("[INFO] Using SQLiteBackend for authentication")
            return SQLiteBackend(
                database_url=self.database_url,
                pool_size=self.backend_pool_size,
                max_overflow=self.backend_max_overflow,
            )
        print("[INFO] Using PostgreSQLBackend for authentication")
        return PostgreSQLBackend(
            database_url=self.database_url,
            echo=False,
        )

    def create_auth_manager(self) -> AuthManager:
        """Create and configure the authentication manager"""
        if IS_RELOAD_MODE:
            print("[INFO] Skipping auth manager initialization during reload")
            # Return a minimal auth manager for reload mode
            return AuthManager(
                backend=MemoryBackend(),
                token_config=self.get_token_config(),
                password_security_level=self.password_security_level,
            )

        print("[INFO] Initializing Gatekeeper authentication manager...")

        auth_manager = AuthManager(
            backend=self.get_backend(),
            token_config=self.get_token_config(),
            password_security_level=self.password_security_level,
        )

        print("[OK] Gatekeeper authentication manager initialized")
        return auth_manager


# Global configuration instance
gatekeeper_config = GatekeeperConfig()

# Global auth manager instance
_auth_manager: AuthManager | None = None


def get_auth_manager() -> AuthManager:
    """Get the global authentication manager instance"""
    global _auth_manager

    if _auth_manager is None:
        _auth_manager = gatekeeper_config.create_auth_manager()

    return _auth_manager


def initialize_auth_manager() -> AuthManager:
    """Initialize the authentication manager (call this during app startup)"""
    global _auth_manager

    if _auth_manager is not None:
        return _auth_manager

    _auth_manager = gatekeeper_config.create_auth_manager()
    return _auth_manager


async def close_auth_manager():
    """Close the authentication manager (call this during app shutdown)"""
    global _auth_manager

    if _auth_manager is not None:
        print("[INFO] Closing Gatekeeper authentication manager...")
        await _auth_manager.close()
        _auth_manager = None
        print("[OK] Gatekeeper authentication manager closed")
