"""
Rate Limiting Configuration

This module provides comprehensive rate limiting setup for the FastAPI application
with specific rules for authentication endpoints and general API usage.
Now integrated with adaptive rate limiting and centralized security management.
"""

from fastapi import FastAPI, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.security.adaptive_rate_limiter import adaptive_rate_limiter
from app.security.security_config import get_security_config

# Rate limiting constants
DEFAULT_RATE_LIMIT = "100/minute"


def get_client_identifier(request: Request) -> str:
    """
    Get a unique identifier for the client making the request.
    Uses IP address as primary identifier with fallback to user agent.

    Special handling for development bypass:
    - If bypass_rate_limiting is set in request.state, return a special identifier
    - This allows the fenrir testing suite to bypass rate limiting in dev mode
    """
    # Check for development bypass flag
    if (
        hasattr(request.state, "bypass_rate_limiting")
        and request.state.bypass_rate_limiting
    ):
        return "dev-bypass-fenrir-testing"

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


def get_adaptive_client_identifier(request: Request) -> str:
    """
    Get a unique identifier for the client using adaptive rate limiting.
    Uses the same logic as the adaptive rate limiter for consistency.
    """
    # Check for development bypass flag
    if (
        hasattr(request.state, "bypass_rate_limiting")
        and request.state.bypass_rate_limiting
    ):
        return "dev-bypass-fenrir-testing"
    
    # Use adaptive rate limiter's client identifier
    return adaptive_rate_limiter._get_client_identifier(request)


def setup_rate_limiting(app: FastAPI) -> Limiter:
    """
    Setup comprehensive rate limiting for the FastAPI application.

    Rate limiting rules:
    - General API: 100 requests per minute
    - Authentication endpoints: 5 requests per minute
    - Registration endpoints: 3 requests per minute
    - Password reset: 2 requests per minute
    - Development bypass: Unlimited (for fenrir testing suite)
    - Adaptive rate limiting: Based on client behavior and threat levels
    """
    # Load security configuration
    config = get_security_config()
    
    # Use adaptive rate limiting if enabled
    if config.adaptive_rate_limiting:
        limiter = Limiter(
            key_func=get_adaptive_client_identifier,
            default_limits=[config.default_rate_limit],
            storage_uri="memory://",
        )
    else:
        limiter = Limiter(
            key_func=get_client_identifier,
            default_limits=[DEFAULT_RATE_LIMIT],
            storage_uri="memory://",
        )

    # Add special rate limit for development bypass
    # This gives unlimited access to the fenrir testing suite in dev mode
    limiter.limit("10000/minute", key_func=lambda request: "dev-bypass-fenrir-testing")

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
    return limiter.limit(DEFAULT_RATE_LIMIT)


# Global limiter instance
limiter = None


def get_limiter() -> Limiter:
    """Get the global limiter instance"""
    global limiter
    if limiter is None:
        limiter = Limiter(
            key_func=get_client_identifier,
            default_limits=[DEFAULT_RATE_LIMIT],
            storage_uri="memory://",
        )
    return limiter
