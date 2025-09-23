#!/usr/bin/env python3
"""
MCP Tool Definitions
====================

Defines all available MCP tools and their schemas.
Follows the 100-line axiom and modular architecture principles.
"""

from typing import Any


# Simple ToolDefinition class
class ToolDefinition:
    def __init__(self, name: str, description: str, parameters: dict[str, Any]):
        self.name = name
        self.description = description
        self.parameters = parameters

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "parameters": self.parameters,
        }


from .ecs_definitions import get_ecs_tool_definitions
from .image_viewer_definitions import get_image_viewer_tool_definitions
from .linting_definitions import get_linting_tool_definitions
from .mermaid_definitions import get_mermaid_tool_definitions
from .monolith_detection.definitions import get_monolith_detection_tool_definitions
from .playwright_definitions import get_playwright_tool_definitions

# Search tools now use @register_tool decorators, no separate definitions needed
from .secrets_definitions import get_secrets_tool_definitions
from .social_definitions import get_social_tool_definitions
from .version_vscode_definitions import get_version_vscode_tool_definitions
from .vscode_tasks_definitions import get_vscode_tasks_tool_definitions


def get_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get all MCP tool definitions."""
    # Import agent tools (if available)
    try:
        from .agent_management import get_agent_tool_definitions

        if get_agent_tool_definitions is not None:
            agent_tools = get_agent_tool_definitions()
        else:
            agent_tools = {}
    except ImportError:
        agent_tools = {}

    # Get all tool definitions
    linting_tools = get_linting_tool_definitions()
    version_vscode_tools = get_version_vscode_tool_definitions()
    # Search tools now use @register_tool decorators, no separate definitions needed
    image_viewer_tools = get_image_viewer_tool_definitions()
    mermaid_tools = get_mermaid_tool_definitions()
    monolith_detection_tools = get_monolith_detection_tool_definitions()
    playwright_tools = get_playwright_tool_definitions()
    secrets_tools = get_secrets_tool_definitions()
    social_tools = get_social_tool_definitions()
    vscode_tasks_tools = get_vscode_tasks_tool_definitions()
    ecs_tools = get_ecs_tool_definitions()

    # Return combined tool definitions
    return {
        **agent_tools,
        **linting_tools,
        **version_vscode_tools,
        **image_viewer_tools,
        **mermaid_tools,
        **monolith_detection_tools,
        **playwright_tools,
        **secrets_tools,
        **social_tools,
        **vscode_tasks_tools,
        **ecs_tools,
    }
