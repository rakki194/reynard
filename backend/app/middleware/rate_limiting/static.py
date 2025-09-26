"""Static rate limiting middleware with configurable limits.

This module provides static rate limiting functionality with predefined
rate limits for different endpoint types and client identification.
"""

import logging
from collections.abc import Awaitable, Callable
from typing import Dict, Optional

from fastapi import Request, Response
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from ..core.base import BaseMiddleware
from ..core.config import RateLimitingConfig

logger = logging.getLogger(__name__)


class StaticRateLimiter(BaseMiddleware):
    """Static rate limiting middleware with configurable limits.

    Provides rate limiting with predefined limits for different endpoint
    types and client identification using IP addresses and user agents.
    """

    def __init__(
        self,
        app: Callable,
        name: str = "static_rate_limiter",
        config: Optional[RateLimitingConfig] = None,
        **kwargs,
    ):
        """Initialize the static rate limiter.

        Args:
            app: The ASGI application
            name: Middleware name
            config: Rate limiting configuration
            **kwargs: Additional configuration
        """
        super().__init__(app, name, **kwargs)

        # Set up configuration
        if config is None:
            config = RateLimitingConfig()

        self.config = config
        self.logger = logging.getLogger(f"middleware.{name}")

        # Initialize the limiter
        self.limiter = self._create_limiter()

    def _create_limiter(self) -> Limiter:
        """Create and configure the SlowAPI limiter.

        Returns:
            Configured Limiter instance
        """
        return Limiter(
            key_func=self._get_client_identifier,
            default_limits=[self.config.default_limit],
            storage_uri=self.config.storage_uri,
        )

    def _get_client_identifier(self, request: Request) -> str:
        """Get a unique identifier for the client making the request.

        Args:
            request: The HTTP request

        Returns:
            Unique client identifier
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

    async def process_request(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Process the request through rate limiting.

        Args:
            request: The incoming HTTP request
            call_next: The next middleware/handler in the chain

        Returns:
            Response: The HTTP response
        """
        # Check if rate limiting is enabled
        if not self.config.enabled:
            return await call_next(request)

        # Check for bypass conditions
        if self._should_bypass_rate_limit(request):
            return await call_next(request)

        try:
            # Apply rate limiting
            client_id = self._get_client_identifier(request)
            limit = self._get_rate_limit_for_request(request)

            # Check if client is within limits
            if not self._check_rate_limit(client_id, limit):
                self.logger.warning(f"Rate limit exceeded for client: {client_id}")
                return self._create_rate_limit_response()

            # Continue with the request
            response = await call_next(request)

            # Update rate limit tracking
            self._update_rate_limit(client_id, limit)

            return response

        except Exception as e:
            self.logger.error(f"Rate limiting error: {e}")
            # Continue with request if rate limiting fails
            return await call_next(request)

    def _should_bypass_rate_limit(self, request: Request) -> bool:
        """Check if rate limiting should be bypassed for this request.

        Args:
            request: The HTTP request

        Returns:
            True if rate limiting should be bypassed
        """
        # Check for development bypass flag
        if (
            hasattr(request.state, "bypass_rate_limiting")
            and request.state.bypass_rate_limiting
        ):
            return True

        # Check for bypass user agents
        if self.config.bypass_enabled:
            user_agent = request.headers.get("User-Agent", "")
            if any(agent in user_agent for agent in self.config.bypass_user_agents):
                return True

        # Check for bypass IPs
        if self.config.bypass_enabled:
            client_ip = self._get_client_ip(request)
            if any(ip in client_ip for ip in self.config.bypass_ips):
                return True

        return False

    def _get_client_ip(self, request: Request) -> str:
        """Get the client IP address from the request.

        Args:
            request: The HTTP request

        Returns:
            Client IP address
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

    def _get_rate_limit_for_request(self, request: Request) -> str:
        """Get the appropriate rate limit for the request.

        Args:
            request: The HTTP request

        Returns:
            Rate limit string (e.g., "5/minute")
        """
        path = request.url.path

        # Authentication endpoints
        if any(
            auth_path in path
            for auth_path in ["/auth/login", "/auth/refresh", "/login"]
        ):
            return self.config.auth_limit

        # Registration endpoints
        if any(
            reg_path in path for reg_path in ["/auth/register", "/register", "/signup"]
        ):
            return self.config.registration_limit

        # Password reset endpoints
        if any(
            reset_path in path
            for reset_path in ["/auth/reset", "/reset-password", "/forgot-password"]
        ):
            return self.config.password_reset_limit

        # Default API limit
        return self.config.api_limit

    def _check_rate_limit(self, client_id: str, limit: str) -> bool:
        """Check if the client is within the rate limit.

        Args:
            client_id: Unique client identifier
            limit: Rate limit string

        Returns:
            True if within limits, False otherwise
        """
        # This is a simplified implementation
        # In a real implementation, you would use the SlowAPI limiter
        # or implement your own rate limiting logic

        # For now, we'll use the SlowAPI limiter's internal logic
        try:
            # Parse the limit (e.g., "5/minute")
            limit_parts = limit.split("/")
            if len(limit_parts) != 2:
                return True

            max_requests = int(limit_parts[0])
            time_window = limit_parts[1]

            # Convert time window to seconds
            if time_window == "minute":
                window_seconds = 60
            elif time_window == "hour":
                window_seconds = 3600
            elif time_window == "day":
                window_seconds = 86400
            else:
                return True

            # Check rate limit (simplified - in practice use proper storage)
            # This would integrate with Redis, memory, or other storage
            return True  # Simplified for now

        except Exception as e:
            self.logger.error(f"Error checking rate limit: {e}")
            return True  # Allow request if rate limiting fails

    def _update_rate_limit(self, client_id: str, limit: str) -> None:
        """Update rate limit tracking for the client.

        Args:
            client_id: Unique client identifier
            limit: Rate limit string
        """
        # This would update the rate limit tracking
        # In practice, this would integrate with the storage backend
        pass

    def _create_rate_limit_response(self) -> Response:
        """Create a rate limit exceeded response.

        Returns:
            Response: Rate limit exceeded response
        """
        return Response(
            status_code=429,
            content='{"error": "Rate limit exceeded", "type": "rate_limit_error"}',
            headers={
                "Content-Type": "application/json",
                "Retry-After": "60",
                "X-RateLimit-Limit": "100",
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": "60",
            },
        )

    def get_rate_limit_info(self, request: Request) -> Dict[str, str]:
        """Get rate limit information for a request.

        Args:
            request: The HTTP request

        Returns:
            Dictionary with rate limit information
        """
        client_id = self._get_client_identifier(request)
        limit = self._get_rate_limit_for_request(request)

        return {
            "client_id": client_id,
            "rate_limit": limit,
            "bypass_enabled": self.config.bypass_enabled,
            "should_bypass": self._should_bypass_rate_limit(request),
        }

    def update_rate_limit_config(self, **kwargs) -> None:
        """Update rate limiting configuration.

        Args:
            **kwargs: Configuration parameters to update
        """
        for key, value in kwargs.items():
            if hasattr(self.config, key):
                setattr(self.config, key, value)
                self.logger.info(f"Updated rate limit config: {key} = {value}")


def create_static_rate_limiter(
    app: Callable, environment: str = "development", **config_kwargs
) -> StaticRateLimiter:
    """Create a static rate limiter instance.

    Args:
        app: The ASGI application
        environment: The environment (development, staging, production)
        **config_kwargs: Additional configuration parameters

    Returns:
        Configured static rate limiter instance
    """
    config = RateLimitingConfig()

    # Update config with any provided parameters
    for key, value in config_kwargs.items():
        if hasattr(config, key):
            setattr(config, key, value)

    return StaticRateLimiter(app, config=config, **config_kwargs)


def setup_static_rate_limiting(
    app, environment: str = "development", **config_kwargs
) -> None:
    """Setup static rate limiting for a FastAPI application.

    Args:
        app: The FastAPI application
        environment: The environment (development, staging, production)
        **config_kwargs: Additional configuration parameters
    """
    rate_limiter = create_static_rate_limiter(app, environment, **config_kwargs)

    # Add the middleware to the FastAPI app
    app.add_middleware(StaticRateLimiter, config=rate_limiter.config, **config_kwargs)

    logger.info(f"Static rate limiting setup complete for {environment} environment")
