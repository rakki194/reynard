"""
Base classes and data models for the tool calling system.

This module defines the core abstractions that all tools must implement,
along with supporting data structures for parameters, results, and execution context.
"""

import asyncio
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
import os
from enum import Enum
from typing import Any, Dict, List, Optional, Union

logger = logging.getLogger("uvicorn")


class ParameterType(Enum):
    """Supported parameter types for tool parameters."""

    STRING = "string"
    INTEGER = "integer"
    FLOAT = "float"
    BOOLEAN = "boolean"
    ARRAY = "array"
    OBJECT = "object"


@dataclass
class ToolParameter:
    """
    Definition of a tool parameter with validation rules.

    Attributes:
        name: Parameter name
        type: Parameter type (from ParameterType enum)
        description: Human-readable description
        required: Whether the parameter is required
        default: Default value if not provided
        min_value: Minimum value for numeric types
        max_value: Maximum value for numeric types
        min_length: Minimum length for string/array types
        max_length: Maximum length for string/array types
        choices: List of allowed values
        pattern: Regex pattern for string validation
    """

    name: str
    type: ParameterType
    description: str
    required: bool = True
    default: Any = None
    min_value: Optional[Union[int, float]] = None
    max_value: Optional[Union[int, float]] = None
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    choices: Optional[List[Any]] = None
    pattern: Optional[str] = None

    def __post_init__(self):
        """Validate parameter definition."""
        if not self.required and self.default is None:
            raise ValueError(
                f"Optional parameter '{self.name}' must have a default value"
            )

    def validate(self, value: Any) -> tuple[bool, Optional[str]]:
        """
        Validate a parameter value against this parameter definition.

        Args:
            value: Value to validate

        Returns:
            Tuple of (is_valid, error_message)
        """
        if value is None:
            if self.required:
                return False, f"Parameter '{self.name}' is required"
            return True, None

        # Type validation
        if self.type == ParameterType.STRING and not isinstance(value, str):
            return False, f"Parameter '{self.name}' must be a string"
        elif self.type == ParameterType.INTEGER and not isinstance(value, int):
            return False, f"Parameter '{self.name}' must be an integer"
        elif self.type == ParameterType.FLOAT and not isinstance(value, (int, float)):
            return False, f"Parameter '{self.name}' must be a number"
        elif self.type == ParameterType.BOOLEAN and not isinstance(value, bool):
            return False, f"Parameter '{self.name}' must be a boolean"
        elif self.type == ParameterType.ARRAY and not isinstance(value, list):
            return False, f"Parameter '{self.name}' must be an array"
        elif self.type == ParameterType.OBJECT and not isinstance(value, dict):
            return False, f"Parameter '{self.name}' must be an object"

        # Range validation for numeric types
        if self.type in (ParameterType.INTEGER, ParameterType.FLOAT):
            if self.min_value is not None and value < self.min_value:
                return False, f"Parameter '{self.name}' must be >= {self.min_value}"
            if self.max_value is not None and value > self.max_value:
                return False, f"Parameter '{self.name}' must be <= {self.max_value}"

        # Length validation for string and array types
        if self.type in (ParameterType.STRING, ParameterType.ARRAY):
            length = len(value)
            if self.min_length is not None and length < self.min_length:
                return (
                    False,
                    f"Parameter '{self.name}' must have length >= {self.min_length}",
                )
            if self.max_length is not None and length > self.max_length:
                return (
                    False,
                    f"Parameter '{self.name}' must have length <= {self.max_length}",
                )

        # Choices validation
        if self.choices is not None and value not in self.choices:
            return False, f"Parameter '{self.name}' must be one of: {self.choices}"

        # Pattern validation for strings
        if self.type == ParameterType.STRING and self.pattern is not None:
            import re

            if not re.match(self.pattern, value):
                return False, f"Parameter '{self.name}' does not match required pattern"

        return True, None


@dataclass
class ToolResult:
    """
    Result of a tool execution.

    Attributes:
        success: Whether the tool executed successfully
        data: Tool output data
        error: Error message if execution failed
        metadata: Additional metadata about the execution
        execution_time: Time taken to execute in seconds
    """

    success: bool
    data: Any = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    execution_time: Optional[float] = None

    @classmethod
    def success_result(
        cls,
        data: Any,
        metadata: Optional[Dict[str, Any]] = None,
        execution_time: Optional[float] = None,
    ) -> "ToolResult":
        """Create a successful result."""
        return cls(
            success=True,
            data=data,
            metadata=metadata or {},
            execution_time=execution_time,
        )

    @classmethod
    def error_result(
        cls,
        error: str,
        metadata: Optional[Dict[str, Any]] = None,
        execution_time: Optional[float] = None,
    ) -> "ToolResult":
        """Create an error result."""
        return cls(
            success=False,
            error=error,
            metadata=metadata or {},
            execution_time=execution_time,
        )

    def to_dict(self) -> Dict[str, Any]:
        """Convert result to dictionary for API responses."""
        result = {"success": self.success, "metadata": self.metadata}

        if self.success:
            result["data"] = self.data
        else:
            result["error"] = self.error

        if self.execution_time is not None:
            result["execution_time"] = self.execution_time

        return result


