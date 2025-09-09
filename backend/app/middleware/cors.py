"""
CORS middleware configuration for Reynard Backend.

This module provides secure CORS configuration with proper
origin validation and header management.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from ..config import get_config


def setup_cors_middleware(app: FastAPI) -> None:
    """Setup CORS and trusted host middleware."""
    config = get_config()
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=config.CORS_METHODS,
        allow_headers=config.CORS_HEADERS,
        expose_headers=config.CORS_EXPOSE_HEADERS,
        max_age=config.CORS_MAX_AGE,
    )
    
    # Trusted host middleware
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=config.ALLOWED_HOSTS,
    )
