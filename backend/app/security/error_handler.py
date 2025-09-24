"""Enhanced Error Handling System for Reynard Backend

This module provides comprehensive error handling and security-aware
error responses to prevent information disclosure and improve reliability.
"""

import logging
import re
from typing import Any

from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


class SecurityErrorHandler:
    """Enhanced error handler that provides secure error responses
    and prevents information disclosure.
    """

    def __init__(self):
        self.error_codes = {
            # Authentication errors
            "AUTH_INVALID_CREDENTIALS": "Invalid username or password",
            "AUTH_TOKEN_EXPIRED": "Authentication token has expired",
            "AUTH_TOKEN_INVALID": "Invalid authentication token",
            "AUTH_INSUFFICIENT_PERMISSIONS": "Insufficient permissions",
            "AUTH_ACCOUNT_LOCKED": "Account is locked",
            "AUTH_ACCOUNT_DISABLED": "Account is disabled",
            # Validation errors
            "VALIDATION_INVALID_INPUT": "Invalid input provided",
            "VALIDATION_MISSING_FIELD": "Required field is missing",
            "VALIDATION_INVALID_FORMAT": "Invalid format provided",
            "VALIDATION_VALUE_TOO_LONG": "Value exceeds maximum length",
            "VALIDATION_VALUE_TOO_SHORT": "Value below minimum length",
            # Security errors
            "SECURITY_SQL_INJECTION": "SQL injection attempt detected",
            "SECURITY_COMMAND_INJECTION": "Command injection attempt detected",
            "SECURITY_XSS_ATTEMPT": "XSS attempt detected",
            "SECURITY_PATH_TRAVERSAL": "Path traversal attempt detected",
            "SECURITY_RATE_LIMIT": "Rate limit exceeded",
            "SECURITY_SUSPICIOUS_ACTIVITY": "Suspicious activity detected",
            # System errors
            "SYSTEM_INTERNAL_ERROR": "Internal server error",
            "SYSTEM_SERVICE_UNAVAILABLE": "Service temporarily unavailable",
            "SYSTEM_DATABASE_ERROR": "Database operation failed",
            "SYSTEM_NETWORK_ERROR": "Network operation failed",
            "SYSTEM_TIMEOUT": "Operation timed out",
            # Business logic errors
            "BUSINESS_RESOURCE_NOT_FOUND": "Resource not found",
            "BUSINESS_RESOURCE_CONFLICT": "Resource conflict",
            "BUSINESS_OPERATION_FAILED": "Operation failed",
            "BUSINESS_INVALID_STATE": "Invalid state for operation",
        }

    def get_error_response(
        self,
        error_code: str,
        status_code: int = 500,
        details: dict[str, Any] | None = None,
        request_id: str | None = None,
    ) -> JSONResponse:
        """Generate a standardized error response."""
        # Get user-friendly message
        message = self.error_codes.get(error_code, "An error occurred")

        # Build response
        response_data = {
            "error": {"code": error_code, "message": message, "status": status_code},
        }

        # Add request ID if provided
        if request_id:
            response_data["error"]["request_id"] = request_id

        # Add details if provided and safe
        if details:
            response_data["error"]["details"] = self._sanitize_details(details)

        # Log the error
        self._log_error(error_code, message, details, request_id)

        return JSONResponse(status_code=status_code, content=response_data)

    def handle_validation_error(
        self, error: RequestValidationError, request: Request,
    ) -> JSONResponse:
        """Handle Pydantic validation errors."""
        # Extract validation errors
        errors = []
        for err in error.errors():
            field = ".".join(str(loc) for loc in err["loc"])
            message = err["msg"]
            errors.append({"field": field, "message": message, "type": err["type"]})

        return self.get_error_response(
            error_code="VALIDATION_INVALID_INPUT",
            status_code=422,
            details={"validation_errors": errors},
            request_id=getattr(request.state, "request_id", None),
        )

    def handle_http_exception(
        self, error: HTTPException, request: Request,
    ) -> JSONResponse:
        """Handle HTTP exceptions."""
        # Map status codes to error codes
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

        error_code = status_code_mapping.get(error.status_code, "SYSTEM_INTERNAL_ERROR")

        return self.get_error_response(
            error_code=error_code,
            status_code=error.status_code,
            details={"detail": str(error.detail)} if error.detail else None,
            request_id=getattr(request.state, "request_id", None),
        )

    def handle_starlette_exception(
        self, error: StarletteHTTPException, request: Request,
    ) -> JSONResponse:
        """Handle Starlette HTTP exceptions."""
        # Map status codes to error codes
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

        error_code = status_code_mapping.get(error.status_code, "SYSTEM_INTERNAL_ERROR")

        return self.get_error_response(
            error_code=error_code,
            status_code=error.status_code,
            details={"detail": str(error.detail)} if error.detail else None,
            request_id=getattr(request.state, "request_id", None),
        )

    def handle_generic_exception(
        self, error: Exception, request: Request,
    ) -> JSONResponse:
        """Handle generic exceptions."""
        # Log the full error for debugging
        logger.error(f"Unhandled exception: {error}", exc_info=True)

        # Determine error type and code
        error_code = "SYSTEM_INTERNAL_ERROR"
        status_code = 500

        if isinstance(error, ValueError):
            error_code = "VALIDATION_INVALID_INPUT"
            status_code = 400
        elif isinstance(error, PermissionError):
            error_code = "AUTH_INSUFFICIENT_PERMISSIONS"
            status_code = 403
        elif isinstance(error, FileNotFoundError):
            error_code = "BUSINESS_RESOURCE_NOT_FOUND"
            status_code = 404
        elif isinstance(error, TimeoutError):
            error_code = "SYSTEM_TIMEOUT"
            status_code = 408
        elif isinstance(error, ConnectionError):
            error_code = "SYSTEM_NETWORK_ERROR"
            status_code = 503

        return self.get_error_response(
            error_code=error_code,
            status_code=status_code,
            details={"type": type(error).__name__},
            request_id=getattr(request.state, "request_id", None),
        )

    def _sanitize_details(self, details: dict[str, Any]) -> dict[str, Any]:
        """Sanitize error details to prevent information disclosure."""
        sanitized = {}

        for key, value in details.items():
            if isinstance(value, str):
                # Truncate long strings
                if len(value) > 200:
                    value = value[:200] + "..."
                # Remove sensitive information
                value = self._remove_sensitive_info(value)
            elif isinstance(value, dict):
                value = self._sanitize_details(value)
            elif isinstance(value, list):
                value = [
                    self._sanitize_details({"item": item})["item"]
                    for item in value[:10]
                ]

            sanitized[key] = value

        return sanitized

    def _remove_sensitive_info(self, text: str) -> str:
        """Remove sensitive information from error messages."""
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
        message: str,
        details: dict[str, Any] | None,
        request_id: str | None,
    ) -> None:
        """Log error information."""
        log_data = {
            "error_code": error_code,
            "message": message,
            "request_id": request_id,
        }

        if details:
            log_data["details"] = details

        logger.error(f"Error occurred: {log_data}")


# Global error handler instance
error_handler = SecurityErrorHandler()


async def validation_exception_handler(
    request: Request, exc: RequestValidationError,
) -> JSONResponse:
    """Handle Pydantic validation errors."""
    return error_handler.handle_validation_error(exc, request)


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle FastAPI HTTP exceptions."""
    return error_handler.handle_http_exception(exc, request)


async def starlette_exception_handler(
    request: Request, exc: StarletteHTTPException,
) -> JSONResponse:
    """Handle Starlette HTTP exceptions."""
    return error_handler.handle_starlette_exception(exc, request)


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle generic exceptions."""
    return error_handler.handle_generic_exception(exc, request)


def setup_error_handlers(app):
    """Set up error handlers for the FastAPI app."""
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(StarletteHTTPException, starlette_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)
