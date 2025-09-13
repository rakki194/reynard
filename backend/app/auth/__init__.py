"""
Authentication module for Reynard Backend.

This module provides authentication functionality using the Gatekeeper library.
It wraps the Gatekeeper functionality to provide a consistent interface
for the application.
"""

from .jwt_utils import create_access_token, create_refresh_token, verify_token
from .password_utils import get_password_hash, verify_password
from .user_service import (
    create_user,
    authenticate_user,
    refresh_user_token,
    logout_user,
    get_current_user,
    get_current_active_user,
    users_db,
    refresh_tokens_db,
)
from .user_models import UserCreate, UserLogin, RefreshTokenRequest

__all__ = [
    "create_access_token",
    "create_refresh_token", 
    "verify_token",
    "get_password_hash",
    "verify_password",
    "create_user",
    "authenticate_user",
    "refresh_user_token",
    "logout_user",
    "get_current_user",
    "get_current_active_user",
    "users_db",
    "refresh_tokens_db",
    "UserCreate",
    "UserLogin",
    "RefreshTokenRequest",
]

