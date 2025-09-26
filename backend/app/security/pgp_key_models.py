"""🔐 PGP Key Database Models for Reynard Auth Database

Database models for secure PGP key storage using PostgreSQL.
This module provides the database schema for storing PGP keys
and their metadata in the auth database alongside user data.

Key Features:
- Encrypted PGP key storage in PostgreSQL
- Key metadata with lifecycle management
- User association and permissions
- Audit logging for key access
- Admin controls for key management

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
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
    text,
)
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

logger = logging.getLogger(__name__)

# Auth database configuration
AUTH_DATABASE_URL = os.getenv(
    "AUTH_DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/reynard_auth",
)

# SQLAlchemy setup for auth database
auth_engine = create_engine(AUTH_DATABASE_URL, echo=False)
AuthSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=auth_engine)
AuthBase = declarative_base()


class PGPKeyStatus(str, Enum):
    """PGP key status enumeration."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    REVOKED = "revoked"
    EXPIRED = "expired"
    PENDING = "pending"


class PGPKeyType(str, Enum):
    """PGP key type enumeration."""

    RSA = "rsa"
    DSA = "dsa"
    ELGAMAL = "elgamal"
    ECDSA = "ecdsa"
    EDDSA = "eddsa"


class PGPKey(AuthBase):
    """Database model for storing PGP keys in the auth database."""

    __tablename__ = "pgp_keys"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)

    # Key identification
    key_id = Column(String(16), unique=True, nullable=False, index=True)
    fingerprint = Column(String(40), unique=True, nullable=False, index=True)
    short_fingerprint = Column(String(8), nullable=False, index=True)

    # Key details
    key_type = Column(SQLEnum(PGPKeyType), nullable=False)
    key_length = Column(Integer, nullable=False)
    algorithm = Column(String(50), nullable=False)

    # User association (references Gatekeeper user)
    user_id = Column(String(255), nullable=False, index=True)  # Gatekeeper user ID
    email = Column(String(255), nullable=False, index=True)
    name = Column(String(255), nullable=False)

    # Key data (encrypted)
    public_key_armored = Column(Text, nullable=False)
    private_key_armored = Column(Text, nullable=True)  # Encrypted private key
    passphrase_hash = Column(String(255), nullable=True)  # Hash of passphrase

    # Key metadata
    status = Column(SQLEnum(PGPKeyStatus), nullable=False, default=PGPKeyStatus.ACTIVE)
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
        return f"<PGPKey(key_id='{self.key_id}', user_id='{self.user_id}', status='{self.status}')>"

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary representation (excluding sensitive data)."""
        return {
            "id": str(self.id),
            "key_id": self.key_id,
            "fingerprint": self.fingerprint,
            "short_fingerprint": self.short_fingerprint,
            "key_type": self.key_type.value,
            "key_length": self.key_length,
            "algorithm": self.algorithm,
            "user_id": self.user_id,
            "email": self.email,
            "name": self.name,
            "status": self.status.value,
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
            "notes": self.notes,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class PGPKeyAccessLog(AuthBase):
    """Database model for logging PGP key access for audit purposes."""

    __tablename__ = "pgp_key_access_logs"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    key_id = Column(String(16), nullable=False, index=True)
    user_id = Column(String(255), nullable=False, index=True)

    # Operation details
    operation = Column(
        String(100), nullable=False, index=True
    )  # 'generate', 'regenerate', 'revoke', 'export', 'import', 'use'
    success = Column(Boolean, nullable=False, index=True)
    error_message = Column(Text, nullable=True)

    # Request context
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    user_agent = Column(Text, nullable=True)
    request_id = Column(String(255), nullable=True)  # For tracing

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
        return f"<PGPKeyAccessLog(key_id='{self.key_id}', operation='{self.operation}', success={self.success})>"


class PGPKeyRotationLog(AuthBase):
    """Database model for logging PGP key rotation events."""

    __tablename__ = "pgp_key_rotation_logs"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)

    # Key references
    old_key_id = Column(String(16), nullable=True, index=True)  # Previous key
    new_key_id = Column(String(16), nullable=False, index=True)  # New key
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
        return f"<PGPKeyRotationLog(old_key_id='{self.old_key_id}', new_key_id='{self.new_key_id}')>"


def create_pgp_key_tables():
    """Create the PGP key tables if they don't exist."""
    try:
        AuthBase.metadata.create_all(bind=auth_engine)
        logger.info("PGP key tables created successfully in auth database")
    except Exception as e:
        logger.error(f"Failed to create PGP key tables: {e}")
        raise


def get_auth_database_session():
    """Get a database session for auth database operations."""
    return AuthSessionLocal()


# Initialize tables on import
try:
    create_pgp_key_tables()
except Exception as e:
    logger.warning(f"Could not initialize PGP key tables: {e}")
