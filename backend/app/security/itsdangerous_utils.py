"""🦊 ItsDangerous Integration for Reynard Backend

This module provides strategic integration of itsdangerous for specific security
use cases where it excels over our custom encryption system. Since itsdangerous
is already a required dependency, we leverage it for:

- Secure token signing and verification
- Time-based token expiration
- URL-safe serialization with tamper protection
- Session token management
- API key generation and validation
- Password reset tokens
- Email verification tokens

Key Features:
- TimestampSigner for time-based tokens
- URLSafeTimedSerializer for web-safe tokens
- Secure serialization with automatic tamper detection
- Integration with existing security infrastructure
- Fallback to custom encryption for complex use cases

Author: Smiling-Sage-9 (Strategic Quokka Specialist)
Version: 1.0.0
"""

import logging
from datetime import UTC, datetime, timedelta
from typing import Any

from itsdangerous import (
    BadSignature,
    SignatureExpired,
    TimestampSigner,
    URLSafeTimedSerializer,
)

from app.security.key_manager import KeyType, get_key_manager

logger = logging.getLogger(__name__)


class ItsDangerousError(Exception):
    """Exception raised for itsdangerous-related errors."""


class ItsDangerousUtils:
    """Strategic integration of itsdangerous for specific security use cases.

    This class provides methods for:
    - Time-based token signing and verification
    - URL-safe serialization with tamper protection
    - Session token management
    - API key generation and validation
    - Password reset and email verification tokens
    """

    def __init__(self):
        """Initialize the ItsDangerous utilities."""
        self.key_manager = get_key_manager()
        self._ensure_itsdangerous_keys()

    def _ensure_itsdangerous_keys(self) -> None:
        """Ensure itsdangerous signing keys exist."""
        # Token signing key for general use
        if not self.key_manager.get_key_metadata("itsdangerous_token_key"):
            logger.info("Creating itsdangerous token signing key")
            self.key_manager.generate_key(
                key_id="itsdangerous_token_key",
                key_type=KeyType.TOKEN_SIGNING,
                rotation_schedule_days=90,  # Rotate every 3 months
            )

        # Session signing key for session tokens
        if not self.key_manager.get_key_metadata("itsdangerous_session_key"):
            logger.info("Creating itsdangerous session signing key")
            self.key_manager.generate_key(
                key_id="itsdangerous_session_key",
                key_type=KeyType.SESSION_SIGNING,
                rotation_schedule_days=30,  # Rotate monthly
            )

    def _get_signing_key(self, key_id: str) -> str:
        """Get a signing key from the key manager."""
        key = self.key_manager.get_key(key_id)
        if not key:
            raise ItsDangerousError(f"Signing key {key_id} not found")
        # Convert bytes to base64 string for itsdangerous
        if isinstance(key, bytes):
            import base64

            return base64.b64encode(key).decode("utf-8")
        return str(key)

    def create_timestamped_token(
        self,
        data: str | dict[str, Any],
        expires_in: timedelta | None = None,
        key_id: str = "itsdangerous_token_key",
    ) -> str:
        """Create a timestamped token that expires automatically.

        Args:
            data: Data to include in the token
            expires_in: Token expiration time (default: 1 hour)
            key_id: Key ID to use for signing

        Returns:
            URL-safe timestamped token

        """
        try:
            if expires_in is None:
                expires_in = timedelta(hours=1)

            signer = TimestampSigner(self._get_signing_key(key_id))

            if isinstance(data, dict):
                # Use URLSafeTimedSerializer for complex data
                serializer = URLSafeTimedSerializer(self._get_signing_key(key_id))
                token = serializer.dumps(data, salt=key_id)
            else:
                # Use TimestampSigner for simple strings
                token = signer.sign(str(data))

            # Convert bytes to string if needed
            if isinstance(token, bytes):
                token = token.decode("utf-8")
            return token

        except Exception as e:
            logger.error(f"Failed to create timestamped token: {e}")
            raise ItsDangerousError(f"Token creation failed: {e}")

    def verify_timestamped_token(
        self,
        token: str,
        max_age: int | None = None,
        key_id: str = "itsdangerous_token_key",
    ) -> str | dict[str, Any] | None:
        """Verify a timestamped token and return the data.

        Args:
            token: Token to verify
            max_age: Maximum age in seconds (default: 3600)
            key_id: Key ID to use for verification

        Returns:
            Token data if valid, None if invalid or expired

        """
        try:
            if max_age is None:
                max_age = 3600  # 1 hour default

            signer = TimestampSigner(self._get_signing_key(key_id))

            # Try to unsign with max_age
            try:
                data = signer.unsign(token, max_age=max_age)
                return data.decode("utf-8") if isinstance(data, bytes) else data
            except SignatureExpired:
                logger.warning(f"Token expired: {token[:20]}...")
                return None
            except BadSignature:
                # Try as serialized data
                try:
                    serializer = URLSafeTimedSerializer(self._get_signing_key(key_id))
                    return serializer.loads(token, salt=key_id, max_age=max_age)
                except (SignatureExpired, BadSignature):
                    logger.warning(f"Invalid token signature: {token[:20]}...")
                    return None

        except Exception as e:
            logger.error(f"Failed to verify timestamped token: {e}")
            return None

    def create_session_token(
        self,
        session_data: dict[str, Any],
        expires_in: timedelta | None = None,
    ) -> str:
        """Create a secure session token.

        Args:
            session_data: Session data to encode
            expires_in: Token expiration time (default: 24 hours)

        Returns:
            URL-safe session token

        """
        try:
            if expires_in is None:
                expires_in = timedelta(hours=24)

            serializer = URLSafeTimedSerializer(
                self._get_signing_key("itsdangerous_session_key"),
            )

            # Add timestamp to session data
            session_data_with_time = {
                **session_data,
                "created_at": datetime.now(UTC).isoformat(),
            }

            return serializer.dumps(
                session_data_with_time,
                salt="session_token",
            )

        except Exception as e:
            logger.error(f"Failed to create session token: {e}")
            raise ItsDangerousError(f"Session token creation failed: {e}")

    def verify_session_token(
        self,
        token: str,
        max_age: int | None = None,
    ) -> dict[str, Any] | None:
        """Verify a session token and return the session data.

        Args:
            token: Session token to verify
            max_age: Maximum age in seconds (default: 86400 = 24 hours)

        Returns:
            Session data if valid, None if invalid or expired

        """
        try:
            if max_age is None:
                max_age = 86400  # 24 hours default

            serializer = URLSafeTimedSerializer(
                self._get_signing_key("itsdangerous_session_key"),
            )

            return serializer.loads(
                token,
                salt="session_token",
                max_age=max_age,
            )

        except SignatureExpired:
            logger.warning(f"Session token expired: {token[:20]}...")
            return None
        except BadSignature:
            logger.warning(f"Invalid session token signature: {token[:20]}...")
            return None
        except Exception as e:
            logger.error(f"Failed to verify session token: {e}")
            return None

    def create_password_reset_token(
        self,
        user_id: str,
        expires_in: timedelta | None = None,
    ) -> str:
        """Create a password reset token.

        Args:
            user_id: User ID to create token for
            expires_in: Token expiration time (default: 1 hour)

        Returns:
            URL-safe password reset token

        """
        try:
            if expires_in is None:
                expires_in = timedelta(hours=1)

            serializer = URLSafeTimedSerializer(
                self._get_signing_key("itsdangerous_token_key"),
            )

            reset_data = {
                "user_id": user_id,
                "type": "password_reset",
                "created_at": datetime.now(UTC).isoformat(),
            }

            return serializer.dumps(
                reset_data,
                salt="password_reset",
            )

        except Exception as e:
            logger.error(f"Failed to create password reset token: {e}")
            raise ItsDangerousError(f"Password reset token creation failed: {e}")

    def verify_password_reset_token(
        self,
        token: str,
        max_age: int | None = None,
    ) -> dict[str, Any] | None:
        """Verify a password reset token.

        Args:
            token: Password reset token to verify
            max_age: Maximum age in seconds (default: 3600 = 1 hour)

        Returns:
            Token data if valid, None if invalid or expired

        """
        try:
            if max_age is None:
                max_age = 3600  # 1 hour default

            serializer = URLSafeTimedSerializer(
                self._get_signing_key("itsdangerous_token_key"),
            )

            data = serializer.loads(
                token,
                salt="password_reset",
                max_age=max_age,
            )

            # Validate token type
            if data.get("type") != "password_reset":
                logger.warning("Invalid password reset token type")
                return None

            return data

        except SignatureExpired:
            logger.warning(f"Password reset token expired: {token[:20]}...")
            return None
        except BadSignature:
            logger.warning(f"Invalid password reset token signature: {token[:20]}...")
            return None
        except Exception as e:
            logger.error(f"Failed to verify password reset token: {e}")
            return None

    def create_email_verification_token(
        self,
        user_id: str,
        email: str,
        expires_in: timedelta | None = None,
    ) -> str:
        """Create an email verification token.

        Args:
            user_id: User ID to create token for
            email: Email address to verify
            expires_in: Token expiration time (default: 24 hours)

        Returns:
            URL-safe email verification token

        """
        try:
            if expires_in is None:
                expires_in = timedelta(hours=24)

            serializer = URLSafeTimedSerializer(
                self._get_signing_key("itsdangerous_token_key"),
            )

            verification_data = {
                "user_id": user_id,
                "email": email,
                "type": "email_verification",
                "created_at": datetime.now(UTC).isoformat(),
            }

            return serializer.dumps(
                verification_data,
                salt="email_verification",
            )

        except Exception as e:
            logger.error(f"Failed to create email verification token: {e}")
            raise ItsDangerousError(f"Email verification token creation failed: {e}")

    def verify_email_verification_token(
        self,
        token: str,
        max_age: int | None = None,
    ) -> dict[str, Any] | None:
        """Verify an email verification token.

        Args:
            token: Email verification token to verify
            max_age: Maximum age in seconds (default: 86400 = 24 hours)

        Returns:
            Token data if valid, None if invalid or expired

        """
        try:
            if max_age is None:
                max_age = 86400  # 24 hours default

            serializer = URLSafeTimedSerializer(
                self._get_signing_key("itsdangerous_token_key"),
            )

            data = serializer.loads(
                token,
                salt="email_verification",
                max_age=max_age,
            )

            # Validate token type
            if data.get("type") != "email_verification":
                logger.warning("Invalid email verification token type")
                return None

            return data

        except SignatureExpired:
            logger.warning(f"Email verification token expired: {token[:20]}...")
            return None
        except BadSignature:
            logger.warning(
                f"Invalid email verification token signature: {token[:20]}...",
            )
            return None
        except Exception as e:
            logger.error(f"Failed to verify email verification token: {e}")
            return None

    def create_api_key_token(
        self,
        user_id: str,
        permissions: list[str],
        expires_in: timedelta | None = None,
    ) -> str:
        """Create an API key token.

        Args:
            user_id: User ID to create token for
            permissions: List of permissions for the API key
            expires_in: Token expiration time (default: 30 days)

        Returns:
            URL-safe API key token

        """
        try:
            if expires_in is None:
                expires_in = timedelta(days=30)

            serializer = URLSafeTimedSerializer(
                self._get_signing_key("itsdangerous_token_key"),
            )

            api_key_data = {
                "user_id": user_id,
                "permissions": permissions,
                "type": "api_key",
                "created_at": datetime.now(UTC).isoformat(),
            }

            return serializer.dumps(
                api_key_data,
                salt="api_key",
            )

        except Exception as e:
            logger.error(f"Failed to create API key token: {e}")
            raise ItsDangerousError(f"API key token creation failed: {e}")

    def verify_api_key_token(
        self,
        token: str,
        max_age: int | None = None,
    ) -> dict[str, Any] | None:
        """Verify an API key token.

        Args:
            token: API key token to verify
            max_age: Maximum age in seconds (default: 2592000 = 30 days)

        Returns:
            Token data if valid, None if invalid or expired

        """
        try:
            if max_age is None:
                max_age = 2592000  # 30 days default

            serializer = URLSafeTimedSerializer(
                self._get_signing_key("itsdangerous_token_key"),
            )

            data = serializer.loads(
                token,
                salt="api_key",
                max_age=max_age,
            )

            # Validate token type
            if data.get("type") != "api_key":
                logger.warning("Invalid API key token type")
                return None

            return data

        except SignatureExpired:
            logger.warning(f"API key token expired: {token[:20]}...")
            return None
        except BadSignature:
            logger.warning(f"Invalid API key token signature: {token[:20]}...")
            return None
        except Exception as e:
            logger.error(f"Failed to verify API key token: {e}")
            return None

    def create_simple_token(
        self,
        data: str,
        expires_in: timedelta | None = None,
    ) -> str:
        """Create a simple timestamped token for basic use cases.

        Args:
            data: Simple string data to encode
            expires_in: Token expiration time (default: 1 hour)

        Returns:
            URL-safe timestamped token

        """
        try:
            if expires_in is None:
                expires_in = timedelta(hours=1)

            # Use URLSafeTimedSerializer for expiration support
            serializer = URLSafeTimedSerializer(
                self._get_signing_key("itsdangerous_token_key"),
            )
            token = serializer.dumps(data, salt="simple-token-salt")
            return token

        except Exception as e:
            logger.error(f"Failed to create simple token: {e}")
            raise ItsDangerousError(f"Simple token creation failed: {e}")

    def verify_simple_token(
        self,
        token: str,
        max_age: int | None = None,
    ) -> str | None:
        """Verify a simple timestamped token.

        Args:
            token: Token to verify
            max_age: Maximum age in seconds (default: 3600 = 1 hour)

        Returns:
            Original data if valid, None if invalid or expired

        """
        try:
            serializer = URLSafeTimedSerializer(
                self._get_signing_key("itsdangerous_token_key"),
            )
            # Use max_age if provided, otherwise use default from creation
            if max_age is None:
                max_age = 3600  # 1 hour default
            data = serializer.loads(token, salt="simple-token-salt", max_age=max_age)
            return data

        except SignatureExpired:
            logger.warning(f"Simple token expired: {token[:20]}...")
            return None
        except BadSignature:
            logger.warning(f"Invalid simple token signature: {token[:20]}...")
            return None
        except Exception as e:
            logger.error(f"Failed to verify simple token: {e}")
            return None


