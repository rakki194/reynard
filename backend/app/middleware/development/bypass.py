"""Development bypass middleware for testing and development scenarios.

This module provides development bypass functionality that allows certain
security restrictions to be bypassed in development environments for
testing purposes, particularly for the Fenrir testing suite.
"""

import logging
from collections.abc import Awaitable, Callable
from typing import Optional

from fastapi import Request, Response

from ..core.base import BaseMiddleware
from ..core.config import DevelopmentBypassConfig

logger = logging.getLogger(__name__)


class DevelopmentBypassMiddleware(BaseMiddleware):
    """Development bypass middleware for testing and development.
    
    Provides secure development bypass system that allows the Reynard
    fenrir testing suite to bypass rate limiting and other security
    restrictions ONLY when running in development mode from localhost.
    """
    
    def __init__(
        self,
        app: Callable,
        name: str = "development_bypass",
        config: Optional[DevelopmentBypassConfig] = None,
        **kwargs
    ):
        """Initialize the development bypass middleware.
        
        Args:
            app: The ASGI application
            name: Middleware name
            config: Development bypass configuration
            **kwargs: Additional configuration
        """
        super().__init__(app, name, **kwargs)
        
        # Set up configuration
        if config is None:
            config = DevelopmentBypassConfig()
        
        self.config = config
        self.logger = logging.getLogger(f"middleware.{name}")
    
    async def process_request(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Process the request and apply development bypasses if conditions are met.
        
        Args:
            request: The incoming HTTP request
            call_next: The next middleware/handler in the chain
            
        Returns:
            Response: The HTTP response
        """
        # Only apply bypasses in development mode
        if not self._is_development_environment():
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
        
        if self.config.bypass_rate_limiting:
            # Add bypass header for rate limiting
            request.state.bypass_rate_limiting = True
            bypass_applied = True
        
        if self.config.bypass_security_headers:
            # Add bypass header for security headers
            request.state.bypass_security_headers = True
            bypass_applied = True
        
        if self.config.bypass_input_validation:
            # Add bypass header for input validation
            request.state.bypass_input_validation = True
            bypass_applied = True
        
        # Log the bypass for audit purposes
        if bypass_applied and self.config.log_bypass_events:
            self.logger.info(
                f"🦊 Development bypass applied for fenrir testing: "
                f"{request.method} {request.url.path} from {client_ip} "
                f"(User-Agent: {user_agent})"
            )
        
        response = await call_next(request)
        
        # Add development bypass header to response for debugging
        if bypass_applied and self.config.add_debug_headers:
            response.headers["X-Dev-Bypass"] = "fenrir-testing"
            response.headers["X-Dev-Bypass-Reason"] = "localhost-fenrir-suite"
            response.headers["X-Dev-Bypass-Applied"] = "true"
        
        return response
    
    def _is_development_environment(self) -> bool:
        """Check if running in development environment.
        
        Returns:
            True if in development environment
        """
        return (
            self.config.environment == "development" or
            self.config.environment == "testing"
        )
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract the real client IP address from the request.
        
        Args:
            request: The HTTP request
            
        Returns:
            The client IP address
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
        """Check if the IP address is localhost.
        
        Args:
            ip: The IP address to check
            
        Returns:
            True if the IP is localhost
        """
        return any(pattern in ip for pattern in self.config.localhost_patterns)
    
    def _is_fenrir_request(self, user_agent: str) -> bool:
        """Check if the request is from the fenrir testing suite.
        
        Args:
            user_agent: The User-Agent header value
            
        Returns:
            True if the request is from fenrir suite
        """
        return any(agent in user_agent for agent in self.config.fenrir_user_agents)
    
    def get_bypass_info(self, request: Request) -> dict:
        """Get bypass information for a request.
        
        Args:
            request: The HTTP request
            
        Returns:
            Dictionary with bypass information
        """
        client_ip = self._get_client_ip(request)
        user_agent = request.headers.get("user-agent", "")
        
        return {
            "is_development": self._is_development_environment(),
            "is_localhost": self._is_localhost(client_ip),
            "is_fenrir": self._is_fenrir_request(user_agent),
            "client_ip": client_ip,
            "user_agent": user_agent,
            "bypass_rate_limiting": self.config.bypass_rate_limiting,
            "bypass_security_headers": self.config.bypass_security_headers,
            "bypass_input_validation": self.config.bypass_input_validation,
            "should_apply_bypass": (
                self._is_development_environment() and
                self._is_localhost(client_ip) and
                self._is_fenrir_request(user_agent)
            ),
        }
    
    def update_bypass_config(self, **kwargs) -> None:
        """Update bypass configuration.
        
        Args:
            **kwargs: Configuration parameters to update
        """
        for key, value in kwargs.items():
            if hasattr(self.config, key):
                setattr(self.config, key, value)
                self.logger.info(f"Updated bypass config: {key} = {value}")


def create_development_bypass_middleware(
    app: Callable,
    environment: str = "development",
    **config_kwargs
) -> DevelopmentBypassMiddleware:
    """Create a development bypass middleware instance.
    
    Args:
        app: The ASGI application
        environment: The environment (development, staging, production)
        **config_kwargs: Additional configuration parameters
        
    Returns:
        Configured development bypass middleware instance
    """
    config = DevelopmentBypassConfig(environment=environment)
    
    # Update config with any provided parameters
    for key, value in config_kwargs.items():
        if hasattr(config, key):
            setattr(config, key, value)
    
    return DevelopmentBypassMiddleware(app, config=config, environment=environment)


def setup_development_bypass_middleware(
    app, 
    environment: str = "development", 
    **config_kwargs
) -> None:
    """Setup development bypass middleware for a FastAPI application.
    
    Args:
        app: The FastAPI application
        environment: The environment (development, staging, production)
        **config_kwargs: Additional configuration parameters
    """
    bypass_middleware = create_development_bypass_middleware(app, environment, **config_kwargs)
    
    # Add the middleware to the FastAPI app
    app.add_middleware(
        DevelopmentBypassMiddleware,
        config=bypass_middleware.config,
        **config_kwargs
    )
    
    logger.info(f"Development bypass middleware setup complete for {environment} environment")
