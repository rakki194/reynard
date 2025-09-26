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
    def __init__(self, name: str, description: str, input_schema: dict[str, Any]):
        self.name = name
        self.description = description
        self.input_schema = input_schema

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "inputSchema": self.input_schema,
        }


# Import from ultimate organized subdirectories
from .agent.definitions import get_agent_tool_definitions
from .agent.social.definitions import get_social_tool_definitions
from .development.code_quality.monolith_detection.definitions import (
    get_monolith_detection_tool_definitions,
)
from .development.definitions import get_development_tool_definitions
from .research.definitions import get_research_tool_definitions
from .system.definitions import get_system_tool_definitions
from .visualization.definitions import get_visualization_tool_definitions

# Search tools now use @register_tool decorators, no separate definitions needed


def get_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get all MCP tool definitions."""
    # Get all tool definitions from ultimate organized subdirectories
    agent_tools = get_agent_tool_definitions()
    development_tools = get_development_tool_definitions()
    visualization_tools = get_visualization_tool_definitions()
    monolith_detection_tools = get_monolith_detection_tool_definitions()
    social_tools = get_social_tool_definitions()
    system_tools = get_system_tool_definitions()
    research_tools = get_research_tool_definitions()

    # Return combined tool definitions
    return {
        **agent_tools,
        **development_tools,
        **visualization_tools,
        **monolith_detection_tools,
        **social_tools,
        **system_tools,
        **research_tools,
    }
