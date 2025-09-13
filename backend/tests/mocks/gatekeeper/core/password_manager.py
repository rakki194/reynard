"""
Mock password management for the Gatekeeper authentication library.
"""

from enum import Enum
from typing import Optional


class Argon2Variant(Enum):
    """Argon2 variants available for password hashing."""
    ARGON2ID = "argon2id"
    ARGON2I = "argon2i" 
    ARGON2D = "argon2d"


class SecurityLevel(Enum):
    """Predefined security levels for Argon2 parameters."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    PARANOID = "paranoid"


class PasswordManager:
    """Mock password manager for testing."""
    
    def __init__(self, security_level: SecurityLevel = SecurityLevel.MEDIUM):
        self.security_level = security_level
    
    def hash_password(self, password: str) -> str:
        """Mock password hashing - returns a fake hash."""
        return f"mock_hash_{password}"
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Mock password verification - always returns True for testing."""
        return True
    
    def is_secure_password(self, password: str) -> bool:
        """Mock password security check - always returns True for testing."""
        return True
