"""Encryption Service for Role-Based Data Protection.

This service provides comprehensive encryption capabilities including:
- Role-based data encryption
- Key management integration
- Secure data sharing
- Encryption key rotation
- Data integrity verification

Author: Reynard Development Team
Version: 1.0.0
"""

import hashlib
import hmac
import json
import logging
import secrets
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple, Union

from cryptography.fernet import Fernet
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from ..core.audit_service import AuditEventType, AuditService
from ..models.rbac import Operation, ResourceType

logger = logging.getLogger(__name__)


class EncryptionAlgorithm(str, Enum):
    """Encryption algorithm enumeration."""

    AES_256_GCM = "aes_256_gcm"
    AES_256_CBC = "aes_256_cbc"
    RSA_2048 = "rsa_2048"
    RSA_4096 = "rsa_4096"
    FERNET = "fernet"


class KeyType(str, Enum):
    """Key type enumeration."""

    SYMMETRIC = "symmetric"
    ASYMMETRIC = "asymmetric"
    HYBRID = "hybrid"


class EncryptionLevel(str, Enum):
    """Encryption level enumeration."""

    BASIC = "basic"  # Standard encryption
    ENHANCED = "enhanced"  # Enhanced encryption with key rotation
    MAXIMUM = "maximum"  # Maximum security with multiple layers


@dataclass
class EncryptionKey:
    """Encryption key data structure."""

    key_id: str
    key_type: KeyType
    algorithm: EncryptionAlgorithm
    key_data: bytes
    created_at: datetime
    expires_at: Optional[datetime] = None
    is_active: bool = True
    metadata: Dict[str, Any] = field(default_factory=dict)
    role_access: List[str] = field(default_factory=list)  # Roles that can use this key


@dataclass
class EncryptedData:
    """Encrypted data structure."""

    data: bytes
    key_id: str
    algorithm: EncryptionAlgorithm
    iv: Optional[bytes] = None  # Initialization vector for symmetric encryption
    tag: Optional[bytes] = None  # Authentication tag for GCM
    metadata: Dict[str, Any] = field(default_factory=dict)
    encrypted_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class KeyRotationPolicy:
    """Key rotation policy data structure."""

    key_id: str
    rotation_interval_days: int
    last_rotated: datetime
    next_rotation: datetime
    auto_rotate: bool = True
    backup_old_keys: bool = True
    max_backup_keys: int = 3


