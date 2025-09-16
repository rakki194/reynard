#!/usr/bin/env python3
"""
Tool Registry
=============

Centralized registry for MCP tool routing.
Follows the 100-line axiom and modular architecture principles.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Any, Awaitable, Callable, Dict, Set, Union


class ToolExecutionType(Enum):
    """Tool execution type enumeration."""

    SYNC = "sync"
    ASYNC = "async"


@dataclass
class ToolHandler:
    """Tool handler configuration."""

    tool_name: str
    handler_method: Callable[..., Union[Dict[str, Any], Awaitable[Dict[str, Any]]]]
    execution_type: ToolExecutionType
    tool_category: str


class ToolRegistry:
    """Centralized tool registry for routing."""

    def __init__(self) -> None:
        self._handlers: Dict[str, ToolHandler] = {}
        self._category_tools: Dict[str, Set[str]] = {}

    def register_tool(
        self,
        tool_name: str,
        handler_method: Callable[..., Union[Dict[str, Any], Awaitable[Dict[str, Any]]]],
        execution_type: ToolExecutionType,
        tool_category: str,
    ) -> None:
        """Register a tool handler."""
        handler = ToolHandler(
            tool_name=tool_name,
            handler_method=handler_method,
            execution_type=execution_type,
            tool_category=tool_category,
        )

        self._handlers[tool_name] = handler

        if tool_category not in self._category_tools:
            self._category_tools[tool_category] = set()
        self._category_tools[tool_category].add(tool_name)

    def get_handler(self, tool_name: str) -> ToolHandler:
        """Get handler for a tool."""
        if tool_name not in self._handlers:
            raise ValueError(f"Unknown tool: {tool_name}")
        return self._handlers[tool_name]

    def get_tools_by_category(self, category: str) -> Set[str]:
        """Get all tools in a category."""
        return self._category_tools.get(category, set())

    def list_all_tools(self) -> Set[str]:
        """List all registered tools."""
        return set(self._handlers.keys())

    def is_tool_registered(self, tool_name: str) -> bool:
        """Check if a tool is registered."""
        return tool_name in self._handlers
