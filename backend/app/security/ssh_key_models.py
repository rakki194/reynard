"""🔐 SSH Key Database Models for Reynard Auth Database

Database models for secure SSH key storage using PostgreSQL.
This module provides the database schema for storing SSH keys
and their metadata in the auth database alongside user data.

Key Features:
- Encrypted SSH key storage in PostgreSQL
- Key metadata with lifecycle management
- User association and permissions
- Audit logging for key access
- Admin controls for key management
- Support for multiple key types (RSA, Ed25519, ECDSA)

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

import logging
import os
from datetime import datetime, timezone
from enum import Enum
from typing import Any
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
)
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import (
    Integer,
    String,
    Text,
    create_engine,
    text,
)
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger(__name__)

# Auth database configuration
AUTH_DATABASE_URL = os.getenv(
    "AUTH_DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/reynard_auth",
)

# Import the shared AuthBase from PGP key models
from .pgp_key_models import AuthBase, AuthSessionLocal, auth_engine


class SSHKeyStatus(str, Enum):
    """SSH key status enumeration."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    REVOKED = "revoked"
    EXPIRED = "expired"
    PENDING = "pending"


class SSHKeyType(str, Enum):
    """SSH key type enumeration."""

    RSA = "rsa"
    ED25519 = "ed25519"
    ECDSA = "ecdsa"
    DSA = "dsa"  # Deprecated but still supported


class SSHKeyUsage(str, Enum):
    """SSH key usage enumeration."""

    AUTHENTICATION = "authentication"
    SIGNING = "signing"
    ENCRYPTION = "encryption"
    MULTIPURPOSE = "multipurpose"


