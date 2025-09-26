"""CORS validation utilities and security checks.

This module provides validation functions for CORS requests, ensuring
secure handling of cross-origin requests with proper security checks.
"""

import logging
from typing import List, Optional, Tuple
from urllib.parse import urlparse

from fastapi import HTTPException, Request

logger = logging.getLogger(__name__)


class CORSValidator:
    """Validator for CORS requests with security checks.

    Provides comprehensive validation for CORS requests including origin
    validation, method validation, and header validation with security
    best practices.
    """

    def __init__(self, config):
        """Initialize the CORS validator.

        Args:
            config: CORS configuration object
        """
        self.config = config
        self.logger = logging.getLogger(f"cors.validator")

    def validate_origin(self, origin: str) -> bool:
        """Validate a request origin.

        Args:
            origin: The origin to validate

        Returns:
            True if origin is valid and allowed
        """
        if not origin:
            return False

        try:
            # Parse the origin URL
            parsed = urlparse(origin)

            # Check if it's a valid URL
            if not parsed.scheme or not parsed.netloc:
                self.logger.warning(f"Invalid origin URL format: {origin}")
                return False

            # Check if scheme is allowed
            if parsed.scheme not in ["http", "https"]:
                self.logger.warning(f"Disallowed origin scheme: {parsed.scheme}")
                return False

            # Check if origin is in allowed list
            if not self.config.should_allow_origin(origin):
                self.logger.warning(f"Origin not allowed: {origin}")
                return False

            return True

        except Exception as e:
            self.logger.error(f"Error validating origin '{origin}': {e}")
            return False

    def validate_method(self, method: str) -> bool:
        """Validate an HTTP method.

        Args:
            method: The HTTP method to validate

        Returns:
            True if method is allowed
        """
        if not method:
            return False

        method_upper = method.upper()
        allowed_methods = [m.upper() for m in self.config.allowed_methods]

        if method_upper not in allowed_methods:
            self.logger.warning(f"Method not allowed: {method}")
            return False

        return True

    def validate_headers(self, headers: List[str]) -> Tuple[bool, List[str]]:
        """Validate request headers.

        Args:
            headers: List of headers to validate

        Returns:
            Tuple of (is_valid, invalid_headers)
        """
        if not headers:
            return True, []

        allowed_headers = [h.lower() for h in self.config.allowed_headers]
        invalid_headers = []

        for header in headers:
            header_lower = header.lower()

            # Check if header is allowed
            if header_lower not in allowed_headers:
                # Some headers are always allowed (CORS spec)
                if not self._is_always_allowed_header(header_lower):
                    invalid_headers.append(header)

        is_valid = len(invalid_headers) == 0

        if not is_valid:
            self.logger.warning(f"Invalid headers: {invalid_headers}")

        return is_valid, invalid_headers

    def validate_preflight_request(self, request: Request) -> Tuple[bool, str]:
        """Validate a CORS preflight request.

        Args:
            request: The preflight request

        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check if it's actually a preflight request
        if request.method != "OPTIONS":
            return False, "Not a preflight request"

        # Get CORS headers
        origin = request.headers.get("origin")
        method = request.headers.get("access-control-request-method")
        headers = request.headers.get("access-control-request-headers")

        # Validate origin
        if not origin:
            return False, "Missing origin header"

        if not self.validate_origin(origin):
            return False, f"Origin not allowed: {origin}"

        # Validate requested method
        if method and not self.validate_method(method):
            return False, f"Method not allowed: {method}"

        # Validate requested headers
        if headers:
            header_list = [h.strip() for h in headers.split(",")]
            is_valid, invalid_headers = self.validate_headers(header_list)
            if not is_valid:
                return False, f"Headers not allowed: {invalid_headers}"

        return True, ""

    def validate_actual_request(self, request: Request) -> Tuple[bool, str]:
        """Validate a CORS actual request.

        Args:
            request: The actual request

        Returns:
            Tuple of (is_valid, error_message)
        """
        # Get origin
        origin = request.headers.get("origin")

        # For same-origin requests, no CORS validation needed
        if not origin:
            return True, ""

        # Validate origin
        if not self.validate_origin(origin):
            return False, f"Origin not allowed: {origin}"

        return True, ""

    def _is_always_allowed_header(self, header: str) -> bool:
        """Check if a header is always allowed by CORS specification.

        Args:
            header: The header name (lowercase)

        Returns:
            True if header is always allowed
        """
        # Headers that are always allowed by CORS spec
        always_allowed = [
            "accept",
            "accept-language",
            "content-language",
            "content-type",
        ]

        return header in always_allowed

    def get_validation_summary(self, request: Request) -> dict:
        """Get a summary of CORS validation for a request.

        Args:
            request: The request to validate

        Returns:
            Dictionary with validation summary
        """
        origin = request.headers.get("origin")
        method = request.method
        headers = list(request.headers.keys())

        summary = {
            "origin": origin,
            "method": method,
            "headers": headers,
            "is_preflight": method == "OPTIONS",
            "origin_valid": self.validate_origin(origin) if origin else True,
            "method_valid": self.validate_method(method),
            "headers_valid": self.validate_headers(headers)[0],
            "overall_valid": True,
        }

        # Calculate overall validity
        summary["overall_valid"] = (
            summary["origin_valid"]
            and summary["method_valid"]
            and summary["headers_valid"]
        )

        return summary

    def log_validation_result(
        self, request: Request, is_valid: bool, error: str = ""
    ) -> None:
        """Log CORS validation results.

        Args:
            request: The request that was validated
            is_valid: Whether validation passed
            error: Error message if validation failed
        """
        origin = request.headers.get("origin", "unknown")
        method = request.method
        path = request.url.path

        if is_valid:
            self.logger.info(f"CORS validation passed: {method} {path} from {origin}")
        else:
            self.logger.warning(
                f"CORS validation failed: {method} {path} from {origin} - {error}"
            )

    def create_cors_error_response(
        self, error: str, status_code: int = 403
    ) -> HTTPException:
        """Create a CORS error response.

        Args:
            error: Error message
            status_code: HTTP status code

        Returns:
            HTTPException with CORS error details
        """
        return HTTPException(
            status_code=status_code,
            detail={
                "error": "CORS validation failed",
                "message": error,
                "type": "cors_error",
            },
        )
