"""CORS middleware implementation for FastAPI.

This module provides the main CORS middleware class that integrates with FastAPI
to handle cross-origin resource sharing with comprehensive security features.
"""

import logging
from typing import Callable, Optional

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from .config import CORSConfig
from .validator import CORSValidator

logger = logging.getLogger(__name__)


class CORSMiddleware(BaseHTTPMiddleware):
    """CORS middleware for FastAPI applications.

    Provides comprehensive CORS handling with security best practices,
    including preflight request handling, origin validation, and
    proper header management.
    """

    def __init__(self, app: ASGIApp, config: Optional[CORSConfig] = None, **kwargs):
        """Initialize the CORS middleware.

        Args:
            app: The ASGI application
            config: CORS configuration (optional)
            **kwargs: Additional configuration parameters
        """
        super().__init__(app)

        # Use provided config or create default
        if config is None:
            self.config = CORSConfig(**kwargs)
        else:
            self.config = config

        # Initialize validator
        self.validator = CORSValidator(self.config)

        # Set up logging
        self.logger = logging.getLogger(f"cors.middleware")

        self.logger.info(
            f"CORS middleware initialized for environment: {self.config.environment}"
        )

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process the request through CORS middleware.

        Args:
            request: The incoming request
            call_next: The next middleware/handler in the chain

        Returns:
            Response with appropriate CORS headers
        """
        # Get origin from request
        origin = request.headers.get("origin")

        # Handle preflight requests
        if request.method == "OPTIONS":
            return await self._handle_preflight_request(request, origin)

        # Handle actual requests
        return await self._handle_actual_request(request, call_next, origin)

    async def _handle_preflight_request(
        self, request: Request, origin: Optional[str]
    ) -> Response:
        """Handle CORS preflight requests.

        Args:
            request: The preflight request
            origin: The request origin

        Returns:
            Response with preflight headers
        """
        # Validate the preflight request
        is_valid, error = self.validator.validate_preflight_request(request)

        if not is_valid:
            self.validator.log_validation_result(request, False, error)
            return Response(
                content=f"CORS preflight failed: {error}",
                status_code=403,
                headers=self._get_error_headers(),
            )

        # Get requested method and headers
        requested_method = request.headers.get("access-control-request-method", "")
        requested_headers = request.headers.get("access-control-request-headers", "")

        # Build response headers
        headers = self.config.get_cors_headers(origin)

        # Add specific preflight headers
        if requested_method:
            headers["Access-Control-Allow-Methods"] = requested_method

        if requested_headers:
            headers["Access-Control-Allow-Headers"] = requested_headers

        self.validator.log_validation_result(request, True)

        return Response(content="", status_code=200, headers=headers)

    async def _handle_actual_request(
        self, request: Request, call_next: Callable, origin: Optional[str]
    ) -> Response:
        """Handle actual CORS requests.

        Args:
            request: The actual request
            call_next: The next middleware/handler in the chain
            origin: The request origin

        Returns:
            Response with CORS headers
        """
        # Validate the actual request
        is_valid, error = self.validator.validate_actual_request(request)

        if not is_valid:
            self.validator.log_validation_result(request, False, error)
            return Response(
                content=f"CORS validation failed: {error}",
                status_code=403,
                headers=self._get_error_headers(),
            )

        # Process the request
        response = await call_next(request)

        # Add CORS headers to response
        cors_headers = self.config.get_cors_headers(origin)
        for header, value in cors_headers.items():
            response.headers[header] = value

        self.validator.log_validation_result(request, True)

        return response

    def _get_error_headers(self) -> dict[str, str]:
        """Get headers for error responses.

        Returns:
            Dictionary of error response headers
        """
        return {
            "Content-Type": "text/plain",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }

    def get_config(self) -> CORSConfig:
        """Get the current CORS configuration.

        Returns:
            Current CORS configuration
        """
        return self.config

    def update_config(self, new_config: CORSConfig) -> None:
        """Update the CORS configuration.

        Args:
            new_config: New CORS configuration
        """
        self.config = new_config
        self.validator = CORSValidator(self.config)

        self.logger.info("CORS configuration updated")

    def get_validation_summary(self, request: Request) -> dict:
        """Get validation summary for a request.

        Args:
            request: The request to analyze

        Returns:
            Dictionary with validation summary
        """
        return self.validator.get_validation_summary(request)

    def is_origin_allowed(self, origin: str) -> bool:
        """Check if an origin is allowed.

        Args:
            origin: The origin to check

        Returns:
            True if origin is allowed
        """
        return self.validator.validate_origin(origin)

    def get_allowed_origins(self) -> list[str]:
        """Get list of allowed origins.

        Returns:
            List of allowed origins
        """
        return self.config.get_effective_origins()

    def get_allowed_methods(self) -> list[str]:
        """Get list of allowed methods.

        Returns:
            List of allowed HTTP methods
        """
        return self.config.allowed_methods

    def get_allowed_headers(self) -> list[str]:
        """Get list of allowed headers.

        Returns:
            List of allowed headers
        """
        return self.config.allowed_headers
