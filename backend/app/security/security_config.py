"""
🔐 Security Configuration Management for Reynard Backend

This module provides comprehensive security configuration management with
environment-based settings, validation, and security policy enforcement.

Key Features:
- Environment-based security configuration
- Security policy validation and enforcement
- Encryption settings and key management configuration
- Session security configuration
- API security settings
- Database security configuration
- Audit logging configuration

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

import logging
import os
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Union

logger = logging.getLogger(__name__)


class SecurityLevel(Enum):
    """Security levels for different environments."""

    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    HIGH_SECURITY = "high_security"


class EncryptionAlgorithm(Enum):
    """Supported encryption algorithms."""

    AES_256_GCM = "aes-256-gcm"
    AES_256_CBC = "aes-256-cbc"
    RSA_2048 = "rsa-2048"
    RSA_4096 = "rsa-4096"


class HashAlgorithm(Enum):
    """Supported hash algorithms."""

    SHA256 = "sha256"
    SHA384 = "sha384"
    SHA512 = "sha512"
    BLAKE2B = "blake2b"


@dataclass
class DatabaseSecurityConfig:
    """Database security configuration."""

    # Encryption settings
    enable_transparent_encryption: bool = True
    enable_column_encryption: bool = True
    encryption_algorithm: EncryptionAlgorithm = EncryptionAlgorithm.AES_256_GCM

    # Connection security
    require_ssl: bool = True
    ssl_verify_mode: str = "require"
    connection_timeout: int = 30

    # Key management
    key_rotation_days: int = 90
    master_key_backup_enabled: bool = True

    # Audit settings
    enable_query_logging: bool = True
    log_sensitive_queries: bool = False
    audit_retention_days: int = 365


@dataclass
class SessionSecurityConfig:
    """Session security configuration."""

    # Session encryption
    enable_session_encryption: bool = True
    encryption_algorithm: EncryptionAlgorithm = EncryptionAlgorithm.AES_256_GCM

    # Session management
    session_timeout_minutes: int = 30
    max_concurrent_sessions: int = 5
    enable_session_binding: bool = True

    # Cookie security
    secure_cookies: bool = True
    http_only_cookies: bool = True
    same_site_policy: str = "strict"

    # Session storage
    use_redis_for_sessions: bool = True

    # itsdangerous integration settings
    enable_hybrid_sessions: bool = True
    use_itsdangerous_for_tokens: bool = True
    itsdangerous_token_expiry_hours: int = 24
    itsdangerous_password_reset_expiry_hours: int = 1
    itsdangerous_email_verification_expiry_hours: int = 24
    itsdangerous_api_key_expiry_days: int = 30
    redis_encryption_enabled: bool = True
    session_cleanup_interval_minutes: int = 15


@dataclass
class APISecurityConfig:
    """API security configuration."""

    # Authentication
    enable_jwt: bool = True
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # API key management
    enable_api_keys: bool = True
    api_key_encryption_enabled: bool = True
    api_key_rotation_days: int = 90

    # Rate limiting
    enable_rate_limiting: bool = True
    rate_limit_requests_per_minute: int = 60
    rate_limit_burst_size: int = 100

    # Request validation
    enable_input_validation: bool = True
    max_request_size_mb: int = 10
    enable_sql_injection_protection: bool = True
    enable_xss_protection: bool = True


@dataclass
class EncryptionConfig:
    """Encryption configuration."""

    # Default algorithms
    default_symmetric_algorithm: EncryptionAlgorithm = EncryptionAlgorithm.AES_256_GCM
    default_asymmetric_algorithm: EncryptionAlgorithm = EncryptionAlgorithm.RSA_2048
    default_hash_algorithm: HashAlgorithm = HashAlgorithm.SHA256

    # Key management
    key_derivation_iterations: int = 100000
    key_derivation_algorithm: str = "pbkdf2"
    enable_key_rotation: bool = True

    # Performance settings
    enable_hardware_acceleration: bool = True
    encryption_thread_pool_size: int = 4


@dataclass
class AuditLoggingConfig:
    """Audit logging configuration."""

    # Logging settings
    enable_audit_logging: bool = True
    log_level: str = "INFO"
    log_format: str = "json"

    # Log destinations
    enable_file_logging: bool = True
    enable_database_logging: bool = True
    enable_syslog_logging: bool = False

    # Log retention
    file_retention_days: int = 90
    database_retention_days: int = 365
    log_compression_enabled: bool = True

    # Security events
    log_authentication_events: bool = True
    log_authorization_events: bool = True
    log_data_access_events: bool = True
    log_security_violations: bool = True


@dataclass
class SecurityHeadersConfig:
    """Security headers configuration."""

    # Content Security Policy
    enable_csp: bool = True
    csp_policy: str = (
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    )

    # Other security headers
    enable_hsts: bool = True
    hsts_max_age: int = 31536000  # 1 year
    enable_xss_protection: bool = True
    enable_content_type_nosniff: bool = True
    enable_frame_options: bool = True
    frame_options_value: str = "DENY"

    # Referrer policy
    enable_referrer_policy: bool = True
    referrer_policy_value: str = "strict-origin-when-cross-origin"


@dataclass
class SecurityConfig:
    """Main security configuration class."""

    # Environment and security level
    environment: str = field(
        default_factory=lambda: os.getenv("ENVIRONMENT", "development")
    )
    security_level: SecurityLevel = SecurityLevel.DEVELOPMENT

    # Component configurations
    database: DatabaseSecurityConfig = field(default_factory=DatabaseSecurityConfig)
    session: SessionSecurityConfig = field(default_factory=SessionSecurityConfig)
    api: APISecurityConfig = field(default_factory=APISecurityConfig)
    encryption: EncryptionConfig = field(default_factory=EncryptionConfig)
    audit_logging: AuditLoggingConfig = field(default_factory=AuditLoggingConfig)
    security_headers: SecurityHeadersConfig = field(
        default_factory=SecurityHeadersConfig
    )

    # Global security settings
    enable_security_middleware: bool = True
    enable_penetration_testing: bool = False
    security_testing_interval_hours: int = 24

    # Compliance settings
    enable_gdpr_compliance: bool = True
    enable_ccpa_compliance: bool = True
    enable_soc2_compliance: bool = False
    enable_iso27001_compliance: bool = False

    def __post_init__(self):
        """Post-initialization validation and setup."""
        self._validate_environment()
        self._apply_environment_overrides()
        self._validate_configuration()

    def _validate_environment(self) -> None:
        """Validate environment settings."""
        valid_environments = ["development", "staging", "production", "testing"]
        if self.environment not in valid_environments:
            logger.warning(
                f"Invalid environment '{self.environment}', using 'development'"
            )
            self.environment = "development"

        # Set security level based on environment
        if self.environment == "production":
            self.security_level = SecurityLevel.PRODUCTION
        elif self.environment == "staging":
            self.security_level = SecurityLevel.STAGING
        else:
            self.security_level = SecurityLevel.DEVELOPMENT

    def _apply_environment_overrides(self) -> None:
        """Apply environment-specific overrides."""
        if self.environment == "production":
            self._apply_production_overrides()
        elif self.environment == "staging":
            self._apply_staging_overrides()
        else:
            self._apply_development_overrides()

    def _apply_production_overrides(self) -> None:
        """Apply production security overrides."""
        logger.info("Applying production security configuration")

        # Database security
        self.database.require_ssl = True
        self.database.enable_transparent_encryption = True
        self.database.enable_column_encryption = True
        self.database.audit_retention_days = 2555  # 7 years

        # Session security
        self.session.secure_cookies = True
        self.session.http_only_cookies = True
        self.session.enable_session_encryption = True
        self.session.session_timeout_minutes = 15

        # API security
        self.api.access_token_expire_minutes = 15
        self.api.refresh_token_expire_days = 1
        self.api.enable_rate_limiting = True
        self.api.rate_limit_requests_per_minute = 30

        # Encryption
        self.encryption.default_asymmetric_algorithm = EncryptionAlgorithm.RSA_4096
        self.encryption.key_derivation_iterations = 200000

        # Audit logging
        self.audit_logging.enable_audit_logging = True
        self.audit_logging.log_level = "WARNING"
        self.audit_logging.database_retention_days = 2555  # 7 years

        # Security headers
        self.security_headers.enable_csp = True
        self.security_headers.enable_hsts = True

        # Compliance
        self.enable_gdpr_compliance = True
        self.enable_ccpa_compliance = True
        self.enable_soc2_compliance = True
        self.enable_iso27001_compliance = True

    def _apply_staging_overrides(self) -> None:
        """Apply staging security overrides."""
        logger.info("Applying staging security configuration")

        # Database security
        self.database.require_ssl = True
        self.database.enable_transparent_encryption = True
        self.database.enable_column_encryption = True

        # Session security
        self.session.secure_cookies = True
        self.session.http_only_cookies = True
        self.session.enable_session_encryption = True

        # API security
        self.api.enable_rate_limiting = True
        self.api.rate_limit_requests_per_minute = 60

        # Audit logging
        self.audit_logging.enable_audit_logging = True
        self.audit_logging.log_level = "INFO"

    def _apply_development_overrides(self) -> None:
        """Apply development security overrides."""
        logger.info("Applying development security configuration")

        # Relaxed security for development
        self.database.require_ssl = False
        self.database.enable_transparent_encryption = False
        self.database.enable_column_encryption = False

        # Session security
        self.session.secure_cookies = False
        self.session.http_only_cookies = True
        self.session.enable_session_encryption = False
        self.session.session_timeout_minutes = 60

        # API security
        self.api.access_token_expire_minutes = 60
        self.api.refresh_token_expire_days = 7
        self.api.enable_rate_limiting = False

        # Audit logging
        self.audit_logging.enable_audit_logging = True
        self.audit_logging.log_level = "DEBUG"

        # Security headers
        self.security_headers.enable_csp = False
        self.security_headers.enable_hsts = False

    def _validate_configuration(self) -> None:
        """Validate security configuration."""
        errors = []

        # Validate database configuration
        if self.database.key_rotation_days < 30:
            errors.append("Database key rotation must be at least 30 days")

        # Validate session configuration
        if self.session.session_timeout_minutes < 5:
            errors.append("Session timeout must be at least 5 minutes")

        if self.session.max_concurrent_sessions < 1:
            errors.append("Max concurrent sessions must be at least 1")

        # Validate API configuration
        if self.api.access_token_expire_minutes < 5:
            errors.append("Access token expiration must be at least 5 minutes")

        if self.api.rate_limit_requests_per_minute < 1:
            errors.append("Rate limit must be at least 1 request per minute")

        # Validate encryption configuration
        if self.encryption.key_derivation_iterations < 10000:
            errors.append("Key derivation iterations must be at least 10,000")

        # Validate audit logging configuration
        if self.audit_logging.file_retention_days < 1:
            errors.append("File retention must be at least 1 day")

        if errors:
            error_message = "Security configuration validation failed:\n" + "\n".join(
                f"- {error}" for error in errors
            )
            logger.error(error_message)
            raise ValueError(error_message)

    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.environment == "production"

    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.environment == "development"

    def is_staging(self) -> bool:
        """Check if running in staging mode."""
        return self.environment == "staging"

    def get_security_level(self) -> SecurityLevel:
        """Get the current security level."""
        return self.security_level

    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary."""
        return {
            "environment": self.environment,
            "security_level": self.security_level.value,
            "database": {
                "enable_transparent_encryption": self.database.enable_transparent_encryption,
                "enable_column_encryption": self.database.enable_column_encryption,
                "encryption_algorithm": self.database.encryption_algorithm.value,
                "require_ssl": self.database.require_ssl,
                "ssl_verify_mode": self.database.ssl_verify_mode,
                "connection_timeout": self.database.connection_timeout,
                "key_rotation_days": self.database.key_rotation_days,
                "master_key_backup_enabled": self.database.master_key_backup_enabled,
                "enable_query_logging": self.database.enable_query_logging,
                "log_sensitive_queries": self.database.log_sensitive_queries,
                "audit_retention_days": self.database.audit_retention_days,
            },
            "session": {
                "enable_session_encryption": self.session.enable_session_encryption,
                "encryption_algorithm": self.session.encryption_algorithm.value,
                "session_timeout_minutes": self.session.session_timeout_minutes,
                "max_concurrent_sessions": self.session.max_concurrent_sessions,
                "enable_session_binding": self.session.enable_session_binding,
                "secure_cookies": self.session.secure_cookies,
                "http_only_cookies": self.session.http_only_cookies,
                "same_site_policy": self.session.same_site_policy,
                "use_redis_for_sessions": self.session.use_redis_for_sessions,
                "redis_encryption_enabled": self.session.redis_encryption_enabled,
                "session_cleanup_interval_minutes": self.session.session_cleanup_interval_minutes,
            },
            "api": {
                "enable_jwt": self.api.enable_jwt,
                "jwt_algorithm": self.api.jwt_algorithm,
                "access_token_expire_minutes": self.api.access_token_expire_minutes,
                "refresh_token_expire_days": self.api.refresh_token_expire_days,
                "enable_api_keys": self.api.enable_api_keys,
                "api_key_encryption_enabled": self.api.api_key_encryption_enabled,
                "api_key_rotation_days": self.api.api_key_rotation_days,
                "enable_rate_limiting": self.api.enable_rate_limiting,
                "rate_limit_requests_per_minute": self.api.rate_limit_requests_per_minute,
                "rate_limit_burst_size": self.api.rate_limit_burst_size,
                "enable_input_validation": self.api.enable_input_validation,
                "max_request_size_mb": self.api.max_request_size_mb,
                "enable_sql_injection_protection": self.api.enable_sql_injection_protection,
                "enable_xss_protection": self.api.enable_xss_protection,
            },
            "encryption": {
                "default_symmetric_algorithm": self.encryption.default_symmetric_algorithm.value,
                "default_asymmetric_algorithm": self.encryption.default_asymmetric_algorithm.value,
                "default_hash_algorithm": self.encryption.default_hash_algorithm.value,
                "key_derivation_iterations": self.encryption.key_derivation_iterations,
                "key_derivation_algorithm": self.encryption.key_derivation_algorithm,
                "enable_key_rotation": self.encryption.enable_key_rotation,
                "enable_hardware_acceleration": self.encryption.enable_hardware_acceleration,
                "encryption_thread_pool_size": self.encryption.encryption_thread_pool_size,
            },
            "audit_logging": {
                "enable_audit_logging": self.audit_logging.enable_audit_logging,
                "log_level": self.audit_logging.log_level,
                "log_format": self.audit_logging.log_format,
                "enable_file_logging": self.audit_logging.enable_file_logging,
                "enable_database_logging": self.audit_logging.enable_database_logging,
                "enable_syslog_logging": self.audit_logging.enable_syslog_logging,
                "file_retention_days": self.audit_logging.file_retention_days,
                "database_retention_days": self.audit_logging.database_retention_days,
                "log_compression_enabled": self.audit_logging.log_compression_enabled,
                "log_authentication_events": self.audit_logging.log_authentication_events,
                "log_authorization_events": self.audit_logging.log_authorization_events,
                "log_data_access_events": self.audit_logging.log_data_access_events,
                "log_security_violations": self.audit_logging.log_security_violations,
            },
            "security_headers": {
                "enable_csp": self.security_headers.enable_csp,
                "csp_policy": self.security_headers.csp_policy,
                "enable_hsts": self.security_headers.enable_hsts,
                "hsts_max_age": self.security_headers.hsts_max_age,
                "enable_xss_protection": self.security_headers.enable_xss_protection,
                "enable_content_type_nosniff": self.security_headers.enable_content_type_nosniff,
                "enable_frame_options": self.security_headers.enable_frame_options,
                "frame_options_value": self.security_headers.frame_options_value,
                "enable_referrer_policy": self.security_headers.enable_referrer_policy,
                "referrer_policy_value": self.security_headers.referrer_policy_value,
            },
            "global_settings": {
                "enable_security_middleware": self.enable_security_middleware,
                "enable_penetration_testing": self.enable_penetration_testing,
                "security_testing_interval_hours": self.security_testing_interval_hours,
                "enable_gdpr_compliance": self.enable_gdpr_compliance,
                "enable_ccpa_compliance": self.enable_ccpa_compliance,
                "enable_soc2_compliance": self.enable_soc2_compliance,
                "enable_iso27001_compliance": self.enable_iso27001_compliance,
            },
        }


# Global security configuration instance
_security_config: Optional[SecurityConfig] = None


def get_security_config() -> SecurityConfig:
    """Get the global security configuration instance."""
    global _security_config
    if _security_config is None:
        _security_config = SecurityConfig()
    return _security_config


def reload_security_config() -> SecurityConfig:
    """Reload the security configuration from environment."""
    global _security_config
    _security_config = SecurityConfig()
    return _security_config


def get_database_security_config() -> DatabaseSecurityConfig:
    """Get database security configuration."""
    return get_security_config().database


def get_session_security_config() -> SessionSecurityConfig:
    """Get session security configuration."""
    return get_security_config().session


def get_api_security_config() -> APISecurityConfig:
    """Get API security configuration."""
    return get_security_config().api


def get_encryption_config() -> EncryptionConfig:
    """Get encryption configuration."""
    return get_security_config().encryption


def get_audit_logging_config() -> AuditLoggingConfig:
    """Get audit logging configuration."""
    return get_security_config().audit_logging


def get_security_headers_config() -> SecurityHeadersConfig:
    """Get security headers configuration."""
    return get_security_config().security_headers
