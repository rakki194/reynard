"""
User models for Reynard Backend.

This module provides Pydantic models for user-related operations.
"""

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Model for user creation."""

    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=1, max_length=100)


class UserLogin(BaseModel):
    """Model for user login."""

    username: str
    password: str


class RefreshTokenRequest(BaseModel):
    """Model for refresh token request."""

    refresh_token: str


class UserResponse(BaseModel):
    """Model for user response."""

    username: str
    email: str
    full_name: str
    is_active: bool
    created_at: str


class AuthResponse(BaseModel):
    """Model for authentication response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshResponse(BaseModel):
    """Model for token refresh response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
