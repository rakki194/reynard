#!/usr/bin/env python3
"""
MCP Tool Definitions
====================

Defines all available MCP tools and their schemas.
Follows the 100-line axiom and modular architecture principles.
"""

from typing import Any


def get_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get all MCP tool definitions."""
    return {
        "generate_agent_name": {
            "name": "generate_agent_name",
            "description": "Generate a new robot name with animal spirit themes",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "spirit": {
                        "type": "string",
                        "enum": ["fox", "wolf", "otter"],
                        "description": "Animal spirit theme",
                    },
                    "style": {
                        "type": "string",
                        "enum": ["foundation", "exo", "hybrid"],
                        "description": "Naming style",
                    },
                },
            },
        },
        "assign_agent_name": {
            "name": "assign_agent_name",
            "description": "Assign a name to an agent",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {
                        "type": "string",
                        "description": "Unique identifier for the agent",
                    },
                    "name": {
                        "type": "string",
                        "description": "Name to assign to the agent",
                    },
                },
                "required": ["agent_id", "name"],
            },
        },
        "get_agent_name": {
            "name": "get_agent_name",
            "description": "Get the current name of an agent",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {
                        "type": "string",
                        "description": "Unique identifier for the agent",
                    }
                },
                "required": ["agent_id"],
            },
        },
        "list_agent_names": {
            "name": "list_agent_names",
            "description": "List all agents and their assigned names",
            "inputSchema": {"type": "object", "properties": {}},
        },
        "get_current_time": {
            "name": "get_current_time",
            "description": "Get the current date and time",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "format": {
                        "type": "string",
                        "description": "Time format (default: ISO format)",
                        "default": "iso",
                    }
                },
            },
        },
        "get_current_location": {
            "name": "get_current_location",
            "description": "Get the current location based on the machine's IP address",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "include_coordinates": {
                        "type": "boolean",
                        "description": "Include latitude and longitude coordinates",
                        "default": True,
                    }
                },
            },
        },
    }
