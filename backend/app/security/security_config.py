"""Security Configuration Management for Reynard Backend
"""

import logging
import os
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class SecurityLevel(Enum):
    """Security levels for different environments."""

    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class SecurityConfig(BaseModel):
    """Main security configuration model."""

    security_level: SecurityLevel = SecurityLevel.DEVELOPMENT
    enabled: bool = True

    # Threat detection settings
    threat_detection_enabled: bool = True
    sql_injection_detection: bool = True
    command_injection_detection: bool = True
    xss_detection: bool = True
    path_traversal_detection: bool = True

    # Rate limiting settings
    rate_limiting_enabled: bool = True
    adaptive_rate_limiting: bool = True
    default_rate_limit: str = "100/minute"
    auth_rate_limit: str = "5/minute"

    # Security headers
    security_headers_enabled: bool = True
    x_content_type_options: str = "nosniff"
    x_frame_options: str = "DENY"
    x_xss_protection: str = "1; mode=block"

    # Logging settings
    security_logging_enabled: bool = True
    log_level: str = "INFO"

    # Monitoring settings
    monitoring_enabled: bool = True
    collect_metrics: bool = True

    # Environment-specific settings
    excluded_paths: list[str] = Field(
        default=[
            "/api/docs",
            "/api/redoc",
            "/api/openapi.json",
            "/favicon.ico",
            "/health",
            "/api/health",
            "/",
            "/api/search",
            "/api/rag",
            "/api/email/ai",
        ],
    )

    development_bypass: bool = False
    debug_mode: bool = False

    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.security_level == SecurityLevel.DEVELOPMENT

    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.security_level == SecurityLevel.PRODUCTION

    def should_bypass_security(self, path: str) -> bool:
        """Check if security should be bypassed for a path."""
        if self.development_bypass and self.is_development():
            return True
        return any(path.startswith(excluded) for excluded in self.excluded_paths)

    def get_security_headers(self) -> dict[str, str]:
        """Get security headers configuration."""
        if not self.security_headers_enabled:
            return {}

        return {
            "X-Content-Type-Options": self.x_content_type_options,
            "X-Frame-Options": self.x_frame_options,
            "X-XSS-Protection": self.x_xss_protection,
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Content-Security-Policy": "default-src 'self'",
        }


class SecurityConfigManager:
    """Security configuration manager with hot-reload capabilities."""

    def __init__(self):
        self._config: SecurityConfig | None = None

    def load_config(self, environment: str | None = None) -> SecurityConfig:
        """Load security configuration from environment variables."""
        # Determine security level
        security_level = SecurityLevel.DEVELOPMENT
        if environment:
            try:
                security_level = SecurityLevel(environment.lower())
            except ValueError:
                logger.warning(
                    f"Invalid environment '{environment}', using development",
                )
        elif os.getenv("SECURITY_LEVEL"):
            try:
                security_level = SecurityLevel(os.getenv("SECURITY_LEVEL").lower())
            except ValueError:
                logger.warning("Invalid SECURITY_LEVEL, using development")

        # Create configuration with environment overrides
        config_data = {
            "security_level": security_level,
            "enabled": os.getenv("SECURITY_ENABLED", "true").lower() == "true",
            "threat_detection_enabled": os.getenv(
                "SECURITY_THREAT_DETECTION", "true",
            ).lower()
            == "true",
            "rate_limiting_enabled": os.getenv("SECURITY_RATE_LIMITING", "true").lower()
            == "true",
            "adaptive_rate_limiting": os.getenv(
                "SECURITY_ADAPTIVE_RATE_LIMITING", "true",
            ).lower()
            == "true",
            "security_headers_enabled": os.getenv("SECURITY_HEADERS", "true").lower()
            == "true",
            "security_logging_enabled": os.getenv("SECURITY_LOGGING", "true").lower()
            == "true",
            "monitoring_enabled": os.getenv("SECURITY_MONITORING", "true").lower()
            == "true",
            "development_bypass": os.getenv(
                "SECURITY_DEVELOPMENT_BYPASS", "false",
            ).lower()
            == "true",
            "debug_mode": os.getenv("SECURITY_DEBUG_MODE", "false").lower() == "true",
        }

        self._config = SecurityConfig(**config_data)
        logger.info("Security configuration loaded successfully")
        return self._config

    def get_config(self) -> SecurityConfig:
        """Get current configuration."""
        if self._config is None:
            self._config = SecurityConfig()
        return self._config

    def update_config(self, updates: dict[str, Any]) -> SecurityConfig:
        """Update configuration with new values."""
        if self._config is None:
            self._config = SecurityConfig()

        config_dict = self._config.dict()
        config_dict.update(updates)

        self._config = SecurityConfig(**config_dict)
        logger.info("Security configuration updated successfully")
        return self._config


