"""🔐 Key Storage Database Models

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
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
    Text,
    create_engine,
    inspect,
    text,
)
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger(__name__)

# Detect reload mode to prevent repeated table creation during development
IS_RELOAD_MODE = os.environ.get("UVICORN_RELOAD_PROCESS") == "1"

# Key storage database configuration
KEY_STORAGE_DATABASE_URL = os.getenv("KEY_STORAGE_DATABASE_URL")
if not KEY_STORAGE_DATABASE_URL:
    raise ValueError(
        "KEY_STORAGE_DATABASE_URL environment variable is required. "
        "Please set it in your .env file with the proper database connection string."
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
        nullable=False,
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
    operation = Column(
        String(100),
        nullable=False,
    )  # 'read', 'write', 'rotate', 'revoke'
    user_id = Column(String(255), nullable=True)  # Optional user context
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    user_agent = Column(Text, nullable=True)
    success = Column(Boolean, nullable=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False,
    )

    def __repr__(self):
        return f"<KeyAccessLog(key_id='{self.key_id}', operation='{self.operation}', success={self.success})>"


def create_key_storage_tables():
    """Create the key storage tables if they don't exist with auto-fix for permission issues."""
    try:
        # Check if tables already exist to avoid unnecessary creation attempts
        inspector = inspect(key_engine)
        existing_tables = inspector.get_table_names()

        if 'key_storage' in existing_tables:
            logger.debug("Key storage tables already exist, skipping creation")
            return

        KeyBase.metadata.create_all(bind=key_engine)
        logger.info("Key storage tables created successfully")
    except Exception as e:
        error_msg = str(e).lower()
        if "permission denied" in error_msg and "schema public" in error_msg:
            logger.warning(f"Permission denied for schema public: {e}")
            logger.info("Attempting to auto-fix database permissions...")
            try:
                _auto_fix_database_permissions()
                # Retry table creation after fixing permissions
                KeyBase.metadata.create_all(bind=key_engine)
                logger.info(
                    "Key storage tables created successfully after auto-fixing permissions"
                )
            except Exception as fix_error:
                logger.error(f"Auto-fix failed: {fix_error}")
                logger.error(f"Original error: {e}")
                raise
        else:
            logger.error(f"Failed to create key storage tables: {e}")
            raise


def _auto_fix_database_permissions():
    """Automatically fix PostgreSQL permissions for the public schema."""
    try:
        # Get database connection details from URL
        from urllib.parse import urlparse

        parsed_url = urlparse(KEY_STORAGE_DATABASE_URL)

        # Connect as postgres superuser to fix permissions
        # Use environment variables for admin credentials
        admin_user = os.getenv("POSTGRES_ADMIN_USER", "postgres")
        admin_password = os.getenv("POSTGRES_ADMIN_PASSWORD")
        if not admin_password:
            raise ValueError(
                "POSTGRES_ADMIN_PASSWORD environment variable is required for auto-fixing permissions. "
                "Please set it in your .env file."
            )
        admin_url = f"postgresql://{admin_user}:{admin_password}@{parsed_url.hostname}:{parsed_url.port or 5432}/postgres"
        admin_engine = create_engine(admin_url, echo=False)

        with admin_engine.connect() as conn:
            # Grant permissions to the current user
            current_user = parsed_url.username or "postgres"
            database_name = parsed_url.path[1:] if parsed_url.path else "reynard_ecs"

            permission_queries = [
                f"GRANT ALL ON SCHEMA public TO {current_user};",
                f"GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO {current_user};",
                f"GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO {current_user};",
                f"GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO {current_user};",
                f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO {current_user};",
                f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO {current_user};",
                f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO {current_user};",
            ]

            for query in permission_queries:
                try:
                    conn.execute(text(query))
                except Exception as query_error:
                    logger.warning(
                        f"Permission query failed (may already be granted): {query_error}"
                    )

            logger.info(
                f"Auto-fixed database permissions for user {current_user} on database {database_name}"
            )

    except Exception as e:
        logger.error(f"Failed to auto-fix database permissions: {e}")
        raise


def get_key_storage_session():
    """Get a database session for key storage operations."""
    return KeySessionLocal()


# Initialize tables on import (skip during reload to prevent repeated attempts)
if not IS_RELOAD_MODE:
    try:
        create_key_storage_tables()
    except Exception as e:
        logger.warning(f"Could not initialize key storage tables: {e}")
else:
    logger.debug("Skipping key storage table creation during uvicorn reload")
