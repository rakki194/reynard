"""Authentication module for Reynard Backend.

This module provides authentication functionality using the Gatekeeper library.
It wraps the Gatekeeper functionality to provide a consistent interface
for the application.
"""

from .jwt_utils import create_access_token, create_refresh_token, verify_token
from .password_utils import get_password_hash, verify_password
from .user_models import RefreshTokenRequest, UserCreate, UserLogin
from .user_service import (
    authenticate_user,
    create_user,
    get_current_active_user,
    get_current_agent,
    get_current_user,
    logout_user,
    refresh_tokens_db,
    refresh_user_token,
    users_db,
)

__all__ = [
    "RefreshTokenRequest",
    "UserCreate",
    "UserLogin",
    "authenticate_user",
    "create_access_token",
    "create_refresh_token",
    "create_user",
    "get_current_active_user",
    "get_current_agent",
    "get_current_user",
    "get_password_hash",
    "logout_user",
    "refresh_tokens_db",
    "refresh_user_token",
    "users_db",
    "verify_password",
    "verify_token",
]