# Global security configuration manager
security_config_manager = SecurityConfigManager()


def get_security_config() -> SecurityConfig:
    """Get the current security configuration."""
    return security_config_manager.get_config()


def load_security_config(environment: str | None = None) -> SecurityConfig:
    """Load security configuration."""
    return security_config_manager.load_config(environment)


def get_audit_logging_config() -> dict[str, Any]:
    """Get audit logging configuration."""
    config = get_security_config()
    return {
        "enabled": config.security_logging_enabled,
        "log_level": config.log_level,
        "log_file": config.log_file,
        "max_file_size": config.max_file_size,
        "backup_count": config.backup_count,
        "log_format": config.log_format,
        "date_format": config.date_format,
    }


def get_api_security_config() -> dict[str, Any]:
    """Get API security configuration."""
    config = get_security_config()
    return {
        "enabled": config.enabled,
        "security_level": config.security_level.value,
        "threat_detection_enabled": config.threat_detection_enabled,
        "rate_limiting_enabled": config.rate_limiting_enabled,
        "adaptive_rate_limiting": config.adaptive_rate_limiting,
        "default_rate_limit": config.default_rate_limit,
        "auth_rate_limit": config.auth_rate_limit,
    }


def get_database_security_config() -> dict[str, Any]:
    """Get database security configuration."""
    config = get_security_config()
    return {
        "enabled": config.enabled,
        "security_level": config.security_level.value,
        "encryption_enabled": getattr(config, "encryption_enabled", True),
        "audit_enabled": getattr(config, "audit_enabled", True),
    }


# Additional configuration classes
class APISecurityConfig(BaseModel):
    """API security configuration."""

    enabled: bool = True
    rate_limiting_enabled: bool = True
    adaptive_rate_limiting: bool = True
    default_rate_limit: str = "100/minute"
    auth_rate_limit: str = "5/minute"


class AuditLoggingConfig(BaseModel):
    """Audit logging configuration."""

    enabled: bool = True
    log_level: str = "INFO"
    log_file: str = "security_audit.log"
    max_file_size: int = 10485760  # 10MB
    backup_count: int = 5
    log_format: str = "json"
    date_format: str = "%Y-%m-%d %H:%M:%S"


class DatabaseSecurityConfig(BaseModel):
    """Database security configuration."""

    enabled: bool = True
    encryption_enabled: bool = True
    audit_enabled: bool = True


class EncryptionConfig(BaseModel):
    """Encryption configuration."""

    algorithm: str = "AES-256-GCM"
    key_size: int = 32
    iv_size: int = 12


class SecurityHeadersConfig(BaseModel):
    """Security headers configuration."""

    enabled: bool = True
    x_content_type_options: str = "nosniff"
    x_frame_options: str = "DENY"
    x_xss_protection: str = "1; mode=block"


class SessionSecurityConfig(BaseModel):
    """Session security configuration."""

    enabled: bool = True
    secure: bool = True
    httponly: bool = True
    samesite: str = "strict"


class EncryptionAlgorithm(Enum):
    """Encryption algorithms."""

    AES_256_GCM = "AES-256-GCM"
    AES_256_CBC = "AES-256-CBC"
    RSA_2048 = "RSA-2048"
    RSA_4096 = "RSA-4096"


class HashAlgorithm(Enum):
    """Hash algorithms."""

    SHA256 = "SHA256"
    SHA512 = "SHA512"
    BLAKE2B = "BLAKE2B"
    ARGON2 = "ARGON2"


def get_encryption_config() -> dict[str, Any]:
    """Get encryption configuration."""
    return {
        "algorithm": "AES-256-GCM",
        "key_size": 32,
        "iv_size": 12,
    }


def get_security_headers_config() -> dict[str, Any]:
    """Get security headers configuration."""
    config = get_security_config()
    return {
        "enabled": config.security_headers_enabled,
        "x_content_type_options": config.x_content_type_options,
        "x_frame_options": config.x_frame_options,
        "x_xss_protection": config.x_xss_protection,
    }


def get_session_security_config() -> dict[str, Any]:
    """Get session security configuration."""
    return {
        "enabled": True,
        "secure": True,
        "httponly": True,
        "samesite": "strict",
    }
