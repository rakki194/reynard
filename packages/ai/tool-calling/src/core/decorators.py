"""Decorators for creating tools from regular functions.

This module provides decorators that make it easy to convert regular functions
into tools with proper parameter validation, permission checking, and automatic
registration.
"""

import asyncio
import inspect
from collections.abc import Callable
from typing import Any, get_type_hints

from .base import (
    BaseTool,
    ParameterType,
    ToolExecutionContext,
    ToolParameter,
    ToolResult,
)
from .registry import register_tool


def tool(
    name: str | None = None,
    description: str | None = None,
    category: str = "general",
    tags: list[str] | None = None,
    required_permission: str = "execute",
    timeout: float = 30.0,
    parameters: dict[str, dict[str, Any]] | None = None,
    auto_register: bool = True,
):
    """Decorator to convert a function into a tool.

    Args:
        name: Tool name (defaults to function name)
        description: Tool description (defaults to function docstring)
        category: Tool category for organization
        tags: List of tags for searchability
        required_permission: Required permission level
        timeout: Default timeout in seconds
        parameters: Parameter definitions (auto-detected if not provided)
        auto_register: Whether to automatically register the tool

    Example:
        @tool(
            name="list_files",
            description="List files in a directory",
            category="filesystem",
            tags=["files", "directory"],
            parameters={
                "path": {
                    "type": "string",
                    "description": "Directory path",
                    "required": True
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum files to return",
                    "default": 100,
                    "min_value": 1,
                    "max_value": 1000
                }
            }
        )
        async def list_files_tool(path: str, limit: int = 100) -> dict:
            # Implementation
            return {"files": [], "count": 0}

    """

    def decorator(func: Callable) -> "FunctionTool":
        # Get function metadata
        func_name = name or func.__name__
        func_description = (
            description or (func.__doc__ or "").strip() or f"Execute {func_name}"
        )
        func_tags = tags or []

        # Auto-detect parameters if not provided
        if parameters is None:
            detected_params = _detect_function_parameters(func)
        else:
            detected_params = _convert_parameter_definitions(parameters)

        # Check if function is async
        is_async = asyncio.iscoroutinefunction(func)

        # Create tool class
        tool_instance = FunctionTool(
            func=func,
            tool_name=func_name,
            tool_description=func_description,
            tool_category=category,
            tool_tags=func_tags,
            tool_parameters=detected_params,
            tool_required_permission=required_permission,
            tool_timeout=timeout,
            is_async=is_async,
        )

        # Auto-register if requested
        if auto_register:
            register_tool(tool_instance)

        # Return the tool instance (can also be called as original function)
        return tool_instance

    return decorator


def requires_permission(permission: str):
    """Decorator to set permission requirements for a tool function.

    Args:
        permission: Required permission level

    Example:
        @tool(name="delete_file")
        @requires_permission("admin")
        async def delete_file_tool(path: str) -> dict:
            # Implementation
            return {"deleted": True}

    """

    def decorator(func_or_tool):
        if isinstance(func_or_tool, FunctionTool):
            func_or_tool._required_permission = permission
            return func_or_tool
        # Store permission requirement for later use by @tool decorator
        func_or_tool._tool_required_permission = permission
        return func_or_tool

    return decorator


class FunctionTool(BaseTool):
    """Tool implementation that wraps a regular function.

    This class allows regular functions to be used as tools with proper
    parameter validation and execution handling.
    """

    def __init__(
        self,
        func: Callable,
        tool_name: str,
        tool_description: str,
        tool_category: str = "general",
        tool_tags: list[str] | None = None,
        tool_parameters: list[ToolParameter] | None = None,
        tool_required_permission: str = "execute",
        tool_timeout: float = 30.0,
        is_async: bool = False,
    ):
        super().__init__()
        self._func = func
        self._name = tool_name
        self._description = tool_description
        self._category = tool_category
        self._tags = tool_tags or []
        self._parameters = tool_parameters or []
        self._required_permission = tool_required_permission
        self._timeout = tool_timeout
        self._is_async = is_async

    @property
    def name(self) -> str:
        return self._name

    @property
    def description(self) -> str:
        return self._description

    @property
    def parameters(self) -> list[ToolParameter]:
        return self._parameters

    @property
    def category(self) -> str:
        return self._category

    @property
    def tags(self) -> list[str]:
        return self._tags

    @property
    def required_permission(self) -> str:
        return self._required_permission

    @property
    def timeout(self) -> float:
        return self._timeout

    async def execute(self, context: ToolExecutionContext, **params) -> ToolResult:
        """Execute the wrapped function."""
        try:
            if self._is_async:
                # Execute async function directly
                result = await self._func(**params)
            else:
                # Execute sync function in thread pool
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(None, lambda: self._func(**params))

            return ToolResult.success_result(result)

        except Exception as e:
            return ToolResult.error_result(f"Function execution failed: {e!s}")

    def __call__(self, *args, **kwargs):
        """Allow the tool to be called as a regular function."""
        return self._func(*args, **kwargs)


