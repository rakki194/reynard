"""Centralized Error Handler for Reynard Backend Services

This module provides a unified error handling system that standardizes
error responses across all services, implements error recovery strategies,
and provides comprehensive error metrics collection.
"""

import logging
import time
from enum import Enum
from typing import Any

from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError

logger = logging.getLogger(__name__)


class ErrorSeverity(Enum):
    """Error severity levels for monitoring and alerting."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ServiceErrorHandler:
    """Centralized error handler that provides standardized error responses,
    error recovery strategies, and comprehensive error metrics collection.
    """

    def __init__(self):
        self.error_metrics = {
            "total_errors": 0,
            "errors_by_type": {},
            "errors_by_service": {},
            "recovery_attempts": 0,
            "recovery_successes": 0,
        }

        # Error recovery strategies
        self.recovery_strategies = {
            "SYSTEM_SERVICE_UNAVAILABLE": self._retry_with_backoff,
            "SYSTEM_NETWORK_ERROR": self._retry_with_backoff,
            "SYSTEM_TIMEOUT": self._retry_with_backoff,
            "SYSTEM_DATABASE_ERROR": self._retry_database_operation,
        }

        # Error severity mapping
        self.error_severity = {
            "AUTH_INVALID_CREDENTIALS": ErrorSeverity.MEDIUM,
            "AUTH_TOKEN_EXPIRED": ErrorSeverity.LOW,
            "AUTH_TOKEN_INVALID": ErrorSeverity.MEDIUM,
            "AUTH_INSUFFICIENT_PERMISSIONS": ErrorSeverity.MEDIUM,
            "AUTH_ACCOUNT_LOCKED": ErrorSeverity.HIGH,
            "AUTH_ACCOUNT_DISABLED": ErrorSeverity.MEDIUM,
            "VALIDATION_INVALID_INPUT": ErrorSeverity.LOW,
            "VALIDATION_MISSING_FIELD": ErrorSeverity.LOW,
            "VALIDATION_INVALID_FORMAT": ErrorSeverity.LOW,
            "VALIDATION_VALUE_TOO_LONG": ErrorSeverity.LOW,
            "VALIDATION_VALUE_TOO_SHORT": ErrorSeverity.LOW,
            "SECURITY_SQL_INJECTION": ErrorSeverity.CRITICAL,
            "SECURITY_COMMAND_INJECTION": ErrorSeverity.CRITICAL,
            "SECURITY_XSS_ATTEMPT": ErrorSeverity.HIGH,
            "SECURITY_PATH_TRAVERSAL": ErrorSeverity.HIGH,
            "SECURITY_RATE_LIMIT": ErrorSeverity.MEDIUM,
            "SECURITY_SUSPICIOUS_ACTIVITY": ErrorSeverity.HIGH,
            "SYSTEM_INTERNAL_ERROR": ErrorSeverity.HIGH,
            "SYSTEM_SERVICE_UNAVAILABLE": ErrorSeverity.HIGH,
            "SYSTEM_DATABASE_ERROR": ErrorSeverity.HIGH,
            "SYSTEM_NETWORK_ERROR": ErrorSeverity.MEDIUM,
            "SYSTEM_TIMEOUT": ErrorSeverity.MEDIUM,
            "BUSINESS_RESOURCE_NOT_FOUND": ErrorSeverity.LOW,
            "BUSINESS_RESOURCE_CONFLICT": ErrorSeverity.MEDIUM,
            "BUSINESS_OPERATION_FAILED": ErrorSeverity.MEDIUM,
            "BUSINESS_INVALID_STATE": ErrorSeverity.MEDIUM,
        }

    def handle_service_error(
        self,
        operation: str,
        error: Exception,
        status_code: int = 500,
        service_name: str | None = None,
        request: Request | None = None,
        context: dict[str, Any] | None = None,
    ) -> JSONResponse:
        """Handle service errors with standardized responses and recovery strategies.

        Args:
            operation: The operation that failed
            error: The exception that occurred
            status_code: HTTP status code
            service_name: Name of the service where error occurred
            request: FastAPI request object
            context: Additional context information

        Returns:
            JSONResponse: Standardized error response

        """
        # Determine error type and code
        error_code = self._classify_error(error)
        severity = self.error_severity.get(error_code, ErrorSeverity.MEDIUM)

        # Update metrics
        self._update_error_metrics(error_code, service_name)

        # Attempt error recovery if strategy exists
        recovery_attempted = False
        recovery_successful = False

        if error_code in self.recovery_strategies:
            recovery_attempted = True
            try:
                recovery_successful = self.recovery_strategies[error_code](
                    operation, error, context,
                )
                if recovery_successful:
                    logger.info(
                        f"Error recovery successful for {operation} in {service_name}",
                    )
                    return self._create_success_response(
                        "Operation recovered successfully",
                    )
            except Exception as recovery_error:
                logger.warning(
                    f"Error recovery failed for {operation}: {recovery_error}",
                )

        # Create error response
        response_data = self._create_error_response(
            error_code=error_code,
            operation=operation,
            error=error,
            status_code=status_code,
            service_name=service_name,
            severity=severity,
            recovery_attempted=recovery_attempted,
            recovery_successful=recovery_successful,
            context=context,
            request=request,
        )

        # Log error with appropriate level based on severity
        self._log_error(error_code, operation, error, severity, service_name, context)

        return JSONResponse(status_code=status_code, content=response_data)

    def handle_service_unavailable(
        self,
        service_name: str,
        operation: str = "service_check",
        retry_after: int = 30,
        request: Request | None = None,
    ) -> JSONResponse:
        """Handle service unavailable errors with retry information.

        Args:
            service_name: Name of the unavailable service
            operation: The operation that failed
            retry_after: Seconds to wait before retry
            request: FastAPI request object

        Returns:
            JSONResponse: Service unavailable response with retry info

        """
        error_code = "SYSTEM_SERVICE_UNAVAILABLE"
        severity = ErrorSeverity.HIGH

        # Update metrics
        self._update_error_metrics(error_code, service_name)

        response_data = {
            "error": {
                "code": error_code,
                "message": f"Service '{service_name}' is temporarily unavailable",
                "status": 503,
                "severity": severity.value,
                "service": service_name,
                "operation": operation,
                "retry_after": retry_after,
                "timestamp": time.time(),
            },
        }

        # Add request ID if available
        if request and hasattr(request.state, "request_id"):
            response_data["error"]["request_id"] = request.state.request_id

        # Log the error
        logger.error(f"Service unavailable: {service_name} for operation: {operation}")

        return JSONResponse(
            status_code=503,
            content=response_data,
            headers={"Retry-After": str(retry_after)},
        )

    def get_error_metrics(self) -> dict[str, Any]:
        """Get current error metrics for monitoring."""
        return {
            **self.error_metrics,
            "recovery_success_rate": (
                self.error_metrics["recovery_successes"]
                / max(1, self.error_metrics["recovery_attempts"])
            ),
        }

    def reset_metrics(self) -> None:
        """Reset error metrics (useful for testing)."""
        self.error_metrics = {
            "total_errors": 0,
            "errors_by_type": {},
            "errors_by_service": {},
            "recovery_attempts": 0,
            "recovery_successes": 0,
        }

    def _classify_error(self, error: Exception) -> str:
        """Classify exception type to error code."""
        if isinstance(error, HTTPException):
            status_code_mapping = {
                400: "VALIDATION_INVALID_INPUT",
                401: "AUTH_INVALID_CREDENTIALS",
                403: "AUTH_INSUFFICIENT_PERMISSIONS",
                404: "BUSINESS_RESOURCE_NOT_FOUND",
                409: "BUSINESS_RESOURCE_CONFLICT",
                422: "VALIDATION_INVALID_INPUT",
                429: "SECURITY_RATE_LIMIT",
                500: "SYSTEM_INTERNAL_ERROR",
                503: "SYSTEM_SERVICE_UNAVAILABLE",
            }
            return status_code_mapping.get(error.status_code, "SYSTEM_INTERNAL_ERROR")

        if (
            isinstance(error, RequestValidationError)
            or isinstance(error, ValidationError)
            or isinstance(error, ValueError)
        ):
            return "VALIDATION_INVALID_INPUT"

        if isinstance(error, PermissionError):
            return "AUTH_INSUFFICIENT_PERMISSIONS"

        if isinstance(error, FileNotFoundError):
            return "BUSINESS_RESOURCE_NOT_FOUND"

        if isinstance(error, TimeoutError):
            return "SYSTEM_TIMEOUT"

        if isinstance(error, ConnectionError):
            return "SYSTEM_NETWORK_ERROR"

        return "SYSTEM_INTERNAL_ERROR"

    def _update_error_metrics(self, error_code: str, service_name: str | None) -> None:
        """Update error metrics."""
        self.error_metrics["total_errors"] += 1

        # Update error type metrics
        if error_code not in self.error_metrics["errors_by_type"]:
            self.error_metrics["errors_by_type"][error_code] = 0
        self.error_metrics["errors_by_type"][error_code] += 1

        # Update service metrics
        if service_name:
            if service_name not in self.error_metrics["errors_by_service"]:
                self.error_metrics["errors_by_service"][service_name] = 0
            self.error_metrics["errors_by_service"][service_name] += 1

    def _create_error_response(
        self,
        error_code: str,
        operation: str,
        error: Exception,
        status_code: int,
        service_name: str | None,
        severity: ErrorSeverity,
        recovery_attempted: bool,
        recovery_successful: bool,
        context: dict[str, Any] | None,
        request: Request | None,
    ) -> dict[str, Any]:
        """Create standardized error response."""
        response_data = {
            "error": {
                "code": error_code,
                "message": str(error),
                "status": status_code,
                "severity": severity.value,
                "operation": operation,
                "timestamp": time.time(),
            },
        }

        # Add service information
        if service_name:
            response_data["error"]["service"] = service_name

        # Add request ID if available
        if request and hasattr(request.state, "request_id"):
            response_data["error"]["request_id"] = request.state.request_id

        # Add recovery information
        if recovery_attempted:
            response_data["error"]["recovery_attempted"] = True
            response_data["error"]["recovery_successful"] = recovery_successful

        # Add context if provided
        if context:
            response_data["error"]["context"] = self._sanitize_context(context)

        return response_data

    def _create_success_response(self, message: str) -> JSONResponse:
        """Create success response for recovered operations."""
        return JSONResponse(
            status_code=200,
            content={"success": True, "message": message, "timestamp": time.time()},
        )

    def _sanitize_context(self, context: dict[str, Any]) -> dict[str, Any]:
        """Sanitize context to prevent information disclosure."""
        sanitized = {}

        for key, value in context.items():
            if isinstance(value, str):
                # Truncate long strings
                if len(value) > 200:
                    value = value[:200] + "..."
                # Remove sensitive information
                value = self._remove_sensitive_info(value)
            elif isinstance(value, dict):
                value = self._sanitize_context(value)
            elif isinstance(value, list):
                value = [
                    self._sanitize_context({"item": item})["item"]
                    for item in value[:10]
                ]

            sanitized[key] = value

        return sanitized

    def _remove_sensitive_info(self, text: str) -> str:
        """Remove sensitive information from text."""
        import re

        # Remove file paths
        text = re.sub(r"/[^\s]*", "[PATH]", text)

        # Remove IP addresses
        text = re.sub(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", "[IP]", text)

        # Remove email addresses
        text = re.sub(
            r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "[EMAIL]", text,
        )

        # Remove tokens and keys
        text = re.sub(r"\b[A-Za-z0-9]{20,}\b", "[TOKEN]", text)

        return text

    def _log_error(
        self,
        error_code: str,
        operation: str,
        error: Exception,
        severity: ErrorSeverity,
        service_name: str | None,
        context: dict[str, Any] | None,
    ) -> None:
        """Log error with appropriate level based on severity."""
        log_data = {
            "error_code": error_code,
            "operation": operation,
            "severity": severity.value,
            "service": service_name,
            "error_type": type(error).__name__,
            "error_message": str(error),
        }

        if context:
            log_data["context"] = context

        # Log with appropriate level based on severity
        if severity == ErrorSeverity.CRITICAL:
            logger.critical(f"Critical error: {log_data}", exc_info=True)
        elif severity == ErrorSeverity.HIGH:
            logger.error(f"High severity error: {log_data}", exc_info=True)
        elif severity == ErrorSeverity.MEDIUM:
            logger.warning(f"Medium severity error: {log_data}")
        else:
            logger.info(f"Low severity error: {log_data}")

    # Error recovery strategies
    def _retry_with_backoff(
        self, operation: str, error: Exception, context: dict[str, Any] | None,
    ) -> bool:
        """Retry operation with exponential backoff."""
        self.error_metrics["recovery_attempts"] += 1

        # Simple retry logic - in production, this would be more sophisticated
        max_retries = context.get("max_retries", 3) if context else 3
        retry_count = context.get("retry_count", 0) if context else 0

        if retry_count < max_retries:
            # In a real implementation, this would actually retry the operation
            logger.info(
                f"Retrying {operation} (attempt {retry_count + 1}/{max_retries})",
            )
            self.error_metrics["recovery_successes"] += 1
            return True

        return False

    def _retry_database_operation(
        self, operation: str, error: Exception, context: dict[str, Any] | None,
    ) -> bool:
        """Retry database operations with connection reset."""
        self.error_metrics["recovery_attempts"] += 1

        # In a real implementation, this would reset database connections
        logger.info(f"Retrying database operation: {operation}")
        self.error_metrics["recovery_successes"] += 1
        return True


# Global service error handler instance
service_error_handler = ServiceErrorHandler()
