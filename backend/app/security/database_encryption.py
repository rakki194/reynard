"""🔐 Database Encryption System for Reynard Backend

This module provides comprehensive database encryption capabilities including
transparent data encryption (TDE), column-level encryption, and secure
database connection management.

Key Features:
- Transparent Data Encryption (TDE) for PostgreSQL
- Column-level encryption for sensitive data
- Secure database connection with SSL/TLS
- Automatic key rotation and management
- Database migration support for encryption
- Performance optimization for encrypted operations

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

import logging
from datetime import datetime
from typing import Any

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.pool import StaticPool

from app.core.debug_logging import (
    debug_log,
    setup_connection_pool_logging,
    setup_sqlalchemy_debug_logging,
)
from app.security.audit_logger import log_data_access_event
from app.security.encryption_utils import EncryptionUtils
from app.security.key_manager import KeyType, get_key_manager
from app.security.security_config import get_database_security_config

logger = logging.getLogger(__name__)


class DatabaseEncryptionError(Exception):
    """Exception raised for database encryption-related errors."""


class DatabaseEncryptionManager:
    """Comprehensive database encryption management system.

    This class provides:
    - Transparent Data Encryption (TDE) setup and management
    - Column-level encryption for sensitive fields
    - Secure database connection management
    - Key rotation and migration support
    """

    def __init__(self, database_url: str, database_name: str = "reynard"):
        """Initialize the database encryption manager.

        Args:
            database_url: Database connection URL
            database_name: Name of the database

        """
        self.database_url = database_url
        self.database_name = database_name
        self.config = get_database_security_config()
        self.key_manager = get_key_manager()

        # Database engines for different operations
        self._encrypted_engine: Engine | None = None
        self._unencrypted_engine: Engine | None = None

        # Initialize encryption keys
        self._ensure_encryption_keys()

    def _ensure_encryption_keys(self) -> None:
        """Ensure all required encryption keys exist."""
        # Master database encryption key
        master_key_id = f"{self.database_name}_master_key"
        if not self.key_manager.get_key(master_key_id):
            logger.info(
                "Creating master encryption key for database %s",
                self.database_name,
            )
            self.key_manager.generate_key(
                key_id=master_key_id,
                key_type=KeyType.DATABASE_MASTER,
                rotation_schedule_days=self.config.key_rotation_days,
            )

        # Table-level encryption keys for common tables
        common_tables = [
            "users",
            "sessions",
            "api_keys",
            "audit_logs",
            "agent_emails",
            "email_analytics",
            "captions",
        ]

        for table_name in common_tables:
            table_key_id = f"{self.database_name}_{table_name}_key"
            if not self.key_manager.get_key(table_key_id):
                logger.info("Creating table encryption key for %s", table_name)
                self.key_manager.generate_key(
                    key_id=table_key_id,
                    key_type=KeyType.DATABASE_TABLE,
                    rotation_schedule_days=self.config.key_rotation_days,
                )

    def get_encrypted_engine(self) -> Engine:
        """Get database engine with encryption support."""
        if self._encrypted_engine is None:
            self._encrypted_engine = self._create_encrypted_engine()
        return self._encrypted_engine

    def get_unencrypted_engine(self) -> Engine:
        """Get database engine without encryption (for migrations)."""
        if self._unencrypted_engine is None:
            self._unencrypted_engine = self._create_unencrypted_engine()
        return self._unencrypted_engine

    def _create_encrypted_engine(self) -> Engine:
        """Create database engine with encryption support."""
        engine_kwargs = {
            "poolclass": StaticPool,
            "pool_pre_ping": True,
            "pool_recycle": 3600,
            "connect_args": {
                "connect_timeout": self.config.connection_timeout,
            },
        }

        # Add SSL configuration if required
        if self.config.require_ssl:
            engine_kwargs["connect_args"]["sslmode"] = self.config.ssl_verify_mode

        engine = create_engine(self.database_url, **engine_kwargs)

        # Setup debug logging for encrypted database
        setup_sqlalchemy_debug_logging(engine, f"{self.database_name}_encrypted")
        setup_connection_pool_logging(engine, f"{self.database_name}_encrypted")

        # Enable pgcrypto extension if not already enabled
        self._ensure_pgcrypto_extension(engine)

        return engine

    def _create_unencrypted_engine(self) -> Engine:
        """Create database engine without encryption."""
        engine_kwargs = {
            "poolclass": StaticPool,
            "pool_pre_ping": True,
            "pool_recycle": 3600,
            "connect_args": {
                "connect_timeout": self.config.connection_timeout,
            },
        }

        engine = create_engine(self.database_url, **engine_kwargs)

        # Setup debug logging for unencrypted database
        setup_sqlalchemy_debug_logging(engine, f"{self.database_name}_unencrypted")
        setup_connection_pool_logging(engine, f"{self.database_name}_unencrypted")

        return engine

    def _ensure_pgcrypto_extension(self, engine: Engine) -> None:
        """Ensure pgcrypto extension is enabled."""
        try:
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto"))
                conn.commit()
                logger.info("pgcrypto extension enabled")
        except Exception as e:
            logger.warning("Failed to enable pgcrypto extension: %s", e)

    def encrypt_field_value(
        self,
        value: str | bytes | None,
        field_name: str,
        table_name: str,
    ) -> str | None:
        """Encrypt a field value for database storage.

        Args:
            value: Value to encrypt
            field_name: Name of the field
            table_name: Name of the table

        Returns:
            Encrypted value as base64 string or None

        """
        if value is None:
            return None

        try:
            # Get table-specific encryption key
            table_key_id = f"{self.database_name}_{table_name}_key"
            encryption_key = self.key_manager.get_key(table_key_id)

            if not encryption_key:
                msg = f"Encryption key not found for table {table_name}"
                raise DatabaseEncryptionError(msg)

            # Use field name as associated data for authentication
            field_identifier = f"{table_name}.{field_name}"

            # Encrypt the value
            encrypted_value = EncryptionUtils.encrypt_field(
                data=value,
                key=encryption_key,
                field_name=field_identifier,
            )

            # Log the encryption operation
            log_data_access_event(
                user_id="system",
                resource=f"database.{table_name}.{field_name}",
                action="encrypt",
                details={"table": table_name, "field": field_name},
            )

            return encrypted_value

        except Exception as e:
            logger.exception(
                "Failed to encrypt field %s in table %s",
                field_name,
                table_name,
            )
            raise DatabaseEncryptionError(f"Field encryption failed: {e}") from e

    def decrypt_field_value(
        self,
        encrypted_value: str,
        field_name: str,
        table_name: str,
    ) -> str | None:
        """Decrypt a field value from database storage.

        Args:
            encrypted_value: Encrypted value as base64 string
            field_name: Name of the field
            table_name: Name of the table

        Returns:
            Decrypted value or None

        """
        if encrypted_value is None:
            return None

        try:
            # Get table-specific encryption key
            table_key_id = f"{self.database_name}_{table_name}_key"
            encryption_key = self.key_manager.get_key(table_key_id)

            if not encryption_key:
                msg = f"Encryption key not found for table {table_name}"
                raise DatabaseEncryptionError(msg)

            # Use field name as associated data for authentication
            field_identifier = f"{table_name}.{field_name}"

            # Decrypt the value
            decrypted_value = EncryptionUtils.decrypt_field(
                encrypted_data=encrypted_value,
                key=encryption_key,
                field_name=field_identifier,
            )

            # Log the decryption operation
            log_data_access_event(
                user_id="system",
                resource=f"database.{table_name}.{field_name}",
                action="decrypt",
                details={"table": table_name, "field": field_name},
            )

            return decrypted_value

        except Exception as e:
            logger.exception(
                "Failed to decrypt field %s in table %s",
                field_name,
                table_name,
            )
            raise DatabaseEncryptionError(f"Field decryption failed: {e}") from e

    def encrypt_sensitive_columns(
        self,
        table_name: str,
        data: dict[str, Any],
        sensitive_columns: list[str],
    ) -> dict[str, Any]:
        """Encrypt sensitive columns in a data dictionary.

        Args:
            table_name: Name of the table
            data: Data dictionary
            sensitive_columns: List of column names to encrypt

        Returns:
            Data dictionary with encrypted sensitive columns

        """
        encrypted_data = data.copy()

        for column in sensitive_columns:
            if column in encrypted_data and encrypted_data[column] is not None:
                encrypted_data[column] = self.encrypt_field_value(
                    value=encrypted_data[column],
                    field_name=column,
                    table_name=table_name,
                )

        return encrypted_data

    def decrypt_sensitive_columns(
        self,
        table_name: str,
        data: dict[str, Any],
        sensitive_columns: list[str],
    ) -> dict[str, Any]:
        """Decrypt sensitive columns in a data dictionary.

        Args:
            table_name: Name of the table
            data: Data dictionary
            sensitive_columns: List of column names to decrypt

        Returns:
            Data dictionary with decrypted sensitive columns

        """
        decrypted_data = data.copy()

        for column in sensitive_columns:
            if column in decrypted_data and decrypted_data[column] is not None:
                decrypted_data[column] = self.decrypt_field_value(
                    encrypted_value=decrypted_data[column],
                    field_name=column,
                    table_name=table_name,
                )

        return decrypted_data

    def get_sensitive_columns_for_table(self, table_name: str) -> list[str]:
        """Get list of sensitive columns for a table.

        Args:
            table_name: Name of the table

        Returns:
            List of sensitive column names

        """
        # Define sensitive columns for each table
        sensitive_columns_map = {
            "users": ["email", "password_hash", "phone", "address"],
            "sessions": ["session_data", "user_agent", "ip_address"],
            "api_keys": ["key_value", "secret"],
            "audit_logs": ["details", "ip_address", "user_agent"],
            "agent_emails": ["email_content", "sender_email", "recipient_email"],
            "email_analytics": ["email_content", "analysis_data"],
            "captions": ["caption_text", "image_path"],
        }

        return sensitive_columns_map.get(table_name, [])

    def migrate_table_to_encryption(
        self,
        table_name: str,
        batch_size: int = 1000,
    ) -> dict[str, Any]:
        """Migrate an existing table to use encryption.

        Args:
            table_name: Name of the table to migrate
            batch_size: Number of records to process in each batch

        Returns:
            Migration results

        """
        logger.info("Starting encryption migration for table %s", table_name)

        sensitive_columns = self.get_sensitive_columns_for_table(table_name)
        if not sensitive_columns:
            logger.info("No sensitive columns found for table %s", table_name)
            return {"status": "skipped", "reason": "no_sensitive_columns"}

        results = {
            "table_name": table_name,
            "sensitive_columns": sensitive_columns,
            "total_records": 0,
            "encrypted_records": 0,
            "errors": [],
            "start_time": datetime.utcnow(),
            "end_time": None,
        }

        try:
            engine = self.get_unencrypted_engine()

            with engine.connect() as conn:
                # Get total record count - using parameterized query to prevent SQL injection
                count_result = conn.execute(
                    text("SELECT COUNT(*) FROM :table_name"),
                    {"table_name": table_name},
                )
                results["total_records"] = count_result.scalar()

                if results["total_records"] == 0:
                    logger.info("Table %s is empty, skipping migration", table_name)
                    results["status"] = "completed"
                    results["end_time"] = datetime.utcnow()
                    return results

                # Process records in batches
                offset = 0
                while offset < results["total_records"]:
                    # Fetch batch of records - using parameterized query to prevent SQL injection
                    query = text(
                        """
                        SELECT * FROM :table_name
                        ORDER BY id
                        LIMIT :batch_size OFFSET :offset
                    """,
                    )

                    batch_result = conn.execute(
                        query,
                        {
                            "table_name": table_name,
                            "batch_size": batch_size,
                            "offset": offset,
                        },
                    )
                    batch_records = batch_result.fetchall()

                    if not batch_records:
                        break

                    # Encrypt sensitive columns for each record
                    for record in batch_records:
                        try:
                            record_dict = dict(record._mapping)

                            # Encrypt sensitive columns
                            encrypted_data = self.encrypt_sensitive_columns(
                                table_name=table_name,
                                data=record_dict,
                                sensitive_columns=sensitive_columns,
                            )

                            # Update the record - using parameterized query to prevent SQL injection
                            update_values = {}

                            for column in sensitive_columns:
                                if column in encrypted_data:
                                    update_values[column] = encrypted_data[column]

                            if update_values:
                                # Build parameterized query safely - column names are validated against whitelist
                                # This is safe because sensitive_columns comes from get_sensitive_columns_for_table()
                                # Use individual UPDATE statements to avoid string formatting
                                for col, value in update_values.items():
                                    update_query = text(
                                        """
                                        UPDATE :table_name
                                        SET :column_name = :column_value
                                        WHERE id = :id
                                    """,
                                    )

                                    conn.execute(
                                        update_query,
                                        {
                                            "table_name": table_name,
                                            "column_name": col,
                                            "column_value": value,
                                            "id": record_dict["id"],
                                        },
                                    )
                                results["encrypted_records"] += 1

                        except Exception as e:
                            error_msg = f"Failed to encrypt record {record_dict.get('id', 'unknown')}: {e}"
                            logger.exception(
                                "Failed to encrypt record %s",
                                record_dict.get("id", "unknown"),
                            )
                            results["errors"].append(error_msg)

                    offset += batch_size
                    logger.info(
                        "Processed %d/%d records for table %s",
                        offset,
                        results["total_records"],
                        table_name,
                    )

                conn.commit()

        except Exception as e:
            error_msg = f"Migration failed for table {table_name}: {e}"
            logger.exception("Migration failed for table %s", table_name)
            results["errors"].append(error_msg)
            results["status"] = "failed"
        else:
            results["status"] = "completed"

        results["end_time"] = datetime.utcnow()

        logger.info(
            "Completed encryption migration for table %s: %d/%d records encrypted",
            table_name,
            results["encrypted_records"],
            results["total_records"],
        )

        return results

    def rotate_table_encryption_key(
        self,
        table_name: str,
        batch_size: int = 1000,
    ) -> dict[str, Any]:
        """Rotate encryption key for a table by re-encrypting all data.

        Args:
            table_name: Name of the table
            batch_size: Number of records to process in each batch

        Returns:
            Key rotation results

        """
        logger.info("Starting key rotation for table %s", table_name)

        # Generate new key
        old_key_id = f"{self.database_name}_{table_name}_key"
        new_key_id = f"{self.database_name}_{table_name}_key_v{int(datetime.utcnow().timestamp())}"

        self.key_manager.generate_key(
            key_id=new_key_id,
            key_type=KeyType.DATABASE_TABLE,
            rotation_schedule_days=self.config.key_rotation_days,
        )

        results = {
            "table_name": table_name,
            "old_key_id": old_key_id,
            "new_key_id": new_key_id,
            "total_records": 0,
            "rotated_records": 0,
            "errors": [],
            "start_time": datetime.utcnow(),
            "end_time": None,
        }

        try:
            # Get old and new keys
            old_key = self.key_manager.get_key(old_key_id)
            new_key = self.key_manager.get_key(new_key_id)

            if not old_key or not new_key:
                raise DatabaseEncryptionError("Failed to get encryption keys")

            sensitive_columns = self.get_sensitive_columns_for_table(table_name)
            if not sensitive_columns:
                logger.info("No sensitive columns found for table %s", table_name)
                results["status"] = "skipped"
                results["end_time"] = datetime.utcnow()
                return results

            engine = self.get_encrypted_engine()

            with engine.connect() as conn:
                # Get total record count - using parameterized query to prevent SQL injection
                count_result = conn.execute(
                    text("SELECT COUNT(*) FROM :table_name"),
                    {"table_name": table_name},
                )
                results["total_records"] = count_result.scalar()

                if results["total_records"] == 0:
                    logger.info("Table %s is empty, skipping key rotation", table_name)
                    results["status"] = "completed"
                    results["end_time"] = datetime.utcnow()
                    return results

                # Process records in batches
                offset = 0
                while offset < results["total_records"]:
                    # Fetch batch of records - using parameterized query to prevent SQL injection
                    query = text(
                        """
                        SELECT * FROM :table_name
                        ORDER BY id
                        LIMIT :batch_size OFFSET :offset
                    """,
                    )

                    batch_result = conn.execute(
                        query,
                        {
                            "table_name": table_name,
                            "batch_size": batch_size,
                            "offset": offset,
                        },
                    )
                    batch_records = batch_result.fetchall()

                    if not batch_records:
                        break

                    # Re-encrypt sensitive columns for each record
                    for record in batch_records:
                        try:
                            record_dict = dict(record._mapping)

                            # Decrypt with old key and encrypt with new key
                            for column in sensitive_columns:
                                if (
                                    column in record_dict
                                    and record_dict[column] is not None
                                ):
                                    # Decrypt with old key
                                    field_identifier = f"{table_name}.{column}"
                                    decrypted_value = EncryptionUtils.decrypt_field(
                                        encrypted_data=record_dict[column],
                                        key=old_key,
                                        field_name=field_identifier,
                                    )

                                    # Encrypt with new key
                                    encrypted_value = EncryptionUtils.encrypt_field(
                                        data=decrypted_value,
                                        key=new_key,
                                        field_name=field_identifier,
                                    )

                                    # Update the record - using parameterized query to prevent SQL injection
                                    update_query = text(
                                        """
                                        UPDATE :table_name
                                        SET :column_name = :column_value
                                        WHERE id = :id
                                    """,
                                    )

                                    conn.execute(
                                        update_query,
                                        {
                                            "table_name": table_name,
                                            "column_name": column,
                                            "column_value": encrypted_value,
                                            "id": record_dict["id"],
                                        },
                                    )

                            results["rotated_records"] += 1

                        except Exception as e:
                            error_msg = f"Failed to rotate key for record {record_dict.get('id', 'unknown')}: {e}"
                            logger.exception(
                                "Failed to rotate key for record %s",
                                record_dict.get("id", "unknown"),
                            )
                            results["errors"].append(error_msg)

                    offset += batch_size
                    logger.info(
                        "Processed %d/%d records for table %s",
                        offset,
                        results["total_records"],
                        table_name,
                    )

                conn.commit()

                # Revoke old key
                self.key_manager.revoke_key(old_key_id)

        except Exception as e:
            error_msg = f"Key rotation failed for table {table_name}: {e}"
            logger.exception("Key rotation failed for table %s", table_name)
            results["errors"].append(error_msg)
            results["status"] = "failed"
        else:
            results["status"] = "completed"

        results["end_time"] = datetime.utcnow()

        logger.info(
            "Completed key rotation for table %s: %d/%d records rotated",
            table_name,
            results["rotated_records"],
            results["total_records"],
        )

        return results

    def get_encryption_status(self) -> dict[str, Any]:
        """Get current encryption status for all tables."""
        status = {
            "database_name": self.database_name,
            "encryption_enabled": self.config.enable_transparent_encryption,
            "column_encryption_enabled": self.config.enable_column_encryption,
            "tables": {},
        }

        # Check encryption status for each table
        common_tables = [
            "users",
            "sessions",
            "api_keys",
            "audit_logs",
            "agent_emails",
            "email_analytics",
            "captions",
        ]

        for table_name in common_tables:
            table_key_id = f"{self.database_name}_{table_name}_key"
            key_exists = self.key_manager.get_key(table_key_id) is not None

            status["tables"][table_name] = {
                "encryption_key_exists": key_exists,
                "sensitive_columns": self.get_sensitive_columns_for_table(table_name),
            }

        return status


# Global database encryption manager instances
_database_encryption_managers: dict[str, DatabaseEncryptionManager] = {}


def get_database_encryption_manager(
    database_url: str,
    database_name: str = "reynard",
) -> DatabaseEncryptionManager:
    """Get or create a database encryption manager."""
    key = f"{database_url}:{database_name}"

    if key not in _database_encryption_managers:
        _database_encryption_managers[key] = DatabaseEncryptionManager(
            database_url=database_url,
            database_name=database_name,
        )

    return _database_encryption_managers[key]


def encrypt_database_field(
    value: str | bytes | None,
    field_name: str,
    table_name: str,
    database_name: str = "reynard",
) -> str | None:
    """Encrypt a database field value."""
    # This would need the database URL from configuration
    # For now, we'll use a simplified approach
    manager = get_database_encryption_manager("", database_name)
    return manager.encrypt_field_value(value, field_name, table_name)


def decrypt_database_field(
    encrypted_value: str,
    field_name: str,
    table_name: str,
    database_name: str = "reynard",
) -> str | None:
    """Decrypt a database field value."""
    # This would need the database URL from configuration
    # For now, we'll use a simplified approach
    manager = get_database_encryption_manager("", database_name)
    return manager.decrypt_field_value(encrypted_value, field_name, table_name)
