#!/usr/bin/env python3
"""
Tool Handlers
=============

Specialized handlers for different tool categories.
Follows the 100-line axiom and modular architecture principles.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict


class BaseToolHandler(ABC):
    """Abstract base class for tool handlers."""

    @abstractmethod
    async def handle_tool(
        self, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Handle a tool call."""
        pass


class AgentToolHandler(BaseToolHandler):
    """Handler for agent-related tools."""

    def __init__(self, agent_tools: Any) -> None:
        self.agent_tools = agent_tools

    async def handle_tool(
        self, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Handle agent tool calls."""
        method_map = {
            "generate_agent_name": self.agent_tools.generate_agent_name,
            "assign_agent_name": self.agent_tools.assign_agent_name,
            "get_agent_name": self.agent_tools.get_agent_name,
            "list_agent_names": self.agent_tools.list_agent_names,
            "roll_agent_spirit": self.agent_tools.roll_agent_spirit,
            "agent_startup_sequence": self.agent_tools.agent_startup_sequence,
            "get_agent_persona": self.agent_tools.get_agent_persona,
            "get_lora_config": self.agent_tools.get_lora_config,
            "get_simulation_status": self.agent_tools.get_simulation_status,
            "accelerate_time": self.agent_tools.accelerate_time,
            "nudge_time": self.agent_tools.nudge_time,
        }

        if tool_name not in method_map:
            raise ValueError(f"Unknown agent tool: {tool_name}")

        method = method_map[tool_name]

        # Handle async vs sync methods
        if tool_name == "agent_startup_sequence":
            result = await method(arguments)
        else:
            result = method(arguments)
        return result


class ECSAgentToolHandler(BaseToolHandler):
    """Handler for ECS agent tools."""

    def __init__(self, ecs_agent_tools: Any) -> None:
        self.ecs_agent_tools = ecs_agent_tools

    def handle_tool(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        """Handle ECS agent tool calls."""
        method_map = {
            "create_ecs_agent": self.ecs_agent_tools.create_ecs_agent,
            "create_ecs_offspring": self.ecs_agent_tools.create_ecs_offspring,
            "enable_automatic_reproduction": self.ecs_agent_tools.enable_automatic_reproduction,
            "get_ecs_agent_status": self.ecs_agent_tools.get_ecs_agent_status,
            "get_ecs_agent_positions": self.ecs_agent_tools.get_ecs_agent_positions,
            "search_agents_by_proximity": self.ecs_agent_tools.search_agents_by_proximity,
            "search_agents_by_region": self.ecs_agent_tools.search_agents_by_region,
            "get_agent_movement_path": self.ecs_agent_tools.get_agent_movement_path,
            "get_spatial_analytics": self.ecs_agent_tools.get_spatial_analytics,
            "start_global_breeding": self.ecs_agent_tools.start_global_breeding,
            "stop_global_breeding": self.ecs_agent_tools.stop_global_breeding,
            "get_breeding_statistics": self.ecs_agent_tools.get_breeding_statistics,
            "find_ecs_compatible_mates": self.ecs_agent_tools.find_ecs_compatible_mates,
            "analyze_ecs_compatibility": self.ecs_agent_tools.analyze_ecs_compatibility,
            "get_ecs_lineage": self.ecs_agent_tools.get_ecs_lineage,
            "update_ecs_world": self.ecs_agent_tools.update_ecs_world,
        }

        if tool_name not in method_map:
            raise ValueError(f"Unknown ECS agent tool: {tool_name}")

        method = method_map[tool_name]
        result = method(arguments)
        return result


class UtilityToolHandler(BaseToolHandler):
    """Handler for utility tools."""

    def __init__(self, utility_tools: Any) -> None:
        self.utility_tools = utility_tools

    def handle_tool(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        """Handle utility tool calls."""
        method_map = {
            "get_current_time": self.utility_tools.get_current_time,
            "get_current_location": self.utility_tools.get_current_location,
            "send_desktop_notification": self.utility_tools.send_desktop_notification,
        }

        if tool_name not in method_map:
            raise ValueError(f"Unknown utility tool: {tool_name}")

        result = method_map[tool_name](arguments)
        return result


class LintingToolHandler(BaseToolHandler):
    """Handler for linting tools."""

    def __init__(self, linting_tools: Any) -> None:
        self.linting_tools = linting_tools

    async def handle_tool(
        self, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Handle linting tool calls."""
        method_map = {
            "lint_frontend": self.linting_tools.lint_frontend,
            "format_frontend": self.linting_tools.format_frontend,
            "lint_python": self.linting_tools.lint_python,
            "format_python": self.linting_tools.format_python,
            "lint_markdown": self.linting_tools.lint_markdown,
            "validate_comprehensive": self.linting_tools.validate_comprehensive,
            "scan_security": self.linting_tools.scan_security,
            "run_all_linting": self.linting_tools.run_all_linting,
        }

        if tool_name not in method_map:
            raise ValueError(f"Unknown linting tool: {tool_name}")

        result = await method_map[tool_name](arguments)
        return result


class MermaidToolHandler(BaseToolHandler):
    """Handler for mermaid diagram tools."""

    def __init__(self, mermaid_tools: Any) -> None:
        self.mermaid_tools = mermaid_tools

    def handle_tool(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        """Handle mermaid tool calls."""
        method_map = {
            "validate_mermaid_diagram": self.mermaid_tools.validate_mermaid_diagram,
            "render_mermaid_to_svg": self.mermaid_tools.render_mermaid_to_svg,
            "render_mermaid_to_png": self.mermaid_tools.render_mermaid_to_png,
            "get_mermaid_diagram_stats": self.mermaid_tools.get_mermaid_diagram_stats,
            "test_mermaid_render": self.mermaid_tools.test_mermaid_render,
        }

        if tool_name not in method_map:
            raise ValueError(f"Unknown mermaid tool: {tool_name}")

        result = method_map[tool_name](arguments)
        return result
