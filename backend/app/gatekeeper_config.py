"""
Gatekeeper configuration for Reynard Backend.

This module configures the authentication system using the Gatekeeper library
with SQLite backend for development and PostgreSQL for production.
"""

import os

from app.security.jwt_secret_manager import get_jwt_algorithm, get_jwt_secret_key
from gatekeeper import AuthManager, SecurityLevel, TokenConfig
from gatekeeper.backends.memory import MemoryBackend
from gatekeeper.backends.postgresql import PostgreSQLBackend
from gatekeeper.backends.sqlite import SQLiteBackend

# Detect reload mode for optimization
IS_RELOAD_MODE = os.environ.get("UVICORN_RELOAD_PROCESS") == "1"


class ReynardGatekeeperConfig:
    """Configuration for Gatekeeper authentication system in Reynard."""

    def __init__(self) -> None:
        # Token configuration - use secure persistent secret key
        self.secret_key = get_jwt_secret_key()
        self.algorithm = get_jwt_algorithm()
        self.access_token_expire_minutes = int(
            os.getenv("GATEKEEPER_ACCESS_TOKEN_EXPIRE_MINUTES", "30")
        )
        self.refresh_token_expire_days = int(
            os.getenv("GATEKEEPER_REFRESH_TOKEN_EXPIRE_DAYS", "7")
        )
        self.issuer = os.getenv("GATEKEEPER_ISSUER", "reynard-backend")
        self.audience = os.getenv("GATEKEEPER_AUDIENCE", "reynard-users")

        # Password security level
        security_level_str = os.getenv("GATEKEEPER_PASSWORD_SECURITY_LEVEL", "MEDIUM")
        self.password_security_level = getattr(
            SecurityLevel, security_level_str.upper(), SecurityLevel.MEDIUM
        )

        # Database configuration - Use dedicated auth database
        self.database_url = os.getenv(
            "AUTH_DATABASE_URL",
            "postgresql://postgres:password@localhost:5432/reynard_auth",
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
        """Get token configuration for Gatekeeper."""
        return TokenConfig(
            secret_key=self.secret_key,
            algorithm=self.algorithm,
            access_token_expire_minutes=self.access_token_expire_minutes,
            refresh_token_expire_days=self.refresh_token_expire_days,
            issuer=self.issuer,
            audience=self.audience,
        )

    def get_user_backend(self) -> MemoryBackend | PostgreSQLBackend | SQLiteBackend:
        """Get the appropriate user backend based on configuration."""
        if IS_RELOAD_MODE or self.use_memory_backend:
            # Use memory backend for development/reload mode
            return MemoryBackend()

        if self.database_url.startswith(
            "postgresql://"
        ) or self.database_url.startswith("postgres://"):
            # PostgreSQL backend (preferred)
            return PostgreSQLBackend(database_url=self.database_url)
        elif self.database_url.startswith("sqlite://"):
            # SQLite backend (fallback only)
            return SQLiteBackend(database_url=self.database_url)
        else:
            # Default to PostgreSQL if URL format is unclear
            return PostgreSQLBackend(database_url=self.database_url)

    def create_auth_manager(self) -> AuthManager:
        """Create and configure the AuthManager instance."""
        token_config = self.get_token_config()
        backend = self.get_user_backend()

        auth_manager = AuthManager(
            backend=backend,
            token_config=token_config,
            password_security_level=self.password_security_level,
        )

        return auth_manager


# Global configuration instance
_config: ReynardGatekeeperConfig | None = None
_auth_manager: AuthManager | None = None


def get_config() -> ReynardGatekeeperConfig:
    """Get the global Gatekeeper configuration instance."""
    global _config
    if _config is None:
        _config = ReynardGatekeeperConfig()
    return _config


async def get_auth_manager() -> AuthManager:
    """Get the global AuthManager instance."""
    global _auth_manager
    if _auth_manager is None:
        config = get_config()
        _auth_manager = config.create_auth_manager()

        # Initialize the backend if needed
        if hasattr(_auth_manager.backend, "initialize"):
            await _auth_manager.backend.initialize()

    return _auth_manager


async def initialize_gatekeeper() -> AuthManager:
    """Initialize Gatekeeper for the Reynard backend."""
    print("[INFO] Initializing Gatekeeper authentication system...")

    try:
        auth_manager = await get_auth_manager()
        print("[OK] Gatekeeper initialized successfully")
        return auth_manager
    except Exception as e:
        print(f"[FAIL] Failed to initialize Gatekeeper: {e}")
        raise


async def shutdown_gatekeeper() -> None:
    """Shutdown Gatekeeper and cleanup resources."""
    global _auth_manager
    if _auth_manager is not None:
        if hasattr(_auth_manager.backend, "close"):
            await _auth_manager.backend.close()
        _auth_manager = None
    print("[OK] Gatekeeper shutdown complete")
