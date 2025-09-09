"""
Rate Limiting Configuration

This module provides rate limiting setup for the FastAPI application.
"""

from fastapi import FastAPI
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded


def setup_rate_limiting(app: FastAPI) -> Limiter:
    """Setup rate limiting for the FastAPI application"""
    limiter = Limiter(key_func=get_remote_address)
    
    # Add rate limiter to app
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
    return limiter