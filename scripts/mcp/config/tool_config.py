#!/usr/bin/env python3
"""
Tool Configuration System
=========================

Manages tool enable/disable states and configuration for the MCP server.
Follows the 140-line axiom and modular architecture principles.
"""

import json
import os
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
    dependencies: list[str] = None
    config: dict[str, Any] = None

    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = []
        if self.config is None:
            self.config = {}


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
    """Manages tool configuration persistence and loading."""

    def __init__(self, config_path: str = "tool_config.json"):
        self.config_path = config_path
        self._config: ToolConfiguration | None = None

    def load_config(self) -> ToolConfiguration:
        """Load configuration from file or create default."""
        if self._config is not None:
            return self._config

        if os.path.exists(self.config_path):
            try:
                with open(self.config_path) as f:
                    data = json.load(f)

                # Convert tools dict back to ToolConfig objects
                tools = {}
                for name, tool_data in data.get("tools", {}).items():
                    tools[name] = ToolConfig(
                        name=name,
                        category=ToolCategory(tool_data["category"]),
                        enabled=tool_data.get("enabled", True),
                        description=tool_data.get("description", ""),
                        dependencies=tool_data.get("dependencies", []),
                        config=tool_data.get("config", {}),
                    )

                self._config = ToolConfiguration(
                    tools=tools,
                    version=data.get("version", "1.0.0"),
                    last_updated=data.get("last_updated", ""),
                )

                logger.info(f"Loaded tool configuration with {len(tools)} tools")
                return self._config

            except Exception as e:
                logger.warning(f"Failed to load config from {self.config_path}: {e}")

        # Create default configuration
        self._config = self._create_default_config()
        self.save_config()
        return self._config

    def save_config(self) -> bool:
        """Save current configuration to file."""
        if self._config is None:
            return False

        try:
            # Convert to serializable format
            data = {
                "version": self._config.version,
                "last_updated": self._config.last_updated,
                "tools": {},
            }

            for name, tool_config in self._config.tools.items():
                data["tools"][name] = asdict(tool_config)
                data["tools"][name]["category"] = tool_config.category.value

            with open(self.config_path, "w") as f:
                json.dump(data, f, indent=2)

            logger.info(f"Saved tool configuration to {self.config_path}")
            return True

        except Exception as e:
            logger.error(f"Failed to save config to {self.config_path}: {e}")
            return False

    def _create_default_config(self) -> ToolConfiguration:
        """Create default tool configuration."""
        tools = {
            # Agent Tools
            "generate_agent_name": ToolConfig(
                name="generate_agent_name",
                category=ToolCategory.AGENT,
                description="Generate robot names with animal spirit themes",
            ),
            "assign_agent_name": ToolConfig(
                name="assign_agent_name",
                category=ToolCategory.AGENT,
                description="Assign names to agents with persistence",
            ),
            "get_agent_name": ToolConfig(
                name="get_agent_name",
                category=ToolCategory.AGENT,
                description="Retrieve current agent names",
            ),
            "list_agent_names": ToolConfig(
                name="list_agent_names",
                category=ToolCategory.AGENT,
                description="List all assigned agent names",
            ),
            "roll_agent_spirit": ToolConfig(
                name="roll_agent_spirit",
                category=ToolCategory.AGENT,
                description="Randomly select animal spirits",
            ),
            "get_spirit_emoji": ToolConfig(
                name="get_spirit_emoji",
                category=ToolCategory.AGENT,
                description="Get emoji for animal spirit types",
            ),
            "agent_startup_sequence": ToolConfig(
                name="agent_startup_sequence",
                category=ToolCategory.AGENT,
                description="Complete initialization with ECS integration",
            ),
            "get_agent_persona": ToolConfig(
                name="get_agent_persona",
                category=ToolCategory.AGENT,
                description="Get comprehensive agent persona from ECS system",
            ),
            "get_lora_config": ToolConfig(
                name="get_lora_config",
                category=ToolCategory.AGENT,
                description="Get LoRA configuration for agent persona",
            ),
            # Character Tools
            "create_character": ToolConfig(
                name="create_character",
                category=ToolCategory.CHARACTER,
                description="Create a new character with detailed customization",
            ),
            "get_character": ToolConfig(
                name="get_character",
                category=ToolCategory.CHARACTER,
                description="Get detailed character information by ID",
            ),
            "list_characters": ToolConfig(
                name="list_characters",
                category=ToolCategory.CHARACTER,
                description="List all characters with optional filtering",
            ),
            "search_characters": ToolConfig(
                name="search_characters",
                category=ToolCategory.CHARACTER,
                description="Search characters by name, description, or tags",
            ),
            "update_character": ToolConfig(
                name="update_character",
                category=ToolCategory.CHARACTER,
                description="Update character information",
            ),
            "delete_character": ToolConfig(
                name="delete_character",
                category=ToolCategory.CHARACTER,
                description="Delete a character by ID",
            ),
            "get_character_types": ToolConfig(
                name="get_character_types",
                category=ToolCategory.CHARACTER,
                description="Get available character types",
            ),
            "get_personality_traits": ToolConfig(
                name="get_personality_traits",
                category=ToolCategory.CHARACTER,
                description="Get available personality traits",
            ),
            "get_ability_traits": ToolConfig(
                name="get_ability_traits",
                category=ToolCategory.CHARACTER,
                description="Get available ability traits",
            ),
            "get_current_time": ToolConfig(
                name="get_current_time",
                category=ToolCategory.UTILITY,
                description="Get current date and time with timezone support",
            ),
            "get_current_location": ToolConfig(
                name="get_current_location",
                category=ToolCategory.UTILITY,
                description="Get location based on IP address",
            ),
            "send_desktop_notification": ToolConfig(
                name="send_desktop_notification",
                category=ToolCategory.UTILITY,
                description="Send desktop notifications using libnotify",
            ),
            "restart_mcp_server": ToolConfig(
                name="restart_mcp_server",
                category=ToolCategory.UTILITY,
                description="Restart the MCP server with different methods",
            ),
            # ECS Tools
            "create_ecs_agent": ToolConfig(
                name="create_ecs_agent",
                category=ToolCategory.ECS,
                description="Create a new agent using the ECS system",
            ),
            "create_ecs_offspring": ToolConfig(
                name="create_ecs_offspring",
                category=ToolCategory.ECS,
                description="Create offspring agent from two parent agents using ECS",
            ),
            "get_ecs_agent_status": ToolConfig(
                name="get_ecs_agent_status",
                category=ToolCategory.ECS,
                description="Get status of all agents in the ECS system",
            ),
            "get_ecs_agent_positions": ToolConfig(
                name="get_ecs_agent_positions",
                category=ToolCategory.ECS,
                description="Get positions of all agents in the ECS system",
            ),
            "get_simulation_status": ToolConfig(
                name="get_simulation_status",
                category=ToolCategory.ECS,
                description="Get comprehensive ECS world simulation status",
            ),
            "accelerate_time": ToolConfig(
                name="accelerate_time",
                category=ToolCategory.ECS,
                description="Adjust time acceleration factor for world simulation",
            ),
            "nudge_time": ToolConfig(
                name="nudge_time",
                category=ToolCategory.ECS,
                description="Nudge simulation time forward (for MCP actions)",
            ),
            # Linting Tools
            "lint_frontend": ToolConfig(
                name="lint_frontend",
                category=ToolCategory.LINTING,
                description="ESLint for TypeScript/JavaScript (with auto-fix)",
            ),
            "lint_python": ToolConfig(
                name="lint_python",
                category=ToolCategory.LINTING,
                description="Flake8, Pylint for Python (with auto-fix)",
            ),
            "lint_markdown": ToolConfig(
                name="lint_markdown",
                category=ToolCategory.LINTING,
                description="markdownlint validation (with auto-fix)",
            ),
            "run_all_linting": ToolConfig(
                name="run_all_linting",
                category=ToolCategory.LINTING,
                description="Execute entire linting suite (with auto-fix)",
            ),
            # Formatting Tools
            "format_frontend": ToolConfig(
                name="format_frontend",
                category=ToolCategory.FORMATTING,
                description="Prettier formatting (with check-only mode)",
            ),
            "format_python": ToolConfig(
                name="format_python",
                category=ToolCategory.FORMATTING,
                description="Black + isort formatting (with check-only mode)",
            ),
            # Search Tools
            "search_files": ToolConfig(
                name="search_files",
                category=ToolCategory.SEARCH,
                description="Search for files by name pattern in the project",
            ),
            "semantic_search": ToolConfig(
                name="semantic_search",
                category=ToolCategory.SEARCH,
                description="Perform semantic search using vector embeddings",
            ),
            "search_enhanced": ToolConfig(
                name="search_enhanced",
                category=ToolCategory.SEARCH,
                description="Enhanced BM25 search with query expansion",
            ),
            # Visualization Tools
            "validate_mermaid_diagram": ToolConfig(
                name="validate_mermaid_diagram",
                category=ToolCategory.VISUALIZATION,
                description="Validate mermaid diagram syntax and check for errors",
            ),
            "render_mermaid_to_svg": ToolConfig(
                name="render_mermaid_to_svg",
                category=ToolCategory.VISUALIZATION,
                description="Render mermaid diagram to SVG format",
            ),
            "open_image": ToolConfig(
                name="open_image",
                category=ToolCategory.VISUALIZATION,
                description="Open an image file with the imv image viewer",
            ),
            # Security Tools
            "scan_security": ToolConfig(
                name="scan_security",
                category=ToolCategory.SECURITY,
                description="Complete security audit (Bandit, audit-ci, type checking)",
            ),
            "scan_security_fast": ToolConfig(
                name="scan_security_fast",
                category=ToolCategory.SECURITY,
                description="Run fast security scanning (skips slow Bandit checks)",
            ),
            # Version Tools
            "get_versions": ToolConfig(
                name="get_versions",
                category=ToolCategory.VERSION,
                description="Get versions of Python, Node.js, npm, pnpm, and TypeScript",
            ),
            "get_python_version": ToolConfig(
                name="get_python_version",
                category=ToolCategory.VERSION,
                description="Get Python version information",
            ),
            # VS Code Tools
            "get_vscode_active_file": ToolConfig(
                name="get_vscode_active_file",
                category=ToolCategory.VSCODE,
                description="Get currently active file path in VS Code",
            ),
            "discover_vscode_tasks": ToolConfig(
                name="discover_vscode_tasks",
                category=ToolCategory.VSCODE,
                description="Discover all available VS Code tasks from tasks.json",
            ),
            # Playwright Tools
            "playwright_screenshot": ToolConfig(
                name="playwright_screenshot",
                category=ToolCategory.PLAYWRIGHT,
                description="Take screenshots using Playwright browser automation",
            ),
            "playwright_navigate": ToolConfig(
                name="playwright_navigate",
                category=ToolCategory.PLAYWRIGHT,
                description="Navigate to URLs and interact with web pages",
            ),
            # Monolith Detection Tools
            "detect_monoliths": ToolConfig(
                name="detect_monoliths",
                category=ToolCategory.MONOLITH,
                description="Detect large monolithic files that violate the 140-line axiom",
            ),
            "analyze_file_complexity": ToolConfig(
                name="analyze_file_complexity",
                category=ToolCategory.MONOLITH,
                description="Deep-dive analysis of a specific file's complexity metrics",
            ),
        }

        return ToolConfiguration(tools=tools, version="1.0.0", last_updated="")