def _detect_function_parameters(func: Callable) -> list[ToolParameter]:
    """Auto-detect parameters from a function signature.

    Args:
        func: Function to analyze

    Returns:
        List of detected tool parameters

    """
    signature = inspect.signature(func)
    type_hints = get_type_hints(func)
    parameters = []

    for param_name, param in signature.parameters.items():
        # Skip context parameter if present
        if param_name == "context" and param.annotation == ToolExecutionContext:
            continue

        # Get parameter type
        param_type = _python_type_to_parameter_type(
            type_hints.get(param_name, param.annotation),
        )

        # Check if parameter is required
        has_default = param.default != inspect.Parameter.empty
        default_value = param.default if has_default else None

        # Create parameter definition
        tool_param = ToolParameter(
            name=param_name,
            type=param_type,
            description=f"Parameter {param_name}",
            required=not has_default,
            default=default_value,
        )

        parameters.append(tool_param)

    return parameters


def _convert_parameter_definitions(
    param_defs: dict[str, dict[str, Any]],
) -> list[ToolParameter]:
    """Convert parameter definitions from dict format to ToolParameter objects.

    Args:
        param_defs: Parameter definitions dictionary

    Returns:
        List of ToolParameter objects

    """
    parameters = []

    for param_name, param_def in param_defs.items():
        # Get parameter type
        type_str = param_def.get("type", "string")
        param_type = ParameterType(type_str.lower())

        # Create parameter
        tool_param = ToolParameter(
            name=param_name,
            type=param_type,
            description=param_def.get("description", f"Parameter {param_name}"),
            required=param_def.get("required", True),
            default=param_def.get("default"),
            min_value=param_def.get("min_value"),
            max_value=param_def.get("max_value"),
            min_length=param_def.get("min_length"),
            max_length=param_def.get("max_length"),
            choices=param_def.get("choices"),
            pattern=param_def.get("pattern"),
        )

        parameters.append(tool_param)

    return parameters


def _python_type_to_parameter_type(python_type) -> ParameterType:
    """Convert Python type annotation to ParameterType.

    Args:
        python_type: Python type annotation

    Returns:
        Corresponding ParameterType

    """
    if python_type == str:
        return ParameterType.STRING
    if python_type == int:
        return ParameterType.INTEGER
    if python_type == float:
        return ParameterType.FLOAT
    if python_type == bool:
        return ParameterType.BOOLEAN
    if python_type == list:
        return ParameterType.ARRAY
    if python_type == dict:
        return ParameterType.OBJECT
    # Default to string for unknown types
    return ParameterType.STRING


# Convenience functions for common tool patterns


def simple_tool(func: Callable) -> FunctionTool:
    """Simple decorator that converts a function to a tool with minimal configuration.

    Args:
        func: Function to convert

    Returns:
        FunctionTool instance

    Example:
        @simple_tool
        def get_current_time() -> str:
            return datetime.now().isoformat()

    """
    return tool()(func)


def admin_tool(func: Callable) -> FunctionTool:
    """Decorator for tools that require admin permission.

    Args:
        func: Function to convert

    Returns:
        FunctionTool instance with admin permission requirement

    Example:
        @admin_tool
        def delete_all_files() -> dict:
            # Implementation
            return {"deleted_count": 100}

    """
    return tool(required_permission="admin")(func)


def read_only_tool(func: Callable) -> FunctionTool:
    """Decorator for tools that only require read permission.

    Args:
        func: Function to convert

    Returns:
        FunctionTool instance with read permission requirement

    Example:
        @read_only_tool
        def list_files(path: str) -> dict:
            # Implementation
            return {"files": []}

    """
    return tool(required_permission="read")(func)
