"""
🦊 Secure Authentication Service with itsdangerous Integration

This module provides a modern authentication service that uses itsdangerous
for secure token operations by default, with fallback to traditional JWT
when needed.

Key Features:
- itsdangerous-based secure tokens by default
- Hybrid session management
- Password reset and email verification
- API key management
- Comprehensive security logging
- Backward compatibility with existing JWT system

Author: Smiling-Sage-9 (Strategic Quokka Specialist)
Version: 1.0.0
"""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Tuple

from app.auth.jwt_utils import (
    create_secure_token,
    create_secure_token_sync,
    verify_secure_token,
    verify_secure_token_sync,
)
from app.security.itsdangerous_utils import (
    create_api_key_token,
    create_email_verification_token,
    create_password_reset_token,
    verify_api_key_token,
    verify_email_verification_token,
    verify_password_reset_token,
)
from app.security.security_config import get_session_security_config
from app.security.session_encryption import create_session, get_session

logger = logging.getLogger(__name__)


class SecureAuthService:
    """
    Modern authentication service using itsdangerous for secure operations.

    This service provides:
    - Secure token creation and verification
    - Session management with hybrid approach
    - Password reset and email verification
    - API key management
    - Comprehensive security features
    """

    def __init__(self):
        """Initialize the secure authentication service."""
        self.config = get_session_security_config()

    async def create_user_session(
        self,
        user_id: str,
        user_data: Dict[str, Any],
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Tuple[str, str]:
        """
        Create a user session with both access token and session token.

        Args:
            user_id: User ID
            user_data: User data to include in tokens
            ip_address: Client IP address
            user_agent: Client user agent

        Returns:
            Tuple of (access_token, session_token)
        """
        try:
            # Create access token using itsdangerous
            access_token = await create_secure_token(
                {"user_id": user_id, "type": "access", **user_data},
                expires_delta=timedelta(
                    hours=self.config.itsdangerous_token_expiry_hours
                ),
            )

            # Create hybrid session
            session_token = create_session(
                user_id=user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                session_data={
                    "access_token_created": datetime.utcnow().isoformat(),
                    "user_data": user_data,
                },
            )

            logger.info(f"Created secure session for user {user_id}")
            return access_token, session_token

        except Exception as e:
            logger.error(f"Failed to create user session for {user_id}: {e}")
            raise

    async def verify_user_session(
        self,
        access_token: str,
        session_token: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Verify a user session using access token and optional session token.

        Args:
            access_token: Access token to verify
            session_token: Optional session token for additional validation

        Returns:
            User data if valid, None otherwise
        """
        try:
            # Verify access token
            token_data = await verify_secure_token(access_token)
            if not token_data:
                logger.warning("Invalid access token provided")
                return None

            # Verify session token if provided
            if session_token:
                session = get_session(session_token)
                if not session:
                    logger.warning("Invalid session token provided")
                    return None

                # Validate session belongs to same user
                if session.user_id != token_data.get("user_id"):
                    logger.warning("Session token user mismatch")
                    return None

            logger.info(f"Verified session for user {token_data.get('user_id')}")
            return token_data

        except Exception as e:
            logger.error(f"Failed to verify user session: {e}")
            return None

    def create_password_reset_request(
        self,
        user_id: str,
        email: str,
    ) -> str:
        """
        Create a password reset request token.

        Args:
            user_id: User ID
            email: User email address

        Returns:
            Password reset token
        """
        try:
            token = create_password_reset_token(
                user_id,
                expires_in=timedelta(
                    hours=self.config.itsdangerous_password_reset_expiry_hours
                ),
            )

            logger.info(f"Created password reset token for user {user_id}")
            return token

        except Exception as e:
            logger.error(f"Failed to create password reset token for {user_id}: {e}")
            raise

    def verify_password_reset_request(
        self,
        token: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Verify a password reset request token.

        Args:
            token: Password reset token

        Returns:
            Token data if valid, None otherwise
        """
        try:
            data = verify_password_reset_token(token)
            if data:
                logger.info(
                    f"Verified password reset token for user {data.get('user_id')}"
                )
            else:
                logger.warning("Invalid password reset token provided")
            return data

        except Exception as e:
            logger.error(f"Failed to verify password reset token: {e}")
            return None

    def create_email_verification_request(
        self,
        user_id: str,
        email: str,
    ) -> str:
        """
        Create an email verification request token.

        Args:
            user_id: User ID
            email: Email address to verify

        Returns:
            Email verification token
        """
        try:
            token = create_email_verification_token(
                user_id,
                email,
                expires_in=timedelta(
                    hours=self.config.itsdangerous_email_verification_expiry_hours
                ),
            )

            logger.info(f"Created email verification token for user {user_id}")
            return token

        except Exception as e:
            logger.error(
                f"Failed to create email verification token for {user_id}: {e}"
            )
            raise

    def verify_email_verification_request(
        self,
        token: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Verify an email verification request token.

        Args:
            token: Email verification token

        Returns:
            Token data if valid, None otherwise
        """
        try:
            data = verify_email_verification_token(token)
            if data:
                logger.info(
                    f"Verified email verification token for user {data.get('user_id')}"
                )
            else:
                logger.warning("Invalid email verification token provided")
            return data

        except Exception as e:
            logger.error(f"Failed to verify email verification token: {e}")
            return None

    def create_api_key(
        self,
        user_id: str,
        permissions: list[str],
        description: Optional[str] = None,
    ) -> str:
        """
        Create an API key for a user.

        Args:
            user_id: User ID
            permissions: List of permissions for the API key
            description: Optional description of the API key

        Returns:
            API key token
        """
        try:
            token = create_api_key_token(
                user_id,
                permissions,
                expires_in=timedelta(days=self.config.itsdangerous_api_key_expiry_days),
            )

            logger.info(
                f"Created API key for user {user_id} with permissions: {permissions}"
            )
            return token

        except Exception as e:
            logger.error(f"Failed to create API key for {user_id}: {e}")
            raise

    def verify_api_key(
        self,
        token: str,
        required_permission: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Verify an API key and check permissions.

        Args:
            token: API key token
            required_permission: Optional required permission to check

        Returns:
            API key data if valid, None otherwise
        """
        try:
            data = verify_api_key_token(token)
            if not data:
                logger.warning("Invalid API key provided")
                return None

            # Check required permission if specified
            if required_permission:
                permissions = data.get("permissions", [])
                if required_permission not in permissions:
                    logger.warning(
                        f"API key missing required permission: {required_permission}"
                    )
                    return None

            logger.info(f"Verified API key for user {data.get('user_id')}")
            return data

        except Exception as e:
            logger.error(f"Failed to verify API key: {e}")
            return None

    def revoke_user_sessions(
        self,
        user_id: str,
    ) -> int:
        """
        Revoke all sessions for a user.

        Args:
            user_id: User ID

        Returns:
            Number of sessions revoked
        """
        try:
            from app.security.session_encryption import revoke_user_sessions

            count = revoke_user_sessions(user_id)
            logger.info(f"Revoked {count} sessions for user {user_id}")
            return count

        except Exception as e:
            logger.error(f"Failed to revoke sessions for user {user_id}: {e}")
            return 0

    def get_user_sessions(
        self,
        user_id: str,
    ) -> list[Dict[str, Any]]:
        """
        Get all active sessions for a user.

        Args:
            user_id: User ID

        Returns:
            List of session data
        """
        try:
            from app.security.session_encryption import get_session_encryption_manager

            manager = get_session_encryption_manager()
            sessions = manager.get_user_sessions(user_id)

            # Convert to dictionaries
            session_data = []
            for session in sessions:
                session_data.append(
                    {
                        "session_id": session.session_id,
                        "created_at": session.created_at.isoformat(),
                        "last_accessed": session.last_accessed.isoformat(),
                        "expires_at": session.expires_at.isoformat(),
                        "ip_address": session.ip_address,
                        "user_agent": session.user_agent,
                        "data": session.data,
                    }
                )

            logger.info(f"Retrieved {len(session_data)} sessions for user {user_id}")
            return session_data

        except Exception as e:
            logger.error(f"Failed to get sessions for user {user_id}: {e}")
            return []


# Global instance
_secure_auth_service: Optional[SecureAuthService] = None


def get_secure_auth_service() -> SecureAuthService:
    """Get the global secure authentication service instance."""
    global _secure_auth_service
    if _secure_auth_service is None:
        _secure_auth_service = SecureAuthService()
    return _secure_auth_service


# Convenience functions
async def create_user_session(
    user_id: str,
    user_data: Dict[str, Any],
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> Tuple[str, str]:
    """Create a user session with secure tokens."""
    service = get_secure_auth_service()
    return await service.create_user_session(user_id, user_data, ip_address, user_agent)


async def verify_user_session(
    access_token: str,
    session_token: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Verify a user session."""
    service = get_secure_auth_service()
    return await service.verify_user_session(access_token, session_token)


def create_password_reset_request(
    user_id: str,
    email: str,
) -> str:
    """Create a password reset request."""
    service = get_secure_auth_service()
    return service.create_password_reset_request(user_id, email)


def verify_password_reset_request(
    token: str,
) -> Optional[Dict[str, Any]]:
    """Verify a password reset request."""
    service = get_secure_auth_service()
    return service.verify_password_reset_request(token)


def create_email_verification_request(
    user_id: str,
    email: str,
) -> str:
    """Create an email verification request."""
    service = get_secure_auth_service()
    return service.create_email_verification_request(user_id, email)


def verify_email_verification_request(
    token: str,
) -> Optional[Dict[str, Any]]:
    """Verify an email verification request."""
    service = get_secure_auth_service()
    return service.verify_email_verification_request(token)


def create_api_key(
    user_id: str,
    permissions: list[str],
    description: Optional[str] = None,
) -> str:
    """Create an API key."""
    service = get_secure_auth_service()
    return service.create_api_key(user_id, permissions, description)


def verify_api_key(
    token: str,
    required_permission: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Verify an API key."""
    service = get_secure_auth_service()
    return service.verify_api_key(token, required_permission)


# Export all functions
__all__ = [
    "SecureAuthService",
    "get_secure_auth_service",
    "create_user_session",
    "verify_user_session",
    "create_password_reset_request",
    "verify_password_reset_request",
    "create_email_verification_request",
    "verify_email_verification_request",
    "create_api_key",
    "verify_api_key",
]
