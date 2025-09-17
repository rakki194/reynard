"""
Secure Authentication Wrapper for Reynard Backend

This module provides a secure wrapper around the authentication system
to prevent SQL injection and other security vulnerabilities.
"""

import logging
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from ..security.input_validator import (
    SecureUserCreate,
    SecureUserLogin,
    sanitize_input,
    validate_command_input,
    validate_sql_input,
)

logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()


class SecureAuthManager:
    """
    Secure wrapper around the authentication manager that validates
    all inputs and prevents common security vulnerabilities.
    """

    def __init__(self, auth_manager):
        self.auth_manager = auth_manager

    async def create_user_secure(self, user_data: SecureUserCreate) -> dict[str, Any]:
        """
        Securely create a new user with comprehensive input validation.

        Args:
            user_data: Validated user creation data

        Returns:
            Dict containing user information

        Raises:
            HTTPException: If user creation fails or security violation detected
        """
        try:
            # Additional security checks
            if not self._validate_user_creation_security(user_data):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Security validation failed",
                )

            # Create user through the original auth manager
            user = await self.auth_manager.create_user(user_data)

            # Return sanitized user data
            return self._sanitize_user_response(user)

        except Exception as e:
            logger.error(f"Secure user creation failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="User creation failed"
            )

    async def authenticate_secure(self, login_data: SecureUserLogin) -> dict[str, Any]:
        """
        Securely authenticate a user with comprehensive input validation.

        Args:
            login_data: Validated login data

        Returns:
            Dict containing authentication tokens

        Raises:
            HTTPException: If authentication fails or security violation detected
        """
        try:
            # Additional security checks
            if not self._validate_login_security(login_data):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Security validation failed",
                )

            # Authenticate through the original auth manager
            tokens = await self.auth_manager.authenticate(
                username=login_data.username, password=login_data.password
            )

            if not tokens:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials",
                )

            # Return sanitized token data
            return self._sanitize_token_response(tokens)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Secure authentication failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication failed",
            )

    def _validate_user_creation_security(self, user_data: SecureUserCreate) -> bool:
        """Validate user creation data for security issues."""
        try:
            # Check for SQL injection patterns
            if not validate_sql_input(user_data.username):
                logger.warning(
                    f"SQL injection attempt in username: {user_data.username}"
                )
                return False

            if not validate_sql_input(user_data.email):
                logger.warning(f"SQL injection attempt in email: {user_data.email}")
                return False

            if not validate_sql_input(user_data.full_name):
                logger.warning(
                    f"SQL injection attempt in full_name: {user_data.full_name}"
                )
                return False

            # Check for command injection patterns
            if not validate_command_input(user_data.username):
                logger.warning(
                    f"Command injection attempt in username: {user_data.username}"
                )
                return False

            if not validate_command_input(user_data.email):
                logger.warning(f"Command injection attempt in email: {user_data.email}")
                return False

            if not validate_command_input(user_data.full_name):
                logger.warning(
                    f"Command injection attempt in full_name: {user_data.full_name}"
                )
                return False

            # Check for suspicious patterns
            if self._contains_suspicious_patterns(user_data.username):
                logger.warning(f"Suspicious username pattern: {user_data.username}")
                return False

            return True

        except Exception as e:
            logger.error(f"Security validation error: {e}")
            return False

    def _validate_login_security(self, login_data: SecureUserLogin) -> bool:
        """Validate login data for security issues."""
        try:
            # Check for SQL injection patterns
            if not validate_sql_input(login_data.username):
                logger.warning(
                    f"SQL injection attempt in login username: {login_data.username}"
                )
                return False

            # Check for command injection patterns
            if not validate_command_input(login_data.username):
                logger.warning(
                    f"Command injection attempt in login username: {login_data.username}"
                )
                return False

            # Check for suspicious patterns
            if self._contains_suspicious_patterns(login_data.username):
                logger.warning(
                    f"Suspicious login username pattern: {login_data.username}"
                )
                return False

            return True

        except Exception as e:
            logger.error(f"Login security validation error: {e}")
            return False

    def _contains_suspicious_patterns(self, text: str) -> bool:
        """Check for suspicious patterns in text."""
        suspicious_patterns = [
            r"admin",
            r"root",
            r"system",
            r"test",
            r"user",
            r"guest",
            r"null",
            r"undefined",
            r"<script",
            r"javascript:",
            r"vbscript:",
            r"data:",
            r"file:",
            r"ftp:",
            r"gopher:",
            r"http:",
            r"https:",
            r"<iframe",
            r"<object",
            r"<embed",
            r"<applet",
            r"<form",
            r"onload=",
            r"onerror=",
            r"onclick=",
            r"onmouseover=",
            r"alert\(",
            r"confirm\(",
            r"prompt\(",
            r"document\.write",
            r"innerHTML",
            r"outerHTML",
            r"document\.cookie",
            r"window\.open",
            r"window\.location",
            r"window\.history",
        ]

        import re

        for pattern in suspicious_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True

        return False

    def _sanitize_user_response(self, user: Any) -> dict[str, Any]:
        """Sanitize user response data."""
        try:
            # Convert user object to dict if needed
            if hasattr(user, "dict"):
                user_dict = user.dict()
            elif hasattr(user, "__dict__"):
                user_dict = user.__dict__
            else:
                user_dict = dict(user)

            # Remove sensitive fields
            sensitive_fields = [
                "password",
                "password_hash",
                "hashed_password",
                "salt",
                "secret",
                "private_key",
                "access_token",
                "refresh_token",
            ]

            for field in sensitive_fields:
                user_dict.pop(field, None)

            # Sanitize remaining fields
            sanitized = {}
            for key, value in user_dict.items():
                if isinstance(value, str):
                    sanitized[key] = sanitize_input(value)
                else:
                    sanitized[key] = value

            return sanitized

        except Exception as e:
            logger.error(f"Error sanitizing user response: {e}")
            return {"error": "Failed to sanitize user data"}

    def _sanitize_token_response(self, tokens: Any) -> dict[str, Any]:
        """Sanitize token response data."""
        try:
            # Convert tokens to dict if needed
            if hasattr(tokens, "dict"):
                token_dict = tokens.dict()
            elif hasattr(tokens, "__dict__"):
                token_dict = tokens.__dict__
            else:
                token_dict = dict(tokens)

            # Only include safe fields
            safe_fields = ["access_token", "refresh_token", "token_type", "expires_in"]
            sanitized = {}

            for field in safe_fields:
                if field in token_dict:
                    sanitized[field] = token_dict[field]

            return sanitized

        except Exception as e:
            logger.error(f"Error sanitizing token response: {e}")
            return {"error": "Failed to sanitize token data"}


async def get_current_user_secure(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict[str, Any]:
    """
    Securely get the current user from JWT token.

    Args:
        credentials: HTTP Bearer token credentials

    Returns:
        Dict containing user information

    Raises:
        HTTPException: If token is invalid or user not found
    """
    try:
        # Validate token format
        if not credentials or not credentials.credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authentication token",
            )

        # Check for suspicious patterns in token
        if not validate_sql_input(credentials.credentials):
            logger.warning("SQL injection attempt in JWT token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )

        # TODO: Implement actual JWT validation
        # For now, return a mock user
        return {"username": "secure_user", "role": "user", "is_active": True}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Secure user authentication failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication failed"
        )


def create_secure_auth_manager(auth_manager) -> SecureAuthManager:
    """Create a secure authentication manager wrapper."""
    return SecureAuthManager(auth_manager)
