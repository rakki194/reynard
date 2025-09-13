"""
JWT token utilities for Reynard Backend.

This module provides JWT token creation, verification, and management functionality
using the Gatekeeper library.
"""

from datetime import timedelta
from typing import Any, Dict, Optional

from gatekeeper.api.dependencies import get_auth_manager
from app.security.jwt_secret_manager import get_jwt_secret_key, get_jwt_algorithm


async def create_access_token(
    data: Dict[str, Any], expires_delta: Optional[timedelta] = None
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
    return auth_manager.token_manager.create_access_token(data, expires_delta)


async def create_refresh_token(
    data: Dict[str, Any], expires_delta: Optional[timedelta] = None
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
    return auth_manager.token_manager.create_refresh_token(data, expires_delta)


async def verify_token(token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
    """
    Verify and decode a JWT token.
    
    Args:
        token: The JWT token to verify
        token_type: Expected token type ("access" or "refresh")
        
    Returns:
        Optional[Dict[str, Any]]: Token payload if valid, None otherwise
    """
    auth_manager = await get_auth_manager()
    result = auth_manager.token_manager.verify_token(token, token_type)
    
    if result.is_valid and result.payload:
        return result.payload
    return None


# Synchronous wrappers for backward compatibility with tests
def create_access_token_sync(
    data: Dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Synchronous wrapper for create_access_token.
    
    This is a simplified version that creates tokens directly using the token manager
    for testing purposes.
    """
    from gatekeeper.models.token import TokenConfig
    from gatekeeper.core.token_manager import TokenManager
    
    # Use test configuration
    config = TokenConfig(
        secret_key=get_jwt_secret_key(),
        algorithm="HS256",
        access_token_expire_minutes=30,
        refresh_token_expire_days=7,
    )
    
    # Ensure required fields are present for gatekeeper compatibility
    token_data = data.copy()
    if "role" not in token_data:
        token_data["role"] = "user"
    if "sub" not in token_data:
        # Use username as sub if available, otherwise use a default
        token_data["sub"] = token_data.get("username", "anonymous")
    
    # Filter out sensitive fields that shouldn't be in tokens
    sensitive_fields = {"password", "secret_key", "secret", "api_key", "private_key"}
    for field in sensitive_fields:
        token_data.pop(field, None)
    
    token_manager = TokenManager(config)
    return token_manager.create_access_token(token_data, expires_delta)


def create_refresh_token_sync(
    data: Dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Synchronous wrapper for create_refresh_token.
    
    This is a simplified version that creates tokens directly using the token manager
    for testing purposes.
    """
    from gatekeeper.models.token import TokenConfig
    from gatekeeper.core.token_manager import TokenManager
    
    # Use test configuration
    config = TokenConfig(
        secret_key=get_jwt_secret_key(),
        algorithm="HS256",
        access_token_expire_minutes=30,
        refresh_token_expire_days=7,
    )
    
    # Ensure required fields are present for gatekeeper compatibility
    token_data = data.copy()
    if "role" not in token_data:
        token_data["role"] = "user"
    if "sub" not in token_data:
        # Use username as sub if available, otherwise use a default
        token_data["sub"] = token_data.get("username", "anonymous")
    
    # Filter out sensitive fields that shouldn't be in tokens
    sensitive_fields = {"password", "secret_key", "secret", "api_key", "private_key"}
    for field in sensitive_fields:
        token_data.pop(field, None)
    
    token_manager = TokenManager(config)
    return token_manager.create_refresh_token(token_data, expires_delta)


def verify_token_sync(token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
    """
    Synchronous wrapper for verify_token.
    
    This is a simplified version that verifies tokens directly using the token manager
    for testing purposes.
    """
    from gatekeeper.models.token import TokenConfig
    from gatekeeper.core.token_manager import TokenManager
    
    # Use test configuration
    config = TokenConfig(
        secret_key=get_jwt_secret_key(),
        algorithm="HS256",
        access_token_expire_minutes=30,
        refresh_token_expire_days=7,
    )
    
    token_manager = TokenManager(config)
    result = token_manager.verify_token(token, token_type)
    
    if result.is_valid and result.payload:
        # Get the raw JWT payload from model_dump() which contains all fields
        result_dict = result.model_dump()
        payload_dict = result_dict.get('payload', {})
        
        # Add username field for backward compatibility if it's not present
        # Only add if username wasn't in the original token data
        if 'sub' in payload_dict and 'username' not in payload_dict:
            payload_dict['username'] = payload_dict['sub']
        return payload_dict
    elif result.is_valid and not result.payload:
        # Handle case where token is valid but payload is None (missing required fields)
        # This happens when gatekeeper validation fails but token is structurally valid
        return None
    return None


# Export the synchronous versions for tests
create_access_token = create_access_token_sync
create_refresh_token = create_refresh_token_sync
verify_token = verify_token_sync
