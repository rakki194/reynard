"""
JWT token utilities for Reynard Backend.

This module provides JWT token creation, verification, and management functionality
using the Gatekeeper library.
"""

from datetime import timedelta
from typing import Any

from app.security.jwt_secret_manager import get_jwt_secret_key
from gatekeeper.api.dependencies import get_auth_manager  # type: ignore[import-untyped]


async def create_access_token(
    data: dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    """
    Create a JWT access token.

    Args:
        data: The data to encode into the token
        expires_delta: Optional custom expiration time

    Returns:
        str: The encoded JWT access token
    """
    auth_manager = await get_auth_manager()
    # Gatekeeper returns Any, but we know it's a string
    token_result = auth_manager.token_manager.create_access_token(data, expires_delta)
    return str(token_result)


async def create_refresh_token(
    data: dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    """
    Create a JWT refresh token.

    Args:
        data: The data to encode into the token
        expires_delta: Optional custom expiration time

    Returns:
        str: The encoded JWT refresh token
    """
    auth_manager = await get_auth_manager()
    # Gatekeeper returns Any, but we know it's a string
    token_result = auth_manager.token_manager.create_refresh_token(data, expires_delta)
    return str(token_result)


async def verify_token(token: str, kind: str = "access") -> dict[str, Any] | None:
    """
    Verify and decode a JWT token.

    Args:
        token: The JWT token to verify
        kind: Expected token type ("access" or "refresh")

    Returns:
        Optional[Dict[str, Any]]: Token payload if valid, None otherwise
    """
    auth_manager = await get_auth_manager()
    result = auth_manager.token_manager.verify_token(token, kind)

    if result.is_valid and result.payload:
        # Gatekeeper returns Any, but we know it's a dict
        return dict(result.payload)
    return None


# Synchronous wrappers for backward compatibility with tests
def create_access_token_sync(
    data: dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    """
    Synchronous wrapper for create_access_token.

    This is a simplified version that creates tokens directly using the token manager
    for testing purposes.
    """
    from gatekeeper.core.token_manager import (
        TokenManager,  # type: ignore[import-untyped]
    )
    from gatekeeper.models.token import TokenConfig  # type: ignore[import-untyped]

    # Use test configuration
    config = TokenConfig(
        secret_key=get_jwt_secret_key(),
        algorithm="HS256",
        access_token_expire_minutes=30,
        refresh_token_expire_days=7,
    )

    # Ensure required fields are present for gatekeeper compatibility
    token_data: dict[str, Any] = data.copy()
    if "role" not in token_data:
        token_data["role"] = "user"
    if "sub" not in token_data:
        # Use username as sub if available, otherwise use a default
        token_data["sub"] = token_data.get("username", "anonymous")

    # Store custom fields in metadata to preserve them through Gatekeeper verification
    metadata: dict[str, Any] = {}
    gatekeeper_fields: set[str] = {
        "sub",
        "role",
        "type",
        "exp",
        "iat",
        "jti",
        "metadata",
    }
    metadata = {
        key: value
        for key, value in token_data.items()
        if key not in gatekeeper_fields and key != "sub"
    }

    # Add metadata to token data
    if metadata:
        token_data["metadata"] = metadata

    # Filter out sensitive fields that shouldn't be in tokens
    sensitive_fields: set[str] = {
        "password",
        "secret_key",
        "secret",
        "api_key",
        "private_key",
    }
    for field in sensitive_fields:
        token_data.pop(field, None)

    token_manager = TokenManager(config)
    # Gatekeeper returns Any, but we know it's a string
    token_result = token_manager.create_access_token(token_data, expires_delta)
    return str(token_result)


def create_refresh_token_sync(
    data: dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    """
    Synchronous wrapper for create_refresh_token.

    This is a simplified version that creates tokens directly using the token manager
    for testing purposes.
    """
    from gatekeeper.core.token_manager import TokenManager
    from gatekeeper.models.token import TokenConfig

    # Use test configuration
    config = TokenConfig(
        secret_key=get_jwt_secret_key(),
        algorithm="HS256",
        access_token_expire_minutes=30,
        refresh_token_expire_days=7,
    )

    # Ensure required fields are present for gatekeeper compatibility
    token_data: dict[str, Any] = data.copy()
    if "role" not in token_data:
        token_data["role"] = "user"
    if "sub" not in token_data:
        # Use username as sub if available, otherwise use a default
        token_data["sub"] = token_data.get("username", "anonymous")

    # Store custom fields in metadata to preserve them through Gatekeeper verification
    metadata: dict[str, Any] = {}
    gatekeeper_fields: set[str] = {
        "sub",
        "role",
        "type",
        "exp",
        "iat",
        "jti",
        "metadata",
    }
    metadata = {
        key: value
        for key, value in token_data.items()
        if key not in gatekeeper_fields and key != "sub"
    }

    # Add metadata to token data
    if metadata:
        token_data["metadata"] = metadata

    # Filter out sensitive fields that shouldn't be in tokens
    sensitive_fields: set[str] = {
        "password",
        "secret_key",
        "secret",
        "api_key",
        "private_key",
    }
    for field in sensitive_fields:
        token_data.pop(field, None)

    token_manager = TokenManager(config)
    # Gatekeeper returns Any, but we know it's a string
    token_result = token_manager.create_refresh_token(token_data, expires_delta)
    return str(token_result)


def verify_token_sync(token: str, kind: str = "access") -> dict[str, Any] | None:
    """
    Synchronous wrapper for verify_token.

    This is a simplified version that verifies tokens directly using the token manager
    for testing purposes.
    """
    from gatekeeper.core.token_manager import (
        TokenManager,  # type: ignore[import-untyped]
    )
    from gatekeeper.models.token import TokenConfig  # type: ignore[import-untyped]

    # Use test configuration
    config = TokenConfig(
        secret_key=get_jwt_secret_key(),
        algorithm="HS256",
        access_token_expire_minutes=30,
        refresh_token_expire_days=7,
    )

    token_manager = TokenManager(config)
    result = token_manager.verify_token(token, kind)

    if result.is_valid and result.payload:
        # Get the raw JWT payload from model_dump() which contains all fields
        result_dict: dict[str, Any] = result.model_dump()
        payload_dict: dict[str, Any] = result_dict.get("payload", {})

        # Extract custom fields from metadata
        metadata: dict[str, Any] = payload_dict.get("metadata", {})
        payload_dict.update(metadata)

        # Add username field for backward compatibility if it's not present
        # Only add if username wasn't in the original token data
        if "sub" in payload_dict and "username" not in payload_dict:
            payload_dict["username"] = payload_dict["sub"]
        return payload_dict
    if result.is_valid and not result.payload:
        # Handle case where token is valid but payload is None (missing required fields)
        # This happens when gatekeeper validation fails but token is structurally valid
        return None
    return None


# Export both async and sync versions
__all__ = [
    "create_access_token",
    "create_access_token_sync",
    "create_refresh_token",
    "create_refresh_token_sync",
    "verify_token",
    "verify_token_sync",
]
