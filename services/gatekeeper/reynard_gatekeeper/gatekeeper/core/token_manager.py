"""Token management for the Gatekeeper authentication library.

This module provides JWT token creation, validation, and management functionality
for the authentication system.
"""

import base64
import json
import logging
import secrets
import time
from collections import defaultdict
from datetime import UTC, datetime, timedelta
from typing import Any

from jose import JWTError, jwt

from ..models.token import TokenConfig, TokenData, TokenResponse, TokenValidationResult

logger = logging.getLogger(__name__)

# JWT structure constants
JWT_PARTS_COUNT = 3  # JWT tokens have exactly 3 parts: header.payload.signature
TOKEN_TYPE_ACCESS = "access"  # JWT token type constant for access tokens  # noqa: S105
TOKEN_TYPE_BEARER = "bearer"  # OAuth token type constant  # noqa: S105


class TokenManager:
    """Token management class for JWT operations.

    Provides methods for creating, validating, and managing JWT tokens
    for authentication and authorization.
    """

    def __init__(self, config: TokenConfig):
        """Initialize the token manager.

        Args:
            config: Token configuration containing secret key and other settings

        """
        self.config = config
        self._validate_config()

        # Token blacklist for revoked tokens
        self._blacklisted_tokens: set[str] = set()

        # Rate limiting tracking
        self._rate_limit_tracker: dict[str, list] = defaultdict(list)
        self._max_requests_per_minute = 60

        # Cleanup old rate limit entries periodically
        self._last_cleanup = time.time()

    def _validate_config(self) -> None:
        """Validate the token configuration."""
        if not self.config.secret_key:
            raise ValueError("Secret key is required for token management")

        if (
            self.config.secret_key
            == "test-secret-key-for-testing-only-not-for-production"  # noqa: S105
        ):
            logger.warning("Using test secret key - not suitable for production")

    def _cleanup_rate_limits(self) -> None:
        """Clean up old rate limit entries."""
        current_time = time.time()
        cleanup_interval_seconds = 300  # Clean up every 5 minutes
        rate_limit_window_seconds = 60  # Keep only last minute

        if current_time - self._last_cleanup > cleanup_interval_seconds:
            cutoff_time = current_time - rate_limit_window_seconds

            # Create a copy of keys to avoid modification during iteration
            ip_addresses = list(self._rate_limit_tracker.keys())
            for ip_address in ip_addresses:
                self._rate_limit_tracker[ip_address] = [
                    timestamp
                    for timestamp in self._rate_limit_tracker[ip_address]
                    if timestamp > cutoff_time
                ]

                # Remove empty entries
                if not self._rate_limit_tracker[ip_address]:
                    del self._rate_limit_tracker[ip_address]

            self._last_cleanup = current_time

    def check_rate_limit(self, identifier: str) -> bool:
        """Check if the request is within rate limits.

        Args:
            identifier: IP address or user identifier

        Returns:
            bool: True if within limits, False if rate limited

        """
        self._cleanup_rate_limits()

        current_time = time.time()
        cutoff_time = current_time - 60  # 1 minute window

        # Filter recent requests
        recent_requests = [
            timestamp
            for timestamp in self._rate_limit_tracker[identifier]
            if timestamp > cutoff_time
        ]

        # Check if within limit
        if len(recent_requests) >= self._max_requests_per_minute:
            return False

        # Add current request
        self._rate_limit_tracker[identifier].append(current_time)
        return True

    def blacklist_token(self, token: str) -> None:
        """Add a token to the blacklist (revoke it).

        Args:
            token: The JWT token to blacklist

        """
        self._blacklisted_tokens.add(token)
        logger.info("Token blacklisted (length: %d)", len(token))

    def is_token_blacklisted(self, token: str) -> bool:
        """Check if a token is blacklisted.

        Args:
            token: The JWT token to check

        Returns:
            bool: True if token is blacklisted

        """
        return token in self._blacklisted_tokens

    def create_access_token(
        self,
        data: dict[str, Any],
        expires_delta: timedelta | None = None,
    ) -> str:
        """Creates a JWT access token.

        Args:
            data: The data to encode into the token (e.g., {"sub": username, "role": role})
            expires_delta: The timedelta for token expiration

        Returns:
            str: The encoded JWT token

        """
        # Convert TokenData to dict if needed
        to_encode = data.model_dump() if hasattr(data, "model_dump") else data.copy()

        # Only set expiration if not already provided or if expires_delta is specified
        if expires_delta:
            expire = datetime.now(UTC) + expires_delta
            to_encode.update(
                {
                    "exp": expire,
                    "iat": datetime.now(UTC),
                    "type": "access",
                    "jti": secrets.token_urlsafe(32),
                },
            )
        elif "exp" not in to_encode:
            # Only set default expiration if not already provided
            expire = datetime.now(UTC) + self.config.access_token_expire_timedelta
            to_encode.update(
                {
                    "exp": expire,
                    "iat": datetime.now(UTC),
                    "type": "access",
                    "jti": secrets.token_urlsafe(32),
                },
            )
        else:
            # Keep existing exp, just add other fields
            to_encode.update(
                {
                    "iat": datetime.now(UTC),
                    "type": "access",
                    "jti": secrets.token_urlsafe(32),
                },
            )

        # Add optional claims
        if self.config.issuer:
            to_encode["iss"] = self.config.issuer
        if self.config.audience:
            to_encode["aud"] = self.config.audience

        encoded_jwt = jwt.encode(
            to_encode,
            self.config.secret_key,
            algorithm=self.config.algorithm,
        )
        return str(encoded_jwt)

    def create_refresh_token(
        self,
        data: dict[str, Any],
        expires_delta: timedelta | None = None,
    ) -> str:
        """Creates a JWT refresh token.

        Args:
            data: The data to encode into the token (e.g., {"sub": username, "role": role})
            expires_delta: The timedelta for token expiration

        Returns:
            str: The encoded JWT refresh token

        """
        # Convert TokenData to dict if needed
        to_encode = data.model_dump() if hasattr(data, "model_dump") else data.copy()

        if expires_delta:
            expire = datetime.now(UTC) + expires_delta
        else:
            expire = datetime.now(UTC) + self.config.refresh_token_expire_timedelta

        to_encode.update(
            {
                "exp": expire,
                "iat": datetime.now(UTC),
                "type": "refresh",
                "jti": secrets.token_urlsafe(32),
            },
        )

        # Add optional claims
        if self.config.issuer:
            to_encode["iss"] = self.config.issuer
        if self.config.audience:
            to_encode["aud"] = self.config.audience

        encoded_jwt = jwt.encode(
            to_encode,
            self.config.secret_key,
            algorithm=self.config.algorithm,
        )
        return str(encoded_jwt)

    def create_tokens(self, data: dict[str, Any]) -> TokenResponse:
        """Create both access and refresh tokens.

        Args:
            data: The data to encode into the tokens

        Returns:
            TokenResponse: Object containing both tokens and metadata

        """
        access_token = self.create_access_token(data)
        refresh_token = self.create_refresh_token(data)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type=TOKEN_TYPE_BEARER,
            expires_in=self.config.access_token_expire_minutes * 60,
            refresh_expires_in=self.config.refresh_token_expire_days * 24 * 60 * 60,
        )

    def verify_token(
        self,
        token: str,
        token_type: str = TOKEN_TYPE_ACCESS,
    ) -> TokenValidationResult:
        """Verify and decode a JWT token.

        Args:
            token: The JWT token to verify
            token_type: Expected token type ("access" or "refresh")

        Returns:
            TokenValidationResult: Result of token validation

        """
        try:
            # Check if token is blacklisted
            if self.is_token_blacklisted(token):
                return TokenValidationResult(
                    is_valid=False,
                    error="Token has been revoked",
                )

            # Decode and verify token
            payload = jwt.decode(
                token,
                self.config.secret_key,
                algorithms=[self.config.algorithm],
                issuer=self.config.issuer,
                audience=self.config.audience,
            )

            # Validate token type
            if payload.get("type") != token_type:
                return TokenValidationResult(
                    is_valid=False,
                    error=f"Invalid token type. Expected {token_type}",
                )

            # Check expiration
            exp = payload.get("exp")
            if exp and datetime.fromtimestamp(exp, tz=UTC) < datetime.now(UTC):
                return TokenValidationResult(
                    is_valid=False,
                    error="Token has expired",
                )

            return TokenValidationResult(
                is_valid=True,
                payload=TokenData(
                    sub=payload.get("sub"),
                    role=payload.get("role"),
                    type=payload.get("type"),
                    exp=exp,
                ),
            )

        except JWTError as e:
            error_msg = str(e)
            is_expired = "expired" in error_msg.lower() or "exp" in error_msg.lower()
            return TokenValidationResult(
                is_valid=False,
                error=error_msg,
                is_expired=is_expired,
            )
        except (ValueError, TypeError, KeyError):
            logger.exception("Unexpected error during token verification")
            return TokenValidationResult(
                is_valid=False,
                error="Token verification failed",
            )

    def refresh_access_token(self, refresh_token: str) -> str | None:
        """Create a new access token using a valid refresh token.

        Args:
            refresh_token: The refresh token

        Returns:
            Optional[str]: New access token if refresh token is valid

        """
        result = self.verify_token(refresh_token, "refresh")
        if not result.is_valid:
            return None

        # Create new access token with same user data
        payload = result.payload
        if payload is None:
            return None

        # pylint: disable=no-member
        # Pydantic's dynamic field system confuses static type checkers, which see
        # FieldInfo objects instead of actual field values. This is a known false
        # positive - at runtime, payload is guaranteed to be a TokenData object
        # with .sub and .role attributes after the None check above.
        user_data = {"sub": payload.sub, "role": payload.role}

        return self.create_access_token(user_data)

    def get_token_info(self, token: str) -> dict[str, Any] | None:
        """Get information about a token without verifying it.

        Args:
            token: The JWT token

        Returns:
            Optional[Dict[str, Any]]: Token payload if valid format

        """
        try:
            # Split token and decode payload directly (bypasses signature verification)
            # This is safe as we're not using the payload for authentication decisions
            parts = token.split(".")
            if len(parts) != JWT_PARTS_COUNT:
                return None

            # Decode the payload part (base64url)
            # Add padding if needed
            payload_part = parts[1]
            payload_part += "=" * (4 - len(payload_part) % 4)

            payload_bytes = base64.urlsafe_b64decode(payload_part)
            payload = json.loads(payload_bytes)
            return dict(payload)
        except (json.JSONDecodeError, IndexError):
            return None

    def revoke_user_tokens(self, username: str) -> None:
        """Revoke all tokens for a specific user.
        Note: This is a simple implementation. In production, you might want
        to track tokens by user and revoke them individually.

        Args:
            username: The username whose tokens should be revoked

        """
        # In a production system, you would track tokens by user
        # and revoke them individually. This is a placeholder.
        logger.info("All tokens for user '%s' marked for revocation", username)

    def cleanup_expired_blacklist(self) -> None:
        """Clean up expired tokens from blacklist to save memory."""
        current_time = time.time()
        expired_tokens = set()

        for token in self._blacklisted_tokens:
            try:
                # Use get_token_info for safe unverified decode
                payload = self.get_token_info(token)
                if payload:
                    exp = payload.get("exp")
                    if exp and exp < current_time:
                        expired_tokens.add(token)
                else:
                    # Invalid token format, remove it
                    expired_tokens.add(token)
            except (json.JSONDecodeError, IndexError):
                # Any error, remove the token
                expired_tokens.add(token)

        # Remove expired tokens
        self._blacklisted_tokens -= expired_tokens
        if expired_tokens:
            logger.info("Cleaned up %d expired blacklisted tokens", len(expired_tokens))

    def get_blacklist_stats(self) -> dict[str, Any]:
        """Get statistics about the token blacklist.

        Returns:
            Dict[str, Any]: Statistics about blacklisted tokens

        """
        return {
            "total_blacklisted": len(self._blacklisted_tokens),
            "rate_limit_entries": len(self._rate_limit_tracker),
            "last_cleanup": self._last_cleanup,
        }
