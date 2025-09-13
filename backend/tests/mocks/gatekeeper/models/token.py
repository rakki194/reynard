"""
Mock token models for the Gatekeeper authentication library.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from pydantic import BaseModel


class TokenConfig(BaseModel):
    """Mock token configuration."""
    secret_key: str = "mock_secret"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7


class TokenData(BaseModel):
    """Mock token data."""
    sub: str
    role: str = "user"
    type: str = "access"
    exp: datetime
    iat: datetime
    jti: str = "mock_jti"


class TokenValidationResult(BaseModel):
    """Mock token validation result."""
    is_valid: bool
    payload: Optional[TokenData] = None
    error: Optional[str] = None
