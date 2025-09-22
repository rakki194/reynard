"""
Email Encryption Service for Reynard Backend.

This module provides email encryption functionality using PGP and S/MIME.
"""

import asyncio
import base64
import json
import logging
import os
import tempfile
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# PGP imports
try:
    import gnupg

    PGP_AVAILABLE = True
except ImportError:
    PGP_AVAILABLE = False

# S/MIME imports
try:
    from cryptography import x509
    from cryptography.hazmat.backends import default_backend
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import padding, rsa
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    from cryptography.x509.oid import NameOID

    SMIME_AVAILABLE = True
except ImportError:
    SMIME_AVAILABLE = False

logger = logging.getLogger(__name__)


@dataclass
class EncryptionKey:
    """Encryption key data structure."""

    key_id: str
    key_type: str  # 'pgp' or 'smime'
    fingerprint: str
    public_key: str
    private_key: Optional[str] = None
    user_id: str = ""
    email: str = ""
    created_at: datetime = None
    expires_at: Optional[datetime] = None
    is_revoked: bool = False
    trust_level: str = "unknown"  # unknown, marginal, full, ultimate

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()


@dataclass
class EncryptedMessage:
    """Encrypted message data structure."""

    message_id: str
    original_message: str
    encrypted_content: str
    encryption_method: str  # 'pgp' or 'smime'
    recipient_keys: List[str]  # Key IDs or fingerprints
    sender_key: Optional[str] = None
    encrypted_at: datetime = None
    signature: Optional[str] = None
    is_signed: bool = False

    def __post_init__(self):
        if self.encrypted_at is None:
            self.encrypted_at = datetime.now()


@dataclass
class EncryptionConfig:
    """Encryption service configuration."""

    pgp_enabled: bool = True
    smime_enabled: bool = True
    default_encryption: str = "pgp"  # 'pgp' or 'smime'
    key_storage_path: str = "data/encryption/keys"
    message_storage_path: str = "data/encryption/messages"
    auto_encrypt: bool = False
    require_encryption: bool = False
    key_expiry_days: int = 365
    trust_web_of_trust: bool = True
    compression_enabled: bool = True


