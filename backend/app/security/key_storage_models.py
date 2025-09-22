"""
🔐 Key Storage Database Models

Database models for secure key storage using PostgreSQL and Redis.
This module provides the database schema for storing cryptographic keys
and their metadata in a secure, scalable manner.

Key Features:
- Encrypted key storage in PostgreSQL
- Key metadata with lifecycle management
- Redis caching for performance
- Secure key rotation and expiration
- Audit logging for key access

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
    Text,
    create_engine,
    text,
)
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger(__name__)

# Key storage database configuration
KEY_STORAGE_DATABASE_URL = os.getenv(
    "KEY_STORAGE_DATABASE_URL", 
    "postgresql://postgres:password@localhost:5432/reynard_ecs"  # Use existing ECS database
)

# SQLAlchemy setup for key storage
key_engine = create_engine(KEY_STORAGE_DATABASE_URL, echo=False)
KeySessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=key_engine)
KeyBase = declarative_base()


class KeyStorage(KeyBase):
    """Database model for storing encrypted cryptographic keys."""
    
    __tablename__ = "key_storage"
    
    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    key_id = Column(String(255), unique=True, nullable=False, index=True)
    key_type = Column(String(100), nullable=False, index=True)
    encrypted_key_data = Column(Text, nullable=True)  # Base64 encoded encrypted key
    status = Column(String(50), nullable=False, default="active", index=True)
    created_at = Column(
        DateTime(timezone=True), 
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False
    )
    expires_at = Column(DateTime(timezone=True), nullable=True)
    last_used = Column(DateTime(timezone=True), nullable=True)
    usage_count = Column(Integer, default=0)
    rotation_schedule_days = Column(Integer, default=90)
    key_metadata = Column(Text, nullable=True)  # JSON metadata
    is_active = Column(Boolean, default=True, index=True)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )

    def __repr__(self):
        return f"<KeyStorage(key_id='{self.key_id}', key_type='{self.key_type}', status='{self.status}')>"


class KeyAccessLog(KeyBase):
    """Database model for logging key access for audit purposes."""
    
    __tablename__ = "key_access_logs"
    
    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    key_id = Column(String(255), nullable=False, index=True)
    operation = Column(String(100), nullable=False)  # 'read', 'write', 'rotate', 'revoke'
    user_id = Column(String(255), nullable=True)  # Optional user context
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    user_agent = Column(Text, nullable=True)
    success = Column(Boolean, nullable=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True), 
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False
    )

    def __repr__(self):
        return f"<KeyAccessLog(key_id='{self.key_id}', operation='{self.operation}', success={self.success})>"


def create_key_storage_tables():
    """Create the key storage tables if they don't exist."""
    try:
        KeyBase.metadata.create_all(bind=key_engine)
        logger.info("Key storage tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create key storage tables: {e}")
        raise


def get_key_storage_session():
    """Get a database session for key storage operations."""
    return KeySessionLocal()


# Initialize tables on import
try:
    create_key_storage_tables()
except Exception as e:
    logger.warning(f"Could not initialize key storage tables: {e}")
