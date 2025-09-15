"""
Custom Exception Classes for Reynard Backend Services

This module defines custom exception classes for different error types,
providing structured error handling and better error classification.
"""

from typing import Any


class ReynardBaseException(Exception):
    """Base exception class for all Reynard-specific exceptions."""

    def __init__(
        self,
        message: str,
        error_code: str = "REYNARD_ERROR",
        status_code: int = 500,
        details: dict[str, Any] | None = None,
        service_name: str | None = None,
    ):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        self.service_name = service_name


# Authentication and Authorization Exceptions
class AuthenticationError(ReynardBaseException):
    """Raised when authentication fails."""

    def __init__(self, message: str = "Authentication failed", **kwargs):
        super().__init__(
            message=message,
            error_code="AUTH_INVALID_CREDENTIALS",
            status_code=401,
            **kwargs,
        )


class AuthorizationError(ReynardBaseException):
    """Raised when authorization fails."""

    def __init__(self, message: str = "Insufficient permissions", **kwargs):
        super().__init__(
            message=message,
            error_code="AUTH_INSUFFICIENT_PERMISSIONS",
            status_code=403,
            **kwargs,
        )


class TokenExpiredError(ReynardBaseException):
    """Raised when authentication token has expired."""

    def __init__(self, message: str = "Authentication token has expired", **kwargs):
        super().__init__(
            message=message, error_code="AUTH_TOKEN_EXPIRED", status_code=401, **kwargs
        )


class TokenInvalidError(ReynardBaseException):
    """Raised when authentication token is invalid."""

    def __init__(self, message: str = "Invalid authentication token", **kwargs):
        super().__init__(
            message=message, error_code="AUTH_TOKEN_INVALID", status_code=401, **kwargs
        )


class AccountLockedError(ReynardBaseException):
    """Raised when user account is locked."""

    def __init__(self, message: str = "Account is locked", **kwargs):
        super().__init__(
            message=message, error_code="AUTH_ACCOUNT_LOCKED", status_code=423, **kwargs
        )


class AccountDisabledError(ReynardBaseException):
    """Raised when user account is disabled."""

    def __init__(self, message: str = "Account is disabled", **kwargs):
        super().__init__(
            message=message,
            error_code="AUTH_ACCOUNT_DISABLED",
            status_code=403,
            **kwargs,
        )


# Validation Exceptions
class ValidationError(ReynardBaseException):
    """Raised when input validation fails."""

    def __init__(self, message: str = "Invalid input provided", **kwargs):
        super().__init__(
            message=message,
            error_code="VALIDATION_INVALID_INPUT",
            status_code=400,
            **kwargs,
        )


class MissingFieldError(ReynardBaseException):
    """Raised when a required field is missing."""

    def __init__(self, field_name: str, message: str | None = None, **kwargs):
        if message is None:
            message = f"Required field '{field_name}' is missing"
        super().__init__(
            message=message,
            error_code="VALIDATION_MISSING_FIELD",
            status_code=400,
            details={"field": field_name},
            **kwargs,
        )


class InvalidFormatError(ReynardBaseException):
    """Raised when input format is invalid."""

    def __init__(self, field_name: str, expected_format: str, **kwargs):
        message = (
            f"Field '{field_name}' has invalid format. Expected: {expected_format}"
        )
        super().__init__(
            message=message,
            error_code="VALIDATION_INVALID_FORMAT",
            status_code=400,
            details={"field": field_name, "expected_format": expected_format},
            **kwargs,
        )


class ValueTooLongError(ReynardBaseException):
    """Raised when a value exceeds maximum length."""

    def __init__(self, field_name: str, max_length: int, actual_length: int, **kwargs):
        message = f"Field '{field_name}' exceeds maximum length of {max_length} characters (actual: {actual_length})"
        super().__init__(
            message=message,
            error_code="VALIDATION_VALUE_TOO_LONG",
            status_code=400,
            details={
                "field": field_name,
                "max_length": max_length,
                "actual_length": actual_length,
            },
            **kwargs,
        )