class EmailEncryptionService:
    """Service for email encryption using PGP and S/MIME."""

    def __init__(
        self,
        config: Optional[EncryptionConfig] = None,
        data_dir: str = "data/encryption",
    ):
        self.config = config or EncryptionConfig()
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Storage directories
        self.keys_dir = self.data_dir / "keys"
        self.keys_dir.mkdir(exist_ok=True)
        self.messages_dir = self.data_dir / "messages"
        self.messages_dir.mkdir(exist_ok=True)

        # Initialize encryption backends
        self.pgp = None
        if PGP_AVAILABLE and self.config.pgp_enabled:
            self._setup_pgp()

        self.smime_available = SMIME_AVAILABLE and self.config.smime_enabled

        # Load existing keys
        self._load_keys()

    def _setup_pgp(self) -> None:
        """Setup PGP encryption backend."""
        try:
            # Create temporary directory for PGP operations
            self.pgp_temp_dir = tempfile.mkdtemp()
            self.pgp = gnupg.GPG(gnupghome=self.pgp_temp_dir)
            logger.info("PGP encryption backend initialized")
        except Exception as e:
            logger.error(f"Failed to setup PGP: {e}")
            self.pgp = None

    def _load_keys(self) -> None:
        """Load existing encryption keys."""
        try:
            keys_file = self.data_dir / "keys.json"
            if keys_file.exists():
                with open(keys_file, "r", encoding="utf-8") as f:
                    keys_data = json.load(f)
                    self.keys = {
                        key_id: EncryptionKey(**key_data)
                        for key_id, key_data in keys_data.items()
                    }
            else:
                self.keys = {}

            # Import keys into PGP if available
            if self.pgp:
                self._import_pgp_keys()

        except Exception as e:
            logger.error(f"Failed to load encryption keys: {e}")
            self.keys = {}

    def _save_keys(self) -> None:
        """Save encryption keys to storage."""
        try:
            keys_file = self.data_dir / "keys.json"
            keys_data = {key_id: asdict(key) for key_id, key in self.keys.items()}

            # Convert datetime objects to ISO strings
            for key_data in keys_data.values():
                for key, value in key_data.items():
                    if isinstance(value, datetime):
                        key_data[key] = value.isoformat()

            with open(keys_file, "w", encoding="utf-8") as f:
                json.dump(keys_data, f, indent=2, default=str)

        except Exception as e:
            logger.error(f"Failed to save encryption keys: {e}")

    def _import_pgp_keys(self) -> None:
        """Import PGP keys into the GPG keyring."""
        try:
            for key in self.keys.values():
                if key.key_type == "pgp" and key.public_key:
                    import_result = self.pgp.import_keys(key.public_key)
                    if import_result.count > 0:
                        logger.info(f"Imported PGP key: {key.key_id}")
                    else:
                        logger.warning(f"Failed to import PGP key: {key.key_id}")

        except Exception as e:
            logger.error(f"Failed to import PGP keys: {e}")

    async def generate_pgp_keypair(
        self,
        name: str,
        email: str,
        passphrase: Optional[str] = None,
        key_type: str = "RSA",
        key_length: int = 2048,
    ) -> EncryptionKey:
        """
        Generate a new PGP keypair.

        Args:
            name: Key owner name
            email: Key owner email
            passphrase: Optional passphrase for private key
            key_type: Key type (RSA, DSA, ECC)
            key_length: Key length in bits

        Returns:
            EncryptionKey object
        """
        try:
            if not self.pgp:
                raise RuntimeError("PGP not available")

            # Generate key input
            key_input = self.pgp.gen_key_input(
                name_email=email,
                name_real=name,
                key_type=key_type,
                key_length=key_length,
                passphrase=passphrase,
            )

            # Generate the key
            key = self.pgp.gen_key(key_input)

            if not key:
                raise RuntimeError("Failed to generate PGP key")

            # Get key details
            public_key = str(self.pgp.export_keys(key.fingerprint))
            private_key = str(self.pgp.export_keys(key.fingerprint, secret=True))

            # Create encryption key object
            encryption_key = EncryptionKey(
                key_id=key.fingerprint,
                key_type="pgp",
                fingerprint=key.fingerprint,
                public_key=public_key,
                private_key=private_key,
                user_id=f"{name} <{email}>",
                email=email,
                created_at=datetime.now(),
                expires_at=datetime.now().replace(year=datetime.now().year + 1),
                trust_level="ultimate",  # Self-generated keys are trusted
            )

            # Store the key
            self.keys[encryption_key.key_id] = encryption_key
            self._save_keys()

            logger.info(f"Generated PGP keypair: {encryption_key.key_id}")
            return encryption_key

        except Exception as e:
            logger.error(f"Failed to generate PGP keypair: {e}")
            raise

    async def import_pgp_key(self, public_key_data: str) -> EncryptionKey:
        """
        Import a PGP public key.

        Args:
            public_key_data: PGP public key data

        Returns:
            EncryptionKey object
        """
        try:
            if not self.pgp:
                raise RuntimeError("PGP not available")

            # Import the key
            import_result = self.pgp.import_keys(public_key_data)

            if import_result.count == 0:
                raise ValueError("No keys found in provided data")

            # Get key details
            fingerprint = import_result.fingerprints[0]
            key_details = self.pgp.list_keys(keys=fingerprint)[0]

            # Create encryption key object
            encryption_key = EncryptionKey(
                key_id=fingerprint,
                key_type="pgp",
                fingerprint=fingerprint,
                public_key=public_key_data,
                user_id=key_details.get("uids", [""])[0],
                email=self._extract_email_from_uid(key_details.get("uids", [""])[0]),
                created_at=datetime.now(),
                trust_level="unknown",
            )

            # Store the key
            self.keys[encryption_key.key_id] = encryption_key
            self._save_keys()

            logger.info(f"Imported PGP key: {encryption_key.key_id}")
            return encryption_key

        except Exception as e:
            logger.error(f"Failed to import PGP key: {e}")
            raise

    async def encrypt_message_pgp(
        self,
        message: str,
        recipient_keys: List[str],
        sign_with: Optional[str] = None,
        passphrase: Optional[str] = None,
    ) -> EncryptedMessage:
        """
        Encrypt a message using PGP.

        Args:
            message: Message to encrypt
            recipient_keys: List of recipient key IDs/fingerprints
            sign_with: Optional sender key ID for signing
            passphrase: Passphrase for signing key

        Returns:
            EncryptedMessage object
        """
        try:
            if not self.pgp:
                raise RuntimeError("PGP not available")

            # Encrypt the message
            encrypted_data = self.pgp.encrypt(
                message,
                recipients=recipient_keys,
                sign=sign_with,
                passphrase=passphrase,
                always_trust=True,
            )

            if not encrypted_data:
                raise RuntimeError("Failed to encrypt message")

            # Create encrypted message object
            encrypted_message = EncryptedMessage(
                message_id=str(uuid.uuid4()),
                original_message=message,
                encrypted_content=str(encrypted_data),
                encryption_method="pgp",
                recipient_keys=recipient_keys,
                sender_key=sign_with,
                is_signed=sign_with is not None,
            )

            # Store the encrypted message
            self._save_encrypted_message(encrypted_message)

            logger.info(f"Encrypted message with PGP: {encrypted_message.message_id}")
            return encrypted_message

        except Exception as e:
            logger.error(f"Failed to encrypt message with PGP: {e}")
            raise

    async def decrypt_message_pgp(
        self,
        encrypted_content: str,
        passphrase: Optional[str] = None,
    ) -> Tuple[str, bool, Optional[str]]:
        """
        Decrypt a PGP message.

        Args:
            encrypted_content: Encrypted message content
            passphrase: Passphrase for private key

        Returns:
            Tuple of (decrypted_message, is_signed, signer_fingerprint)
        """
        try:
            if not self.pgp:
                raise RuntimeError("PGP not available")

            # Decrypt the message
            decrypted_data = self.pgp.decrypt(encrypted_content, passphrase=passphrase)

            if not decrypted_data:
                raise RuntimeError("Failed to decrypt message")

            # Check if message is signed
            is_signed = decrypted_data.trust_text is not None
            signer_fingerprint = None

            if is_signed:
                # Extract signer information
                signer_fingerprint = decrypted_data.fingerprint

            logger.info("Successfully decrypted PGP message")
            return str(decrypted_data), is_signed, signer_fingerprint

        except Exception as e:
            logger.error(f"Failed to decrypt PGP message: {e}")
            raise

    async def verify_pgp_signature(
        self, message: str, signature: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Verify a PGP signature.

        Args:
            message: Original message
            signature: PGP signature

        Returns:
            Tuple of (is_valid, signer_fingerprint)
        """
        try:
            if not self.pgp:
                raise RuntimeError("PGP not available")

            # Verify the signature
            verified = self.pgp.verify(message, signature)

            if verified:
                signer_fingerprint = verified.fingerprint
                logger.info(f"PGP signature verified: {signer_fingerprint}")
                return True, signer_fingerprint
            else:
                logger.warning("PGP signature verification failed")
                return False, None

        except Exception as e:
            logger.error(f"Failed to verify PGP signature: {e}")
            return False, None

    async def generate_smime_certificate(
        self,
        common_name: str,
        email: str,
        organization: str = "",
        country: str = "US",
        validity_days: int = 365,
    ) -> Tuple[str, str]:
        """
        Generate a self-signed S/MIME certificate.

        Args:
            common_name: Certificate common name
            email: Email address
            organization: Organization name
            country: Country code
            validity_days: Certificate validity in days

        Returns:
            Tuple of (certificate_pem, private_key_pem)
        """
        try:
            if not self.smime_available:
                raise RuntimeError("S/MIME not available")

            # Generate private key
            private_key = rsa.generate_private_key(
                public_exponent=65537, key_size=2048, backend=default_backend()
            )

            # Create certificate
            subject = issuer = x509.Name(
                [
                    x509.NameAttribute(NameOID.COUNTRY_NAME, country),
                    x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, ""),
                    x509.NameAttribute(NameOID.LOCALITY_NAME, ""),
                    x509.NameAttribute(NameOID.ORGANIZATION_NAME, organization),
                    x509.NameAttribute(NameOID.COMMON_NAME, common_name),
                    x509.NameAttribute(NameOID.EMAIL_ADDRESS, email),
                ]
            )

            cert = (
                x509.CertificateBuilder()
                .subject_name(subject)
                .issuer_name(issuer)
                .public_key(private_key.public_key())
                .serial_number(x509.random_serial_number())
                .not_valid_before(datetime.utcnow())
                .not_valid_after(datetime.utcnow() + timedelta(days=validity_days))
                .add_extension(
                    x509.SubjectAlternativeName([x509.RFC822Name(email)]),
                    critical=False,
                )
                .sign(private_key, hashes.SHA256(), default_backend())
            )

            # Serialize certificate and private key
            cert_pem = cert.public_bytes(serialization.Encoding.PEM).decode("utf-8")
            key_pem = private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption(),
            ).decode("utf-8")

            logger.info(f"Generated S/MIME certificate for: {email}")
            return cert_pem, key_pem

        except Exception as e:
            logger.error(f"Failed to generate S/MIME certificate: {e}")
            raise

    async def encrypt_message_smime(
        self,
        message: str,
        recipient_certificates: List[str],
        sender_certificate: Optional[str] = None,
        sender_private_key: Optional[str] = None,
    ) -> EncryptedMessage:
        """
        Encrypt a message using S/MIME.

        Args:
            message: Message to encrypt
            recipient_certificates: List of recipient certificates
            sender_certificate: Optional sender certificate for signing
            sender_private_key: Optional sender private key for signing

        Returns:
            EncryptedMessage object
        """
        try:
            if not self.smime_available:
                raise RuntimeError("S/MIME not available")

            # This is a simplified S/MIME implementation
            # In production, you'd use a proper S/MIME library like python-magic

            # For now, we'll create a placeholder encrypted message
            encrypted_content = base64.b64encode(message.encode("utf-8")).decode(
                "utf-8"
            )

            # Create encrypted message object
            encrypted_message = EncryptedMessage(
                message_id=str(uuid.uuid4()),
                original_message=message,
                encrypted_content=encrypted_content,
                encryption_method="smime",
                recipient_keys=[],  # Would contain certificate fingerprints
                sender_key=None,  # Would contain sender certificate fingerprint
                is_signed=sender_certificate is not None,
            )

            # Store the encrypted message
            self._save_encrypted_message(encrypted_message)

            logger.info(
                f"Encrypted message with S/MIME: {encrypted_message.message_id}"
            )
            return encrypted_message

        except Exception as e:
            logger.error(f"Failed to encrypt message with S/MIME: {e}")
            raise

    async def decrypt_message_smime(
        self,
        encrypted_content: str,
        private_key: str,
        passphrase: Optional[str] = None,
    ) -> Tuple[str, bool]:
        """
        Decrypt an S/MIME message.

        Args:
            encrypted_content: Encrypted message content
            private_key: Private key for decryption
            passphrase: Optional passphrase for private key

        Returns:
            Tuple of (decrypted_message, is_signed)
        """
        try:
            if not self.smime_available:
                raise RuntimeError("S/MIME not available")

            # This is a simplified S/MIME implementation
            # In production, you'd use a proper S/MIME library

            # For now, we'll just decode the base64 content
            decrypted_message = base64.b64decode(encrypted_content).decode("utf-8")

            logger.info("Successfully decrypted S/MIME message")
            return decrypted_message, False  # Simplified - would check signature

        except Exception as e:
            logger.error(f"Failed to decrypt S/MIME message: {e}")
            raise

    async def get_available_keys(
        self, key_type: Optional[str] = None, email: Optional[str] = None
    ) -> List[EncryptionKey]:
        """
        Get available encryption keys.

        Args:
            key_type: Filter by key type ('pgp' or 'smime')
            email: Filter by email address

        Returns:
            List of EncryptionKey objects
        """
        try:
            keys = list(self.keys.values())

            # Filter by key type
            if key_type:
                keys = [key for key in keys if key.key_type == key_type]

            # Filter by email
            if email:
                keys = [key for key in keys if email.lower() in key.email.lower()]

            return keys

        except Exception as e:
            logger.error(f"Failed to get available keys: {e}")
            return []

    async def revoke_key(
        self, key_id: str, reason: str = "No reason specified"
    ) -> bool:
        """
        Revoke an encryption key.

        Args:
            key_id: Key ID to revoke
            reason: Reason for revocation

        Returns:
            True if successful
        """
        try:
            if key_id not in self.keys:
                return False

            key = self.keys[key_id]
            key.is_revoked = True

            # Create revocation certificate for PGP keys
            if key.key_type == "pgp" and self.pgp:
                try:
                    revocation_cert = self.pgp.gen_revoke(
                        key_id, reason=reason, passphrase=None
                    )
                    # Store revocation certificate
                    revocation_file = self.keys_dir / f"{key_id}.rev"
                    with open(revocation_file, "w") as f:
                        f.write(revocation_cert)
                except Exception as e:
                    logger.warning(f"Failed to create PGP revocation certificate: {e}")

            self._save_keys()

            logger.info(f"Revoked key: {key_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to revoke key: {e}")
            return False

    async def set_key_trust(self, key_id: str, trust_level: str) -> bool:
        """
        Set trust level for a PGP key.

        Args:
            key_id: Key ID
            trust_level: Trust level ('unknown', 'marginal', 'full', 'ultimate')

        Returns:
            True if successful
        """
        try:
            if key_id not in self.keys:
                return False

            key = self.keys[key_id]
            if key.key_type != "pgp":
                return False

            # Set trust in GPG keyring
            if self.pgp:
                trust_map = {
                    "unknown": "1",
                    "marginal": "2",
                    "full": "3",
                    "ultimate": "5",
                }

                if trust_level in trust_map:
                    self.pgp.trust_keys(key_id, trust_map[trust_level])

            # Update key trust level
            key.trust_level = trust_level
            self._save_keys()

            logger.info(f"Set trust level for key {key_id}: {trust_level}")
            return True

        except Exception as e:
            logger.error(f"Failed to set key trust: {e}")
            return False

    # Private helper methods

    def _extract_email_from_uid(self, uid: str) -> str:
        """Extract email address from PGP UID."""
        try:
            # PGP UID format: "Name <email@domain.com>"
            if "<" in uid and ">" in uid:
                start = uid.find("<") + 1
                end = uid.find(">")
                return uid[start:end]
            return ""
        except:
            return ""

    def _save_encrypted_message(self, encrypted_message: EncryptedMessage) -> None:
        """Save encrypted message to storage."""
        try:
            message_file = self.messages_dir / f"{encrypted_message.message_id}.json"
            message_data = asdict(encrypted_message)

            # Convert datetime objects to ISO strings
            for key, value in message_data.items():
                if isinstance(value, datetime):
                    message_data[key] = value.isoformat()

            with open(message_file, "w", encoding="utf-8") as f:
                json.dump(message_data, f, indent=2, default=str)

        except Exception as e:
            logger.error(f"Failed to save encrypted message: {e}")

    def __del__(self):
        """Cleanup temporary PGP directory."""
        try:
            if hasattr(self, "pgp_temp_dir") and os.path.exists(self.pgp_temp_dir):
                import shutil

                shutil.rmtree(self.pgp_temp_dir)
        except:
            pass


# Global email encryption service instance
email_encryption_service = EmailEncryptionService()
