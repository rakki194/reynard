"""Logging Middleware for Reynard Backend Services

This module provides middleware for request tracking, logging,
and monitoring across all services.
"""

import logging
import time
import uuid
from collections.abc import Callable
from typing import Any

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from .logging_config import get_service_logger

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging HTTP requests and responses."""

    def __init__(self, app: ASGIApp, service_name: str = "reynard"):
        super().__init__(app)
        self.service_name = service_name
        self.service_logger = get_service_logger(service_name)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request and response with logging.

        Args:
            request: The incoming request
            call_next: The next middleware/handler in the chain

        Returns:
            Response: The response to send back

        """
        # Generate request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        # Start timing
        start_time = time.time()

        # Log request
        self._log_request(request, request_id)

        try:
            # Process request
            response = await call_next(request)

            # Calculate processing time
            process_time = time.time() - start_time

            # Log response
            self._log_response(request, response, request_id, process_time)

            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time"] = str(process_time)

            return response

        except Exception as e:
            # Calculate processing time
            process_time = time.time() - start_time

            # Log error
            self._log_error(request, e, request_id, process_time)

            # Re-raise the exception
            raise

    def _log_request(self, request: Request, request_id: str) -> None:
        """Log incoming request details."""
        log_data = {
            "request_id": request_id,
            "method": request.method,
            "url": str(request.url),
            "path": request.url.path,
            "query_params": dict(request.query_params),
            "client_ip": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
            "content_type": request.headers.get("content-type"),
            "content_length": request.headers.get("content-length"),
        }

        self.service_logger.info("Request received", extra=log_data)

    def _log_response(
        self,
        request: Request,
        response: Response,
        request_id: str,
        process_time: float,
    ) -> None:
        """Log response details."""
        log_data = {
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "process_time": process_time,
            "response_size": response.headers.get("content-length"),
            "content_type": response.headers.get("content-type"),
        }

        # Log at appropriate level based on status code
        if response.status_code >= 500:
            self.service_logger.error(
                "Request completed with server error",
                extra=log_data,
            )
        elif response.status_code >= 400:
            self.service_logger.warning(
                "Request completed with client error",
                extra=log_data,
            )
        else:
            self.service_logger.info("Request completed successfully", extra=log_data)

    def _log_error(
        self,
        request: Request,
        error: Exception,
        request_id: str,
        process_time: float,
    ) -> None:
        """Log error details."""
        log_data = {
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "error_type": type(error).__name__,
            "error_message": str(error),
            "process_time": process_time,
        }

        self.service_logger.error(
            "Request failed with exception",
            extra=log_data,
            exc_info=True,
        )


class PerformanceLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for performance monitoring and logging."""

    def __init__(self, app: ASGIApp, service_name: str = "reynard"):
        super().__init__(app)
        self.service_name = service_name
        self.service_logger = get_service_logger(service_name)
        self.performance_metrics: dict[str, Any] = {
            "total_requests": 0,
            "total_time": 0.0,
            "avg_response_time": 0.0,
            "slow_requests": 0,
            "error_requests": 0,
        }

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request with performance monitoring.

        Args:
            request: The incoming request
            call_next: The next middleware/handler in the chain

        Returns:
            Response: The response to send back

        """
        start_time = time.time()

        try:
            response = await call_next(request)
            process_time = time.time() - start_time

            # Update metrics
            self._update_metrics(process_time, response.status_code)

            # Log slow requests
            if process_time > 1.0:  # Log requests taking more than 1 second
                self._log_slow_request(request, process_time)

            return response

        except Exception:
            process_time = time.time() - start_time
            self._update_metrics(process_time, 500)
            raise

    def _update_metrics(self, process_time: float, status_code: int) -> None:
        """Update performance metrics."""
        self.performance_metrics["total_requests"] += 1
        self.performance_metrics["total_time"] += process_time
        self.performance_metrics["avg_response_time"] = (
            self.performance_metrics["total_time"]
            / self.performance_metrics["total_requests"]
        )

        if process_time > 1.0:
            self.performance_metrics["slow_requests"] += 1

        if status_code >= 400:
            self.performance_metrics["error_requests"] += 1

    def _log_slow_request(self, request: Request, process_time: float) -> None:
        """Log slow requests."""
        log_data = {
            "method": request.method,
            "path": request.url.path,
            "process_time": process_time,
            "query_params": dict(request.query_params),
        }

        self.service_logger.warning("Slow request detected", extra=log_data)

    def get_performance_metrics(self) -> dict[str, Any]:
        """Get current performance metrics."""
        return self.performance_metrics.copy()

    def reset_metrics(self) -> None:
        """Reset performance metrics."""
        self.performance_metrics = {
            "total_requests": 0,
            "total_time": 0.0,
            "avg_response_time": 0.0,
            "slow_requests": 0,
            "error_requests": 0,
        }


class SecurityLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for security event logging."""

    def __init__(self, app: ASGIApp, service_name: str = "reynard"):
        super().__init__(app)
        self.service_name = service_name
        self.service_logger = get_service_logger(service_name)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request with security monitoring.

        Args:
            request: The incoming request
            call_next: The next middleware/handler in the chain

        Returns:
            Response: The response to send back

        """
        # Check for suspicious patterns
        self._check_suspicious_patterns(request)

        try:
            response = await call_next(request)

            # Log security events based on response
            self._log_security_events(request, response)

            return response

        except Exception as e:
            # Log security-related exceptions
            self._log_security_exception(request, e)
            raise

    def _check_suspicious_patterns(self, request: Request) -> None:
        """Check for suspicious request patterns."""
        suspicious_patterns = [
            "..",  # Path traversal
            "<script",  # XSS attempt
            "union select",  # SQL injection
            "exec(",  # Command injection
            "eval(",  # Code injection
        ]

        request_str = f"{request.method} {request.url.path} {request.url.query}"
        request_str_lower = request_str.lower()

        for pattern in suspicious_patterns:
            if pattern in request_str_lower:
                self._log_suspicious_activity(request, pattern)

    def _log_suspicious_activity(self, request: Request, pattern: str) -> None:
        """Log suspicious activity."""
        log_data = {
            "method": request.method,
            "url": str(request.url),
            "client_ip": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
            "suspicious_pattern": pattern,
            "timestamp": time.time(),
        }

        self.service_logger.warning("Suspicious activity detected", extra=log_data)

    def _log_security_events(self, request: Request, response: Response) -> None:
        """Log security-related events."""
        # Log authentication failures
        if response.status_code == 401:
            log_data = {
                "method": request.method,
                "path": request.url.path,
                "client_ip": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
                "event_type": "authentication_failure",
            }
            self.service_logger.warning("Authentication failure", extra=log_data)

        # Log authorization failures
        elif response.status_code == 403:
            log_data = {
                "method": request.method,
                "path": request.url.path,
                "client_ip": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
                "event_type": "authorization_failure",
            }
            self.service_logger.warning("Authorization failure", extra=log_data)

        # Log rate limiting
        elif response.status_code == 429:
            log_data = {
                "method": request.method,
                "path": request.url.path,
                "client_ip": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
                "event_type": "rate_limit_exceeded",
            }
            self.service_logger.warning("Rate limit exceeded", extra=log_data)

    def _log_security_exception(self, request: Request, error: Exception) -> None:
        """Log security-related exceptions."""
        log_data = {
            "method": request.method,
            "path": request.url.path,
            "client_ip": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
            "error_type": type(error).__name__,
            "error_message": str(error),
            "event_type": "security_exception",
        }

        self.service_logger.error(
            "Security exception occurred",
            extra=log_data,
            exc_info=True,
        )


def setup_logging_middleware(app: ASGIApp, service_name: str = "reynard") -> None:
    """Setup all logging middleware for the application.

    Args:
        app: FastAPI application instance
        service_name: Name of the service

    """
    # Add request logging middleware
    app.add_middleware(RequestLoggingMiddleware, service_name=service_name)

    # Add performance logging middleware
    app.add_middleware(PerformanceLoggingMiddleware, service_name=service_name)

    # Add security logging middleware
    app.add_middleware(SecurityLoggingMiddleware, service_name=service_name)

    logger.info(f"Logging middleware setup complete for service: {service_name}")
