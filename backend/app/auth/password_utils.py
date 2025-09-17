"""
Password utilities for Reynard Backend.

This module provides password hashing and verification functionality
using the Gatekeeper library.
"""

from gatekeeper.core.password_manager import PasswordManager, SecurityLevel


def get_password_hash(password: str) -> str:
    """
    Hash a password using Argon2.

    Args:
        password: Plain text password to hash

    Returns:
        str: Hashed password string
    """
    password_manager = PasswordManager(security_level=SecurityLevel.MEDIUM)
    return password_manager.hash_password(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash.

    Args:
        password: Plain text password to verify
        hashed_password: Stored password hash

    Returns:
        bool: True if password matches, False otherwise
    """
    password_manager = PasswordManager(security_level=SecurityLevel.MEDIUM)
    return password_manager.verify_password(password, hashed_password)
