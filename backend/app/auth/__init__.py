"""
Authentication module for Reynard Backend.

This module provides JWT-based authentication with proper signature verification,
password hashing, and user management.
"""

from .jwt_handler import create_access_token, create_refresh_token, verify_token
from .password_utils import get_password_hash, verify_password
from .user_models import UserCreate, UserLogin, UserResponse, Token, TokenData, RefreshTokenRequest
from .user_service import get_current_user, get_current_active_user

__all__ = [
    "create_access_token",
    "create_refresh_token", 
    "verify_token",
    "get_password_hash",
    "verify_password",
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "Token",
    "TokenData",
    "RefreshTokenRequest",
    "get_current_user",
    "get_current_active_user",
]
