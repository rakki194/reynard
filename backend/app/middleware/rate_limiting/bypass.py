"""Rate limiting bypass middleware for development and testing.

This module provides rate limiting bypass functionality for development
and testing scenarios, particularly for the Fenrir testing suite.
"""

import logging
from collections.abc import Awaitable, Callable
from typing import Optional

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class RateLimitBypassMiddleware(BaseHTTPMiddleware):
    """Rate limiting bypass middleware for development and testing.

    Provides bypass functionality for rate limiting in development and
    testing environments, particularly for the Fenrir testing suite.
    """

    def __init__(
        self, app, enabled: bool = True, environment: str = "development", **kwargs
    ):
        """Initialize the rate limit bypass middleware.

        Args:
            app: The ASGI application
            enabled: Whether bypass is enabled
            environment: The current environment
            **kwargs: Additional configuration
        """
        super().__init__(app)
        self.enabled = enabled
        self.environment = environment
        self.logger = logging.getLogger("middleware.rate_limit_bypass")

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process the request with rate limit bypass.

        Args:
            request: The incoming request
            call_next: The next middleware/handler in the chain

        Returns:
            Response: The HTTP response
        """
        if not self.enabled or self.environment not in ["development", "testing"]:
            return await call_next(request)

        # Check if this is a bypass request
        if self._should_bypass_rate_limit(request):
            # Set bypass flag in request state
            request.state.bypass_rate_limiting = True
            self.logger.debug(
                f"Rate limit bypass applied for {request.method} {request.url.path}"
            )

        return await call_next(request)

    def _should_bypass_rate_limit(self, request: Request) -> bool:
        """Check if rate limiting should be bypassed for this request.

        Args:
            request: The HTTP request

        Returns:
            True if rate limiting should be bypassed
        """
        # Check for Fenrir testing suite user agents
        user_agent = request.headers.get("User-Agent", "")
        fenrir_agents = [
            "Fenrir Exploit Suite",
            "Reynard Security Tester",
            "Fenrir Testing Framework",
            "Security Assessment Tool",
        ]

        if any(agent in user_agent for agent in fenrir_agents):
            return True

        # Check for localhost requests
        client_ip = self._get_client_ip(request)
        localhost_ips = ["127.0.0.1", "localhost", "::1", "0.0.0.0"]

        if any(ip in client_ip for ip in localhost_ips):
            return True

        return False

    def _get_client_ip(self, request: Request) -> str:
        """Get the client IP address from the request.

        Args:
            request: The HTTP request

        Returns:
            Client IP address
        """
        # Check for forwarded headers
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()

        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip.strip()

        # Fall back to direct client IP
        if hasattr(request, "client") and request.client:
            return request.client.host

        return "unknown"


def setup_rate_limit_bypass(
    app, environment: str = "development", **config_kwargs
) -> None:
    """Setup rate limit bypass middleware for a FastAPI application.

    Args:
        app: The FastAPI application
        environment: The environment (development, staging, production)
        **config_kwargs: Additional configuration parameters
    """
    enabled = config_kwargs.get('enabled', True)

    app.add_middleware(
        RateLimitBypassMiddleware,
        enabled=enabled,
        environment=environment,
        **config_kwargs,
    )

    logger.info(
        f"Rate limit bypass middleware setup complete for {environment} environment"
    )
