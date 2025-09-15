"""
Development Bypass Middleware for Fenrir Testing Suite

This middleware provides a secure development bypass system that allows
the Reynard fenrir testing suite to bypass rate limiting and other
security restrictions ONLY when running in development mode from localhost.

Security Features:
- Only works in development environment
- Only allows localhost connections
- Requires specific fenrir user agent
- Logs all bypassed requests for audit
- Automatically disabled in production

This ensures our security testing doesn't interfere with production
security while allowing comprehensive testing in development.
"""

import logging
from collections.abc import Awaitable, Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import get_config

logger = logging.getLogger(__name__)


class DevBypassMiddleware(BaseHTTPMiddleware):
    """
    Development bypass middleware for fenrir testing suite.

    This middleware allows the fenrir testing suite to bypass certain
    security restrictions (like rate limiting) when running in development
    mode from localhost with the proper user agent.
    """

    def __init__(self, app: Callable, bypass_rate_limiting: bool = True):
        super().__init__(app)
        self.bypass_rate_limiting = bypass_rate_limiting
        self.config = get_config()

        # Fenrir testing suite identifiers
        self.fenrir_user_agents = [
            "Fenrir Exploit Suite",
            "Reynard Security Tester",
            "Fenrir Testing Framework",
            "Security Assessment Tool",
        ]

        # Allowed localhost patterns
        self.localhost_patterns = ["127.0.0.1", "localhost", "::1", "0.0.0.0"]

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """
        Process request and apply development bypasses if conditions are met.

        Args:
            request: The incoming HTTP request
            call_next: The next middleware/handler in the chain

        Returns:
            Response: The HTTP response
        """
        # Only apply bypasses in development mode
        if self.config.environment != "development":
            return await call_next(request)

        # Check if request is from localhost
        client_ip = self._get_client_ip(request)
        if not self._is_localhost(client_ip):
            return await call_next(request)

        # Check if request is from fenrir testing suite
        user_agent = request.headers.get("user-agent", "")
        if not self._is_fenrir_request(user_agent):
            return await call_next(request)

        # Apply development bypasses
        bypass_applied = False

        if self.bypass_rate_limiting:
            # Add bypass header for rate limiting
            request.state.bypass_rate_limiting = True
            bypass_applied = True

        # Log the bypass for audit purposes
        if bypass_applied:
            logger.info(
                f"🦊 Development bypass applied for fenrir testing: "
                f"{request.method} {request.url.path} from {client_ip} "
                f"(User-Agent: {user_agent})"
            )

        response = await call_next(request)

        # Add development bypass header to response for debugging
        if bypass_applied:
            response.headers["X-Dev-Bypass"] = "fenrir-testing"
            response.headers["X-Dev-Bypass-Reason"] = "localhost-fenrir-suite"

        return response

    def _get_client_ip(self, request: Request) -> str:
        """
        Extract the real client IP address from the request.

        Args:
            request: The HTTP request

        Returns:
            str: The client IP address
        """
        # Check for forwarded headers (in case of reverse proxy)
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            # Take the first IP in the chain
            return forwarded_for.split(",")[0].strip()

        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip.strip()

        # Fall back to direct client IP
        if hasattr(request, "client") and request.client:
            return request.client.host

        return "unknown"

    def _is_localhost(self, ip: str) -> bool:
        """
        Check if the IP address is localhost.

        Args:
            ip: The IP address to check

        Returns:
            bool: True if the IP is localhost
        """
        return any(pattern in ip for pattern in self.localhost_patterns)

    def _is_fenrir_request(self, user_agent: str) -> bool:
        """
        Check if the request is from the fenrir testing suite.

        Args:
            user_agent: The User-Agent header value

        Returns:
            bool: True if the request is from fenrir suite
        """
        return any(agent in user_agent for agent in self.fenrir_user_agents)


def setup_dev_bypass_middleware(
    app: Callable, bypass_rate_limiting: bool = True
) -> None:
    """
    Set up the development bypass middleware.

    Args:
        app: The FastAPI application
        bypass_rate_limiting: Whether to bypass rate limiting
    """
    app.add_middleware(DevBypassMiddleware, bypass_rate_limiting=bypass_rate_limiting)