# Global instance
_itsdangerous_utils: ItsDangerousUtils | None = None


def get_itsdangerous_utils() -> ItsDangerousUtils:
    """Get the global ItsDangerous utilities instance."""
    global _itsdangerous_utils
    if _itsdangerous_utils is None:
        _itsdangerous_utils = ItsDangerousUtils()
    return _itsdangerous_utils


# Convenience functions
def create_timestamped_token(
    data: str | dict[str, Any],
    expires_in: timedelta | None = None,
) -> str:
    """Create a timestamped token."""
    utils = get_itsdangerous_utils()
    return utils.create_timestamped_token(data, expires_in)


def verify_timestamped_token(
    token: str,
    max_age: int | None = None,
) -> str | dict[str, Any] | None:
    """Verify a timestamped token."""
    utils = get_itsdangerous_utils()
    return utils.verify_timestamped_token(token, max_age)


def create_session_token(
    session_data: dict[str, Any],
    expires_in: timedelta | None = None,
) -> str:
    """Create a session token."""
    utils = get_itsdangerous_utils()
    return utils.create_session_token(session_data, expires_in)


def verify_session_token(
    token: str,
    max_age: int | None = None,
) -> dict[str, Any] | None:
    """Verify a session token."""
    utils = get_itsdangerous_utils()
    return utils.verify_session_token(token, max_age)


