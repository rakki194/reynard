"""🔐 PGP Key Service for Reynard Backend

Service for managing PGP keys with PostgreSQL database integration.
This service provides secure PGP key generation, storage, and management
integrated with the Gatekeeper authentication system.

Key Features:
- Secure PGP key generation and storage
- Database integration with audit logging
- User and admin key management
- Key rotation and lifecycle management
- Integration with email encryption service

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

import hashlib
import logging
import os
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional
from uuid import uuid4

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from .pgp_key_models import (
    AuthSessionLocal,
    PGPKey,
    PGPKeyAccessLog,
    PGPKeyRotationLog,
    PGPKeyStatus,
    PGPKeyType,
)

logger = logging.getLogger(__name__)


class PGPKeyService:
    """Service for managing PGP keys with database integration."""

    def __init__(self):
        """Initialize the PGP key service."""
        self.session_factory = AuthSessionLocal
        self.temp_dir = Path(tempfile.gettempdir()) / "reynard_pgp_keys"
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
    ) -> None:
        """Log key access for audit purposes."""
        try:
            access_log = PGPKeyAccessLog(
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
            )
            session.add(access_log)
            session.commit()
        except Exception as e:
            logger.error(f"Failed to log key access: {e}")
            session.rollback()

    def _generate_gpg_key(
        self,
        name: str,
        email: str,
        passphrase: Optional[str] = None,
        key_length: int = 2048,
        key_type: str = "RSA",
    ) -> dict[str, Any]:
        """Generate a new PGP key using gpg command line."""
        try:
            # Create temporary directory for this key generation
            temp_key_dir = self.temp_dir / f"keygen_{uuid4().hex[:8]}"
            temp_key_dir.mkdir(exist_ok=True)

            # Set up GPG batch input
            key_input = f"""Key-Type: {key_type}
