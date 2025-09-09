"""
JWT Configuration Management

This module handles JWT secret key management with persistent storage
and secure fallback mechanisms.
"""

import os
import secrets
from pathlib import Path
from typing import Optional


def get_persistent_secret_key() -> str:
    """Get persistent JWT secret key with fallback to environment variable"""
    # First try environment variable
    env_secret = os.getenv("SECRET_KEY")
    if env_secret:
        return env_secret
    
    # Create persistent secret file
    secret_file = Path("./secrets/jwt_secret.key")
    secret_file.parent.mkdir(exist_ok=True, mode=0o700)
    
    if secret_file.exists():
        # Load existing secret
        return secret_file.read_text().strip()
    else:
        # Generate new persistent secret
        new_secret = secrets.token_urlsafe(64)  # 64 bytes for strong entropy
        secret_file.write_text(new_secret)
        secret_file.chmod(0o600)  # Secure file permissions
        return new_secret


# JWT Configuration Constants
SECRET_KEY = get_persistent_secret_key()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password hashing configuration
PASSWORD_SALT_LENGTH = 32
PASSWORD_ITERATIONS = 100000
