#!/usr/bin/env python3
"""
Tool Configuration System
=========================

Manages tool enable/disable states and configuration for the MCP server.
Follows the 140-line axiom and modular architecture principles.
"""

import json
import os
import time
from dataclasses import asdict, dataclass
from enum import Enum
from typing import Any

from utils.logging_config import setup_logging

logger = setup_logging()


class ToolCategory(Enum):
    """Tool category enumeration."""

    AGENT = "agent"
    CHARACTER = "character"
    ECS = "ecs"
    SOCIAL = "social"
    LINTING = "linting"
    FORMATTING = "formatting"
    SEARCH = "search"
    VISUALIZATION = "visualization"
    SECURITY = "security"
    UTILITY = "utility"
    VERSION = "version"
    VSCODE = "vscode"
    PLAYWRIGHT = "playwright"
    MONOLITH = "monolith"


@dataclass
class ToolConfig:
    """Individual tool configuration."""

    name: str
    category: ToolCategory
    enabled: bool = True
    description: str = ""
    dependencies: list[str] | None = None
    config: dict[str, Any] | None = None

    def __post_init__(self) -> None:
        if self.dependencies is None:
            object.__setattr__(self, "dependencies", [])
        if self.config is None:
            object.__setattr__(self, "config", {})


@dataclass
class ToolConfiguration:
    """Complete tool configuration system."""

    tools: dict[str, ToolConfig]
    version: str = "1.0.0"
    last_updated: str = ""

    def get_enabled_tools(self) -> set[str]:
        """Get set of enabled tool names."""
        return {name for name, config in self.tools.items() if config.enabled}

    def get_tools_by_category(self, category: ToolCategory) -> dict[str, ToolConfig]:
        """Get tools filtered by category."""
        return {
            name: config
            for name, config in self.tools.items()
            if config.category == category
        }

    def enable_tool(self, tool_name: str) -> bool:
        """Enable a tool."""
        if tool_name in self.tools:
            self.tools[tool_name].enabled = True
            return True
        return False

    def disable_tool(self, tool_name: str) -> bool:
        """Disable a tool."""
        if tool_name in self.tools:
            self.tools[tool_name].enabled = False
            return True
        return False

    def toggle_tool(self, tool_name: str) -> bool:
        """Toggle a tool's enabled state."""
        if tool_name in self.tools:
            self.tools[tool_name].enabled = not self.tools[tool_name].enabled
            return self.tools[tool_name].enabled
        return False


class ToolConfigManager:
    """Deprecated JSON config manager (kept for compatibility; no-op)."""

    def __init__(self, config_path: str = "tool_config.json"):
        logger.debug("ToolConfigManager is deprecated; using PostgreSQL backend.")
        self.config_path = config_path
        self._config: ToolConfiguration | None = None

    def load_config(self) -> ToolConfiguration:
        """Return an empty configuration; PostgreSQL is the source of truth."""
        if self._config is None:
            self._config = ToolConfiguration(tools={}, version="1.0.0", last_updated="")
        return self._config

    def save_config(self) -> bool:
        """No-op; configuration is stored in PostgreSQL."""
            return True

    def _create_default_config(self) -> ToolConfiguration:
        """Return an empty default; PostgreSQL holds defaults."""
        return ToolConfiguration(tools={}, version="1.0.0", last_updated="")
