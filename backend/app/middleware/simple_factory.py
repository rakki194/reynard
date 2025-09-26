"""🦊 Simple Middleware Factory for Reynard Backend

This module provides a simplified factory system for creating and configuring
the modular middleware stack with sensible defaults and easy integration.
"""

import logging
from typing import Any, Callable, Dict, List, Optional

from fastapi import FastAPI

from .core.base import BaseMiddleware
from .cors.config import CORSConfig
from .cors.middleware import CORSMiddleware
from .development.bypass import DevelopmentBypassMiddleware
from .rate_limiting.simple import SimpleRateLimiter
from .security.headers import SecurityHeadersMiddleware
from .security.input_validation import InputValidationMiddleware

logger = logging.getLogger(__name__)


def setup_reynard_middleware(
    app: FastAPI,
    environment: str = "development",
    security_config: Optional[Dict[str, Any]] = None,
    **kwargs,
) -> FastAPI:
    """Set up the complete Reynard middleware stack.

    Args:
        app: FastAPI application instance
        environment: Environment (development, staging, production)
        security_config: Security configuration dictionary
        **kwargs: Additional configuration options

    Returns:
        FastAPI: Application with middleware configured
    """
    logger.info(f"Setting up Reynard middleware for {environment} environment")

    # Create middleware stack
    middleware_stack = create_middleware_stack(
        environment=environment, security_config=security_config, **kwargs
    )

    # Add middleware to app in reverse order (last added = first executed)
    for middleware in reversed(middleware_stack):
        app.add_middleware(middleware)
        logger.debug(f"Added middleware: {middleware.__name__}")

    logger.info(
        f"Successfully configured {len(middleware_stack)} middleware components"
    )
    return app


def create_middleware_stack(
    environment: str = "development",
    security_config: Optional[Dict[str, Any]] = None,
    **kwargs,
) -> List[type]:
    """Create the middleware stack for the application.

    Args:
        environment: Environment (development, staging, production)
        security_config: Security configuration dictionary
        **kwargs: Additional configuration options

    Returns:
        List[type]: List of middleware classes in execution order
    """
    middleware_stack = []

    # Development bypass middleware (only in development)
    if environment == "development":
        middleware_stack.append(DevelopmentBypassMiddleware)

    # CORS middleware
    middleware_stack.append(CORSMiddleware)

    # Security headers middleware
    middleware_stack.append(SecurityHeadersMiddleware)

    # Input validation middleware
    middleware_stack.append(InputValidationMiddleware)

    # Rate limiting middleware
    middleware_stack.append(SimpleRateLimiter)

    return middleware_stack


def create_middleware_instance(
    middleware_class: type,
    app: Callable,
    config: Optional[Dict[str, Any]] = None,
    **kwargs,
) -> BaseMiddleware:
    """Create a middleware instance with configuration.

    Args:
        middleware_class: Middleware class to instantiate
        app: ASGI application
        config: Configuration dictionary
        **kwargs: Additional keyword arguments

    Returns:
        BaseMiddleware: Configured middleware instance
    """
    config = config or {}

    # Merge config and kwargs
    init_kwargs = {**config, **kwargs}

    # Create middleware instance
    middleware = middleware_class(app, **init_kwargs)

    logger.debug(f"Created middleware instance: {middleware.name}")
    return middleware


def get_default_config(environment: str = "development") -> Dict[str, Any]:
    """Get default configuration for the specified environment.

    Args:
        environment: Environment (development, staging, production)

    Returns:
        Dict[str, Any]: Default configuration dictionary
    """
    base_config = {
        "environment": environment,
        "debug": environment == "development",
    }

    if environment == "development":
        return {
            **base_config,
            "cors_origins": ["*"],
            "rate_limit": 1000,
            "bypass_enabled": True,
        }
    elif environment == "staging":
        return {
            **base_config,
            "cors_origins": ["https://staging.example.com"],
            "rate_limit": 100,
            "bypass_enabled": False,
        }
    else:  # production
        return {
            **base_config,
            "cors_origins": ["https://example.com"],
            "rate_limit": 50,
            "bypass_enabled": False,
        }
