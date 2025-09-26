"""Custom exceptions for the tool calling system.

This module defines specific exception types for different tool-related errors,
providing clear error messaging and proper categorization of failures.
"""

from typing import Any


class ToolError(Exception):
    """Base exception for all tool-related errors."""

    def __init__(
        self,
        message: str,
        tool_name: str | None = None,
        details: dict[str, Any] | None = None,
    ):
        super().__init__(message)
        self.tool_name = tool_name
        self.details = details or {}

    def to_dict(self) -> dict[str, Any]:
        """Convert exception to dictionary for API responses."""
        return {
            "error": self.__class__.__name__,
            "message": str(self),
            "tool_name": self.tool_name,
            "details": self.details,
        }


class ToolNotFoundError(ToolError):
    """Raised when a requested tool is not found in the registry."""

    def __init__(self, tool_name: str):
        super().__init__(f"Tool '{tool_name}' not found", tool_name)


class ToolExecutionError(ToolError):
    """Raised when a tool fails during execution."""

    def __init__(
        self,
        message: str,
        tool_name: str,
        original_error: Exception | None = None,
    ):
        super().__init__(f"Tool '{tool_name}' execution failed: {message}", tool_name)
        self.original_error = original_error
        if original_error:
            self.details["original_error"] = str(original_error)
            self.details["error_type"] = type(original_error).__name__


class ToolPermissionError(ToolError):
    """Raised when a user lacks permission to execute a tool."""

    def __init__(
        self,
        tool_name: str,
        required_permission: str,
        user_role: str | None = None,
    ):
        message = (
            f"Permission denied for tool '{tool_name}'. Required: {required_permission}"
        )
        if user_role:
            message += f", User role: {user_role}"
        super().__init__(message, tool_name)
        self.required_permission = required_permission
        self.user_role = user_role
        self.details.update(
            {"required_permission": required_permission, "user_role": user_role},
        )


class ToolValidationError(ToolError):
    """Raised when tool parameters fail validation."""

    def __init__(self, tool_name: str, validation_errors: dict[str, str]):
        errors_str = ", ".join(
            [f"{param}: {error}" for param, error in validation_errors.items()],
        )
        super().__init__(
            f"Tool '{tool_name}' parameter validation failed: {errors_str}",
            tool_name,
        )
        self.validation_errors = validation_errors
        self.details["validation_errors"] = validation_errors


class ToolTimeoutError(ToolError):
    """Raised when a tool execution times out."""

    def __init__(self, tool_name: str, timeout_seconds: float):
        super().__init__(
            f"Tool '{tool_name}' timed out after {timeout_seconds} seconds",
            tool_name,
        )
        self.timeout_seconds = timeout_seconds
        self.details["timeout_seconds"] = timeout_seconds


class ToolResourceError(ToolError):
    """Raised when a tool encounters resource-related issues (disk space, memory, etc.)."""

    def __init__(self, tool_name: str, resource_type: str, message: str):
        super().__init__(
            f"Tool '{tool_name}' resource error ({resource_type}): {message}",
            tool_name,
        )
        self.resource_type = resource_type
        self.details["resource_type"] = resource_type
