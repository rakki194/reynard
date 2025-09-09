"""
Password Utilities

This module provides secure password hashing and verification functions
using PBKDF2 with HMAC-SHA256.
"""

import hashlib
import secrets
from app.config.jwt_config import PASSWORD_SALT_LENGTH, PASSWORD_ITERATIONS


def get_password_hash(password: str) -> str:
    """Hash a password using PBKDF2 with HMAC-SHA256"""
    salt = secrets.token_bytes(PASSWORD_SALT_LENGTH)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS
    )
    # Store salt and hash together
    return salt.hex() + ":" + password_hash.hex()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        salt_hex, password_hash_hex = hashed_password.split(":")
        salt = bytes.fromhex(salt_hex)
        stored_hash = bytes.fromhex(password_hash_hex)

        # Hash the provided password with the same salt
        password_hash = hashlib.pbkdf2_hmac(
            "sha256", plain_password.encode("utf-8"), salt, PASSWORD_ITERATIONS
        )

        # Use constant-time comparison to prevent timing attacks
        import hmac
        return hmac.compare_digest(stored_hash, password_hash)
    except (ValueError, IndexError):
        return False