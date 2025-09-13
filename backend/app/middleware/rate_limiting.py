"""
Rate Limiting Configuration

This module provides comprehensive rate limiting setup for the FastAPI application
with specific rules for authentication endpoints and general API usage.
"""

from fastapi import FastAPI, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import time
from typing import Dict, Tuple


def get_client_identifier(request: Request) -> str:
    """
    Get a unique identifier for the client making the request.
    Uses IP address as primary identifier with fallback to user agent.
    
    Special handling for development bypass:
    - If bypass_rate_limiting is set in request.state, return a special identifier
    - This allows the blackhat testing suite to bypass rate limiting in dev mode
    """
    # Check for development bypass flag
    if hasattr(request.state, 'bypass_rate_limiting') and request.state.bypass_rate_limiting:
        return "dev-bypass-blackhat-testing"
    
    # Try to get real IP from headers (for reverse proxy setups)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # Take the first IP in the chain
        client_ip = forwarded_for.split(",")[0].strip()
    else:
        client_ip = get_remote_address(request)
    
    # Add user agent hash for additional uniqueness
    user_agent = request.headers.get("User-Agent", "")
    user_agent_hash = str(hash(user_agent))[:8]
    
    return f"{client_ip}:{user_agent_hash}"


def setup_rate_limiting(app: FastAPI) -> Limiter:
    """
    Setup comprehensive rate limiting for the FastAPI application.
    
    Rate limiting rules:
    - General API: 100 requests per minute
    - Authentication endpoints: 5 requests per minute
    - Registration endpoints: 3 requests per minute
    - Password reset: 2 requests per minute
    - Development bypass: Unlimited (for blackhat testing suite)
    """
    limiter = Limiter(
        key_func=get_client_identifier,
        default_limits=["100/minute"],  # General API rate limit
        storage_uri="memory://",  # Use in-memory storage for simplicity
    )
    
    # Add special rate limit for development bypass
    # This gives unlimited access to the blackhat testing suite in dev mode
    limiter.limit("10000/minute", key_func=lambda request: "dev-bypass-blackhat-testing")
    
    # Add rate limiter to app
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
    # Add SlowAPI middleware
    app.add_middleware(SlowAPIMiddleware)
    
    return limiter


# Rate limiting decorators for specific endpoints
def auth_rate_limit():
    """Rate limit for authentication endpoints (login, refresh)"""
    return limiter.limit("5/minute")


def registration_rate_limit():
    """Rate limit for registration endpoints"""
    return limiter.limit("3/minute")


def password_reset_rate_limit():
    """Rate limit for password reset endpoints"""
    return limiter.limit("2/minute")


def api_rate_limit():
    """Rate limit for general API endpoints"""
    return limiter.limit("100/minute")


# Global limiter instance
limiter = None


def get_limiter() -> Limiter:
    """Get the global limiter instance"""
    global limiter
    if limiter is None:
        limiter = Limiter(
            key_func=get_client_identifier,
            default_limits=["100/minute"],
            storage_uri="memory://",
        )
    return limiter