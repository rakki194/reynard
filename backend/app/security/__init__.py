"""🔐 Comprehensive Security Module for Reynard Backend

This module provides enterprise-grade security infrastructure including
key management, encryption utilities, security configuration, audit logging,
input validation, security headers, and threat detection.

Key Components:
- Key Management: Centralized key management with HSM simulation
- Encryption Utilities: AES-256-GCM, RSA, and secure hashing
- Security Configuration: Environment-based security policies
- Audit Logging: Comprehensive security event logging
- Input Validation: SQL injection, XSS, and command injection protection
- Security Headers: HTTP security headers and CSP policies
- Threat Detection: Real-time security violation detection

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

from .api_key_manager import (
    APIKeyManager,
    APIKeyMetadata,
    APIKeyScope,
    APIKeyStatus,
    check_api_key_rate_limit,
    create_api_key,
    get_api_key_manager,
    list_api_keys,
    revoke_api_key,
    rotate_api_key,
    validate_api_key,
)
from .audit_logger import (
    SecurityAuditLogger,
    SecurityEvent,
    SecurityEventSeverity,
    SecurityEventType,
    get_security_audit_logger,
    log_authentication_event,
    log_authorization_event,
    log_data_access_event,
    log_security_event,
    log_security_violation,
    log_system_event,
)

# Database and Session Security
from .database_encryption import (
    DatabaseEncryptionError,
    DatabaseEncryptionManager,
    decrypt_database_field,
    encrypt_database_field,
    get_database_encryption_manager,
)
from .encryption_utils import (
    DecryptionError,
    EncryptionError,
    EncryptionUtils,
    decrypt_data,
    encrypt_data,
    generate_password_hash,
    hash_string,
    verify_password_hash,
)

# Legacy security components
from .input_validator import validate_input_security
from .jwt_secret_manager import JWTSecretManager, get_jwt_secret_manager

# Core security components
from .key_manager import (
    KeyManager,
    KeyMetadata,
    KeyStatus,
    KeyType,
    cleanup_expired_keys,
    generate_key,
    get_key,
    get_key_manager,
    list_keys,
    revoke_key,
    rotate_key,
)
from .security_config import (
    APISecurityConfig,
    AuditLoggingConfig,
    DatabaseSecurityConfig,
    EncryptionAlgorithm,
    EncryptionConfig,
    HashAlgorithm,
    SecurityConfig,
    SecurityHeadersConfig,
    SecurityLevel,
    SessionSecurityConfig,
    get_api_security_config,
    get_audit_logging_config,
    get_database_security_config,
    get_encryption_config,
    get_security_config,
    get_security_headers_config,
    get_session_security_config,
)
from .security_headers import add_security_headers_middleware
from .security_middleware import SecurityMiddleware, setup_security_middleware
from .session_encryption import (
    SessionData,
    SessionEncryptionError,
    SessionEncryptionManager,
    cleanup_expired_sessions,
    create_encrypted_session,
    delete_encrypted_session,
    get_encrypted_session,
    get_session_encryption_manager,
    revoke_user_sessions,
    update_encrypted_session,
)

__all__ = [
    # Key Management
    "KeyManager",
    "KeyType",
    "KeyStatus",
    "KeyMetadata",
    "get_key_manager",
    "get_key",
    "generate_key",
    "rotate_key",
    "revoke_key",
    "list_keys",
    "cleanup_expired_keys",
    # Encryption Utilities
    "EncryptionUtils",
    "EncryptionError",
    "DecryptionError",
    "encrypt_data",
    "decrypt_data",
    "hash_string",
    "generate_password_hash",
    "verify_password_hash",
    # Security Configuration
    "SecurityConfig",
    "SecurityLevel",
    "EncryptionAlgorithm",
    "HashAlgorithm",
    "DatabaseSecurityConfig",
    "SessionSecurityConfig",
    "APISecurityConfig",
    "EncryptionConfig",
    "AuditLoggingConfig",
    "SecurityHeadersConfig",
    "get_security_config",
    "get_database_security_config",
    "get_session_security_config",
    "get_api_security_config",
    "get_encryption_config",
    "get_audit_logging_config",
    "get_security_headers_config",
    # Audit Logging
    "SecurityAuditLogger",
    "SecurityEvent",
    "SecurityEventType",
    "SecurityEventSeverity",
    "get_security_audit_logger",
    "log_security_event",
    "log_authentication_event",
    "log_authorization_event",
    "log_data_access_event",
    "log_security_violation",
    "log_system_event",
    # Database and Session Security
    "DatabaseEncryptionManager",
    "DatabaseEncryptionError",
    "get_database_encryption_manager",
    "encrypt_database_field",
    "decrypt_database_field",
    "SessionEncryptionManager",
    "SessionData",
    "SessionEncryptionError",
    "get_session_encryption_manager",
    "create_encrypted_session",
    "get_encrypted_session",
    "update_encrypted_session",
    "delete_encrypted_session",
    "revoke_user_sessions",
    "cleanup_expired_sessions",
    "APIKeyManager",
    "APIKeyMetadata",
    "APIKeyStatus",
    "APIKeyScope",
    "get_api_key_manager",
    "create_api_key",
    "validate_api_key",
    "check_api_key_rate_limit",
    "revoke_api_key",
    "rotate_api_key",
    "list_api_keys",
    # Legacy Components
    "add_security_headers_middleware",
    "validate_input_security",
    "SecurityMiddleware",
    "setup_security_middleware",
    "JWTSecretManager",
    "get_jwt_secret_manager",
]