class ValueTooShortError(ReynardBaseException):
    """Raised when a value is below minimum length."""

    def __init__(self, field_name: str, min_length: int, actual_length: int, **kwargs):
        message = f"Field '{field_name}' is below minimum length of {min_length} characters (actual: {actual_length})"
        super().__init__(
            message=message,
            error_code="VALIDATION_VALUE_TOO_SHORT",
            status_code=400,
            details={
                "field": field_name,
                "min_length": min_length,
                "actual_length": actual_length,
            },
            **kwargs,
        )


# Security Exceptions
class SecurityError(ReynardBaseException):
    """Base class for security-related exceptions."""

    def __init__(self, message: str, error_code: str, **kwargs):
        super().__init__(
            message=message, error_code=error_code, status_code=403, **kwargs
        )


class SQLInjectionError(SecurityError):
    """Raised when SQL injection attempt is detected."""

    def __init__(self, message: str = "SQL injection attempt detected", **kwargs):
        super().__init__(message=message, error_code="SECURITY_SQL_INJECTION", **kwargs)


class CommandInjectionError(SecurityError):
    """Raised when command injection attempt is detected."""

    def __init__(self, message: str = "Command injection attempt detected", **kwargs):
        super().__init__(
            message=message, error_code="SECURITY_COMMAND_INJECTION", **kwargs
        )


class XSSAttemptError(SecurityError):
    """Raised when XSS attempt is detected."""

    def __init__(self, message: str = "XSS attempt detected", **kwargs):
        super().__init__(message=message, error_code="SECURITY_XSS_ATTEMPT", **kwargs)


class PathTraversalError(SecurityError):
    """Raised when path traversal attempt is detected."""

    def __init__(self, message: str = "Path traversal attempt detected", **kwargs):
        super().__init__(
            message=message, error_code="SECURITY_PATH_TRAVERSAL", **kwargs
        )


class RateLimitError(SecurityError):
    """Raised when rate limit is exceeded."""

    def __init__(
        self, message: str = "Rate limit exceeded", retry_after: int = 60, **kwargs
    ):
        super().__init__(
            message=message,
            error_code="SECURITY_RATE_LIMIT",
            status_code=429,
            details={"retry_after": retry_after},
            **kwargs,
        )


class SuspiciousActivityError(SecurityError):
    """Raised when suspicious activity is detected."""

    def __init__(self, message: str = "Suspicious activity detected", **kwargs):
        super().__init__(
            message=message, error_code="SECURITY_SUSPICIOUS_ACTIVITY", **kwargs
        )


# System Exceptions
class SystemError(ReynardBaseException):
    """Base class for system-related exceptions."""

    def __init__(self, message: str, error_code: str, **kwargs):
        super().__init__(
            message=message, error_code=error_code, status_code=500, **kwargs
        )


class InternalError(SystemError):
    """Raised when an internal system error occurs."""

    def __init__(self, message: str = "Internal server error", **kwargs):
        super().__init__(message=message, error_code="SYSTEM_INTERNAL_ERROR", **kwargs)


class ServiceUnavailableError(SystemError):
    """Raised when a service is unavailable."""

    def __init__(self, service_name: str, message: str | None = None, **kwargs):
        if message is None:
            message = f"Service '{service_name}' is temporarily unavailable"
        super().__init__(
            message=message,
            error_code="SYSTEM_SERVICE_UNAVAILABLE",
            status_code=503,
            details={"service": service_name},
            **kwargs,
        )


class DatabaseError(SystemError):
    """Raised when a database operation fails."""

    def __init__(self, message: str = "Database operation failed", **kwargs):
        super().__init__(message=message, error_code="SYSTEM_DATABASE_ERROR", **kwargs)


class NetworkError(SystemError):
    """Raised when a network operation fails."""

    def __init__(self, message: str = "Network operation failed", **kwargs):
        super().__init__(
            message=message,
            error_code="SYSTEM_NETWORK_ERROR",
            status_code=503,
            **kwargs,
        )


