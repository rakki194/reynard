"""Security headers middleware with comprehensive protection features.

This module provides security headers middleware with CSP, HSTS, and other
security headers for comprehensive application protection.
"""

import logging
import os
from collections.abc import Awaitable, Callable
from typing import Dict, Optional

from fastapi import Request, Response

from ..core.base import BaseMiddleware
from ..core.config import SecurityHeadersConfig

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseMiddleware):
    """Comprehensive security headers middleware.

    Provides security headers including CSP, HSTS, X-Frame-Options,
    and other security-related headers for comprehensive protection.
    """

    def __init__(
        self,
        app: Callable,
        name: str = "security_headers",
        config: Optional[SecurityHeadersConfig] = None,
        **kwargs,
    ):
        """Initialize the security headers middleware.

        Args:
            app: The ASGI application
            name: Middleware name
            config: Security headers configuration
            **kwargs: Additional configuration
        """
        super().__init__(app, name, **kwargs)

        # Set up configuration
        if config is None:
            config = SecurityHeadersConfig()

        self.config = config
        self.environment = kwargs.get(
            'environment', os.getenv('ENVIRONMENT', 'development')
        )

        self.logger = logging.getLogger(f"middleware.{name}")

    async def process_request(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Process the request and add security headers.

        Args:
            request: The incoming HTTP request
            call_next: The next middleware/handler in the chain

        Returns:
            Response: The HTTP response with security headers
        """
        # Process the request
        response = await call_next(request)

        # Add security headers
        self._add_security_headers(request, response)

        return response

    def _add_security_headers(self, request: Request, response: Response) -> None:
        """Add security headers to the response.

        Args:
            request: The original HTTP request
            response: The HTTP response to modify
        """
        # Standard security headers
        self._add_standard_headers(response)

        # Content Security Policy
        if self.config.csp_enabled:
            self._add_csp_header(response)

        # HTTP Strict Transport Security (only in production)
        if self.config.hsts_enabled and self._is_production():
            self._add_hsts_header(response)

        # Additional custom headers
        self._add_custom_headers(response)

        self.logger.debug(
            f"Added security headers to {request.method} {request.url.path}"
        )

    def _add_standard_headers(self, response: Response) -> None:
        """Add standard security headers.

        Args:
            response: The HTTP response to modify
        """
        headers = {
            "X-Content-Type-Options": self.config.x_content_type_options,
            "X-Frame-Options": self.config.x_frame_options,
            "X-XSS-Protection": self.config.x_xss_protection,
            "Referrer-Policy": self.config.referrer_policy,
            "Permissions-Policy": self.config.permissions_policy,
        }

        for header, value in headers.items():
            response.headers[header] = value

    def _add_csp_header(self, response: Response) -> None:
        """Add Content Security Policy header.

        Args:
            response: The HTTP response to modify
        """
        response.headers["Content-Security-Policy"] = self.config.csp_policy

    def _add_hsts_header(self, response: Response) -> None:
        """Add HTTP Strict Transport Security header.

        Args:
            response: The HTTP response to modify
        """
        hsts_value = f"max-age={self.config.hsts_max_age}"

        if self.config.hsts_include_subdomains:
            hsts_value += "; includeSubDomains"

        response.headers["Strict-Transport-Security"] = hsts_value

    def _add_custom_headers(self, response: Response) -> None:
        """Add custom security headers.

        Args:
            response: The HTTP response to modify
        """
        for header, value in self.config.additional_headers.items():
            response.headers[header] = value

    def _is_production(self) -> bool:
        """Check if running in production environment.

        Returns:
            True if in production environment
        """
        return self.environment.lower() == "production"

    def get_security_headers(self) -> Dict[str, str]:
        """Get all security headers that would be applied.

        Returns:
            Dictionary of security headers
        """
        headers = {
            "X-Content-Type-Options": self.config.x_content_type_options,
            "X-Frame-Options": self.config.x_frame_options,
            "X-XSS-Protection": self.config.x_xss_protection,
            "Referrer-Policy": self.config.referrer_policy,
            "Permissions-Policy": self.config.permissions_policy,
        }

        if self.config.csp_enabled:
            headers["Content-Security-Policy"] = self.config.csp_policy

        if self.config.hsts_enabled and self._is_production():
            hsts_value = f"max-age={self.config.hsts_max_age}"
            if self.config.hsts_include_subdomains:
                hsts_value += "; includeSubDomains"
            headers["Strict-Transport-Security"] = hsts_value

        # Add custom headers
        headers.update(self.config.additional_headers)

        return headers

    def update_csp_policy(self, new_policy: str) -> None:
        """Update the Content Security Policy.

        Args:
            new_policy: The new CSP policy string
        """
        self.config.csp_policy = new_policy
        self.logger.info("Updated Content Security Policy")

    def add_custom_header(self, header: str, value: str) -> None:
        """Add a custom security header.

        Args:
            header: The header name
            value: The header value
        """
        self.config.additional_headers[header] = value
        self.logger.info(f"Added custom security header: {header}")

    def remove_custom_header(self, header: str) -> bool:
        """Remove a custom security header.

        Args:
            header: The header name to remove

        Returns:
            True if header was removed, False if not found
        """
        if header in self.config.additional_headers:
            del self.config.additional_headers[header]
            self.logger.info(f"Removed custom security header: {header}")
            return True
        return False


def create_security_headers_middleware(
    app: Callable, environment: str = "development", **config_kwargs
) -> SecurityHeadersMiddleware:
    """Create a security headers middleware instance.

    Args:
        app: The ASGI application
        environment: The environment (development, staging, production)
        **config_kwargs: Additional configuration parameters

    Returns:
        Configured security headers middleware instance
    """
    config = SecurityHeadersConfig()

    # Update config with any provided parameters
    for key, value in config_kwargs.items():
        if hasattr(config, key):
            setattr(config, key, value)

    return SecurityHeadersMiddleware(app, config=config, environment=environment)


def setup_security_headers_middleware(
    app, environment: str = "development", **config_kwargs
) -> None:
    """Setup security headers middleware for a FastAPI application.

    Args:
        app: The FastAPI application
        environment: The environment (development, staging, production)
        **config_kwargs: Additional configuration parameters
    """
    security_middleware = create_security_headers_middleware(
        app, environment, **config_kwargs
    )

    # Add the middleware to the FastAPI app
    app.add_middleware(
        SecurityHeadersMiddleware, config=security_middleware.config, **config_kwargs
    )

    logger.info(
        f"Security headers middleware setup complete for {environment} environment"
    )


# Legacy function for backward compatibility
async def add_security_headers(request: Request, call_next):
    """Legacy security headers function for backward compatibility.

    Args:
        request: The incoming HTTP request
        call_next: The next middleware/handler in the chain

    Returns:
        Response: The HTTP response with security headers
    """
    response = await call_next(request)

    # Add basic security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

    # Content Security Policy
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
        "img-src 'self' data: https:; "
        "font-src 'self' https://cdn.jsdelivr.net; "
        "connect-src 'self'; "
        "frame-ancestors 'none';"
    )
    response.headers["Content-Security-Policy"] = csp

    # Strict Transport Security (only in production)
    if os.getenv("ENVIRONMENT") == "production":
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )

    return response