@dataclass
class ToolExecutionContext:
    """
    Context information passed to tools during execution.

    Attributes:
        user_id: ID of the user executing the tool
        user_role: Role of the user (admin, user, guest)
        session_id: Session ID for tracking
        request_id: Unique request ID
        working_directory: Current working directory
        environment: Environment variables
        timeout: Execution timeout in seconds
        dry_run: Whether this is a dry run (don't actually execute)
    """

    user_id: str
    user_role: str = "user"
    session_id: Optional[str] = None
    request_id: Optional[str] = None
    working_directory: Optional[str] = None
    environment: Dict[str, str] = field(default_factory=dict)
    timeout: float = 30.0
    dry_run: bool = False

    def has_permission(self, required_permission: str) -> bool:
        """Check if user has required permission."""
        # Define permission hierarchy
        permission_hierarchy = {
            "guest": ["read"],
            "user": ["read", "write", "execute"],
            "admin": ["read", "write", "execute", "admin"],
        }

        user_permissions = permission_hierarchy.get(self.user_role, [])
        return required_permission in user_permissions


class BaseTool(ABC):
    """
    Abstract base class for all tools.

    All tools must inherit from this class and implement the required methods.
    Tools can be either synchronous or asynchronous.
    """

    def __init__(self):
        self._name: Optional[str] = None
        self._description: Optional[str] = None
        self._parameters: List[ToolParameter] = []
        self._required_permission: str = "execute"
        self._category: str = "general"
        self._tags: List[str] = []
        self._timeout: float = 30.0

    @property
    @abstractmethod
    def name(self) -> str:
        """Tool name (must be unique)."""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """Tool description for the assistant."""
        pass

    @property
    @abstractmethod
    def parameters(self) -> List[ToolParameter]:
        """List of tool parameters."""
        pass

    @property
    def required_permission(self) -> str:
        """Required permission to execute this tool."""
        return self._required_permission

    @property
    def category(self) -> str:
        """Tool category for organization."""
        return self._category

    @property
    def tags(self) -> List[str]:
        """Tool tags for searchability."""
        return self._tags

    @property
    def timeout(self) -> float:
        """Default timeout for tool execution."""
        return self._timeout

    def validate_parameters(self, params: Dict[str, Any]) -> Dict[str, str]:
        """
        Validate tool parameters.

        Args:
            params: Parameters to validate

        Returns:
            Dictionary of validation errors (empty if valid)
        """
        errors = {}

        # Get parameter definitions by name
        param_defs = {p.name: p for p in self.parameters}

        # Check required parameters
        for param_def in self.parameters:
            if param_def.required and param_def.name not in params:
                errors[param_def.name] = "Required parameter missing"

        # Validate provided parameters
        for param_name, param_value in params.items():
            if param_name in param_defs:
                is_valid, error_msg = param_defs[param_name].validate(param_value)
                if not is_valid:
                    errors[param_name] = error_msg
            else:
                errors[param_name] = "Unknown parameter"

        # Additional safety validation for potential path parameters
        try:
            from app.utils.common_utils import (
                resolve_path,
            )  # Local import to avoid cycles

            path_like_names = {
                "path",
                "dataset_path",
                "directory",
                "target_path",
                "source_path",
                "destination_path",
                "file_path",
            }
            root_env = os.getenv("ROOT_DIR")
            root_dir = (
                Path(os.path.expanduser(os.path.expandvars(root_env))).resolve()
                if root_env
                else Path.cwd().resolve()
            )

            for param_name, param_value in params.items():
                if param_name.lower() in path_like_names and isinstance(
                    param_value, str
                ):
                    try:
                        # Attempt to resolve path; will raise if outside ROOT_DIR
                        _ = resolve_path(param_value, root_dir)
                    except Exception:
                        errors[param_name] = "Invalid or unsafe path"
        except Exception:
            # If path safety checks fail to initialize, don't block validation entirely
            pass

        return errors

    def prepare_parameters(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Prepare parameters by adding defaults for missing optional parameters.

        Args:
            params: Input parameters

        Returns:
            Parameters with defaults applied
        """
        result = params.copy()

        for param_def in self.parameters:
            if param_def.name not in result and not param_def.required:
                result[param_def.name] = param_def.default

        return result

    @abstractmethod
    async def execute(self, context: ToolExecutionContext, **params) -> ToolResult:
        """
        Execute the tool with given parameters.

        Args:
            context: Execution context
            **params: Tool parameters

        Returns:
            Tool execution result
        """
        pass

    async def execute_with_timeout(
        self, context: ToolExecutionContext, **params
    ) -> ToolResult:
        """
        Execute tool with timeout handling.

        Args:
            context: Execution context
            **params: Tool parameters

        Returns:
            Tool execution result
        """
        timeout = context.timeout if context.timeout > 0 else self.timeout

        try:
            return await asyncio.wait_for(
                self.execute(context, **params), timeout=timeout
            )
        except asyncio.TimeoutError:
            from .exceptions import ToolTimeoutError

            raise ToolTimeoutError(self.name, timeout)

    def to_dict(self) -> Dict[str, Any]:
        """Convert tool definition to dictionary for API responses."""
        return {
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "tags": self.tags,
            "required_permission": self.required_permission,
            "timeout": self.timeout,
            "parameters": [
                {
                    "name": p.name,
                    "type": p.type.value,
                    "description": p.description,
                    "required": p.required,
                    "default": p.default,
                    "min_value": p.min_value,
                    "max_value": p.max_value,
                    "min_length": p.min_length,
                    "max_length": p.max_length,
                    "choices": p.choices,
                    "pattern": p.pattern,
                }
                for p in self.parameters
            ],
        }
