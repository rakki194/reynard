#!/usr/bin/env python3
"""
MCP Tool Definitions
====================

Defines all available MCP tools and their schemas.
Follows the 100-line axiom and modular architecture principles.
"""

from typing import Any

from .file_search_definitions import get_file_search_tool_definitions
from .image_viewer_definitions import get_image_viewer_tool_definitions
from .linting_definitions import get_linting_tool_definitions
from .mermaid_definitions import get_mermaid_tool_definitions
from .semantic_file_search_definitions import get_semantic_file_search_tool_definitions
from .version_vscode_definitions import get_version_vscode_tool_definitions
from .vscode_tasks_definitions import get_vscode_tasks_tool_definitions

# Constants for repeated strings
AGENT_ID_DESCRIPTION = "Unique identifier for the agent"


def get_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get all MCP tool definitions."""
    # Combine agent tools and linting tools
    agent_tools = {
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
                        "description": AGENT_ID_DESCRIPTION,
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
                        "description": AGENT_ID_DESCRIPTION,
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
        "send_desktop_notification": {
            "name": "send_desktop_notification",
            "description": "Send a desktop notification using libnotify",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Notification title",
                        "default": "MCP Notification",
                    },
                    "message": {
                        "type": "string",
                        "description": "Notification message content",
                        "default": "",
                    },
                    "urgency": {
                        "type": "string",
                        "enum": ["low", "normal", "critical"],
                        "description": "Notification urgency level",
                        "default": "normal",
                    },
                    "timeout": {
                        "type": "integer",
                        "description": "Notification timeout in milliseconds",
                        "default": 5000,
                    },
                    "icon": {
                        "type": "string",
                        "description": "Notification icon name",
                        "default": "dialog-information",
                    },
                },
            },
        },
        "roll_agent_spirit": {
            "name": "roll_agent_spirit",
            "description": "Randomly select an animal spirit for agent initialization",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "weighted": {
                        "type": "boolean",
                        "description": "Use weighted distribution favoring fox (40%), otter (35%), wolf (25%)",
                        "default": True,
                    }
                },
            },
        },
        "agent_startup_sequence": {
            "name": "agent_startup_sequence",
            "description": "Complete agent initialization sequence with random spirit selection",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {
                        "type": "string",
                        "description": AGENT_ID_DESCRIPTION,
                        "default": "current-session",
                    },
                    "preferred_style": {
                        "type": "string",
                        "enum": [
                            "foundation",
                            "exo",
                            "hybrid",
                            "cyberpunk",
                            "mythological",
                            "scientific",
                        ],
                        "description": "Preferred naming style (random if not specified)",
                    },
                    "force_spirit": {
                        "type": "string",
                        "enum": ["fox", "wolf", "otter"],
                        "description": "Force a specific spirit (overrides random selection)",
                    },
                },
            },
        },
    }

    # Get linting, version/vscode, file search, semantic search, image viewer, mermaid, and VS Code tasks tools
    linting_tools = get_linting_tool_definitions()
    version_vscode_tools = get_version_vscode_tool_definitions()
    file_search_tools = get_file_search_tool_definitions()
    semantic_file_search_tools = get_semantic_file_search_tool_definitions()
    image_viewer_tools = get_image_viewer_tool_definitions()
    mermaid_tools = get_mermaid_tool_definitions()
    vscode_tasks_tools = get_vscode_tasks_tool_definitions()

    # Return combined tool definitions
    return {
        **agent_tools,
        **linting_tools,
        **version_vscode_tools,
        **file_search_tools,
        **semantic_file_search_tools,
        **image_viewer_tools,
        **mermaid_tools,
        **vscode_tasks_tools,
    }
