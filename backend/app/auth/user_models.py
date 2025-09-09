"""
User Models

This module defines Pydantic models for user-related operations
with enhanced validation and security.
"""

import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
from app.security.input_validation import validate_input_security


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        if not v or len(v) < 3 or len(v) > 50:
            raise ValueError('Username must be between 3 and 50 characters')
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Username can only contain letters, numbers, underscores, and hyphens')
        return validate_input_security(v, 'username')
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if not v or len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if len(v) > 128:
            raise ValueError('Password is too long')
        return validate_input_security(v, 'password')
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        return validate_input_security(str(v), 'email')


class UserLogin(BaseModel):
    username: str
    password: str
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        return validate_input_security(v, 'username')
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        return validate_input_security(v, 'password')


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str