"""Configuration management for Reynard Basic Backend
Handles environment-based configuration for uvicorn and application settings
"""

import os


class UvicornConfig:
    """Uvicorn server configuration"""

    def __init__(self):
        self.host = os.getenv("UVICORN_HOST", "0.0.0.0")
        self.port = int(os.getenv("UVICORN_PORT", "8000"))
        self.reload = os.getenv("UVICORN_RELOAD", "true").lower() == "true"
        self.reload_dirs = self._parse_reload_dirs()
        self.reload_delay = float(os.getenv("UVICORN_RELOAD_DELAY", "0.25"))
        self.log_level = os.getenv("UVICORN_LOG_LEVEL", "info")
        self.access_log = os.getenv("UVICORN_ACCESS_LOG", "true").lower() == "true"
        self.use_colors = os.getenv("UVICORN_USE_COLORS", "true").lower() == "true"

    def _parse_reload_dirs(self) -> list[str]:
        """Parse reload directories from environment variable"""
        dirs = os.getenv("UVICORN_RELOAD_DIRS", ".")
        return [d.strip() for d in dirs.split(",") if d.strip()]

    def __repr__(self) -> str:
        return (
            f"UvicornConfig(host='{self.host}', port={self.port}, "
            f"reload={self.reload}, reload_dirs={self.reload_dirs}, "
            f"log_level='{self.log_level}')"
        )


class DatabaseConfig:
    """Database configuration"""

    def __init__(self):
        self.url = os.getenv(
            "DATABASE_URL",
            "postgresql+asyncpg://promptnote_user:password@localhost:5432/promptnote_db",
        )
        self.echo = os.getenv("DATABASE_ECHO", "false").lower() == "true"
        self.pool_size = int(os.getenv("DATABASE_POOL_SIZE", "5"))
        self.max_overflow = int(os.getenv("DATABASE_MAX_OVERFLOW", "10"))

    def __repr__(self) -> str:
        return (
            f"DatabaseConfig(url='{self.url}', echo={self.echo}, "
            f"pool_size={self.pool_size}, max_overflow={self.max_overflow})"
        )


class CacheConfig:
    """Cache configuration"""

    def __init__(self):
        self.url = os.getenv("CACHE_URL", "redis://localhost:6379/0")
        self.ttl = int(os.getenv("CACHE_TTL", "3600"))  # 1 hour default
        self.max_connections = int(os.getenv("CACHE_MAX_CONNECTIONS", "10"))

    def __repr__(self) -> str:
        return (
            f"CacheConfig(url='{self.url}', ttl={self.ttl}, "
            f"max_connections={self.max_connections})"
        )


class AppConfig:
    """Application configuration"""

    def __init__(self):
        self.environment = os.getenv("ENVIRONMENT", "development")
        self.debug = os.getenv("DEBUG", "true").lower() == "true"
        self.secret_key = os.getenv(
            "SECRET_KEY",
            "your-secret-key-change-in-production",
        )
        self.cors_origins = self._parse_cors_origins()
        self.rate_limit = int(os.getenv("RATE_LIMIT", "100"))  # requests per minute

    def _parse_cors_origins(self) -> list[str]:
        """Parse CORS origins from environment variable"""
        origins = os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://localhost:5173",
        )
        return [origin.strip() for origin in origins.split(",") if origin.strip()]

    def __repr__(self) -> str:
        return (
            f"AppConfig(environment='{self.environment}', debug={self.debug}, "
            f"cors_origins={self.cors_origins}, rate_limit={self.rate_limit})"
        )


# Global configuration instances
uvicorn_config = UvicornConfig()
database_config = DatabaseConfig()
cache_config = CacheConfig()
app_config = AppConfig()


def get_uvicorn_config() -> UvicornConfig:
    """Get uvicorn configuration"""
    return uvicorn_config


def get_database_config() -> DatabaseConfig:
    """Get database configuration"""
    return database_config


def get_cache_config() -> CacheConfig:
    """Get cache configuration"""
    return cache_config


def get_app_config() -> AppConfig:
    """Get application configuration"""
    return app_config


def print_config():
    """Print current configuration (useful for debugging)"""
    print("🔧 Current Configuration:")
    print(f"  Uvicorn: {uvicorn_config}")
    print(f"  Database: {database_config}")
    print(f"  Cache: {cache_config}")
    print(f"  App: {app_config}")
