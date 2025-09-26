"""🔐 SSH Key Service for Reynard Backend

Service for managing SSH keys with PostgreSQL database integration.
This service provides secure SSH key generation, storage, and management
integrated with the Gatekeeper authentication system.

Key Features:
- Secure SSH key generation and storage
- Database integration with audit logging
- User and admin key management
- Key rotation and lifecycle management
- SSH key validation and fingerprinting
- Support for multiple key types (RSA, Ed25519, ECDSA)

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

import hashlib
import json
import logging
import os
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional
from uuid import uuid4

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec, ed25519, rsa
from cryptography.hazmat.primitives.serialization import load_ssh_public_key
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .ssh_key_models import (
    AuthSessionLocal,
    SSHKey,
    SSHKeyAccessLog,
    SSHKeyRotationLog,
    SSHKeyStatus,
    SSHKeyType,
    SSHKeyUsage,
)

logger = logging.getLogger(__name__)


class SSHKeyService:
    """Service for managing SSH keys with database integration."""

    def __init__(self):
        """Initialize the SSH key service."""
        self.session_factory = AuthSessionLocal
        self.temp_dir = Path(tempfile.gettempdir()) / "reynard_ssh_keys"
        self.temp_dir.mkdir(exist_ok=True)

    def _log_access(
        self,
        session: Session,
        key_id: str,
        user_id: str,
        operation: str,
        success: bool,
        error_message: Optional[str] = None,
        admin_action: bool = False,
        admin_user_id: Optional[str] = None,
        target_user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_id: Optional[str] = None,
        target_host: Optional[str] = None,
        target_user: Optional[str] = None,
        command_executed: Optional[str] = None,
    ) -> None:
        """Log key access for audit purposes."""
        try:
            access_log = SSHKeyAccessLog(
                key_id=key_id,
                user_id=user_id,
                operation=operation,
                success=success,
                error_message=error_message,
                admin_action=admin_action,
                admin_user_id=admin_user_id,
                target_user_id=target_user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                request_id=request_id,
                target_host=target_host,
                target_user=target_user,
                command_executed=command_executed,
            )
            session.add(access_log)
            session.commit()
        except Exception as e:
            logger.error(f"Failed to log SSH key access: {e}")
            session.rollback()

    def _generate_ssh_key(
        self,
        key_type: str = "ed25519",
        key_length: int = 256,
        comment: str = "",
        passphrase: Optional[str] = None,
    ) -> dict[str, Any]:
        """Generate a new SSH key pair."""
        try:
            # Generate private key based on type
            if key_type.lower() == "ed25519":
                private_key = ed25519.Ed25519PrivateKey.generate()
                key_length = 256  # Ed25519 is always 256 bits
            elif key_type.lower() == "rsa":
                private_key = rsa.generate_private_key(
                    public_exponent=65537,
                    key_size=key_length,
                )
            elif key_type.lower() == "ecdsa":
                # Use P-256 curve for ECDSA
                private_key = ec.generate_private_key(ec.SECP256R1())
                key_length = 256
            else:
                raise ValueError(f"Unsupported key type: {key_type}")

            # Serialize private key
            private_pem = private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.OpenSSH,
                encryption_algorithm=(
                    serialization.BestAvailableEncryption(
                        passphrase.encode() if passphrase else b""
                    )
                    if passphrase
                    else serialization.NoEncryption()
                ),
            )

            # Get public key
            public_key = private_key.public_key()

            # Serialize public key in OpenSSH format
            public_ssh = public_key.public_bytes(
                encoding=serialization.Encoding.OpenSSH,
                format=serialization.PublicFormat.OpenSSH,
            )

            # Add comment to public key
            if comment:
                public_ssh_str = f"{public_ssh.decode()} {comment}"
            else:
                public_ssh_str = public_ssh.decode()

            # Generate fingerprint
            fingerprint = self._generate_fingerprint(public_ssh_str)
            key_id = self._generate_key_id(fingerprint)

            return {
                "key_id": key_id,
                "fingerprint": fingerprint,
                "public_key_hash": hashlib.sha256(public_ssh).hexdigest(),
                "public_key_openssh": public_ssh_str,
                "private_key_openssh": private_pem.decode(),
                "key_type": key_type.lower(),
                "key_length": key_length,
                "algorithm": key_type.upper(),
                "comment": comment,
            }

        except Exception as e:
            logger.error(f"SSH key generation failed: {e}")
            raise ValueError(f"Failed to generate SSH key: {e}")

    def _generate_fingerprint(self, public_key_str: str) -> str:
        """Generate SSH key fingerprint."""
        try:
            # Parse the public key
            public_key = load_ssh_public_key(public_key_str.encode())

            # Get the key bytes
            key_bytes = public_key.public_bytes(
                encoding=serialization.Encoding.OpenSSH,
                format=serialization.PublicFormat.OpenSSH,
            )

            # Generate SHA-256 fingerprint
            fingerprint = hashlib.sha256(key_bytes).hexdigest()
            return f"SHA256:{fingerprint[:40]}"  # Truncate to 40 chars for total length of 47

        except Exception as e:
            logger.error(f"Failed to generate fingerprint: {e}")
            # Fallback to simple hash
            return hashlib.sha256(public_key_str.encode()).hexdigest()[:16]

    def _generate_key_id(self, fingerprint: str) -> str:
        """Generate a unique key ID from fingerprint."""
        return hashlib.md5(fingerprint.encode()).hexdigest()[:16]

    def _hash_passphrase(self, passphrase: str) -> str:
        """Hash a passphrase for storage."""
        return hashlib.sha256(passphrase.encode()).hexdigest()

    def _validate_ssh_key(self, public_key_str: str) -> dict[str, Any]:
        """Validate and parse an SSH public key."""
        try:
            # Parse the public key
            public_key = load_ssh_public_key(public_key_str.encode())

            # Get key type
            if isinstance(public_key, rsa.RSAPublicKey):
                key_type = "rsa"
                key_length = public_key.key_size
            elif isinstance(public_key, ed25519.Ed25519PublicKey):
                key_type = "ed25519"
                key_length = 256
            elif isinstance(public_key, ec.EllipticCurvePublicKey):
                key_type = "ecdsa"
                key_length = public_key.curve.key_size
            else:
                key_type = "unknown"
                key_length = 0

            # Generate fingerprint
            fingerprint = self._generate_fingerprint(public_key_str)
            key_id = self._generate_key_id(fingerprint)

            # Parse comment
            parts = public_key_str.strip().split()
            comment = parts[2] if len(parts) > 2 else ""

            return {
                "key_id": key_id,
                "fingerprint": fingerprint,
                "public_key_hash": hashlib.sha256(public_key_str.encode()).hexdigest(),
                "key_type": key_type,
                "key_length": key_length,
                "algorithm": key_type.upper(),
                "comment": comment,
                "public_key_openssh": public_key_str,
            }

        except Exception as e:
            logger.error(f"Failed to validate SSH key: {e}")
            raise ValueError(f"Invalid SSH key format: {e}")

    async def generate_ssh_key(
        self,
        user_id: str,
        name: str,
        email: str,
        key_type: str = "ed25519",
        key_length: int = 256,
        comment: str = "",
        passphrase: Optional[str] = None,
        usage: str = "authentication",
        is_primary: bool = False,
        auto_rotate: bool = False,
        rotation_schedule_days: int = 365,
        allowed_hosts: Optional[list[str]] = None,
        allowed_commands: Optional[list[str]] = None,
        source_restrictions: Optional[list[str]] = None,
        force_command: Optional[str] = None,
        admin_user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> dict[str, Any]:
        """Generate a new SSH key for a user."""
        session = self.session_factory()
        try:
            # Check if user already has a primary key
            if is_primary:
                existing_primary = (
                    session.query(SSHKey)
                    .filter(
                        SSHKey.user_id == user_id,
                        SSHKey.is_primary == True,
                        SSHKey.status == SSHKeyStatus.ACTIVE,
                    )
                    .first()
                )
                if existing_primary:
                    raise ValueError("User already has a primary SSH key")

            # Generate the SSH key
            key_data = self._generate_ssh_key(
                key_type=key_type,
                key_length=key_length,
                comment=comment or f"{name} <{email}>",
                passphrase=passphrase,
            )

            # Create database record
            ssh_key = SSHKey(
                key_id=key_data["key_id"],
                fingerprint=key_data["fingerprint"],
                public_key_hash=key_data["public_key_hash"],
                key_type=SSHKeyType(key_data["key_type"]),
                key_length=key_data["key_length"],
                algorithm=key_data["algorithm"],
                comment=key_data["comment"],
                user_id=user_id,
                email=email,
                name=name,
                public_key_openssh=key_data["public_key_openssh"],
                private_key_openssh=key_data["private_key_openssh"],
                passphrase_hash=(
                    self._hash_passphrase(passphrase) if passphrase else None
                ),
                status=SSHKeyStatus.ACTIVE,
                usage=SSHKeyUsage(usage),
                is_primary=is_primary,
                auto_rotate=auto_rotate,
                rotation_schedule_days=rotation_schedule_days,
                trust_level=0,
                is_revoked=False,
                allowed_hosts=json.dumps(allowed_hosts) if allowed_hosts else None,
                allowed_commands=(
                    json.dumps(allowed_commands) if allowed_commands else None
                ),
                source_restrictions=(
                    json.dumps(source_restrictions) if source_restrictions else None
                ),
                force_command=force_command,
            )

            session.add(ssh_key)
            session.commit()

            # Log the access
            self._log_access(
                session=session,
                key_id=key_data["key_id"],
                user_id=user_id,
                operation="generate",
                success=True,
                admin_action=admin_user_id is not None,
                admin_user_id=admin_user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                request_id=request_id,
            )

            logger.info(f"Generated SSH key {key_data['key_id']} for user {user_id}")

            return ssh_key.to_dict()

        except IntegrityError as e:
            session.rollback()
            error_msg = f"Key already exists: {e}"
            logger.error(error_msg)

            # Log the failed access
            self._log_access(
                session=session,
                key_id=key_data.get("key_id", "unknown"),
                user_id=user_id,
                operation="generate",
                success=False,
                error_message=error_msg,
                admin_action=admin_user_id is not None,
                admin_user_id=admin_user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                request_id=request_id,
            )

            raise ValueError(error_msg)
        except Exception as e:
            session.rollback()
            error_msg = f"Failed to generate SSH key: {e}"
            logger.error(error_msg)

            # Log the failed access
            self._log_access(
                session=session,
                key_id="unknown",
                user_id=user_id,
                operation="generate",
                success=False,
                error_message=error_msg,
                admin_action=admin_user_id is not None,
                admin_user_id=admin_user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                request_id=request_id,
            )

            raise
        finally:
            session.close()

    async def import_ssh_key(
        self,
        user_id: str,
        name: str,
        email: str,
        public_key_str: str,
        private_key_str: Optional[str] = None,
        passphrase: Optional[str] = None,
        usage: str = "authentication",
        is_primary: bool = False,
        admin_user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> dict[str, Any]:
        """Import an existing SSH key for a user."""
        session = self.session_factory()
        try:
            # Validate the public key
            key_data = self._validate_ssh_key(public_key_str)

            # Check if key already exists
            existing_key = (
                session.query(SSHKey)
                .filter(SSHKey.fingerprint == key_data["fingerprint"])
                .first()
            )
            if existing_key:
                raise ValueError("SSH key already exists in database")

            # Create database record
            ssh_key = SSHKey(
                key_id=key_data["key_id"],
                fingerprint=key_data["fingerprint"],
                public_key_hash=key_data["public_key_hash"],
                key_type=SSHKeyType(key_data["key_type"]),
                key_length=key_data["key_length"],
                algorithm=key_data["algorithm"],
                comment=key_data["comment"],
                user_id=user_id,
                email=email,
                name=name,
                public_key_openssh=key_data["public_key_openssh"],
                private_key_openssh=private_key_str,
                passphrase_hash=(
                    self._hash_passphrase(passphrase) if passphrase else None
                ),
                status=SSHKeyStatus.ACTIVE,
                usage=SSHKeyUsage(usage),
                is_primary=is_primary,
                trust_level=0,
                is_revoked=False,
            )

            session.add(ssh_key)
            session.commit()

            # Log the access
            self._log_access(
                session=session,
                key_id=key_data["key_id"],
                user_id=user_id,
                operation="import",
                success=True,
                admin_action=admin_user_id is not None,
                admin_user_id=admin_user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                request_id=request_id,
            )

            logger.info(f"Imported SSH key {key_data['key_id']} for user {user_id}")

            return ssh_key.to_dict()

        except Exception as e:
            session.rollback()
            error_msg = f"Failed to import SSH key: {e}"
            logger.error(error_msg)

            # Log the failed access
            self._log_access(
                session=session,
                key_id="unknown",
                user_id=user_id,
                operation="import",
                success=False,
                error_message=error_msg,
                admin_action=admin_user_id is not None,
                admin_user_id=admin_user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                request_id=request_id,
            )

            raise
        finally:
            session.close()

    async def regenerate_ssh_key(
        self,
        user_id: str,
        old_key_id: str,
        key_type: Optional[str] = None,
        key_length: Optional[int] = None,
        comment: Optional[str] = None,
        passphrase: Optional[str] = None,
        admin_user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> dict[str, Any]:
        """Regenerate an SSH key for a user."""
        session = self.session_factory()
        try:
            # Get the existing key
            old_key = (
                session.query(SSHKey)
                .filter(
                    SSHKey.key_id == old_key_id,
                    SSHKey.user_id == user_id,
                    SSHKey.status == SSHKeyStatus.ACTIVE,
                )
                .first()
            )

            if not old_key:
                raise ValueError(f"SSH key {old_key_id} not found or not active")

            # Use existing values if not provided
            key_type = key_type or old_key.key_type.value
            key_length = key_length or old_key.key_length
            comment = comment or old_key.comment

            # Generate new key
            new_key_data = await self.generate_ssh_key(
                user_id=user_id,
                name=old_key.name,
                email=old_key.email,
                key_type=key_type,
                key_length=key_length,
                comment=comment,
                passphrase=passphrase,
                usage=old_key.usage.value,
                is_primary=old_key.is_primary,
                auto_rotate=old_key.auto_rotate,
                rotation_schedule_days=old_key.rotation_schedule_days,
                admin_user_id=admin_user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                request_id=request_id,
            )

            # Revoke the old key
            old_key.status = SSHKeyStatus.REVOKED
            old_key.is_revoked = True
            old_key.revocation_reason = "Regenerated by user"
            old_key.revoked_at = datetime.now(timezone.utc)
            old_key.revoked_by = admin_user_id or user_id

            # Log the rotation
            rotation_log = SSHKeyRotationLog(
                old_key_id=old_key_id,
                new_key_id=new_key_data["key_id"],
                user_id=user_id,
                rotation_type="manual",
                reason="User requested key regeneration",
                initiated_by=admin_user_id or user_id,
                old_key_revoked=True,
                migration_completed=True,
                completed_at=datetime.now(timezone.utc),
            )
            session.add(rotation_log)

            session.commit()

            # Log the access
            self._log_access(
                session=session,
                key_id=old_key_id,
                user_id=user_id,
                operation="regenerate",
                success=True,
                admin_action=admin_user_id is not None,
                admin_user_id=admin_user_id,
                target_user_id=user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                request_id=request_id,
            )

            logger.info(
                f"Regenerated SSH key {old_key_id} -> {new_key_data['key_id']} for user {user_id}"
            )

            return new_key_data

        except Exception as e:
            session.rollback()
            error_msg = f"Failed to regenerate SSH key: {e}"
            logger.error(error_msg)

            # Log the failed access
            self._log_access(
                session=session,
                key_id=old_key_id,
                user_id=user_id,
                operation="regenerate",
                success=False,
                error_message=error_msg,
                admin_action=admin_user_id is not None,
                admin_user_id=admin_user_id,
                target_user_id=user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                request_id=request_id,
            )

            raise
        finally:
            session.close()

    async def get_user_keys(
        self,
        user_id: str,
        include_revoked: bool = False,
        admin_user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        """Get all SSH keys for a user."""
        session = self.session_factory()
        try:
            query = session.query(SSHKey).filter(SSHKey.user_id == user_id)

            if not include_revoked:
                query = query.filter(SSHKey.status != SSHKeyStatus.REVOKED)

            keys = query.all()
            result = [key.to_dict() for key in keys]

            # Log the access
            self._log_access(
                session=session,
                key_id="multiple",
                user_id=user_id,
                operation="list",
                success=True,
                admin_action=admin_user_id is not None,
                admin_user_id=admin_user_id,
                target_user_id=user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                request_id=request_id,
            )

            return result

        except Exception as e:
            error_msg = f"Failed to get user SSH keys: {e}"
            logger.error(error_msg)

            # Log the failed access
            self._log_access(
                session=session,
                key_id="multiple",
                user_id=user_id,
                operation="list",
                success=False,
                error_message=error_msg,
                admin_action=admin_user_id is not None,
                admin_user_id=admin_user_id,
                target_user_id=user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                request_id=request_id,
            )

            raise
        finally:
            session.close()

    async def revoke_key(
        self,
        user_id: str,
        key_id: str,
        reason: str,
        admin_user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> dict[str, Any]:
        """Revoke an SSH key."""
        session = self.session_factory()
        try:
            key = (
                session.query(SSHKey)
                .filter(
                    SSHKey.key_id == key_id,
                    SSHKey.user_id == user_id,
                    SSHKey.status == SSHKeyStatus.ACTIVE,
                )
                .first()
            )

            if not key:
                raise ValueError(f"SSH key {key_id} not found or not active")

            # Revoke the key
            key.status = SSHKeyStatus.REVOKED
            key.is_revoked = True
            key.revocation_reason = reason
            key.revoked_at = datetime.now(timezone.utc)
            key.revoked_by = admin_user_id or user_id

            session.commit()

            # Log the access
            self._log_access(
                session=session,
                key_id=key_id,
                user_id=user_id,
                operation="revoke",
                success=True,
                admin_action=admin_user_id is not None,
                admin_user_id=admin_user_id,
                target_user_id=user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                request_id=request_id,
            )

            logger.info(f"Revoked SSH key {key_id} for user {user_id}")

            return key.to_dict()

        except Exception as e:
            session.rollback()
            error_msg = f"Failed to revoke SSH key: {e}"
            logger.error(error_msg)

            # Log the failed access
            self._log_access(
                session=session,
                key_id=key_id,
                user_id=user_id,
                operation="revoke",
                success=False,
                error_message=error_msg,
                admin_action=admin_user_id is not None,
                admin_user_id=admin_user_id,
                target_user_id=user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                request_id=request_id,
            )

            raise
        finally:
            session.close()

    async def get_key_by_fingerprint(
        self,
        fingerprint: str,
        include_private: bool = False,
        user_id: Optional[str] = None,
        admin_user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> Optional[dict[str, Any]]:
        """Get an SSH key by fingerprint."""
        session = self.session_factory()
        try:
            key = (
                session.query(SSHKey)
                .filter(
                    SSHKey.fingerprint == fingerprint,
                    SSHKey.status == SSHKeyStatus.ACTIVE,
                )
                .first()
            )

            if not key:
                return None

            # Check permissions
            if user_id and key.user_id != user_id and not admin_user_id:
                raise ValueError("Access denied: not your key")

            # Update usage statistics
            key.last_used = datetime.now(timezone.utc)
            key.usage_count += 1
            session.commit()

            result = key.to_dict()

            # Remove private key if not requested or not authorized
            if not include_private or (
                user_id and key.user_id != user_id and not admin_user_id
            ):
                result.pop("private_key_openssh", None)

            # Log the access
            self._log_access(
                session=session,
                key_id=key.key_id,
                user_id=key.user_id,
                operation="export",
                success=True,
                admin_action=admin_user_id is not None,
                admin_user_id=admin_user_id,
                target_user_id=key.user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                request_id=request_id,
            )

            return result

        except Exception as e:
            error_msg = f"Failed to get SSH key by fingerprint: {e}"
            logger.error(error_msg)

            # Log the failed access
            self._log_access(
                session=session,
                key_id="unknown",
                user_id=user_id or "unknown",
                operation="export",
                success=False,
                error_message=error_msg,
                admin_action=admin_user_id is not None,
                admin_user_id=admin_user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                request_id=request_id,
            )

            raise
        finally:
            session.close()


# Global service instance
ssh_key_service = SSHKeyService()
