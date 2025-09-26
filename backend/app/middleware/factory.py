"""Middleware factory for creating and configuring the complete middleware stack.

This module provides a clean, simple factory for setting up all middleware
components with proper integration and configuration.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import FastAPI

from .cors.middleware import CORSMiddleware
from .development.bypass import DevelopmentBypassMiddleware
from .rate_limiting.simple import SimpleRateLimiter
from .security.headers import SecurityHeadersMiddleware
from .security.input_validation import InputValidationMiddleware

logger = logging.getLogger(__name__)


def setup_middleware(
    app: FastAPI, environment: str = "development", **config_kwargs
) -> None:
    """Setup all Reynard middleware for a FastAPI application.

    Args:
        app: The FastAPI application
        environment: The environment (development, staging, production)
        **config_kwargs: Additional configuration parameters
    """
    logger.info(f"Setting up Reynard middleware for {environment} environment")

    # Development bypass middleware (first) - TEMPORARILY DISABLED
    if environment in ["development", "testing"]:
        app.add_middleware(
            DevelopmentBypassMiddleware,
            enabled=False,  # Temporarily disabled due to config issues
            environment=environment,
        )
        logger.info("Added development bypass middleware (disabled)")

    # Input validation middleware (second) - TEMPORARILY DISABLED
    app.add_middleware(
        InputValidationMiddleware,
        enabled=False,  # Temporarily disabled due to config issues
        environment=environment,
    )
    logger.info("Added input validation middleware (disabled)")

    # CORS middleware (third)
    app.add_middleware(CORSMiddleware, environment=environment)
    logger.info("Added CORS middleware")

    # Rate limiting middleware (fourth)
    app.add_middleware(
        SimpleRateLimiter,
        enabled=True,
        default_limit=config_kwargs.get("rate_limit", 100),
        window_seconds=config_kwargs.get("rate_window", 60),
    )
    logger.info("Added rate limiting middleware")

    # Security headers middleware (last) - TEMPORARILY DISABLED
    app.add_middleware(
        SecurityHeadersMiddleware,
        enabled=False,  # Temporarily disabled due to config issues
        environment=environment,
    )
    logger.info("Added security headers middleware (disabled)")

    logger.info("Reynard middleware setup complete")


def create_custom_middleware_stack(
    app: FastAPI,
    environment: str = "development",
    middleware_order: Optional[List[str]] = None,
    enabled_middleware: Optional[List[str]] = None,
    **config_kwargs,
) -> None:
    """Create a custom middleware stack.

    Args:
        app: The FastAPI application
        environment: The environment (development, staging, production)
        middleware_order: Optional list specifying middleware order
        enabled_middleware: Optional list of enabled middleware
        **config_kwargs: Additional configuration parameters
    """
    if middleware_order is None:
        middleware_order = [
            "development_bypass",
            "input_validation",
            "cors",
            "rate_limiting",
            "security_headers",
        ]

    if enabled_middleware is None:
        enabled_middleware = [
            "development_bypass",
            "input_validation",
            "cors",
            "rate_limiting",
            "security_headers",
        ]

    logger.info(f"Creating custom middleware stack for {environment}")

    # Development bypass middleware
    if "development_bypass" in enabled_middleware and environment in [
        "development",
        "testing",
    ]:
        app.add_middleware(
            DevelopmentBypassMiddleware, enabled=True, environment=environment
        )
        logger.info("Added development bypass middleware")

    # Input validation middleware
    if "input_validation" in enabled_middleware:
        app.add_middleware(
            InputValidationMiddleware, enabled=True, environment=environment
        )
        logger.info("Added input validation middleware")

    # CORS middleware
    if "cors" in enabled_middleware:
        app.add_middleware(CORSMiddleware, environment=environment)
        logger.info("Added CORS middleware")

    # Rate limiting middleware
    if "rate_limiting" in enabled_middleware:
        app.add_middleware(
            SimpleRateLimiter,
            enabled=True,
            default_limit=config_kwargs.get("rate_limit", 100),
            window_seconds=config_kwargs.get("rate_window", 60),
        )
        logger.info("Added rate limiting middleware")

    # Security headers middleware
    if "security_headers" in enabled_middleware:
        app.add_middleware(
            SecurityHeadersMiddleware, enabled=True, environment=environment
        )
        logger.info("Added security headers middleware")

    logger.info("Custom middleware stack creation complete")


# Backward compatibility aliases
def setup_reynard_middleware(
    app: FastAPI, environment: str = "development", **config_kwargs
) -> None:
    """Setup all Reynard middleware for a FastAPI application.

    This is the main function for setting up middleware.

    Args:
        app: The FastAPI application
        environment: The environment (development, staging, production)
        **config_kwargs: Additional configuration parameters
    """
    setup_middleware(app, environment, **config_kwargs)