class SSHKey(AuthBase):
    """Database model for storing SSH keys in the auth database."""

    __tablename__ = "ssh_keys"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)

    # Key identification
    key_id = Column(String(255), unique=True, nullable=False, index=True)
    fingerprint = Column(String(255), unique=True, nullable=False, index=True)
    public_key_hash = Column(String(64), nullable=False, index=True)  # SHA-256 hash

    # Key details
    key_type = Column(SQLEnum(SSHKeyType), nullable=False)
    key_length = Column(Integer, nullable=False)
    algorithm = Column(String(50), nullable=False)
    comment = Column(String(255), nullable=True)  # SSH key comment

    # User association (references Gatekeeper user)
    user_id = Column(String(255), nullable=False, index=True)  # Gatekeeper user ID
    email = Column(String(255), nullable=False, index=True)
    name = Column(String(255), nullable=False)

    # Key data (encrypted)
    public_key_openssh = Column(Text, nullable=False)  # OpenSSH format public key
    private_key_openssh = Column(Text, nullable=True)  # Encrypted private key
    passphrase_hash = Column(String(255), nullable=True)  # Hash of passphrase

    # Key metadata
    status = Column(SQLEnum(SSHKeyStatus), nullable=False, default=SSHKeyStatus.ACTIVE)
    usage = Column(
        SQLEnum(SSHKeyUsage), nullable=False, default=SSHKeyUsage.AUTHENTICATION
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False,
    )
    expires_at = Column(DateTime(timezone=True), nullable=True)
    last_used = Column(DateTime(timezone=True), nullable=True)
    usage_count = Column(Integer, default=0)

    # Admin controls
    is_primary = Column(Boolean, default=False, index=True)  # Primary key for user
    auto_rotate = Column(Boolean, default=False)  # Auto-rotation enabled
    rotation_schedule_days = Column(Integer, default=365)  # Rotation schedule

    # Security metadata
    trust_level = Column(Integer, default=0)  # 0-5 trust level
    is_revoked = Column(Boolean, default=False, index=True)
    revocation_reason = Column(Text, nullable=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    revoked_by = Column(String(255), nullable=True)  # Admin who revoked

    # SSH-specific metadata
    allowed_hosts = Column(Text, nullable=True)  # JSON list of allowed hosts
    allowed_commands = Column(Text, nullable=True)  # JSON list of allowed commands
    source_restrictions = Column(
        Text, nullable=True
    )  # JSON list of source IP restrictions
    force_command = Column(String(255), nullable=True)  # Forced command execution

    # Additional metadata
    key_metadata = Column(Text, nullable=True)  # JSON metadata
    notes = Column(Text, nullable=True)  # Admin notes

    # Timestamps
    updated_at = Column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )

    def __repr__(self):
        return f"<SSHKey(key_id='{self.key_id}', user_id='{self.user_id}', status='{self.status}')>"

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary representation (excluding sensitive data)."""
        return {
            "id": str(self.id),
            "key_id": self.key_id,
            "fingerprint": self.fingerprint,
            "public_key_hash": self.public_key_hash,
            "key_type": self.key_type.value,
            "key_length": self.key_length,
            "algorithm": self.algorithm,
            "comment": self.comment,
            "user_id": self.user_id,
            "email": self.email,
            "name": self.name,
            "status": self.status.value,
            "usage": self.usage.value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "last_used": self.last_used.isoformat() if self.last_used else None,
            "usage_count": self.usage_count,
            "is_primary": self.is_primary,
            "auto_rotate": self.auto_rotate,
            "rotation_schedule_days": self.rotation_schedule_days,
            "trust_level": self.trust_level,
            "is_revoked": self.is_revoked,
            "revocation_reason": self.revocation_reason,
            "revoked_at": self.revoked_at.isoformat() if self.revoked_at else None,
            "revoked_by": self.revoked_by,
            "allowed_hosts": self.allowed_hosts,
            "allowed_commands": self.allowed_commands,
            "source_restrictions": self.source_restrictions,
            "force_command": self.force_command,
            "notes": self.notes,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class SSHKeyAccessLog(AuthBase):
    """Database model for logging SSH key access for audit purposes."""

    __tablename__ = "ssh_key_access_logs"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    key_id = Column(String(255), nullable=False, index=True)
    user_id = Column(String(255), nullable=False, index=True)

    # Operation details
    operation = Column(
        String(100), nullable=False, index=True
    )  # 'generate', 'regenerate', 'revoke', 'export', 'import', 'use', 'authenticate'
    success = Column(Boolean, nullable=False, index=True)
    error_message = Column(Text, nullable=True)

    # Request context
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    user_agent = Column(Text, nullable=True)
    request_id = Column(String(255), nullable=True)  # For tracing

    # SSH-specific context
    target_host = Column(String(255), nullable=True)  # Target host for authentication
    target_user = Column(String(255), nullable=True)  # Target user for authentication
    command_executed = Column(Text, nullable=True)  # Command executed via SSH

    # Additional context
    admin_action = Column(Boolean, default=False)  # Was this an admin action?
    admin_user_id = Column(String(255), nullable=True)  # Admin who performed action
    target_user_id = Column(String(255), nullable=True)  # User whose key was affected

    # Timestamp
    created_at = Column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False,
    )

    def __repr__(self):
        return f"<SSHKeyAccessLog(key_id='{self.key_id}', operation='{self.operation}', success={self.success})>"


class SSHKeyRotationLog(AuthBase):
    """Database model for logging SSH key rotation events."""

    __tablename__ = "ssh_key_rotation_logs"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)

    # Key references
    old_key_id = Column(String(255), nullable=True, index=True)  # Previous key
    new_key_id = Column(String(255), nullable=False, index=True)  # New key
    user_id = Column(String(255), nullable=False, index=True)

    # Rotation details
    rotation_type = Column(
        String(50), nullable=False
    )  # 'manual', 'automatic', 'scheduled', 'emergency'
    reason = Column(Text, nullable=True)  # Reason for rotation
    initiated_by = Column(String(255), nullable=False)  # User or system who initiated

    # Rotation metadata
    old_key_expired = Column(Boolean, default=False)
    old_key_revoked = Column(Boolean, default=False)
    migration_completed = Column(Boolean, default=False)

    # SSH-specific rotation metadata
    authorized_keys_updated = Column(
        Boolean, default=False
    )  # Was authorized_keys updated?
    target_hosts = Column(Text, nullable=True)  # JSON list of target hosts

    # Timestamps
    started_at = Column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False,
    )
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Additional metadata
    rotation_metadata = Column(Text, nullable=True)  # JSON metadata

    def __repr__(self):
        return f"<SSHKeyRotationLog(old_key_id='{self.old_key_id}', new_key_id='{self.new_key_id}')>"


def create_ssh_key_tables():
    """Create the SSH key tables if they don't exist."""
    try:
        AuthBase.metadata.create_all(bind=auth_engine)
        logger.info("SSH key tables created successfully in auth database")
    except Exception as e:
        logger.error(f"Failed to create SSH key tables: {e}")
        raise


# Initialize tables on import
try:
    create_ssh_key_tables()
except Exception as e:
    logger.warning(f"Could not initialize SSH key tables: {e}")
