"""
JWT Secret Key Management System

This module provides secure JWT secret key management with persistence
to prevent token invalidation on server restarts.
"""

import json
import logging
import secrets
from pathlib import Path

logger = logging.getLogger(__name__)


class JWTSecretManager:
    """Manages JWT secret keys with persistence and security."""

    def __init__(self, secret_file_path: str = "backend/.jwt_secret"):
        self.secret_file_path = Path(secret_file_path)
        self._secret_key: str | None = None
        self._ensure_secret_file()

    def _ensure_secret_file(self) -> None:
        """Ensure the secret file exists and is properly secured."""
        if not self.secret_file_path.exists():
            self._generate_and_save_secret()
        else:
            # Verify file permissions (should be readable only by owner)
            stat = self.secret_file_path.stat()
            if stat.st_mode & 0o077:  # Check if others have read/write permissions
                logger.warning(
                    f"JWT secret file has insecure permissions: {self.secret_file_path}"
                )
                # Fix permissions
                self.secret_file_path.chmod(0o600)
                logger.info(
                    f"Fixed JWT secret file permissions: {self.secret_file_path}"
                )

    def _generate_and_save_secret(self) -> None:
        """Generate a new secure secret key and save it to file."""
        # Generate a cryptographically secure random key
        secret_key = secrets.token_urlsafe(64)

        # Create directory if it doesn't exist
        self.secret_file_path.parent.mkdir(parents=True, exist_ok=True)

        # Save secret to file with secure permissions
        secret_data = {
            "secret_key": secret_key,
            "algorithm": "HS256",
            "created_at": "2025-01-01T00:00:00Z",  # Placeholder timestamp
        }

        with open(self.secret_file_path, "w") as f:
            json.dump(secret_data, f, indent=2)

        # Set secure file permissions (read/write for owner only)
        self.secret_file_path.chmod(0o600)

        logger.info(
            f"Generated new JWT secret key and saved to: {self.secret_file_path}"
        )

    def get_secret_key(self) -> str:
        """Get the current JWT secret key."""
        if self._secret_key is None:
            self._load_secret()
        return self._secret_key

    def _load_secret(self) -> None:
        """Load the secret key from the persistent file."""
        try:
            with open(self.secret_file_path) as f:
                secret_data = json.load(f)

            self._secret_key = secret_data.get("secret_key")
            if not self._secret_key:
                logger.error("Invalid JWT secret file format")
                self._generate_and_save_secret()
                self._load_secret()
                return

            logger.info("Loaded JWT secret key from persistent storage")

        except (FileNotFoundError, json.JSONDecodeError, KeyError) as e:
            logger.warning(f"Failed to load JWT secret: {e}. Generating new secret.")
            self._generate_and_save_secret()
            self._load_secret()

    def rotate_secret_key(self) -> str:
        """Rotate the JWT secret key (invalidates all existing tokens)."""
        logger.warning(
            "Rotating JWT secret key - all existing tokens will be invalidated"
        )
        self._generate_and_save_secret()
        self._secret_key = None  # Force reload
        return self.get_secret_key()

    def get_algorithm(self) -> str:
        """Get the JWT algorithm."""
        return "HS256"


# Global instance
_jwt_secret_manager: JWTSecretManager | None = None


def get_jwt_secret_manager() -> JWTSecretManager:
    """Get the global JWT secret manager instance."""
    global _jwt_secret_manager
    if _jwt_secret_manager is None:
        _jwt_secret_manager = JWTSecretManager()
    return _jwt_secret_manager


def get_jwt_secret_key() -> str:
    """Get the current JWT secret key."""
    return get_jwt_secret_manager().get_secret_key()


def get_jwt_algorithm() -> str:
    """Get the JWT algorithm."""
    return get_jwt_secret_manager().get_algorithm()


def rotate_jwt_secret_key() -> str:
    """Rotate the JWT secret key."""
    return get_jwt_secret_manager().rotate_secret_key()
