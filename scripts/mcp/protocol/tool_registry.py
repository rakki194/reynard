#!/usr/bin/env python3
"""
Tool Registry
=============

Centralized registry for MCP tool routing with dynamic loading support.
Follows the 140-line axiom and modular architecture principles.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Any, Awaitable, Callable, Dict, Set, Union

from config.tool_config import ToolConfigManager, ToolCategory


class ToolExecutionType(Enum):
    """Tool execution type enumeration."""

    SYNC = "sync"
    ASYNC = "async"


@dataclass
class ToolHandler:
    """Tool handler configuration."""

    tool_name: str
    handler_method: Callable[..., dict[str | Any, Awaitable[Dict[str, Any]]]]
    execution_type: ToolExecutionType
    tool_category: str
    enabled: bool = True


class ToolRegistry:
    """Centralized tool registry for routing with dynamic loading."""

    def __init__(self, config_manager: ToolConfigManager = None) -> None:
        self._handlers: dict[str, ToolHandler] = {}
        self._category_tools: dict[str, set[str]] = {}
        self._config_manager = config_manager or ToolConfigManager()
        self._config = self._config_manager.load_config()

    def register_tool(
        self,
        tool_name: str,
        handler_method: Callable[..., dict[str | Any, Awaitable[Dict[str, Any]]]],
        execution_type: ToolExecutionType,
        tool_category: str,
    ) -> None:
        """Register a tool handler."""
        # Check if tool is enabled in configuration
        enabled = True
        if tool_name in self._config.tools:
            enabled = self._config.tools[tool_name].enabled
        
        handler = ToolHandler(
            tool_name=tool_name,
            handler_method=handler_method,
            execution_type=execution_type,
            tool_category=tool_category,
            enabled=enabled,
        )

        self._handlers[tool_name] = handler

        if tool_category not in self._category_tools:
            self._category_tools[tool_category] = set()
        self._category_tools[tool_category].add(tool_name)

    def get_handler(self, tool_name: str) -> ToolHandler:
        """Get handler for a tool."""
        if tool_name not in self._handlers:
            raise ValueError(f"Unknown tool: {tool_name}")
        
        handler = self._handlers[tool_name]
        if not handler.enabled:
            raise ValueError(f"Tool {tool_name} is disabled")
        
        return handler

    def get_tools_by_category(self, category: str) -> set[str]:
        """Get all tools in a category."""
        return self._category_tools.get(category, set())

    def get_enabled_tools_by_category(self, category: str) -> set[str]:
        """Get enabled tools in a category."""
        all_tools = self._category_tools.get(category, set())
        return {tool for tool in all_tools if self._handlers.get(tool, {}).enabled}

    def list_all_tools(self) -> set[str]:
        """List all registered tools."""
        return set(self._handlers.keys())

    def list_enabled_tools(self) -> set[str]:
        """List all enabled tools."""
        return {name for name, handler in self._handlers.items() if handler.enabled}

    def is_tool_registered(self, tool_name: str) -> bool:
        """Check if a tool is registered."""
        return tool_name in self._handlers

    def is_tool_enabled(self, tool_name: str) -> bool:
        """Check if a tool is enabled."""
        return (tool_name in self._handlers and 
                self._handlers[tool_name].enabled)

    def enable_tool(self, tool_name: str) -> bool:
        """Enable a tool."""
        if tool_name in self._handlers:
            self._handlers[tool_name].enabled = True
            self._config.enable_tool(tool_name)
            self._config_manager.save_config()
            return True
        return False

    def disable_tool(self, tool_name: str) -> bool:
        """Disable a tool."""
        if tool_name in self._handlers:
            self._handlers[tool_name].enabled = False
            self._config.disable_tool(tool_name)
            self._config_manager.save_config()
            return True
        return False

    def toggle_tool(self, tool_name: str) -> bool:
        """Toggle a tool's enabled state."""
        if tool_name in self._handlers:
            new_state = not self._handlers[tool_name].enabled
            self._handlers[tool_name].enabled = new_state
            if new_state:
                self._config.enable_tool(tool_name)
            else:
                self._config.disable_tool(tool_name)
            self._config_manager.save_config()
            return new_state
        return False

    def get_tool_config(self, tool_name: str) -> dict[str, Any]:
        """Get configuration for a tool."""
        if tool_name in self._config.tools:
            tool_config = self._config.tools[tool_name]
            return {
                "name": tool_config.name,
                "category": tool_config.category.value,
                "enabled": tool_config.enabled,
                "description": tool_config.description,
                "dependencies": tool_config.dependencies,
                "config": tool_config.config,
            }
        return {}

    def get_all_tool_configs(self) -> dict[str, Dict[str, Any]]:
        """Get all tool configurations."""
        return {name: self.get_tool_config(name) for name in self._handlers.keys()}

    def reload_config(self) -> None:
        """Reload configuration from file."""
        self._config = self._config_manager.load_config()
        # Update handler enabled states
        for tool_name, handler in self._handlers.items():
            if tool_name in self._config.tools:
                handler.enabled = self._config.tools[tool_name].enabled
