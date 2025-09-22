"""
🔐 Comprehensive Key Management System for Reynard Backend

This module provides enterprise-grade key management with HSM simulation,
key rotation, and secure key storage. It serves as the foundation for all
encryption operations in the Reynard security infrastructure.

Key Features:
- Centralized key management with hierarchical organization
- Automatic key rotation with configurable schedules
- Secure key storage with encryption at rest
- Key derivation functions for different use cases
- Key backup and recovery procedures
- Key access logging and auditing
- HSM simulation for production-like security

Key Types Managed:
- Database encryption keys (master, table-level, column-level)
- JWT signing keys
- Session encryption keys
- API key encryption keys
- Audit log encryption keys

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

import base64
import json
import logging
import secrets
import time
from datetime import datetime, timedelta, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from .key_cache_service import get_key_cache_service
from .key_storage_models import KeyAccessLog, KeyStorage, get_key_storage_session

logger = logging.getLogger(__name__)


class KeyType(Enum):
    """Types of keys managed by the system."""

    # Database encryption keys
    DATABASE_MASTER = "database_master"
    DATABASE_TABLE = "database_table"
    DATABASE_COLUMN = "database_column"

    # Application keys
    JWT_SIGNING = "jwt_signing"
    SESSION_ENCRYPTION = "session_encryption"
    API_KEY_ENCRYPTION = "api_key_encryption"
    AUDIT_LOG_ENCRYPTION = "audit_log_encryption"

    # itsdangerous integration keys
    TOKEN_SIGNING = "token_signing"
    SESSION_SIGNING = "session_signing"

    # System keys
    SYSTEM_MASTER = "system_master"
    BACKUP_ENCRYPTION = "backup_encryption"


class KeyStatus(Enum):
    """Key lifecycle status."""

    ACTIVE = "active"
    ROTATING = "rotating"
    DEPRECATED = "deprecated"
    REVOKED = "revoked"
    EXPIRED = "expired"


class KeyMetadata:
    """Metadata for a managed key."""

    def __init__(
        self,
        key_id: str,
        key_type: KeyType,
        status: KeyStatus = KeyStatus.ACTIVE,
        created_at: Optional[datetime] = None,
        expires_at: Optional[datetime] = None,
        last_used: Optional[datetime] = None,
        usage_count: int = 0,
        rotation_schedule_days: int = 90,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        self.key_id = key_id
        self.key_type = key_type
        self.status = status
        self.created_at = created_at or datetime.now(UTC)
        self.expires_at = expires_at
        self.last_used = last_used
        self.usage_count = usage_count
        self.rotation_schedule_days = rotation_schedule_days
        self.metadata = metadata or {}

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "key_id": self.key_id,
            "key_type": self.key_type.value,
            "status": self.status.value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "last_used": self.last_used.isoformat() if self.last_used else None,
            "usage_count": self.usage_count,
            "rotation_schedule_days": self.rotation_schedule_days,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "KeyMetadata":
        """Create from dictionary."""
        return cls(
            key_id=data["key_id"],
            key_type=KeyType(data["key_type"]),
            status=KeyStatus(data["status"]),
            created_at=(
                datetime.fromisoformat(data["created_at"])
                if data.get("created_at")
                else None
            ),
            expires_at=(
                datetime.fromisoformat(data["expires_at"])
                if data.get("expires_at")
                else None
            ),
            last_used=(
                datetime.fromisoformat(data["last_used"])
                if data.get("last_used")
                else None
            ),
            usage_count=data.get("usage_count", 0),
            rotation_schedule_days=data.get("rotation_schedule_days", 90),
            metadata=data.get("metadata", {}),
        )


class KeyManager:
    """
    Central key management system with HSM simulation.

    This class provides comprehensive key management including:
    - Key generation with secure entropy
    - Key storage with encryption at rest
    - Key rotation with configurable schedules
    - Key access logging and auditing
    - Key backup and recovery
    """

    def __init__(
        self,
        master_password: Optional[str] = None,
        use_database: bool = True,
    ):
        """
        Initialize the key manager.

        Args:
            master_password: Master password for key encryption (default: from env)
            use_database: Whether to use database storage (default: True)
        """
        # Master password for key encryption
        self.master_password = master_password or self._get_master_password()

        # Storage configuration
        self.use_database = use_database

        # Key cache service for performance
        self.key_cache_service = get_key_cache_service()

        # Key metadata storage (in-memory cache)
        self._metadata: Dict[str, KeyMetadata] = {}

        # Load existing metadata from database
        if self.use_database:
            self._load_metadata_from_database()
        else:
            # Fallback to file-based storage for backward compatibility
            self._setup_file_storage()
            self._load_metadata_from_files()

        # Initialize system master key if needed
        self._ensure_system_master_key()

    def _get_master_password(self) -> str:
        """Get master password from environment or generate one."""
        import os

        master_password = os.getenv("REYNARD_MASTER_PASSWORD")
        if not master_password:
            # Generate a secure master password
            master_password = secrets.token_urlsafe(32)
            logger.warning(
                "No REYNARD_MASTER_PASSWORD found in environment. "
                "Generated temporary password. Set REYNARD_MASTER_PASSWORD for production."
            )
        return master_password

    def _setup_file_storage(self) -> None:
        """Setup file-based storage for backward compatibility."""
        backend_dir = Path(__file__).parent.parent.parent
        self.keys_directory = backend_dir / ".keys"
        self.keys_directory.mkdir(parents=True, exist_ok=True)
        self.keys_directory.chmod(0o700)
        self.metadata_file = self.keys_directory / "key_metadata.json"

    def _load_metadata_from_database(self) -> None:
        """Load key metadata from database."""
        try:
            with get_key_storage_session() as session:
                key_storage_records = (
                    session.query(KeyStorage).filter(KeyStorage.is_active == True).all()
                )

                for record in key_storage_records:
                    metadata = KeyMetadata(
                        key_id=record.key_id,
                        key_type=KeyType(record.key_type),
                        status=KeyStatus(record.status),
                        created_at=record.created_at,
                        expires_at=record.expires_at,
                        last_used=record.last_used,
                        usage_count=record.usage_count,
                        rotation_schedule_days=record.rotation_schedule_days,
                        metadata=(
                            json.loads(record.key_metadata)
                            if record.key_metadata
                            else {}
                        ),
                    )
                    self._metadata[record.key_id] = metadata

                logger.info(
                    f"Loaded metadata for {len(self._metadata)} keys from database"
                )
        except Exception as e:
            logger.error(f"Failed to load key metadata from database: {e}")
            self._metadata = {}

    def _load_metadata_from_files(self) -> None:
        """Load key metadata from files (backward compatibility)."""
        if self.metadata_file.exists():
            try:
                with open(self.metadata_file, "r") as f:
                    data = json.load(f)

                for key_id, metadata_dict in data.items():
                    self._metadata[key_id] = KeyMetadata.from_dict(metadata_dict)

                logger.info(
                    f"Loaded metadata for {len(self._metadata)} keys from files"
                )
            except Exception as e:
                logger.error(f"Failed to load key metadata from files: {e}")
                self._metadata = {}
        else:
            self._metadata = {}

    def _save_metadata_to_database(self, key_id: str, metadata: KeyMetadata) -> None:
        """Save key metadata to database."""
        try:
            with get_key_storage_session() as session:
                # Check if key exists
                existing_key = (
                    session.query(KeyStorage)
                    .filter(KeyStorage.key_id == key_id)
                    .first()
                )

                if existing_key:
                    # Update existing key
                    existing_key.status = metadata.status.value
                    existing_key.expires_at = metadata.expires_at
                    existing_key.last_used = metadata.last_used
                    existing_key.usage_count = metadata.usage_count
                    existing_key.rotation_schedule_days = (
                        metadata.rotation_schedule_days
                    )
                    existing_key.key_metadata = json.dumps(metadata.metadata)
                    existing_key.updated_at = datetime.now(timezone.utc)
                else:
                    # Create new key record
                    new_key = KeyStorage(
                        key_id=key_id,
                        key_type=metadata.key_type.value,
                        status=metadata.status.value,
                        created_at=metadata.created_at,
                        expires_at=metadata.expires_at,
                        last_used=metadata.last_used,
                        usage_count=metadata.usage_count,
                        rotation_schedule_days=metadata.rotation_schedule_days,
                        key_metadata=json.dumps(metadata.metadata),
                        is_active=True,
                    )
                    session.add(new_key)

                session.commit()
                logger.debug(f"Saved metadata for key {key_id} to database")

        except Exception as e:
            logger.error(f"Failed to save key metadata to database: {e}")

    def _save_metadata_to_files(self) -> None:
        """Save key metadata to files (backward compatibility)."""
        try:
            data = {
                key_id: metadata.to_dict()
                for key_id, metadata in self._metadata.items()
            }

            with open(self.metadata_file, "w") as f:
                json.dump(data, f, indent=2)

            # Set secure permissions
            self.metadata_file.chmod(0o600)

        except Exception as e:
            logger.error(f"Failed to save key metadata to files: {e}")

    def _ensure_system_master_key(self) -> None:
        """Ensure system master key exists."""
        system_master_id = "system_master_key"
        if system_master_id not in self._metadata:
            logger.info("Creating system master key")
            self.generate_key(
                key_id=system_master_id,
                key_type=KeyType.SYSTEM_MASTER,
                rotation_schedule_days=365,  # System master key rotates annually
            )

    def _derive_key_from_master(self, key_id: str, key_type: KeyType) -> bytes:
        """Derive a key from the system master key."""
        system_master = self.get_key("system_master_key")
        if not system_master:
            raise ValueError("System master key not found")

        # Use PBKDF2 to derive key
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,  # 256 bits
            salt=f"{key_id}:{key_type.value}".encode(),
            iterations=100000,
            backend=default_backend(),
        )

        return kdf.derive(system_master)

    def _encrypt_key(self, key_data: bytes, key_id: str) -> bytes:
        """Encrypt key data for storage."""
        # Derive encryption key from master password
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=f"key_encryption:{key_id}".encode(),
            iterations=100000,
            backend=default_backend(),
        )
        encryption_key = kdf.derive(self.master_password.encode())

        # Generate random IV
        iv = secrets.token_bytes(16)

        # Encrypt the key
        cipher = Cipher(
            algorithms.AES(encryption_key), modes.CBC(iv), backend=default_backend()
        )
        encryptor = cipher.encryptor()

        # Pad the data to block size
        padding_length = 16 - (len(key_data) % 16)
        padded_data = key_data + bytes([padding_length] * padding_length)

        encrypted_data = encryptor.update(padded_data) + encryptor.finalize()

        # Return IV + encrypted data
        return iv + encrypted_data

    def _save_key_to_database(self, key_id: str, key_data: bytes) -> None:
        """Save encrypted key data to database."""
        try:
            with get_key_storage_session() as session:
                # Get metadata for this key
                metadata = self._metadata.get(key_id)
                if not metadata:
                    logger.error(f"No metadata found for key {key_id}")
                    return

                # Check if key exists
                existing_key = (
                    session.query(KeyStorage)
                    .filter(KeyStorage.key_id == key_id)
                    .first()
                )

                if existing_key:
                    # Update existing key data
                    existing_key.encrypted_key_data = base64.b64encode(
                        key_data
                    ).decode()
                    existing_key.updated_at = datetime.now(timezone.utc)
                else:
                    # Create new key record
                    new_key = KeyStorage(
                        key_id=key_id,
                        key_type=metadata.key_type.value,
                        encrypted_key_data=base64.b64encode(key_data).decode(),
                        status=metadata.status.value,
                        created_at=metadata.created_at,
                        expires_at=metadata.expires_at,
                        last_used=metadata.last_used,
                        usage_count=metadata.usage_count,
                        rotation_schedule_days=metadata.rotation_schedule_days,
                        key_metadata=json.dumps(metadata.metadata),
                        is_active=True,
                    )
                    session.add(new_key)

                session.commit()
                logger.debug(f"Saved key {key_id} to database")

        except Exception as e:
            logger.error(f"Failed to save key {key_id} to database: {e}")

    def _load_key_from_database(self, key_id: str) -> Optional[bytes]:
        """Load encrypted key data from database."""
        try:
            with get_key_storage_session() as session:
                key_record = (
                    session.query(KeyStorage)
                    .filter(KeyStorage.key_id == key_id, KeyStorage.is_active == True)
                    .first()
                )

                if key_record:
                    encrypted_data = base64.b64decode(key_record.encrypted_key_data)
                    return self._decrypt_key(encrypted_data, key_id)

                return None

        except Exception as e:
            logger.error(f"Failed to load key {key_id} from database: {e}")
            return None

    def _save_key_to_file(self, key_id: str, key_data: bytes) -> None:
        """Save encrypted key data to file (backward compatibility)."""
        try:
            key_file = self.keys_directory / f"{key_id}.key"
            with open(key_file, "wb") as f:
                f.write(key_data)

            # Set secure permissions
            key_file.chmod(0o600)

        except Exception as e:
            logger.error(f"Failed to save key {key_id} to file: {e}")

    def _load_key_from_file(self, key_id: str) -> Optional[bytes]:
        """Load encrypted key data from file (backward compatibility)."""
        try:
            key_file = self.keys_directory / f"{key_id}.key"
            if not key_file.exists():
                return None

            with open(key_file, "rb") as f:
                encrypted_data = f.read()

            return self._decrypt_key(encrypted_data, key_id)

        except Exception as e:
            logger.error(f"Failed to load key {key_id} from file: {e}")
            return None

    def _decrypt_key(self, encrypted_data: bytes, key_id: str) -> bytes:
        """Decrypt key data from storage."""
        # Extract IV and encrypted data
        iv = encrypted_data[:16]
        encrypted_key = encrypted_data[16:]

        # Derive decryption key from master password
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=f"key_encryption:{key_id}".encode(),
            iterations=100000,
            backend=default_backend(),
        )
        decryption_key = kdf.derive(self.master_password.encode())

        # Decrypt the key
        cipher = Cipher(
            algorithms.AES(decryption_key), modes.CBC(iv), backend=default_backend()
        )
        decryptor = cipher.decryptor()

        decrypted_data = decryptor.update(encrypted_key) + decryptor.finalize()

        # Remove padding
        padding_length = decrypted_data[-1]
        return decrypted_data[:-padding_length]

    def generate_key(
        self,
        key_id: str,
        key_type: KeyType,
        key_size: int = 256,
        rotation_schedule_days: int = 90,
        expires_in_days: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> bytes:
        """
        Generate a new cryptographic key.

        Args:
            key_id: Unique identifier for the key
            key_type: Type of key to generate
            key_size: Key size in bits (default: 256)
            rotation_schedule_days: Days between key rotations (default: 90)
            expires_in_days: Days until key expires (default: rotation_schedule_days * 2)
            metadata: Additional metadata for the key

        Returns:
            Generated key bytes
        """
        if key_id in self._metadata:
            raise ValueError(f"Key {key_id} already exists")

        # Generate key based on type
        if key_type in [KeyType.JWT_SIGNING, KeyType.SYSTEM_MASTER]:
            # Generate RSA key for signing
            private_key = rsa.generate_private_key(
                public_exponent=65537, key_size=2048, backend=default_backend()
            )
            key_data = private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption(),
            )
        else:
            # Generate symmetric key
            key_data = secrets.token_bytes(key_size // 8)

        # Calculate expiration date
        expires_at = None
        if expires_in_days:
            expires_at = datetime.now(UTC) + timedelta(days=expires_in_days)
        elif rotation_schedule_days:
            expires_at = datetime.now(UTC) + timedelta(days=rotation_schedule_days * 2)

        # Create metadata
        key_metadata = KeyMetadata(
            key_id=key_id,
            key_type=key_type,
            expires_at=expires_at,
            rotation_schedule_days=rotation_schedule_days,
            metadata=metadata or {},
        )

        # Store metadata first, then key data
        self._metadata[key_id] = key_metadata

        if self.use_database:
            self._save_metadata_to_database(key_id, key_metadata)
        else:
            self._save_metadata_to_files()

        # Store key data
        self._store_key(key_id, key_data)

        logger.info(f"Generated new {key_type.value} key: {key_id}")
        return key_data

    def _store_key(self, key_id: str, key_data: bytes) -> None:
        """Store encrypted key data."""
        encrypted_data = self._encrypt_key(key_data, key_id)

        if self.use_database:
            # Save to database
            self._save_key_to_database(key_id, encrypted_data)
            # Cache the key for performance
            self.key_cache_service.cache_key(
                key_id,
                key_data,
                self._metadata[key_id].to_dict(),
                ttl_seconds=3600,  # 1 hour cache TTL
            )
        else:
            # Save to file (backward compatibility)
            key_file = self.keys_directory / f"{key_id}.key"
            with open(key_file, "wb") as f:
                f.write(encrypted_data)
            # Set secure permissions
            key_file.chmod(0o600)

    def get_key(self, key_id: str, update_usage: bool = True) -> Optional[bytes]:
        """
        Retrieve a key by ID.

        Args:
            key_id: Key identifier
            update_usage: Whether to update usage statistics

        Returns:
            Key bytes or None if not found
        """
        # Check Redis cache first
        if self.use_database:
            cached_result = self.key_cache_service.get_cached_key(key_id)
            if cached_result:
                key_data, metadata = cached_result
                if update_usage:
                    self._update_key_usage(key_id)
                return key_data

        # Check if key exists in metadata
        if key_id not in self._metadata:
            logger.warning(f"Key not found: {key_id}")
            return None

        # Check key status
        metadata = self._metadata[key_id]
        if metadata.status in [KeyStatus.REVOKED, KeyStatus.EXPIRED]:
            logger.warning(f"Key {key_id} is {metadata.status.value}")
            return None

        # Load key from storage
        try:
            if self.use_database:
                key_data = self._load_key_from_database(key_id)
            else:
                key_data = self._load_key_from_file(key_id)

            if key_data is None:
                logger.error(f"Key data not found: {key_id}")
                return None

            # Update usage statistics
            if update_usage:
                self._update_key_usage(key_id)

            # Log successful access
            self._log_key_access(key_id, "read", True)
            return key_data

        except Exception as e:
            logger.error(f"Failed to load key {key_id}: {e}")
            # Log failed access
            self._log_key_access(key_id, "read", False, error_message=str(e))
            return None

    def _update_key_usage(self, key_id: str) -> None:
        """Update key usage statistics."""
        if key_id in self._metadata:
            metadata = self._metadata[key_id]
            metadata.last_used = datetime.now(timezone.utc)
            metadata.usage_count += 1

            if self.use_database:
                self._save_metadata_to_database(key_id, metadata)
                # Update cache
                self.key_cache_service.update_key_usage(key_id, metadata.usage_count)
            else:
                self._save_metadata_to_files()

    def rotate_key(self, key_id: str) -> bytes:
        """
        Rotate a key by generating a new version.

        Args:
            key_id: Key identifier to rotate

        Returns:
            New key bytes
        """
        if key_id not in self._metadata:
            raise ValueError(f"Key {key_id} not found")

        metadata = self._metadata[key_id]

        # Mark old key as rotating
        metadata.status = KeyStatus.ROTATING

        # Generate new key with same parameters
        new_key_data = self.generate_key(
            key_id=f"{key_id}_v{int(time.time())}",
            key_type=metadata.key_type,
            rotation_schedule_days=metadata.rotation_schedule_days,
            metadata=metadata.metadata,
        )

        # Mark old key as deprecated
        metadata.status = KeyStatus.DEPRECATED

        logger.info(f"Rotated key {key_id}")
        return new_key_data

    def revoke_key(self, key_id: str) -> None:
        """Revoke a key."""
        if key_id in self._metadata:
            self._metadata[key_id].status = KeyStatus.REVOKED
            self._save_metadata()

            # Remove from cache
            if key_id in self._key_cache:
                del self._key_cache[key_id]

            logger.info(f"Revoked key {key_id}")

    def list_keys(
        self, key_type: Optional[KeyType] = None, status: Optional[KeyStatus] = None
    ) -> List[KeyMetadata]:
        """List keys with optional filtering."""
        keys = list(self._metadata.values())

        if key_type:
            keys = [k for k in keys if k.key_type == key_type]

        if status:
            keys = [k for k in keys if k.status == status]

        return keys

    def get_key_metadata(self, key_id: str) -> Optional[KeyMetadata]:
        """Get metadata for a key."""
        return self._metadata.get(key_id)

    def cleanup_expired_keys(self) -> int:
        """Remove expired keys and return count of cleaned keys."""
        now = datetime.now(timezone.utc)
        expired_keys = []

        for key_id, metadata in self._metadata.items():
            if metadata.expires_at and metadata.expires_at < now:
                expired_keys.append(key_id)

        for key_id in expired_keys:
            self.revoke_key(key_id)

            if self.use_database:
                # Invalidate cache
                self.key_cache_service.invalidate_key(key_id)
            else:
                # Remove key file
                key_file = self.keys_directory / f"{key_id}.key"
                if key_file.exists():
                    key_file.unlink()

        logger.info(f"Cleaned up {len(expired_keys)} expired keys")
        return len(expired_keys)

    def _log_key_access(
        self,
        key_id: str,
        operation: str,
        success: bool,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        error_message: Optional[str] = None,
    ) -> None:
        """Log key access for audit purposes."""
        if not self.use_database:
            return

        try:
            with get_key_storage_session() as session:
                access_log = KeyAccessLog(
                    key_id=key_id,
                    operation=operation,
                    user_id=user_id,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    success=success,
                    error_message=error_message,
                )
                session.add(access_log)
                session.commit()
        except Exception as e:
            logger.error(f"Failed to log key access: {e}")

    def backup_keys(self, backup_path: str) -> None:
        """Create a backup of all keys."""
        backup_dir = Path(backup_path)
        backup_dir.mkdir(parents=True, exist_ok=True)

        # Copy all key files
        for key_file in self.keys_directory.glob("*.key"):
            backup_file = backup_dir / key_file.name
            backup_file.write_bytes(key_file.read_bytes())
            backup_file.chmod(0o600)

        # Copy metadata
        backup_metadata = backup_dir / "key_metadata.json"
        backup_metadata.write_text(self.metadata_file.read_text())
        backup_metadata.chmod(0o600)

        logger.info(f"Backed up keys to {backup_path}")

    def restore_keys(self, backup_path: str) -> None:
        """Restore keys from backup."""
        backup_dir = Path(backup_path)

        if not backup_dir.exists():
            raise ValueError(f"Backup directory not found: {backup_path}")

        # Restore key files
        for key_file in backup_dir.glob("*.key"):
            target_file = self.keys_directory / key_file.name
            target_file.write_bytes(key_file.read_bytes())
            target_file.chmod(0o600)

        # Restore metadata
        backup_metadata = backup_dir / "key_metadata.json"
        if backup_metadata.exists():
            target_metadata = self.keys_directory / "key_metadata.json"
            target_metadata.write_text(backup_metadata.read_text())
            target_metadata.chmod(0o600)

        # Reload metadata
        self._load_metadata()

        logger.info(f"Restored keys from {backup_path}")


# Global key manager instance
_key_manager: Optional[KeyManager] = None


def get_key_manager() -> KeyManager:
    """Get the global key manager instance."""
    global _key_manager
    if _key_manager is None:
        _key_manager = KeyManager()
    return _key_manager


def get_key(
    key_id: str, key_type: KeyType, update_usage: bool = True
) -> Optional[bytes]:
    """Get a key by ID and type."""
    key_manager = get_key_manager()
    return key_manager.get_key(key_id, update_usage)


def generate_key(
    key_id: str,
    key_type: KeyType,
    key_size: int = 256,
    rotation_schedule_days: int = 90,
    expires_in_days: Optional[int] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> bytes:
    """Generate a new key."""
    key_manager = get_key_manager()
    return key_manager.generate_key(
        key_id=key_id,
        key_type=key_type,
        key_size=key_size,
        rotation_schedule_days=rotation_schedule_days,
        expires_in_days=expires_in_days,
        metadata=metadata,
    )


def rotate_key(key_id: str) -> bytes:
    """Rotate a key."""
    key_manager = get_key_manager()
    return key_manager.rotate_key(key_id)


def revoke_key(key_id: str) -> None:
    """Revoke a key."""
    key_manager = get_key_manager()
    key_manager.revoke_key(key_id)


def list_keys(
    key_type: Optional[KeyType] = None, status: Optional[KeyStatus] = None
) -> List[KeyMetadata]:
    """List keys with optional filtering."""
    key_manager = get_key_manager()
    return key_manager.list_keys(key_type, status)


def cleanup_expired_keys() -> int:
    """Clean up expired keys."""
    key_manager = get_key_manager()
    return key_manager.cleanup_expired_keys()
