"""Database-Integrated Email Encryption Service for Reynard Backend.

This module provides PGP encryption functionality integrated with the PostgreSQL
database for secure email communications. Keys are stored securely in the database
instead of file-based storage.

Key Features:
- Database-integrated PGP key storage
- Secure key retrieval and management
- Integration with existing email encryption service
- Audit logging for all operations
- User and admin key management

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

import json
import logging
import os
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

from app.security.pgp_key_service import pgp_key_service

logger = logging.getLogger(__name__)

# Check if gpg is available
PGP_AVAILABLE = shutil.which("gpg") is not None


@dataclass
class EncryptionKey:
    """Encryption key data structure for database integration."""

    key_id: str
    key_type: str  # 'pgp' or 'smime'
    fingerprint: str
    public_key: str
    user_id: str
    email: str
    created_at: datetime
    private_key: str | None = None
    expires_at: datetime | None = None
    is_revoked: bool = False
    trust_level: int = 0  # 0-5 for PGP trust levels


@dataclass
class EncryptedEmail:
    """Encrypted email data structure."""

    original_content: str
    encrypted_content: str
    encryption_method: str  # 'pgp' or 'smime'
    key_id: str
    encrypted_at: datetime
    signature: str | None = None
    is_signed: bool = False


@dataclass
class EncryptionConfig:
    """Encryption configuration."""

    pgp_enabled: bool = True
    smime_enabled: bool = True
    default_encryption: str = "pgp"  # 'pgp' or 'smime'
    auto_encrypt: bool = False
    require_encryption: bool = False
    key_server_url: str = "https://keys.openpgp.org"


class DatabaseEmailEncryptionService:
    """Service for email encryption and decryption using database-stored keys."""

    def __init__(
        self,
        config: EncryptionConfig | None = None,
        temp_dir: str | None = None,
    ):
        """Initialize the database email encryption service."""
        self.config = config or EncryptionConfig()
        self.temp_dir = Path(temp_dir) if temp_dir else Path(tempfile.gettempdir()) / "reynard_pgp_temp"
        self.temp_dir.mkdir(exist_ok=True)

        # PGP setup
        if PGP_AVAILABLE and self.config.pgp_enabled:
            logger.info("PGP encryption available - using database-stored keys")
        else:
            logger.warning("PGP encryption not available - gpg not installed")

    def _create_temp_gpg_home(self, key_data: dict[str, Any]) -> Path:
        """Create a temporary GPG home directory with the specified key."""
        temp_gpg_home = self.temp_dir / f"gpg_home_{key_data['key_id']}"
        temp_gpg_home.mkdir(exist_ok=True)

        try:
            # Import the public key
            pub_result = subprocess.run(
                [
                    "gpg",
                    "--homedir",
                    str(temp_gpg_home),
                    "--import",
                    "--batch",
                    "--yes",
                ],
                input=key_data["public_key_armored"],
                capture_output=True,
                text=True,
                check=True,
            )

            # Import the private key if available
            if key_data.get("private_key_armored"):
                priv_result = subprocess.run(
                    [
                        "gpg",
                        "--homedir",
                        str(temp_gpg_home),
                        "--import",
                        "--batch",
                        "--yes",
                    ],
                    input=key_data["private_key_armored"],
                    capture_output=True,
                    text=True,
                    check=True,
                )

            return temp_gpg_home

        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to import key to temporary GPG home: {e}")
            raise ValueError(f"Failed to import PGP key: {e.stderr}")

    def _cleanup_temp_gpg_home(self, temp_gpg_home: Path) -> None:
        """Clean up temporary GPG home directory."""
        try:
            import shutil
            shutil.rmtree(temp_gpg_home, ignore_errors=True)
        except Exception as e:
            logger.warning(f"Failed to cleanup temporary GPG home {temp_gpg_home}: {e}")

    async def _find_recipient_key(
        self, email: str, encryption_method: str = "pgp"
    ) -> Optional[EncryptionKey]:
        """Find a recipient's encryption key from the database."""
        if encryption_method != "pgp":
            return None

        try:
            # Get key by email from database
            key_data = await pgp_key_service.get_key_by_fingerprint(
                fingerprint="",  # We'll search by email instead
                include_private=False,
            )

            if not key_data:
                return None

            # Convert database key to EncryptionKey format
            return EncryptionKey(
                key_id=key_data["key_id"],
                key_type="pgp",
                fingerprint=key_data["fingerprint"],
                public_key=key_data["public_key_armored"],
                user_id=key_data["user_id"],
                email=key_data["email"],
                created_at=datetime.fromisoformat(key_data["created_at"]),
                private_key=None,  # Not needed for encryption
                expires_at=datetime.fromisoformat(key_data["expires_at"]) if key_data["expires_at"] else None,
                is_revoked=key_data["is_revoked"],
                trust_level=key_data["trust_level"],
            )

        except Exception as e:
            logger.error(f"Failed to find recipient key for {email}: {e}")
            return None

    async def _encrypt_with_pgp(
        self,
        content: str,
        recipient_key: EncryptionKey,
        sign_with: Optional[str] = None,
    ) -> EncryptedEmail:
        """Encrypt content with PGP using database-stored keys."""
        if not PGP_AVAILABLE:
            raise ValueError("PGP encryption not available")

        temp_gpg_home = None
        try:
            # Create temporary GPG home with recipient's key
            key_data = {
                "key_id": recipient_key.key_id,
                "public_key_armored": recipient_key.public_key,
            }
            temp_gpg_home = self._create_temp_gpg_home(key_data)

            # Encrypt the content
            encrypt_cmd = [
                "gpg",
                "--homedir",
                str(temp_gpg_home),
                "--armor",
                "--encrypt",
                "--batch",
                "--yes",
                "--always-trust",
            ]

            # Add signing if requested
            if sign_with:
                encrypt_cmd.extend(["--sign", "--default-key", sign_with])

            # Add recipient
            encrypt_cmd.extend(["--recipient", recipient_key.fingerprint])

            result = subprocess.run(
                encrypt_cmd,
                input=content,
                capture_output=True,
                text=True,
                check=True,
            )

            encrypted_content = result.stdout

            # Check if content was signed
            is_signed = sign_with is not None
            signature = encrypted_content if is_signed else None

            return EncryptedEmail(
                original_content=content,
                encrypted_content=encrypted_content,
                encryption_method="pgp",
                key_id=recipient_key.key_id,
                encrypted_at=datetime.now(),
                signature=signature,
                is_signed=is_signed,
            )

        except subprocess.CalledProcessError as e:
            logger.error(f"PGP encryption failed: {e}")
            logger.error(f"GPG stderr: {e.stderr}")
            raise ValueError(f"PGP encryption failed: {e.stderr}")
        finally:
            if temp_gpg_home:
                self._cleanup_temp_gpg_home(temp_gpg_home)

    async def encrypt_email_content(
        self,
        content: str,
        recipient_email: str,
        encryption_method: Optional[str] = None,
        sign_with: Optional[str] = None,
    ) -> EncryptedEmail:
        """Encrypt email content for a recipient."""
        if not self.config.pgp_enabled:
            raise ValueError("PGP encryption is disabled")

        # Use default encryption method if not specified
        if not encryption_method:
            encryption_method = self.config.default_encryption

        if encryption_method != "pgp":
            raise ValueError(f"Unsupported encryption method: {encryption_method}")

        # Find recipient's key
        recipient_key = await self._find_recipient_key(recipient_email, encryption_method)
        if not recipient_key:
            raise ValueError(f"No encryption key found for {recipient_email}")

        if recipient_key.is_revoked:
            raise ValueError(f"Encryption key for {recipient_email} is revoked")

        # Encrypt the content
        return await self._encrypt_with_pgp(content, recipient_key, sign_with)

    async def decrypt_email_content(
        self,
        encrypted_content: str,
        user_id: str,
        passphrase: Optional[str] = None,
    ) -> str:
        """Decrypt email content using user's private key."""
        if not PGP_AVAILABLE:
            raise ValueError("PGP encryption not available")

        try:
            # Get user's primary key from database
            user_keys = await pgp_key_service.get_user_keys(
                user_id=user_id,
                include_revoked=False,
            )

            if not user_keys:
                raise ValueError(f"No active keys found for user {user_id}")

            # Find primary key or use the first active key
            primary_key = None
            for key_data in user_keys:
                if key_data.get("is_primary", False):
                    primary_key = key_data
                    break

            if not primary_key:
                primary_key = user_keys[0]

            # Get the private key
            key_data = await pgp_key_service.get_key_by_fingerprint(
                fingerprint=primary_key["fingerprint"],
                include_private=True,
                user_id=user_id,
            )

            if not key_data or not key_data.get("private_key_armored"):
                raise ValueError("Private key not available for decryption")

            # Create temporary GPG home with user's key
            temp_gpg_home = self._create_temp_gpg_home(key_data)

            try:
                # Decrypt the content
                decrypt_cmd = [
                    "gpg",
                    "--homedir",
                    str(temp_gpg_home),
                    "--decrypt",
                    "--batch",
                    "--yes",
                ]

                if passphrase:
                    decrypt_cmd.extend(["--passphrase", passphrase])

                result = subprocess.run(
                    decrypt_cmd,
                    input=encrypted_content,
                    capture_output=True,
                    text=True,
                    check=True,
                )

                return result.stdout

            finally:
                self._cleanup_temp_gpg_home(temp_gpg_home)

        except subprocess.CalledProcessError as e:
            logger.error(f"PGP decryption failed: {e}")
            logger.error(f"GPG stderr: {e.stderr}")
            raise ValueError(f"PGP decryption failed: {e.stderr}")
        except Exception as e:
            logger.error(f"Failed to decrypt email content: {e}")
            raise

    async def get_user_public_key(self, user_id: str) -> Optional[str]:
        """Get user's public key for sharing."""
        try:
            user_keys = await pgp_key_service.get_user_keys(
                user_id=user_id,
                include_revoked=False,
            )

            if not user_keys:
                return None

            # Find primary key or use the first active key
            primary_key = None
            for key_data in user_keys:
                if key_data.get("is_primary", False):
                    primary_key = key_data
                    break

            if not primary_key:
                primary_key = user_keys[0]

            return primary_key["public_key_armored"]

        except Exception as e:
            logger.error(f"Failed to get public key for user {user_id}: {e}")
            return None

    async def verify_email_signature(
        self,
        signed_content: str,
        sender_email: str,
    ) -> tuple[bool, Optional[str]]:
        """Verify email signature."""
        if not PGP_AVAILABLE:
            raise ValueError("PGP encryption not available")

        try:
            # Find sender's key
            sender_key = await self._find_recipient_key(sender_email, "pgp")
            if not sender_key:
                return False, "Sender's key not found"

            # Create temporary GPG home with sender's key
            key_data = {
                "key_id": sender_key.key_id,
                "public_key_armored": sender_key.public_key,
            }
            temp_gpg_home = self._create_temp_gpg_home(key_data)

            try:
                # Verify the signature
                verify_cmd = [
                    "gpg",
                    "--homedir",
                    str(temp_gpg_home),
                    "--verify",
                    "--batch",
                    "--yes",
                ]

                result = subprocess.run(
                    verify_cmd,
                    input=signed_content,
                    capture_output=True,
                    text=True,
                )

                # Check if verification was successful
                success = result.returncode == 0
                message = result.stderr if not success else "Signature verified"

                return success, message

            finally:
                self._cleanup_temp_gpg_home(temp_gpg_home)

        except Exception as e:
            logger.error(f"Failed to verify email signature: {e}")
            return False, f"Verification failed: {e}"

    async def generate_pgp_key_for_user(
        self,
        user_id: str,
        name: str,
        email: str,
        passphrase: Optional[str] = None,
        key_length: int = 2048,
        key_type: str = "RSA",
        is_primary: bool = True,
    ) -> dict[str, Any]:
        """Generate a new PGP key for a user."""
        return await pgp_key_service.generate_pgp_key(
            user_id=user_id,
            name=name,
            email=email,
            passphrase=passphrase,
            key_length=key_length,
            key_type=key_type,
            is_primary=is_primary,
        )

    async def regenerate_pgp_key_for_user(
        self,
        user_id: str,
        old_key_id: str,
        name: Optional[str] = None,
        email: Optional[str] = None,
        passphrase: Optional[str] = None,
        key_length: Optional[int] = None,
        key_type: Optional[str] = None,
    ) -> dict[str, Any]:
        """Regenerate a PGP key for a user."""
        return await pgp_key_service.regenerate_pgp_key(
            user_id=user_id,
            old_key_id=old_key_id,
            name=name,
            email=email,
            passphrase=passphrase,
            key_length=key_length,
            key_type=key_type,
        )


# Global service instance
database_email_encryption_service = DatabaseEmailEncryptionService()