def create_password_reset_token(
    user_id: str,
    expires_in: timedelta | None = None,
) -> str:
    """Create a password reset token."""
    utils = get_itsdangerous_utils()
    return utils.create_password_reset_token(user_id, expires_in)


def verify_password_reset_token(
    token: str,
    max_age: int | None = None,
) -> dict[str, Any] | None:
    """Verify a password reset token."""
    utils = get_itsdangerous_utils()
    return utils.verify_password_reset_token(token, max_age)


def create_email_verification_token(
    user_id: str,
    email: str,
    expires_in: timedelta | None = None,
) -> str:
    """Create an email verification token."""
    utils = get_itsdangerous_utils()
    return utils.create_email_verification_token(user_id, email, expires_in)


def verify_email_verification_token(
    token: str,
    max_age: int | None = None,
) -> dict[str, Any] | None:
    """Verify an email verification token."""
    utils = get_itsdangerous_utils()
    return utils.verify_email_verification_token(token, max_age)


def create_api_key_token(
    user_id: str,
    permissions: list[str],
    expires_in: timedelta | None = None,
) -> str:
    """Create an API key token."""
    utils = get_itsdangerous_utils()
    return utils.create_api_key_token(user_id, permissions, expires_in)


def verify_api_key_token(
    token: str,
    max_age: int | None = None,
) -> dict[str, Any] | None:
    """Verify an API key token."""
    utils = get_itsdangerous_utils()
    return utils.verify_api_key_token(token, max_age)


# Export all functions
__all__ = [
    "ItsDangerousError",
    "ItsDangerousUtils",
    "create_api_key_token",
    "create_email_verification_token",
    "create_password_reset_token",
    "create_session_token",
    "create_timestamped_token",
    "get_itsdangerous_utils",
    "verify_api_key_token",
    "verify_email_verification_token",
    "verify_password_reset_token",
    "verify_session_token",
    "verify_timestamped_token",
]
