"""Base middleware classes and interfaces for the Reynard middleware system.

This module provides the foundational classes and interfaces that all middleware
components inherit from, ensuring consistent behavior and integration patterns.
"""

import logging
from abc import ABC, abstractmethod
from collections.abc import Awaitable, Callable
from typing import Any, Optional

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class BaseMiddleware(BaseHTTPMiddleware, ABC):
    """Base class for all Reynard middleware components.
    
    Provides common functionality and ensures consistent behavior across
    all middleware implementations including logging, error handling, and
    configuration management.
    """

    def __init__(
        self,
        app: Callable,
        name: str,
        enabled: bool = True,
        config: Optional[dict[str, Any]] = None,
        **kwargs
    ):
        """Initialize the base middleware.
        
        Args:
            app: The ASGI application
            name: Human-readable name for this middleware
            enabled: Whether this middleware is enabled
            config: Optional configuration dictionary
            **kwargs: Additional configuration parameters
        """
        super().__init__(app)
        self.name = name
        self.enabled = enabled
        self.config = config or {}
        self.logger = logging.getLogger(f"middleware.{name}")
        
        # Store additional kwargs for subclasses
        self.kwargs = kwargs

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Process the request through this middleware.
        
        Args:
            request: The incoming HTTP request
            call_next: The next middleware/handler in the chain
            
        Returns:
            Response: The HTTP response
        """
        if not self.enabled:
            return await call_next(request)

        try:
            # Pre-process the request
            await self.pre_process(request)
            
            # Process the request
            response = await self.process_request(request, call_next)
            
            # Post-process the response
            await self.post_process(request, response)
            
            return response
            
        except Exception as e:
            self.logger.error(f"Error in {self.name} middleware: {e}")
            return await self.handle_error(request, e, call_next)

    @abstractmethod
    async def process_request(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Process the request through this middleware.
        
        This method must be implemented by subclasses to define the
        specific middleware behavior.
        
        Args:
            request: The incoming HTTP request
            call_next: The next middleware/handler in the chain
            
        Returns:
            Response: The HTTP response
        """
        pass

    async def pre_process(self, request: Request) -> None:
        """Pre-process the request before main processing.
        
        Override this method to add pre-processing logic.
        
        Args:
            request: The incoming HTTP request
        """
        self.logger.debug(f"Pre-processing request: {request.method} {request.url.path}")

    async def post_process(self, request: Request, response: Response) -> None:
        """Post-process the response after main processing.
        
        Override this method to add post-processing logic.
        
        Args:
            request: The original HTTP request
            response: The HTTP response
        """
        self.logger.debug(
            f"Post-processing response: {response.status_code} for {request.method} {request.url.path}"
        )

    async def handle_error(
        self, request: Request, error: Exception, call_next: Callable
    ) -> Response:
        """Handle errors that occur during middleware processing.
        
        Args:
            request: The original HTTP request
            error: The exception that occurred
            call_next: The next middleware/handler in the chain
            
        Returns:
            Response: Error response or fallback to next middleware
        """
        self.logger.error(
            f"Error in {self.name} middleware for {request.method} {request.url.path}: {error}"
        )
        
        # Default behavior: continue to next middleware
        # Subclasses can override to provide custom error handling
        return await call_next(request)

    def is_enabled(self) -> bool:
        """Check if this middleware is enabled.
        
        Returns:
            bool: True if enabled, False otherwise
        """
        return self.enabled

    def get_config(self, key: str, default: Any = None) -> Any:
        """Get a configuration value.
        
        Args:
            key: Configuration key
            default: Default value if key not found
            
        Returns:
            Configuration value or default
        """
        return self.config.get(key, default)

    def set_config(self, key: str, value: Any) -> None:
        """Set a configuration value.
        
        Args:
            key: Configuration key
            value: Configuration value
        """
        self.config[key] = value


class ConditionalMiddleware(BaseMiddleware):
    """Base class for middleware that applies conditionally.
    
    Provides common patterns for middleware that should only apply
    under certain conditions (e.g., specific paths, environments, etc.).
    """

    def __init__(
        self,
        app: Callable,
        name: str,
        enabled: bool = True,
        config: Optional[dict[str, Any]] = None,
        conditions: Optional[list[Callable[[Request], bool]]] = None,
    ):
        """Initialize conditional middleware.
        
        Args:
            app: The ASGI application
            name: Human-readable name for this middleware
            enabled: Whether this middleware is enabled
            config: Optional configuration dictionary
            conditions: List of condition functions that must all return True
        """
        super().__init__(app, name, enabled, config)
        self.conditions = conditions or []

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Process the request if all conditions are met.
        
        Args:
            request: The incoming HTTP request
            call_next: The next middleware/handler in the chain
            
        Returns:
            Response: The HTTP response
        """
        if not self.enabled:
            return await call_next(request)

        # Check all conditions
        for condition in self.conditions:
            if not condition(request):
                return await call_next(request)

        # All conditions met, process normally
        return await super().dispatch(request, call_next)

    def add_condition(self, condition: Callable[[Request], bool]) -> None:
        """Add a condition function.
        
        Args:
            condition: Function that takes a Request and returns bool
        """
        self.conditions.append(condition)

    def remove_condition(self, condition: Callable[[Request], bool]) -> None:
        """Remove a condition function.
        
        Args:
            condition: Function to remove
        """
        if condition in self.conditions:
            self.conditions.remove(condition)
