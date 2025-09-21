"""
Input Validation Middleware

This middleware applies comprehensive input validation to all incoming requests
to prevent SQL injection, XSS, path traversal, and other security attacks.
"""

import json
import re
from typing import Any

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.security.input_validator import validate_input_security


class InputValidationMiddleware(BaseHTTPMiddleware):
    """
    Middleware that validates all input data for security threats.

    This middleware intercepts all requests and validates:
    - Query parameters
    - Form data
    - JSON payloads
    - Headers (selective)
    """

    def __init__(self, app, skip_paths: list = None):
        super().__init__(app)
        self.skip_paths = skip_paths or [
            "/api/docs",
            "/api/redoc",
            "/api/openapi.json",
            "/favicon.ico",
            "/health",
            "/api/health",
            "/",
        ]

    async def dispatch(self, request: Request, call_next):
        """Process the request and validate input data."""

        # Skip validation for certain paths
        if any(request.url.path.startswith(path) for path in self.skip_paths):
            return await call_next(request)

        try:
            # Validate query parameters
            await self._validate_query_params(request)

            # Validate request body
            await self._validate_request_body(request)

            # Validate headers (selective)
            await self._validate_headers(request)

        except HTTPException as e:
            return JSONResponse(
                status_code=400,
                content={
                    "error": "Input validation failed",
                    "detail": str(e.detail),
                    "type": "validation_error",
                },
            )
        except Exception:
            return JSONResponse(
                status_code=400,
                content={
                    "error": "Input validation error",
                    "detail": "Invalid input data",
                    "type": "validation_error",
                },
            )

        # Continue with the request
        response = await call_next(request)
        return response

    async def _validate_query_params(self, request: Request):
        """Validate query parameters."""
        for key, value in request.query_params.items():
            if isinstance(value, str):
                try:
                    validate_input_security(value, f"query_param_{key}")
                except ValueError as e:
                    raise HTTPException(status_code=400, detail=str(e))

    async def _validate_request_body(self, request: Request):
        """Validate request body data."""
        content_type = request.headers.get("content-type", "")

        if "application/json" in content_type:
            await self._validate_json_body(request)
        elif "application/x-www-form-urlencoded" in content_type:
            await self._validate_form_body(request)
        elif "multipart/form-data" in content_type:
            await self._validate_multipart_body(request)

    async def _validate_json_body(self, request: Request):
        """Validate JSON request body."""
        try:
            # Read the body
            body = await request.body()
            if not body:
                return

            # Parse JSON
            data = json.loads(body.decode("utf-8"))

            # Validate all string values recursively
            self._validate_dict_recursive(data, "request_body")

        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON format")
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def _validate_form_body(self, request: Request):
        """Validate form-encoded request body."""
        try:
            form_data = await request.form()
            for key, value in form_data.items():
                if isinstance(value, str):
                    validate_input_security(value, f"form_field_{key}")
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def _validate_multipart_body(self, request: Request):
        """Validate multipart form data."""
        try:
            form_data = await request.form()
            for key, value in form_data.items():
                if isinstance(value, str):
                    # Skip file uploads (they're handled differently)
                    if not key.endswith("_file") and not key.startswith("file_"):
                        validate_input_security(value, f"multipart_field_{key}")
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def _validate_headers(self, request: Request):
        """Validate potentially dangerous headers."""
        dangerous_headers = [
            "user-agent",
            "referer",
            "origin",
            "x-forwarded-for",
            "x-real-ip",
        ]

        for header_name in dangerous_headers:
            header_value = request.headers.get(header_name)
            if header_value:
                try:
                    validate_input_security(header_value, f"header_{header_name}")
                except ValueError:
                    # Log the attempt but don't block the request
                    # as headers can be manipulated by proxies
                    pass

    def _validate_dict_recursive(
        self, data: dict | list | str | Any, field_prefix: str
    ):
        """Recursively validate dictionary data."""
        if isinstance(data, dict):
            for key, value in data.items():
                field_name = f"{field_prefix}.{key}"
                self._validate_dict_recursive(value, field_name)
        elif isinstance(data, list):
            for i, item in enumerate(data):
                field_name = f"{field_prefix}[{i}]"
                self._validate_dict_recursive(item, field_name)
        elif isinstance(data, str):
            # Use enhanced validation for authentication fields
            if any(
                auth_field in field_prefix.lower()
                for auth_field in ["username", "email", "password"]
            ):
                self._validate_authentication_field(data, field_prefix)
            else:
                validate_input_security(data, field_prefix)

    def _validate_authentication_field(self, value: str, field_name: str) -> None:
        """Enhanced validation for authentication fields"""
        # First run the standard security validation
        validate_input_security(value, field_name)

        # Additional field-specific validation
        if "username" in field_name.lower():
            self._validate_username(value)
        elif "email" in field_name.lower():
            self._validate_email(value)
        elif "password" in field_name.lower():
            self._validate_password(value)

    def _validate_username(self, username: str) -> None:
        """Validate username field specifically"""
        # Length validation
        if len(username) < 3:
            raise ValueError("Username must be at least 3 characters long")
        if len(username) > 50:
            raise ValueError("Username must be less than 50 characters")

        # Character validation (alphanumeric, underscore, hyphen only)
        if not re.match(r"^[a-zA-Z0-9_-]+$", username):
            raise ValueError(
                "Username can only contain letters, numbers, underscores, and hyphens"
            )

        # Check for reserved usernames
        reserved_usernames = ["admin", "root", "administrator", "system", "api", "test"]
        if username.lower() in reserved_usernames:
            raise ValueError("Username is reserved and cannot be used")

    def _validate_email(self, email: str) -> None:
        """Validate email field specifically"""
        # Basic email format validation
        email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_pattern, email):
            raise ValueError("Invalid email format")

        # Length validation
        if len(email) > 254:  # RFC 5321 limit
            raise ValueError("Email address is too long")

    def _validate_password(self, password: str) -> None:
        """Validate password field specifically"""
        # Length validation
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if len(password) > 128:
            raise ValueError("Password is too long")

        # Check for common weak passwords
        weak_passwords = ["password", "123456", "qwerty", "abc123", "password123"]
        if password.lower() in weak_passwords:
            raise ValueError("Password is too common and weak")


def setup_input_validation_middleware(app):
    """Setup input validation middleware for the FastAPI application."""
    app.add_middleware(InputValidationMiddleware)