class TimeoutError(SystemError):
    """Raised when an operation times out."""

    def __init__(self, operation: str, timeout_seconds: int, **kwargs):
        message = f"Operation '{operation}' timed out after {timeout_seconds} seconds"
        super().__init__(
            message=message,
            error_code="SYSTEM_TIMEOUT",
            status_code=408,
            details={"operation": operation, "timeout_seconds": timeout_seconds},
            **kwargs,
        )


# Business Logic Exceptions
class BusinessError(ReynardBaseException):
    """Base class for business logic exceptions."""

    def __init__(self, message: str, error_code: str, **kwargs):
        super().__init__(
            message=message, error_code=error_code, status_code=400, **kwargs
        )


class ResourceNotFoundError(BusinessError):
    """Raised when a requested resource is not found."""

    def __init__(self, resource_type: str, resource_id: str, **kwargs):
        message = f"{resource_type} with ID '{resource_id}' not found"
        super().__init__(
            message=message,
            error_code="BUSINESS_RESOURCE_NOT_FOUND",
            status_code=404,
            details={"resource_type": resource_type, "resource_id": resource_id},
            **kwargs,
        )


class ResourceConflictError(BusinessError):
    """Raised when a resource conflict occurs."""

    def __init__(self, message: str = "Resource conflict", **kwargs):
        super().__init__(
            message=message,
            error_code="BUSINESS_RESOURCE_CONFLICT",
            status_code=409,
            **kwargs,
        )


class OperationFailedError(BusinessError):
    """Raised when a business operation fails."""

    def __init__(self, operation: str, reason: str, **kwargs):
        message = f"Operation '{operation}' failed: {reason}"
        super().__init__(
            message=message,
            error_code="BUSINESS_OPERATION_FAILED",
            details={"operation": operation, "reason": reason},
            **kwargs,
        )


class InvalidStateError(BusinessError):
    """Raised when an operation is attempted in an invalid state."""

    def __init__(self, current_state: str, required_state: str, **kwargs):
        message = f"Invalid state for operation. Current: {current_state}, Required: {required_state}"
        super().__init__(
            message=message,
            error_code="BUSINESS_INVALID_STATE",
            details={"current_state": current_state, "required_state": required_state},
            **kwargs,
        )


# Service-Specific Exceptions
class OllamaServiceError(SystemError):
    """Raised when Ollama service operations fail."""

    def __init__(self, message: str = "Ollama service error", **kwargs):
        super().__init__(
            message=message,
            error_code="OLLAMA_SERVICE_ERROR",
            service_name="ollama",
            **kwargs,
        )


class DiffusionServiceError(SystemError):
    """Raised when Diffusion service operations fail."""

    def __init__(self, message: str = "Diffusion service error", **kwargs):
        super().__init__(
            message=message,
            error_code="DIFFUSION_SERVICE_ERROR",
            service_name="diffusion",
            **kwargs,
        )


class TTSServiceError(SystemError):
    """Raised when TTS service operations fail."""

    def __init__(self, message: str = "TTS service error", **kwargs):
        super().__init__(
            message=message,
            error_code="TTS_SERVICE_ERROR",
            service_name="tts",
            **kwargs,
        )


class RAGServiceError(SystemError):
    """Raised when RAG service operations fail."""

    def __init__(self, message: str = "RAG service error", **kwargs):
        super().__init__(
            message=message,
            error_code="RAG_SERVICE_ERROR",
            service_name="rag",
            **kwargs,
        )


class ComfyUIServiceError(SystemError):
    """Raised when ComfyUI service operations fail."""

    def __init__(self, message: str = "ComfyUI service error", **kwargs):
        super().__init__(
            message=message,
            error_code="COMFYUI_SERVICE_ERROR",
            service_name="comfyui",
            **kwargs,
        )


class SummarizationServiceError(SystemError):
    """Raised when Summarization service operations fail."""

    def __init__(self, message: str = "Summarization service error", **kwargs):
        super().__init__(
            message=message,
            error_code="SUMMARIZATION_SERVICE_ERROR",
            service_name="summarization",
            **kwargs,
        )
