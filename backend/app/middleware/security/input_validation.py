"""Input validation middleware with comprehensive security checks.

This module provides input validation middleware with SQL injection detection,
XSS protection, path traversal prevention, and other security validations.
"""

import logging
import re
from collections.abc import Awaitable, Callable
from typing import Any, Dict, List, Optional, Union

from fastapi import HTTPException, Request, Response

from ..core.base import BaseMiddleware
from ..core.config import InputValidationConfig

logger = logging.getLogger(__name__)


class InputValidationMiddleware(BaseMiddleware):
    """Comprehensive input validation middleware.

    Provides validation for query parameters, request bodies, and headers
    with security pattern detection and sanitization.
    """

    def __init__(
        self,
        app: Callable,
        name: str = "input_validation",
        config: Optional[InputValidationConfig] = None,
        **kwargs,
    ):
        """Initialize the input validation middleware.

        Args:
            app: The ASGI application
            name: Middleware name
            config: Input validation configuration
            **kwargs: Additional configuration
        """
        super().__init__(app, name, **kwargs)

        # Set up configuration
        if config is None:
            config = InputValidationConfig()

        self.config = config
        self.logger = logging.getLogger(f"middleware.{name}")

        # Compile security patterns
        self._compile_security_patterns()

    def _compile_security_patterns(self) -> None:
        """Compile regex patterns for security detection."""
        self.security_patterns = {}

        if self.config.sql_injection_detection:
            self.security_patterns['sql_injection'] = [
                re.compile(
                    r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)",
                    re.IGNORECASE,
                ),
                re.compile(r"(\b(OR|AND)\s+\d+\s*=\s*\d+)", re.IGNORECASE),
                re.compile(r"(\b(OR|AND)\s+'.*'\s*=\s*'.*')", re.IGNORECASE),
                re.compile(r"(--|#|/\*|\*/)", re.IGNORECASE),
            ]

        if self.config.xss_detection:
            self.security_patterns['xss'] = [
                re.compile(r"<script[^>]*>.*?</script>", re.IGNORECASE | re.DOTALL),
                re.compile(r"javascript:", re.IGNORECASE),
                re.compile(r"on\w+\s*=", re.IGNORECASE),
                re.compile(r"<iframe[^>]*>", re.IGNORECASE),
                re.compile(r"<object[^>]*>", re.IGNORECASE),
                re.compile(r"<embed[^>]*>", re.IGNORECASE),
            ]

        if self.config.path_traversal_detection:
            self.security_patterns['path_traversal'] = [
                re.compile(r"\.\./", re.IGNORECASE),
                re.compile(r"\.\.\\", re.IGNORECASE),
                re.compile(r"%2e%2e%2f", re.IGNORECASE),
                re.compile(r"%2e%2e%5c", re.IGNORECASE),
            ]

        if self.config.command_injection_detection:
            self.security_patterns['command_injection'] = [
                re.compile(r"[;&|`$(){}[\]\\]", re.IGNORECASE),
                re.compile(
                    r"\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig)\b",
                    re.IGNORECASE,
                ),
                re.compile(r"\b(rm|mv|cp|chmod|chown|kill|killall)\b", re.IGNORECASE),
            ]

    async def process_request(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Process the request and validate inputs.

        Args:
            request: The incoming HTTP request
            call_next: The next middleware/handler in the chain

        Returns:
            Response: The HTTP response
        """
        # Skip validation for certain paths
        if self._should_skip_path(request.url.path):
            return await call_next(request)

        # Validate inputs
        validation_result = await self._validate_request(request)

        if not validation_result['valid']:
            self.logger.warning(
                f"Input validation failed for {request.method} {request.url.path}: {validation_result['errors']}"
            )
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Input validation failed",
                    "message": "Invalid input detected",
                    "details": validation_result['errors'],
                },
            )

        return await call_next(request)

    def _should_skip_path(self, path: str) -> bool:
        """Check if path should be skipped for validation.

        Args:
            path: The request path

        Returns:
            True if path should be skipped
        """
        return any(skip_path in path for skip_path in self.config.skip_paths)

    async def _validate_request(self, request: Request) -> Dict[str, Any]:
        """Validate all aspects of the request.

        Args:
            request: The request to validate

        Returns:
            Dictionary with validation results
        """
        errors = []

        # Validate query parameters
        if self.config.validate_query_params:
            query_errors = self._validate_query_params(request.query_params)
            errors.extend(query_errors)

        # Validate request body (if applicable)
        if self.config.validate_request_body and request.method in [
            'POST',
            'PUT',
            'PATCH',
        ]:
            body_errors = await self._validate_request_body(request)
            errors.extend(body_errors)

        # Validate headers
        if self.config.validate_headers:
            header_errors = self._validate_headers(request.headers)
            errors.extend(header_errors)

        return {'valid': len(errors) == 0, 'errors': errors}

    def _validate_query_params(self, query_params: Any) -> List[str]:
        """Validate query parameters.

        Args:
            query_params: The query parameters to validate

        Returns:
            List of validation errors
        """
        errors = []

        for param_name, param_value in query_params.items():
            # Validate parameter name
            if not self._is_valid_parameter_name(param_name):
                errors.append(f"Invalid parameter name: {param_name}")
                continue

            # Validate parameter value
            value_errors = self._validate_parameter_value(param_name, param_value)
            errors.extend(value_errors)

        return errors

    async def _validate_request_body(self, request: Request) -> List[str]:
        """Validate request body.

        Args:
            request: The request to validate

        Returns:
            List of validation errors
        """
        errors = []

        try:
            # Get request body
            body = await request.body()

            if body:
                # Convert to string for pattern matching
                body_str = body.decode('utf-8', errors='ignore')

                # Check for security patterns
                security_errors = self._check_security_patterns(
                    body_str, "request body"
                )
                errors.extend(security_errors)

        except Exception as e:
            self.logger.error(f"Error validating request body: {e}")
            errors.append("Invalid request body format")

        return errors

    def _validate_headers(self, headers: Any) -> List[str]:
        """Validate request headers.

        Args:
            headers: The headers to validate

        Returns:
            List of validation errors
        """
        errors = []

        for header_name, header_value in headers.items():
            # Validate header name
            if not self._is_valid_header_name(header_name):
                errors.append(f"Invalid header name: {header_name}")
                continue

            # Validate header value
            value_errors = self._validate_parameter_value(header_name, header_value)
            errors.extend(value_errors)

        return errors

    def _is_valid_parameter_name(self, name: str) -> bool:
        """Check if parameter name is valid.

        Args:
            name: The parameter name to check

        Returns:
            True if parameter name is valid
        """
        # Basic validation: alphanumeric, underscore, hyphen
        return bool(re.match(r'^[a-zA-Z0-9_-]+$', name))

    def _is_valid_header_name(self, name: str) -> bool:
        """Check if header name is valid.

        Args:
            name: The header name to check

        Returns:
            True if header name is valid
        """
        # Header names should be alphanumeric with hyphens
        return bool(re.match(r'^[a-zA-Z0-9-]+$', name))

    def _validate_parameter_value(self, name: str, value: str) -> List[str]:
        """Validate a parameter value.

        Args:
            name: The parameter name
            value: The parameter value

        Returns:
            List of validation errors
        """
        errors = []

        # Check for security patterns
        security_errors = self._check_security_patterns(value, f"parameter '{name}'")
        errors.extend(security_errors)

        # Field-specific validation
        if name.lower() in ['username', 'user']:
            errors.extend(self._validate_username(value))
        elif name.lower() in ['password', 'pass']:
            errors.extend(self._validate_password(value))
        elif name.lower() in ['email', 'mail']:
            errors.extend(self._validate_email(value))

        return errors

    def _check_security_patterns(self, value: str, context: str) -> List[str]:
        """Check value against security patterns.

        Args:
            value: The value to check
            context: Context for error messages

        Returns:
            List of security violations found
        """
        errors = []

        for pattern_type, patterns in self.security_patterns.items():
            for pattern in patterns:
                if pattern.search(value):
                    errors.append(f"Potential {pattern_type} detected in {context}")
                    break  # Only report one match per pattern type

        return errors

    def _validate_username(self, username: str) -> List[str]:
        """Validate username field.

        Args:
            username: The username to validate

        Returns:
            List of validation errors
        """
        errors = []

        if len(username) < self.config.username_min_length:
            errors.append(
                f"Username too short (minimum {self.config.username_min_length} characters)"
            )

        if len(username) > self.config.username_max_length:
            errors.append(
                f"Username too long (maximum {self.config.username_max_length} characters)"
            )

        # Username should be alphanumeric with underscores and hyphens
        if not re.match(r'^[a-zA-Z0-9_-]+$', username):
            errors.append("Username contains invalid characters")

        return errors

    def _validate_password(self, password: str) -> List[str]:
        """Validate password field.

        Args:
            password: The password to validate

        Returns:
            List of validation errors
        """
        errors = []

        if len(password) < self.config.password_min_length:
            errors.append(
                f"Password too short (minimum {self.config.password_min_length} characters)"
            )

        if len(password) > self.config.password_max_length:
            errors.append(
                f"Password too long (maximum {self.config.password_max_length} characters)"
            )

        return errors

    def _validate_email(self, email: str) -> List[str]:
        """Validate email field.

        Args:
            email: The email to validate

        Returns:
            List of validation errors
        """
        errors = []

        if len(email) > self.config.email_max_length:
            errors.append(
                f"Email too long (maximum {self.config.email_max_length} characters)"
            )

        # Basic email validation
        email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        if not email_pattern.match(email):
            errors.append("Invalid email format")

        return errors

    def get_validation_summary(self, request: Request) -> Dict[str, Any]:
        """Get validation summary for a request.

        Args:
            request: The request to analyze

        Returns:
            Dictionary with validation summary
        """
        return {
            "path": request.url.path,
            "method": request.method,
            "query_params_count": len(request.query_params),
            "headers_count": len(request.headers),
            "validation_enabled": True,
            "skip_paths": self.config.skip_paths,
            "security_patterns": list(self.security_patterns.keys()),
        }

    def update_config(self, new_config: InputValidationConfig) -> None:
        """Update the validation configuration.

        Args:
            new_config: New validation configuration
        """
        self.config = new_config
        self._compile_security_patterns()

        self.logger.info("Input validation configuration updated")

    def add_security_pattern(self, pattern_type: str, pattern: str) -> None:
        """Add a custom security pattern.

        Args:
            pattern_type: Type of security pattern
            pattern: The regex pattern string
        """
        if pattern_type not in self.security_patterns:
            self.security_patterns[pattern_type] = []

        self.security_patterns[pattern_type].append(re.compile(pattern, re.IGNORECASE))
        self.logger.info(f"Added security pattern: {pattern_type}")

    def remove_security_pattern(self, pattern_type: str, pattern: str) -> bool:
        """Remove a security pattern.

        Args:
            pattern_type: Type of security pattern
            pattern: The regex pattern string

        Returns:
            True if pattern was removed, False if not found
        """
        if pattern_type in self.security_patterns:
            compiled_pattern = re.compile(pattern, re.IGNORECASE)
            if compiled_pattern in self.security_patterns[pattern_type]:
                self.security_patterns[pattern_type].remove(compiled_pattern)
                self.logger.info(f"Removed security pattern: {pattern_type}")
                return True
        return False
