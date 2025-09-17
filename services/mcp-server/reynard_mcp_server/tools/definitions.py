#!/usr/bin/env python3
"""
MCP Tool Definitions
====================

Defines all available MCP tools and their schemas.
Follows the 100-line axiom and modular architecture principles.
"""

from typing import Any

from .ecs_definitions import get_ecs_tool_definitions
from .image_viewer_definitions import get_image_viewer_tool_definitions
from .linting_definitions import get_linting_tool_definitions
from .mermaid_definitions import get_mermaid_tool_definitions
from .monolith_detection.definitions import get_monolith_detection_tool_definitions
from .search.search_definitions import SEARCH_TOOL_DEFINITIONS
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
        "create_offspring": {
            "name": "create_offspring",
            "description": "Create offspring agent from two parent agents with inherited traits",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "parent1_id": {
                        "type": "string",
                        "description": "First parent agent ID",
                    },
                    "parent2_id": {
                        "type": "string",
                        "description": "Second parent agent ID",
                    },
                    "offspring_id": {
                        "type": "string",
                        "description": "New offspring agent ID",
                    },
                },
                "required": ["parent1_id", "parent2_id", "offspring_id"],
            },
        },
        "get_agent_lineage": {
            "name": "get_agent_lineage",
            "description": "Get family tree and lineage information for an agent",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {
                        "type": "string",
                        "description": "Agent ID to get lineage for",
                    },
                    "depth": {
                        "type": "integer",
                        "description": "Depth of family tree to show",
                        "default": 3,
                    },
                },
                "required": ["agent_id"],
            },
        },
        "analyze_genetic_compatibility": {
            "name": "analyze_genetic_compatibility",
            "description": "Analyze genetic compatibility between two agents",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent1_id": {
                        "type": "string",
                        "description": "First agent ID",
                    },
                    "agent2_id": {
                        "type": "string",
                        "description": "Second agent ID",
                    },
                },
                "required": ["agent1_id", "agent2_id"],
            },
        },
        "find_compatible_mates": {
            "name": "find_compatible_mates",
            "description": "Find agents with compatible traits for breeding",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {
                        "type": "string",
                        "description": "Agent ID to find mates for",
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum number of results to return",
                        "default": 5,
                    },
                },
                "required": ["agent_id"],
            },
        },
        "get_current_time": {
            "name": "get_current_time",
            "description": "Get the current date and time with timezone support",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "format": {
                        "type": "string",
                        "description": "Time format (default: ISO format)",
                        "default": "iso",
                    },
                    "timezone": {
                        "type": "string",
                        "description": "Timezone (e.g., 'Europe/Berlin', 'America/New_York'). If not provided, will auto-detect from location.",
                    },
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
        "restart_mcp_server": {
            "name": "restart_mcp_server",
            "description": "Restart the MCP server with different restart methods",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "method": {
                        "type": "string",
                        "enum": ["graceful", "immediate", "external"],
                        "description": "Restart method: 'graceful' (SIGTERM), 'immediate' (SIGKILL), or 'external' (via script)",
                        "default": "graceful",
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
            "description": "Complete agent initialization sequence with ECS integration and trait inheritance",
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
        "get_agent_persona": {
            "name": "get_agent_persona",
            "description": "Get comprehensive agent persona from ECS system",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {
                        "type": "string",
                        "description": AGENT_ID_DESCRIPTION,
                    },
                },
                "required": ["agent_id"],
            },
        },
        "get_lora_config": {
            "name": "get_lora_config",
            "description": "Get LoRA configuration for agent persona",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {
                        "type": "string",
                        "description": AGENT_ID_DESCRIPTION,
                    },
                },
                "required": ["agent_id"],
            },
        },
        "get_simulation_status": {
            "name": "get_simulation_status",
            "description": "Get comprehensive ECS world simulation status",
            "inputSchema": {
                "type": "object",
                "properties": {},
            },
        },
        "accelerate_time": {
            "name": "accelerate_time",
            "description": "Adjust time acceleration factor for world simulation",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "factor": {
                        "type": "number",
                        "description": "Time acceleration factor (0.1 to 100.0)",
                        "default": 10.0,
                        "minimum": 0.1,
                        "maximum": 100.0,
                    },
                },
            },
        },
        "nudge_time": {
            "name": "nudge_time",
            "description": "Nudge simulation time forward (for MCP actions)",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "amount": {
                        "type": "number",
                        "description": "Amount to nudge time forward",
                        "default": 0.1,
                        "minimum": 0.01,
                        "maximum": 1.0,
                    },
                },
            },
        },
    }

    # Get linting, version/vscode, search, image viewer, mermaid, and VS Code tasks tools
    linting_tools = get_linting_tool_definitions()
    version_vscode_tools = get_version_vscode_tool_definitions()
    search_tools = {
        tool["name"]: tool for tool in SEARCH_TOOL_DEFINITIONS
    }
    image_viewer_tools = get_image_viewer_tool_definitions()
    mermaid_tools = get_mermaid_tool_definitions()
    monolith_detection_tools = get_monolith_detection_tool_definitions()
    vscode_tasks_tools = get_vscode_tasks_tool_definitions()
    ecs_tools = get_ecs_tool_definitions()

    # Return combined tool definitions
    return {
        **agent_tools,
        **linting_tools,
        **version_vscode_tools,
        **search_tools,
        **image_viewer_tools,
        **mermaid_tools,
        **monolith_detection_tools,
        **vscode_tasks_tools,
        **ecs_tools,
    }