class EncryptionService:
    """Service for role-based data encryption and key management."""

    def __init__(self, audit_service: AuditService):
        """Initialize the encryption service.

        Args:
            audit_service: Audit service instance
        """
        self.audit_service = audit_service
        self.logger = logging.getLogger(f"{__name__}.encryption")

        # Key storage
        self.encryption_keys: Dict[str, EncryptionKey] = {}
        self.key_rotation_policies: Dict[str, KeyRotationPolicy] = {}

        # Configuration
        self.config = {
            "default_algorithm": EncryptionAlgorithm.AES_256_GCM,
            "key_rotation_interval_days": 90,
            "max_key_age_days": 365,
            "backup_old_keys": True,
            "max_backup_keys": 3,
            "encryption_levels": {
                "basic": {
                    "algorithm": EncryptionAlgorithm.AES_256_GCM,
                    "key_rotation_days": 90,
                },
                "enhanced": {
                    "algorithm": EncryptionAlgorithm.AES_256_GCM,
                    "key_rotation_days": 30,
                },
                "maximum": {
                    "algorithm": EncryptionAlgorithm.AES_256_GCM,
                    "key_rotation_days": 7,
                },
            },
        }

        # Initialize default keys
        self._initialize_default_keys()

    def _initialize_default_keys(self):
        """Initialize default encryption keys."""
        try:
            # Create default system key
            system_key = self._generate_symmetric_key(
                key_id="system_default",
                algorithm=EncryptionAlgorithm.AES_256_GCM,
                role_access=["system_admin", "admin"],
            )
            self.encryption_keys["system_default"] = system_key

            # Create default user key
            user_key = self._generate_symmetric_key(
                key_id="user_default",
                algorithm=EncryptionAlgorithm.AES_256_GCM,
                role_access=["user", "admin", "system_admin"],
            )
            self.encryption_keys["user_default"] = user_key

            self.logger.info("Default encryption keys initialized")

        except Exception as e:
            self.logger.error(f"Failed to initialize default keys: {e}")

    def _generate_symmetric_key(
        self, key_id: str, algorithm: EncryptionAlgorithm, role_access: List[str]
    ) -> EncryptionKey:
        """Generate a symmetric encryption key.

        Args:
            key_id: Unique key identifier
            algorithm: Encryption algorithm
            role_access: Roles that can use this key

        Returns:
            EncryptionKey: Generated encryption key
        """
        if algorithm in [
            EncryptionAlgorithm.AES_256_GCM,
            EncryptionAlgorithm.AES_256_CBC,
        ]:
            key_data = secrets.token_bytes(32)  # 256 bits
        elif algorithm == EncryptionAlgorithm.FERNET:
            key_data = Fernet.generate_key()
        else:
            raise ValueError(f"Unsupported symmetric algorithm: {algorithm}")

        return EncryptionKey(
            key_id=key_id,
            key_type=KeyType.SYMMETRIC,
            algorithm=algorithm,
            key_data=key_data,
            created_at=datetime.now(timezone.utc),
            expires_at=datetime.now(timezone.utc)
            + timedelta(days=self.config["max_key_age_days"]),
            role_access=role_access,
        )

    def _generate_asymmetric_keypair(
        self, key_id: str, algorithm: EncryptionAlgorithm, role_access: List[str]
    ) -> Tuple[EncryptionKey, EncryptionKey]:
        """Generate an asymmetric key pair.

        Args:
            key_id: Unique key identifier
            algorithm: Encryption algorithm
            role_access: Roles that can use this key

        Returns:
            Tuple of (private_key, public_key) EncryptionKey objects
        """
        if algorithm == EncryptionAlgorithm.RSA_2048:
            key_size = 2048
        elif algorithm == EncryptionAlgorithm.RSA_4096:
            key_size = 4096
        else:
            raise ValueError(f"Unsupported asymmetric algorithm: {algorithm}")

        # Generate RSA key pair
        private_key = rsa.generate_private_key(
            public_exponent=65537, key_size=key_size, backend=default_backend()
        )
        public_key = private_key.public_key()

        # Serialize keys
        private_key_data = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )

        public_key_data = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )

        # Create key objects
        private_key_obj = EncryptionKey(
            key_id=f"{key_id}_private",
            key_type=KeyType.ASYMMETRIC,
            algorithm=algorithm,
            key_data=private_key_data,
            created_at=datetime.now(timezone.utc),
            expires_at=datetime.now(timezone.utc)
            + timedelta(days=self.config["max_key_age_days"]),
            role_access=role_access,
            metadata={"key_pair_id": key_id, "key_type": "private"},
        )

        public_key_obj = EncryptionKey(
            key_id=f"{key_id}_public",
            key_type=KeyType.ASYMMETRIC,
            algorithm=algorithm,
            key_data=public_key_data,
            created_at=datetime.now(timezone.utc),
            expires_at=datetime.now(timezone.utc)
            + timedelta(days=self.config["max_key_age_days"]),
            role_access=role_access,
            metadata={"key_pair_id": key_id, "key_type": "public"},
        )

        return private_key_obj, public_key_obj

    async def create_role_based_key(
        self,
        key_id: str,
        role_access: List[str],
        algorithm: Optional[EncryptionAlgorithm] = None,
        encryption_level: EncryptionLevel = EncryptionLevel.BASIC,
        expires_in_days: Optional[int] = None,
    ) -> EncryptionKey:
        """Create a role-based encryption key.

        Args:
            key_id: Unique key identifier
            role_access: Roles that can use this key
            algorithm: Encryption algorithm (uses default if None)
            encryption_level: Encryption security level
            expires_in_days: Key expiration in days (uses default if None)

        Returns:
            EncryptionKey: Created encryption key
        """
        try:
            if algorithm is None:
                algorithm = self.config["encryption_levels"][encryption_level.value][
                    "algorithm"
                ]

            # Generate key based on type
            if algorithm in [
                EncryptionAlgorithm.AES_256_GCM,
                EncryptionAlgorithm.AES_256_CBC,
                EncryptionAlgorithm.FERNET,
            ]:
                key = self._generate_symmetric_key(key_id, algorithm, role_access)
            else:
                # For asymmetric keys, we'll create both private and public keys
                private_key, public_key = self._generate_asymmetric_keypair(
                    key_id, algorithm, role_access
                )
                self.encryption_keys[private_key.key_id] = private_key
                self.encryption_keys[public_key.key_id] = public_key
                key = private_key  # Return private key as primary

            # Set expiration
            if expires_in_days:
                key.expires_at = datetime.now(timezone.utc) + timedelta(
                    days=expires_in_days
                )

            # Store key
            self.encryption_keys[key.key_id] = key

            # Set up key rotation policy
            rotation_interval = self.config["encryption_levels"][
                encryption_level.value
            ]["key_rotation_days"]
            self.key_rotation_policies[key.key_id] = KeyRotationPolicy(
                key_id=key.key_id,
                rotation_interval_days=rotation_interval,
                last_rotated=datetime.now(timezone.utc),
                next_rotation=datetime.now(timezone.utc)
                + timedelta(days=rotation_interval),
                auto_rotate=True,
                backup_old_keys=self.config["backup_old_keys"],
                max_backup_keys=self.config["max_backup_keys"],
            )

            # Log key creation
            await self.audit_service.log_event(
                AuditEvent(
                    event_type=AuditEventType.RESOURCE_CREATED,
                    resource_type="encryption_key",
                    resource_id=key.key_id,
                    operation="create",
                    success=True,
                    context={
                        "algorithm": algorithm.value,
                        "encryption_level": encryption_level.value,
                        "role_access": role_access,
                        "expires_at": (
                            key.expires_at.isoformat() if key.expires_at else None
                        ),
                    },
                )
            )

            self.logger.info(f"Created role-based encryption key: {key_id}")
            return key

        except Exception as e:
            self.logger.error(f"Failed to create role-based key: {e}")
            raise

    async def encrypt_data(
        self,
        data: Union[str, bytes],
        key_id: str,
        user_roles: List[str],
        resource_type: Optional[ResourceType] = None,
        resource_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> EncryptedData:
        """Encrypt data using role-based encryption.

        Args:
            data: Data to encrypt
            user_roles: User roles for access control
            key_id: Encryption key ID
            resource_type: Type of resource being encrypted
            resource_id: ID of resource being encrypted
            metadata: Additional metadata

        Returns:
            EncryptedData: Encrypted data object
        """
        try:
            # Check if user has access to the key
            if not await self._check_key_access(key_id, user_roles):
                raise PermissionError(
                    f"User roles {user_roles} do not have access to key {key_id}"
                )

            # Get encryption key
            key = self.encryption_keys.get(key_id)
            if not key or not key.is_active:
                raise ValueError(f"Key {key_id} not found or inactive")

            # Convert data to bytes
            if isinstance(data, str):
                data_bytes = data.encode('utf-8')
            else:
                data_bytes = data

            # Encrypt based on algorithm
            if key.algorithm == EncryptionAlgorithm.AES_256_GCM:
                encrypted_data, iv, tag = self._encrypt_aes_gcm(
                    data_bytes, key.key_data
                )
            elif key.algorithm == EncryptionAlgorithm.AES_256_CBC:
                encrypted_data, iv = self._encrypt_aes_cbc(data_bytes, key.key_data)
            elif key.algorithm == EncryptionAlgorithm.FERNET:
                encrypted_data = self._encrypt_fernet(data_bytes, key.key_data)
                iv = None
            else:
                raise ValueError(f"Unsupported encryption algorithm: {key.algorithm}")

            # Create encrypted data object
            encrypted = EncryptedData(
                data=encrypted_data,
                key_id=key_id,
                algorithm=key.algorithm,
                iv=iv,
                metadata={
                    "resource_type": resource_type.value if resource_type else None,
                    "resource_id": resource_id,
                    "user_roles": user_roles,
                    **(metadata or {}),
                },
            )

            # Log encryption operation
            await self.audit_service.log_event(
                AuditEvent(
                    event_type=AuditEventType.RESOURCE_ACCESS_GRANTED,
                    resource_type="encryption_key",
                    resource_id=key_id,
                    operation="encrypt",
                    success=True,
                    context={
                        "data_size": len(data_bytes),
                        "algorithm": key.algorithm.value,
                        "resource_type": resource_type.value if resource_type else None,
                        "resource_id": resource_id,
                    },
                )
            )

            return encrypted

        except Exception as e:
            self.logger.error(f"Failed to encrypt data: {e}")
            raise

    async def decrypt_data(
        self,
        encrypted_data: EncryptedData,
        user_roles: List[str],
        username: Optional[str] = None,
    ) -> bytes:
        """Decrypt data using role-based encryption.

        Args:
            encrypted_data: Encrypted data object
            user_roles: User roles for access control
            username: Username for audit logging

        Returns:
            bytes: Decrypted data
        """
        try:
            # Check if user has access to the key
            if not await self._check_key_access(encrypted_data.key_id, user_roles):
                raise PermissionError(
                    f"User roles {user_roles} do not have access to key {encrypted_data.key_id}"
                )

            # Get encryption key
            key = self.encryption_keys.get(encrypted_data.key_id)
            if not key or not key.is_active:
                raise ValueError(f"Key {encrypted_data.key_id} not found or inactive")

            # Decrypt based on algorithm
            if key.algorithm == EncryptionAlgorithm.AES_256_GCM:
                decrypted_data = self._decrypt_aes_gcm(
                    encrypted_data.data,
                    key.key_data,
                    encrypted_data.iv,
                    encrypted_data.tag,
                )
            elif key.algorithm == EncryptionAlgorithm.AES_256_CBC:
                decrypted_data = self._decrypt_aes_cbc(
                    encrypted_data.data, key.key_data, encrypted_data.iv
                )
            elif key.algorithm == EncryptionAlgorithm.FERNET:
                decrypted_data = self._decrypt_fernet(encrypted_data.data, key.key_data)
            else:
                raise ValueError(f"Unsupported decryption algorithm: {key.algorithm}")

            # Log decryption operation
            await self.audit_service.log_event(
                AuditEvent(
                    event_type=AuditEventType.RESOURCE_ACCESS_GRANTED,
                    resource_type="encryption_key",
                    resource_id=encrypted_data.key_id,
                    operation="decrypt",
                    success=True,
                    username=username,
                    context={
                        "data_size": len(decrypted_data),
                        "algorithm": key.algorithm.value,
                        "resource_type": encrypted_data.metadata.get("resource_type"),
                        "resource_id": encrypted_data.metadata.get("resource_id"),
                    },
                )
            )

            return decrypted_data

        except Exception as e:
            self.logger.error(f"Failed to decrypt data: {e}")
            raise

    def _encrypt_aes_gcm(self, data: bytes, key: bytes) -> Tuple[bytes, bytes, bytes]:
        """Encrypt data using AES-256-GCM.

        Args:
            data: Data to encrypt
            key: Encryption key

        Returns:
            Tuple of (encrypted_data, iv, tag)
        """
        iv = secrets.token_bytes(12)  # 96-bit IV for GCM
        cipher = Cipher(algorithms.AES(key), modes.GCM(iv), backend=default_backend())
        encryptor = cipher.encryptor()
        encrypted_data = encryptor.update(data) + encryptor.finalize()
        return encrypted_data, iv, encryptor.tag

    def _decrypt_aes_gcm(
        self, encrypted_data: bytes, key: bytes, iv: bytes, tag: bytes
    ) -> bytes:
        """Decrypt data using AES-256-GCM.

        Args:
            encrypted_data: Encrypted data
            key: Decryption key
            iv: Initialization vector
            tag: Authentication tag

        Returns:
            bytes: Decrypted data
        """
        cipher = Cipher(
            algorithms.AES(key), modes.GCM(iv, tag), backend=default_backend()
        )
        decryptor = cipher.decryptor()
        return decryptor.update(encrypted_data) + decryptor.finalize()

    def _encrypt_aes_cbc(self, data: bytes, key: bytes) -> Tuple[bytes, bytes]:
        """Encrypt data using AES-256-CBC.

        Args:
            data: Data to encrypt
            key: Encryption key

        Returns:
            Tuple of (encrypted_data, iv)
        """
        iv = secrets.token_bytes(16)  # 128-bit IV for CBC
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
        encryptor = cipher.encryptor()

        # Pad data to block size
        padding_length = 16 - (len(data) % 16)
        padded_data = data + bytes([padding_length] * padding_length)

        encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
        return encrypted_data, iv

    def _decrypt_aes_cbc(self, encrypted_data: bytes, key: bytes, iv: bytes) -> bytes:
        """Decrypt data using AES-256-CBC.

        Args:
            encrypted_data: Encrypted data
            key: Decryption key
            iv: Initialization vector

        Returns:
            bytes: Decrypted data
        """
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
        decryptor = cipher.decryptor()
        padded_data = decryptor.update(encrypted_data) + decryptor.finalize()

        # Remove padding
        padding_length = padded_data[-1]
        return padded_data[:-padding_length]

    def _encrypt_fernet(self, data: bytes, key: bytes) -> bytes:
        """Encrypt data using Fernet.

        Args:
            data: Data to encrypt
            key: Fernet key

        Returns:
            bytes: Encrypted data
        """
        fernet = Fernet(key)
        return fernet.encrypt(data)

    def _decrypt_fernet(self, encrypted_data: bytes, key: bytes) -> bytes:
        """Decrypt data using Fernet.

        Args:
            encrypted_data: Encrypted data
            key: Fernet key

        Returns:
            bytes: Decrypted data
        """
        fernet = Fernet(key)
        return fernet.decrypt(encrypted_data)

    async def _check_key_access(self, key_id: str, user_roles: List[str]) -> bool:
        """Check if user roles have access to encryption key.

        Args:
            key_id: Encryption key ID
            user_roles: User roles

        Returns:
            bool: True if access is granted
        """
        key = self.encryption_keys.get(key_id)
        if not key:
            return False

        # Check if any user role is in the key's role access list
        return any(role in key.role_access for role in user_roles)

    async def rotate_encryption_key(
        self, key_id: str, username: Optional[str] = None
    ) -> EncryptionKey:
        """Rotate an encryption key.

        Args:
            key_id: Key ID to rotate
            username: Username performing the rotation

        Returns:
            EncryptionKey: New rotated key
        """
        try:
            old_key = self.encryption_keys.get(key_id)
            if not old_key:
                raise ValueError(f"Key {key_id} not found")

            # Generate new key with same parameters
            new_key = self._generate_symmetric_key(
                key_id=f"{key_id}_rotated_{datetime.now(timezone.utc).timestamp()}",
                algorithm=old_key.algorithm,
                role_access=old_key.role_access,
            )

            # Store new key
            self.encryption_keys[new_key.key_id] = new_key

            # Update rotation policy
            if key_id in self.key_rotation_policies:
                policy = self.key_rotation_policies[key_id]
                policy.last_rotated = datetime.now(timezone.utc)
                policy.next_rotation = datetime.now(timezone.utc) + timedelta(
                    days=policy.rotation_interval_days
                )

                # Create new policy for new key
                self.key_rotation_policies[new_key.key_id] = KeyRotationPolicy(
                    key_id=new_key.key_id,
                    rotation_interval_days=policy.rotation_interval_days,
                    last_rotated=datetime.now(timezone.utc),
                    next_rotation=datetime.now(timezone.utc)
                    + timedelta(days=policy.rotation_interval_days),
                    auto_rotate=policy.auto_rotate,
                    backup_old_keys=policy.backup_old_keys,
                    max_backup_keys=policy.max_backup_keys,
                )

            # Deactivate old key
            old_key.is_active = False

            # Log key rotation
            await self.audit_service.log_event(
                AuditEvent(
                    event_type=AuditEventType.RESOURCE_UPDATED,
                    resource_type="encryption_key",
                    resource_id=key_id,
                    operation="rotate",
                    success=True,
                    username=username,
                    context={
                        "old_key_id": key_id,
                        "new_key_id": new_key.key_id,
                        "algorithm": new_key.algorithm.value,
                    },
                )
            )

            self.logger.info(f"Rotated encryption key: {key_id} -> {new_key.key_id}")
            return new_key

        except Exception as e:
            self.logger.error(f"Failed to rotate encryption key: {e}")
            raise

    async def create_secure_share(
        self,
        data: Union[str, bytes],
        sharing_roles: List[str],
        recipient_roles: List[str],
        expires_in_hours: Optional[int] = None,
        username: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a secure data share.

        Args:
            data: Data to share
            sharing_roles: Roles of the user sharing the data
            recipient_roles: Roles that can access the shared data
            expires_in_hours: Share expiration in hours
            username: Username sharing the data

        Returns:
            Dict containing share information
        """
        try:
            # Create temporary encryption key for sharing
            share_key_id = f"share_{secrets.token_hex(16)}"
            share_key = self._generate_symmetric_key(
                key_id=share_key_id,
                algorithm=EncryptionAlgorithm.AES_256_GCM,
                role_access=recipient_roles,
            )

            # Set expiration
            if expires_in_hours:
                share_key.expires_at = datetime.now(timezone.utc) + timedelta(
                    hours=expires_in_hours
                )

            # Store share key
            self.encryption_keys[share_key_id] = share_key

            # Encrypt data with share key
            encrypted_data = await self.encrypt_data(
                data=data,
                key_id=share_key_id,
                user_roles=sharing_roles,
                resource_type=ResourceType.SYSTEM,
                resource_id=share_key_id,
                metadata={
                    "share_type": "secure_share",
                    "recipient_roles": recipient_roles,
                },
            )

            # Create share metadata
            share_info = {
                "share_id": share_key_id,
                "encrypted_data": {
                    "data": encrypted_data.data.hex(),
                    "iv": encrypted_data.iv.hex() if encrypted_data.iv else None,
                    "tag": encrypted_data.tag.hex() if encrypted_data.tag else None,
                    "algorithm": encrypted_data.algorithm.value,
                },
                "recipient_roles": recipient_roles,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "expires_at": (
                    share_key.expires_at.isoformat() if share_key.expires_at else None
                ),
                "created_by": username,
            }

            # Log secure share creation
            await self.audit_service.log_event(
                AuditEvent(
                    event_type=AuditEventType.RESOURCE_CREATED,
                    resource_type="secure_share",
                    resource_id=share_key_id,
                    operation="create_share",
                    success=True,
                    username=username,
                    context={
                        "recipient_roles": recipient_roles,
                        "expires_in_hours": expires_in_hours,
                        "data_size": (
                            len(data)
                            if isinstance(data, bytes)
                            else len(data.encode('utf-8'))
                        ),
                    },
                )
            )

            self.logger.info(f"Created secure share: {share_key_id}")
            return share_info

        except Exception as e:
            self.logger.error(f"Failed to create secure share: {e}")
            raise

    async def access_secure_share(
        self,
        share_info: Dict[str, Any],
        user_roles: List[str],
        username: Optional[str] = None,
    ) -> bytes:
        """Access a secure data share.

        Args:
            share_info: Share information
            user_roles: User roles
            username: Username accessing the share

        Returns:
            bytes: Decrypted shared data
        """
        try:
            share_id = share_info["share_id"]

            # Check if user has access to the share
            if not any(role in share_info["recipient_roles"] for role in user_roles):
                raise PermissionError(
                    f"User roles {user_roles} do not have access to share {share_id}"
                )

            # Check if share has expired
            if share_info.get("expires_at"):
                expires_at = datetime.fromisoformat(share_info["expires_at"])
                if datetime.now(timezone.utc) > expires_at:
                    raise ValueError(f"Share {share_id} has expired")

            # Reconstruct encrypted data object
            encrypted_data = EncryptedData(
                data=bytes.fromhex(share_info["encrypted_data"]["data"]),
                key_id=share_id,
                algorithm=EncryptionAlgorithm(
                    share_info["encrypted_data"]["algorithm"]
                ),
                iv=(
                    bytes.fromhex(share_info["encrypted_data"]["iv"])
                    if share_info["encrypted_data"]["iv"]
                    else None
                ),
                tag=(
                    bytes.fromhex(share_info["encrypted_data"]["tag"])
                    if share_info["encrypted_data"]["tag"]
                    else None
                ),
            )

            # Decrypt data
            decrypted_data = await self.decrypt_data(
                encrypted_data, user_roles, username
            )

            # Log share access
            await self.audit_service.log_event(
                AuditEvent(
                    event_type=AuditEventType.RESOURCE_ACCESS_GRANTED,
                    resource_type="secure_share",
                    resource_id=share_id,
                    operation="access_share",
                    success=True,
                    username=username,
                    context={
                        "share_created_by": share_info.get("created_by"),
                        "data_size": len(decrypted_data),
                    },
                )
            )

            return decrypted_data

        except Exception as e:
            self.logger.error(f"Failed to access secure share: {e}")
            raise

    async def get_encryption_status(self) -> Dict[str, Any]:
        """Get encryption service status.

        Returns:
            Dict containing encryption service status
        """
        current_time = datetime.now(timezone.utc)

        # Count keys by status
        active_keys = len([k for k in self.encryption_keys.values() if k.is_active])
        expired_keys = len(
            [
                k
                for k in self.encryption_keys.values()
                if k.expires_at and k.expires_at < current_time
            ]
        )

        # Count keys by algorithm
        algorithm_counts = {}
        for key in self.encryption_keys.values():
            algorithm_counts[key.algorithm.value] = (
                algorithm_counts.get(key.algorithm.value, 0) + 1
            )

        # Get rotation status
        keys_due_for_rotation = []
        for policy in self.key_rotation_policies.values():
            if policy.next_rotation <= current_time:
                keys_due_for_rotation.append(policy.key_id)

        return {
            "timestamp": current_time.isoformat(),
            "key_statistics": {
                "total_keys": len(self.encryption_keys),
                "active_keys": active_keys,
                "expired_keys": expired_keys,
                "algorithm_distribution": algorithm_counts,
            },
            "rotation_status": {
                "total_policies": len(self.key_rotation_policies),
                "keys_due_for_rotation": len(keys_due_for_rotation),
                "keys_due": keys_due_for_rotation,
            },
            "configuration": self.config,
        }
