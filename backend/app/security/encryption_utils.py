"""
🔐 Encryption Utilities for Reynard Backend

This module provides common encryption utilities for the Reynard security
infrastructure, including symmetric and asymmetric encryption, hashing,
and secure data handling functions.

Key Features:
- AES-256-GCM encryption for data at rest
- RSA encryption for key exchange and signing
- Secure hashing with salt and iterations
- Data integrity verification
- Secure random number generation
- Key derivation functions

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

import base64
import hashlib
import logging
import secrets
from typing import Any, Dict, Optional, Tuple, Union

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.kdf.scrypt import Scrypt
from cryptography.hazmat.backends import default_backend

logger = logging.getLogger(__name__)


class EncryptionError(Exception):
    """Exception raised for encryption-related errors."""

    pass


class DecryptionError(Exception):
    """Exception raised for decryption-related errors."""

    pass


class EncryptionUtils:
    """
    Comprehensive encryption utilities for the Reynard backend.

    This class provides methods for:
    - Symmetric encryption/decryption with AES-256-GCM
    - Asymmetric encryption/decryption with RSA
    - Secure hashing with salt
    - Key derivation functions
    - Data integrity verification
    """

    @staticmethod
    def generate_salt(length: int = 32) -> bytes:
        """Generate a cryptographically secure random salt."""
        return secrets.token_bytes(length)

    @staticmethod
    def generate_iv(length: int = 16) -> bytes:
        """Generate a cryptographically secure random IV."""
        return secrets.token_bytes(length)

    @staticmethod
    def derive_key_from_password(
        password: str,
        salt: bytes,
        length: int = 32,
        iterations: int = 100000,
        algorithm: str = "pbkdf2",
    ) -> bytes:
        """
        Derive a key from a password using PBKDF2 or Scrypt.

        Args:
            password: Password to derive key from
            salt: Salt for key derivation
            length: Length of derived key in bytes
            iterations: Number of iterations (for PBKDF2)
            algorithm: Algorithm to use ('pbkdf2' or 'scrypt')

        Returns:
            Derived key bytes
        """
        password_bytes = password.encode("utf-8")

        if algorithm.lower() == "scrypt":
            kdf = Scrypt(
                algorithm=hashes.SHA256(),
                length=length,
                salt=salt,
                n=2**14,  # CPU/memory cost parameter
                r=8,  # Block size parameter
                p=1,  # Parallelization parameter
                backend=default_backend(),
            )
        else:  # PBKDF2
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=length,
                salt=salt,
                iterations=iterations,
                backend=default_backend(),
            )

        return kdf.derive(password_bytes)

    @staticmethod
    def encrypt_aes_gcm(
        data: bytes, key: bytes, associated_data: Optional[bytes] = None
    ) -> Tuple[bytes, bytes]:
        """
        Encrypt data using AES-256-GCM.

        Args:
            data: Data to encrypt
            key: Encryption key (32 bytes for AES-256)
            associated_data: Additional authenticated data

        Returns:
            Tuple of (encrypted_data, iv)
        """
        if len(key) != 32:
            raise EncryptionError("Key must be 32 bytes for AES-256")

        # Generate random IV
        iv = EncryptionUtils.generate_iv(12)  # GCM uses 12-byte IV

        # Create cipher
        cipher = Cipher(algorithms.AES(key), modes.GCM(iv), backend=default_backend())
        encryptor = cipher.encryptor()

        # Add associated data if provided
        if associated_data:
            encryptor.authenticate_additional_data(associated_data)

        # Encrypt data
        encrypted_data = encryptor.update(data) + encryptor.finalize()

        return encrypted_data, iv

    @staticmethod
    def decrypt_aes_gcm(
        encrypted_data: bytes,
        key: bytes,
        iv: bytes,
        associated_data: Optional[bytes] = None,
    ) -> bytes:
        """
        Decrypt data using AES-256-GCM.

        Args:
            encrypted_data: Encrypted data
            key: Decryption key (32 bytes for AES-256)
            iv: Initialization vector
            associated_data: Additional authenticated data

        Returns:
            Decrypted data
        """
        if len(key) != 32:
            raise DecryptionError("Key must be 32 bytes for AES-256")

        try:
            # Create cipher
            cipher = Cipher(
                algorithms.AES(key), modes.GCM(iv), backend=default_backend()
            )
            decryptor = cipher.decryptor()

            # Add associated data if provided
            if associated_data:
                decryptor.authenticate_additional_data(associated_data)

            # Decrypt data
            decrypted_data = decryptor.update(encrypted_data) + decryptor.finalize()

            return decrypted_data

        except Exception as e:
            raise DecryptionError(f"Decryption failed: {e}")

    @staticmethod
    def encrypt_aes_cbc(
        data: bytes, key: bytes, iv: Optional[bytes] = None
    ) -> Tuple[bytes, bytes]:
        """
        Encrypt data using AES-256-CBC.

        Args:
            data: Data to encrypt
            key: Encryption key (32 bytes for AES-256)
            iv: Initialization vector (optional, will be generated if not provided)

        Returns:
            Tuple of (encrypted_data, iv)
        """
        if len(key) != 32:
            raise EncryptionError("Key must be 32 bytes for AES-256")

        # Generate IV if not provided
        if iv is None:
            iv = EncryptionUtils.generate_iv(16)  # CBC uses 16-byte IV

        # Create cipher
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
        encryptor = cipher.encryptor()

        # Pad data to block size
        padding_length = 16 - (len(data) % 16)
        padded_data = data + bytes([padding_length] * padding_length)

        # Encrypt data
        encrypted_data = encryptor.update(padded_data) + encryptor.finalize()

        return encrypted_data, iv

    @staticmethod
    def decrypt_aes_cbc(encrypted_data: bytes, key: bytes, iv: bytes) -> bytes:
        """
        Decrypt data using AES-256-CBC.

        Args:
            encrypted_data: Encrypted data
            key: Decryption key (32 bytes for AES-256)
            iv: Initialization vector

        Returns:
            Decrypted data
        """
        if len(key) != 32:
            raise DecryptionError("Key must be 32 bytes for AES-256")

        try:
            # Create cipher
            cipher = Cipher(
                algorithms.AES(key), modes.CBC(iv), backend=default_backend()
            )
            decryptor = cipher.decryptor()

            # Decrypt data
            decrypted_data = decryptor.update(encrypted_data) + decryptor.finalize()

            # Remove padding
            padding_length = decrypted_data[-1]
            if padding_length > 16 or padding_length == 0:
                raise DecryptionError("Invalid padding")

            return decrypted_data[:-padding_length]

        except Exception as e:
            raise DecryptionError(f"Decryption failed: {e}")

    @staticmethod
    def encrypt_rsa(
        data: bytes, public_key: rsa.RSAPublicKey, padding_algorithm: str = "oaep"
    ) -> bytes:
        """
        Encrypt data using RSA.

        Args:
            data: Data to encrypt
            public_key: RSA public key
            padding_algorithm: Padding algorithm ('oaep' or 'pkcs1')

        Returns:
            Encrypted data
        """
        try:
            if padding_algorithm.lower() == "oaep":
                padding_scheme = padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None,
                )
            else:  # PKCS1
                padding_scheme = padding.PKCS1v15()

            return public_key.encrypt(data, padding_scheme)

        except Exception as e:
            raise EncryptionError(f"RSA encryption failed: {e}")

    @staticmethod
    def decrypt_rsa(
        encrypted_data: bytes,
        private_key: rsa.RSAPrivateKey,
        padding_algorithm: str = "oaep",
    ) -> bytes:
        """
        Decrypt data using RSA.

        Args:
            encrypted_data: Encrypted data
            private_key: RSA private key
            padding_algorithm: Padding algorithm ('oaep' or 'pkcs1')

        Returns:
            Decrypted data
        """
        try:
            if padding_algorithm.lower() == "oaep":
                padding_scheme = padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None,
                )
            else:  # PKCS1
                padding_scheme = padding.PKCS1v15()

            return private_key.decrypt(encrypted_data, padding_scheme)

        except Exception as e:
            raise DecryptionError(f"RSA decryption failed: {e}")

    @staticmethod
    def sign_rsa(
        data: bytes, private_key: rsa.RSAPrivateKey, hash_algorithm: str = "sha256"
    ) -> bytes:
        """
        Sign data using RSA.

        Args:
            data: Data to sign
            private_key: RSA private key
            hash_algorithm: Hash algorithm ('sha256', 'sha384', 'sha512')

        Returns:
            Digital signature
        """
        try:
            if hash_algorithm.lower() == "sha256":
                hash_algo = hashes.SHA256()
            elif hash_algorithm.lower() == "sha384":
                hash_algo = hashes.SHA384()
            elif hash_algorithm.lower() == "sha512":
                hash_algo = hashes.SHA512()
            else:
                raise ValueError(f"Unsupported hash algorithm: {hash_algorithm}")

            return private_key.sign(
                data,
                padding.PSS(
                    mgf=padding.MGF1(hash_algo), salt_length=padding.PSS.MAX_LENGTH
                ),
                hash_algo,
            )

        except Exception as e:
            raise EncryptionError(f"RSA signing failed: {e}")

    @staticmethod
    def verify_rsa(
        data: bytes,
        signature: bytes,
        public_key: rsa.RSAPublicKey,
        hash_algorithm: str = "sha256",
    ) -> bool:
        """
        Verify RSA signature.

        Args:
            data: Original data
            signature: Digital signature
            public_key: RSA public key
            hash_algorithm: Hash algorithm ('sha256', 'sha384', 'sha512')

        Returns:
            True if signature is valid, False otherwise
        """
        try:
            if hash_algorithm.lower() == "sha256":
                hash_algo = hashes.SHA256()
            elif hash_algorithm.lower() == "sha384":
                hash_algo = hashes.SHA384()
            elif hash_algorithm.lower() == "sha512":
                hash_algo = hashes.SHA512()
            else:
                raise ValueError(f"Unsupported hash algorithm: {hash_algorithm}")

            public_key.verify(
                signature,
                data,
                padding.PSS(
                    mgf=padding.MGF1(hash_algo), salt_length=padding.PSS.MAX_LENGTH
                ),
                hash_algo,
            )
            return True

        except Exception:
            return False

    @staticmethod
    def hash_data(
        data: bytes, algorithm: str = "sha256", salt: Optional[bytes] = None
    ) -> bytes:
        """
        Hash data using specified algorithm.

        Args:
            data: Data to hash
            algorithm: Hash algorithm ('sha256', 'sha384', 'sha512', 'blake2b')
            salt: Optional salt to prepend to data

        Returns:
            Hash bytes
        """
        if salt:
            data = salt + data

        if algorithm.lower() == "sha256":
            hasher = hashes.SHA256()
        elif algorithm.lower() == "sha384":
            hasher = hashes.SHA384()
        elif algorithm.lower() == "sha512":
            hasher = hashes.SHA512()
        elif algorithm.lower() == "blake2b":
            hasher = hashes.BLAKE2b(64)
        else:
            raise ValueError(f"Unsupported hash algorithm: {algorithm}")

        digest = hashes.Hash(hasher, backend=default_backend())
        digest.update(data)
        return digest.finalize()

    @staticmethod
    def secure_hash_password(
        password: str, salt: Optional[bytes] = None, iterations: int = 100000
    ) -> Tuple[bytes, bytes]:
        """
        Securely hash a password using PBKDF2.

        Args:
            password: Password to hash
            salt: Optional salt (will be generated if not provided)
            iterations: Number of iterations

        Returns:
            Tuple of (hash, salt)
        """
        if salt is None:
            salt = EncryptionUtils.generate_salt(32)

        password_bytes = password.encode("utf-8")

        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=iterations,
            backend=default_backend(),
        )

        password_hash = kdf.derive(password_bytes)
        return password_hash, salt

    @staticmethod
    def verify_password(
        password: str, password_hash: bytes, salt: bytes, iterations: int = 100000
    ) -> bool:
        """
        Verify a password against its hash.

        Args:
            password: Password to verify
            password_hash: Stored password hash
            salt: Salt used for hashing
            iterations: Number of iterations used for hashing

        Returns:
            True if password matches, False otherwise
        """
        try:
            computed_hash, _ = EncryptionUtils.secure_hash_password(
                password, salt, iterations
            )
            return secrets.compare_digest(password_hash, computed_hash)
        except Exception:
            return False

    @staticmethod
    def encrypt_field(data: Union[str, bytes], key: bytes, field_name: str) -> str:
        """
        Encrypt a field value for database storage.

        Args:
            data: Data to encrypt
            key: Encryption key
            field_name: Name of the field (used as associated data)

        Returns:
            Base64-encoded encrypted data with IV
        """
        if isinstance(data, str):
            data = data.encode("utf-8")

        # Use field name as associated data for authentication
        associated_data = field_name.encode("utf-8")

        # Encrypt data
        encrypted_data, iv = EncryptionUtils.encrypt_aes_gcm(data, key, associated_data)

        # Combine IV and encrypted data
        combined = iv + encrypted_data

        # Return base64-encoded result
        return base64.b64encode(combined).decode("utf-8")

    @staticmethod
    def decrypt_field(encrypted_data: str, key: bytes, field_name: str) -> str:
        """
        Decrypt a field value from database storage.

        Args:
            encrypted_data: Base64-encoded encrypted data
            key: Decryption key
            field_name: Name of the field (used as associated data)

        Returns:
            Decrypted string
        """
        try:
            # Decode base64
            combined = base64.b64decode(encrypted_data.encode("utf-8"))

            # Extract IV and encrypted data
            iv = combined[:12]  # GCM uses 12-byte IV
            encrypted = combined[12:]

            # Use field name as associated data for authentication
            associated_data = field_name.encode("utf-8")

            # Decrypt data
            decrypted_data = EncryptionUtils.decrypt_aes_gcm(
                encrypted, key, iv, associated_data
            )

            return decrypted_data.decode("utf-8")

        except Exception as e:
            raise DecryptionError(f"Field decryption failed: {e}")

    @staticmethod
    def generate_secure_token(length: int = 32) -> str:
        """Generate a cryptographically secure random token."""
        return secrets.token_urlsafe(length)

    @staticmethod
    def constant_time_compare(a: bytes, b: bytes) -> bool:
        """Compare two byte strings in constant time."""
        return secrets.compare_digest(a, b)

    @staticmethod
    def secure_random_bytes(length: int) -> bytes:
        """Generate cryptographically secure random bytes."""
        return secrets.token_bytes(length)

    @staticmethod
    def secure_random_int(min_value: int, max_value: int) -> int:
        """Generate a cryptographically secure random integer."""
        return secrets.randbelow(max_value - min_value + 1) + min_value


# Convenience functions for common operations
def encrypt_data(data: Union[str, bytes], key: bytes) -> str:
    """Encrypt data and return base64-encoded result."""
    if isinstance(data, str):
        data = data.encode("utf-8")

    encrypted_data, iv = EncryptionUtils.encrypt_aes_gcm(data, key)
    combined = iv + encrypted_data
    return base64.b64encode(combined).decode("utf-8")


def decrypt_data(encrypted_data: str, key: bytes) -> bytes:
    """Decrypt base64-encoded data."""
    combined = base64.b64decode(encrypted_data.encode("utf-8"))
    iv = combined[:12]
    encrypted = combined[12:]
    return EncryptionUtils.decrypt_aes_gcm(encrypted, key, iv)


def hash_string(data: str, algorithm: str = "sha256") -> str:
    """Hash a string and return hex-encoded result."""
    hash_bytes = EncryptionUtils.hash_data(data.encode("utf-8"), algorithm)
    return hash_bytes.hex()


def generate_password_hash(password: str) -> Tuple[str, str]:
    """Generate a secure password hash and return (hash, salt) as hex strings."""
    password_hash, salt = EncryptionUtils.secure_hash_password(password)
    return password_hash.hex(), salt.hex()


def verify_password_hash(password: str, password_hash: str, salt: str) -> bool:
    """Verify a password against its hash."""
    password_hash_bytes = bytes.fromhex(password_hash)
    salt_bytes = bytes.fromhex(salt)
    return EncryptionUtils.verify_password(password, password_hash_bytes, salt_bytes)
