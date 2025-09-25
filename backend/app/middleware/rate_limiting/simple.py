"""Simple rate limiting middleware for basic rate limiting needs.

This module provides a simple rate limiting implementation that works
with the new modular middleware system.
"""

import logging
from collections.abc import Awaitable, Callable
from typing import Dict, Optional

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class SimpleRateLimiter(BaseHTTPMiddleware):
    """Simple rate limiting middleware.
    
    Provides basic rate limiting functionality with configurable limits
    and client identification.
    """
    
    def __init__(
        self,
        app,
        enabled: bool = True,
        default_limit: int = 100,
        window_seconds: int = 60,
        **kwargs
    ):
        """Initialize the simple rate limiter.
        
        Args:
            app: The ASGI application
            enabled: Whether rate limiting is enabled
            default_limit: Default requests per window
            window_seconds: Time window in seconds
            **kwargs: Additional configuration
        """
        super().__init__(app)
        self.enabled = enabled
        self.default_limit = default_limit
        self.window_seconds = window_seconds
        self.logger = logging.getLogger("middleware.simple_rate_limiter")
        
        # Simple in-memory rate limiting
        self.requests: Dict[str, list] = {}
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process the request with rate limiting.
        
        Args:
            request: The incoming request
            call_next: The next middleware/handler in the chain
            
        Returns:
            Response: The HTTP response
        """
        if not self.enabled:
            return await call_next(request)
        
        # Check for bypass flag
        if hasattr(request.state, "bypass_rate_limiting") and request.state.bypass_rate_limiting:
            return await call_next(request)
        
        # Get client identifier
        client_id = self._get_client_identifier(request)
        
        # Check rate limit
        if not self._check_rate_limit(client_id):
            return self._create_rate_limit_response()
        
        # Process the request
        response = await call_next(request)
        
        # Update rate limit tracking
        self._update_rate_limit(client_id)
        
        return response
    
    def _get_client_identifier(self, request: Request) -> str:
        """Get a unique identifier for the client.
        
        Args:
            request: The HTTP request
            
        Returns:
            Unique client identifier
        """
        # Try to get real IP from headers
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"
        
        # Add user agent hash for additional uniqueness
        user_agent = request.headers.get("User-Agent", "")
        user_agent_hash = str(hash(user_agent))[:8]
        
        return f"{client_ip}:{user_agent_hash}"
    
    def _check_rate_limit(self, client_id: str) -> bool:
        """Check if the client is within rate limits.
        
        Args:
            client_id: Unique client identifier
            
        Returns:
            True if within limits, False otherwise
        """
        import time
        current_time = time.time()
        
        # Clean old requests
        if client_id in self.requests:
            self.requests[client_id] = [
                req_time for req_time in self.requests[client_id]
                if current_time - req_time < self.window_seconds
            ]
        else:
            self.requests[client_id] = []
        
        # Check if within limit
        return len(self.requests[client_id]) < self.default_limit
    
    def _update_rate_limit(self, client_id: str) -> None:
        """Update rate limit tracking for the client.
        
        Args:
            client_id: Unique client identifier
        """
        import time
        current_time = time.time()
        
        if client_id not in self.requests:
            self.requests[client_id] = []
        
        self.requests[client_id].append(current_time)
    
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
                "Retry-After": str(self.window_seconds),
                "X-RateLimit-Limit": str(self.default_limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(self.window_seconds),
            }
        )


def setup_simple_rate_limiting(
    app,
    environment: str = "development",
    **config_kwargs
) -> None:
    """Setup simple rate limiting for a FastAPI application.
    
    Args:
        app: The FastAPI application
        environment: The environment (development, staging, production)
        **config_kwargs: Additional configuration parameters
    """
    enabled = config_kwargs.get('enabled', True)
    default_limit = config_kwargs.get('default_limit', 100)
    window_seconds = config_kwargs.get('window_seconds', 60)
    
    app.add_middleware(
        SimpleRateLimiter,
        enabled=enabled,
        default_limit=default_limit,
        window_seconds=window_seconds,
        **config_kwargs
    )
    
    logger.info(f"Simple rate limiting setup complete for {environment} environment")