Key-Length: {key_length}
Name-Real: {name}
Name-Email: {email}
Expire-Date: 0
%no-protection
%commit
"""

            # Generate the key
            result = subprocess.run(
                ["gpg", "--homedir", str(temp_key_dir), "--gen-key", "--batch"],
                input=key_input,
                capture_output=True,
                text=True,
                check=True,
            )

            # Get the key information
            list_result = subprocess.run(
                ["gpg", "--homedir", str(temp_key_dir), "--list-keys", "--with-colons"],
                capture_output=True,
                text=True,
                check=True,
            )

            # Parse key information
            key_info = self._parse_gpg_key_info(list_result.stdout, email)
            if not key_info:
                raise ValueError("Failed to parse generated key information")

            # Export public key
            pub_result = subprocess.run(
                [
                    "gpg",
                    "--homedir",
                    str(temp_key_dir),
                    "--armor",
                    "--export",
                    key_info["fingerprint"],
                ],
                capture_output=True,
                text=True,
                check=True,
            )

            # Export private key
            priv_result = subprocess.run(
                [
                    "gpg",
                    "--homedir",
                    str(temp_key_dir),
                    "--armor",
                    "--export-secret-keys",
                    key_info["fingerprint"],
                ],
                capture_output=True,
                text=True,
                check=True,
            )

            # Clean up temporary directory
            import shutil
            shutil.rmtree(temp_key_dir, ignore_errors=True)

            return {
                "key_id": key_info["key_id"],
                "fingerprint": key_info["fingerprint"],
                "short_fingerprint": key_info["short_fingerprint"],
                "public_key_armored": pub_result.stdout,
                "private_key_armored": priv_result.stdout,
                "key_type": key_type,
                "key_length": key_length,
                "algorithm": key_info.get("algorithm", f"{key_type}{key_length}"),
            }

        except subprocess.CalledProcessError as e:
            logger.error(f"GPG key generation failed: {e}")
            logger.error(f"GPG stderr: {e.stderr}")
            raise ValueError(f"Failed to generate PGP key: {e.stderr}")
        except Exception as e:
            logger.error(f"Unexpected error during key generation: {e}")
            raise

    def _parse_gpg_key_info(self, gpg_output: str, email: str) -> Optional[dict[str, Any]]:
        """Parse GPG key information from gpg --list-keys --with-colons output."""
        try:
            lines = gpg_output.strip().split("\n")
            key_info = {}

            for line in lines:
                if line.startswith("pub:"):
                    parts = line.split(":")
                    if len(parts) >= 5:
                        key_info["algorithm"] = parts[3]
                        key_info["key_length"] = int(parts[2]) if parts[2] else 0
                elif line.startswith("fpr:"):
                    parts = line.split(":")
                    if len(parts) >= 10:
                        fingerprint = parts[9]
                        key_info["fingerprint"] = fingerprint
                        key_info["short_fingerprint"] = fingerprint[-8:]
                        key_info["key_id"] = fingerprint[-16:]
                elif line.startswith("uid:"):
                    parts = line.split(":")
                    if len(parts) >= 10 and email in parts[9]:
                        # Found the matching UID
                        break

            if "fingerprint" in key_info and "key_id" in key_info:
                return key_info
            return None

        except Exception as e:
            logger.error(f"Failed to parse GPG key info: {e}")
            return None

    def _hash_passphrase(self, passphrase: str) -> str:
        """Hash a passphrase for storage."""
        return hashlib.sha256(passphrase.encode()).hexdigest()

    async def generate_pgp_key(
        self,
        user_id: str,
        name: str,
        email: str,
        passphrase: Optional[str] = None,
        key_length: int = 2048,
        key_type: str = "RSA",
        is_primary: bool = False,
        auto_rotate: bool = False,
        rotation_schedule_days: int = 365,
        admin_user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> dict[str, Any]:
        """Generate a new PGP key for a user."""
        session = self.session_factory()
        try:
            # Check if user already has a primary key
            if is_primary:
                existing_primary = (
                    session.query(PGPKey)
                    .filter(
                        PGPKey.user_id == user_id,
                        PGPKey.is_primary == True,
                        PGPKey.status == PGPKeyStatus.ACTIVE,
                    )
                    .first()
                )
                if existing_primary:
                    raise ValueError("User already has a primary PGP key")

            # Generate the PGP key
            key_data = self._generate_gpg_key(
                name=name,
                email=email,
                passphrase=passphrase,
                key_length=key_length,
                key_type=key_type,
            )

            # Create database record
            pgp_key = PGPKey(
                key_id=key_data["key_id"],
                fingerprint=key_data["fingerprint"],
                short_fingerprint=key_data["short_fingerprint"],
                key_type=PGPKeyType(key_type.lower()),
                key_length=key_data["key_length"],
                algorithm=key_data["algorithm"],
                user_id=user_id,
                email=email,
                name=name,
                public_key_armored=key_data["public_key_armored"],
                private_key_armored=key_data["private_key_armored"],
                passphrase_hash=self._hash_passphrase(passphrase) if passphrase else None,
                status=PGPKeyStatus.ACTIVE,
                is_primary=is_primary,
                auto_rotate=auto_rotate,
                rotation_schedule_days=rotation_schedule_days,
                trust_level=0,
                is_revoked=False,
            )

            session.add(pgp_key)
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

            logger.info(f"Generated PGP key {key_data['key_id']} for user {user_id}")

            return pgp_key.to_dict()

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
            error_msg = f"Failed to generate PGP key: {e}"
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

    async def regenerate_pgp_key(
        self,
        user_id: str,
        old_key_id: str,
        name: Optional[str] = None,
        email: Optional[str] = None,
        passphrase: Optional[str] = None,
        key_length: Optional[int] = None,
        key_type: Optional[str] = None,
        admin_user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> dict[str, Any]:
        """Regenerate a PGP key for a user."""
        session = self.session_factory()
        try:
            # Get the existing key
            old_key = (
                session.query(PGPKey)
                .filter(
                    PGPKey.key_id == old_key_id,
                    PGPKey.user_id == user_id,
                    PGPKey.status == PGPKeyStatus.ACTIVE,
                )
                .first()
            )

            if not old_key:
                raise ValueError(f"Key {old_key_id} not found or not active")

            # Use existing values if not provided
            name = name or old_key.name
            email = email or old_key.email
            key_length = key_length or old_key.key_length
            key_type = key_type or old_key.key_type.value.upper()

            # Store old key properties before revoking
            was_primary = old_key.is_primary
            auto_rotate = old_key.auto_rotate
            rotation_schedule_days = old_key.rotation_schedule_days

            # Revoke the old key first to avoid primary key conflict
            old_key.status = PGPKeyStatus.REVOKED
            old_key.is_revoked = True
            old_key.revocation_reason = "Regenerated by user"
            old_key.revoked_at = datetime.now(timezone.utc)
            old_key.revoked_by = admin_user_id or user_id
            old_key.is_primary = False

            # Commit the revocation first
            session.commit()

            # Generate new key
            new_key_data = await self.generate_pgp_key(
                user_id=user_id,
                name=name,
                email=email,
                passphrase=passphrase,
                key_length=key_length,
                key_type=key_type,
                is_primary=was_primary,
                auto_rotate=auto_rotate,
                rotation_schedule_days=rotation_schedule_days,
                admin_user_id=admin_user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                request_id=request_id,
            )

            # Log the rotation
            rotation_log = PGPKeyRotationLog(
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

            logger.info(f"Regenerated PGP key {old_key_id} -> {new_key_data['key_id']} for user {user_id}")

            return new_key_data

        except Exception as e:
            session.rollback()
            error_msg = f"Failed to regenerate PGP key: {e}"
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
        """Get all PGP keys for a user."""
        session = self.session_factory()
        try:
            query = session.query(PGPKey).filter(PGPKey.user_id == user_id)
            
            if not include_revoked:
                query = query.filter(PGPKey.status != PGPKeyStatus.REVOKED)

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
            error_msg = f"Failed to get user keys: {e}"
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
        """Revoke a PGP key."""
        session = self.session_factory()
        try:
            key = (
                session.query(PGPKey)
                .filter(
                    PGPKey.key_id == key_id,
                    PGPKey.user_id == user_id,
                    PGPKey.status == PGPKeyStatus.ACTIVE,
                )
                .first()
            )

            if not key:
                raise ValueError(f"Key {key_id} not found or not active")

            # Revoke the key
            key.status = PGPKeyStatus.REVOKED
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

            logger.info(f"Revoked PGP key {key_id} for user {user_id}")

            return key.to_dict()

        except Exception as e:
            session.rollback()
            error_msg = f"Failed to revoke PGP key: {e}"
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
        """Get a PGP key by fingerprint."""
        session = self.session_factory()
        try:
            key = (
                session.query(PGPKey)
                .filter(
                    PGPKey.fingerprint == fingerprint,
                    PGPKey.status == PGPKeyStatus.ACTIVE,
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
            if not include_private or (user_id and key.user_id != user_id and not admin_user_id):
                result.pop("private_key_armored", None)

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
            error_msg = f"Failed to get key by fingerprint: {e}"
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
pgp_key_service = PGPKeyService()
