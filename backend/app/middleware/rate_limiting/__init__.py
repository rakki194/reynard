"""Rate limiting middleware components with adaptive and static capabilities.

This module provides comprehensive rate limiting functionality including
adaptive rate limiting, static rate limiting, and bypass mechanisms for
development and testing scenarios.
"""

from .bypass import RateLimitBypassMiddleware, setup_rate_limit_bypass
from .simple import SimpleRateLimiter, setup_simple_rate_limiting

__all__ = [
    "SimpleRateLimiter",
    "RateLimitBypassMiddleware",
    "setup_rate_limiting",
    "setup_simple_rate_limiting",
    "setup_rate_limit_bypass",
]


def setup_rate_limiting(
    app,
    environment: str = "development",
    rate_limiting_type: str = "simple",
    **config_kwargs,
) -> None:
    """Setup rate limiting for a FastAPI application.

    Args:
        app: The FastAPI application
        environment: The environment (development, staging, production)
        rate_limiting_type: Type of rate limiting ("simple", "bypass")
        **config_kwargs: Additional configuration parameters
    """
    if rate_limiting_type == "simple":
        setup_simple_rate_limiting(app, environment, **config_kwargs)
    elif rate_limiting_type == "bypass":
        setup_rate_limit_bypass(app, environment, **config_kwargs)
    else:
        # Default to simple rate limiting
        setup_simple_rate_limiting(app, environment, **config_kwargs)
