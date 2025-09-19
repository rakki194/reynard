#!/usr/bin/env python3
"""
ECS Tool Definitions
====================

Tool definitions for ECS-based agent management.
Defines the MCP tool schemas for ECS operations.

Follows the 140-line axiom and modular architecture principles.
"""

from typing import Any, Dict


def get_ecs_tool_definitions() -> dict[str, Dict[str, Any]]:
    """Get ECS tool definitions for MCP server."""
    return {
        "create_ecs_agent": {
            "name": "create_ecs_agent",
            "description": "Create a new agent using the ECS system",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {
                        "type": "string",
                        "description": "Unique identifier for the agent",
                    },
                    "spirit": {
                        "type": "string",
                        "enum": ["fox", "wolf", "otter"],
                        "description": "Animal spirit theme",
                    },
                    "style": {
                        "type": "string",
                        "enum": [
                            "foundation",
                            "exo",
                            "hybrid",
                            "cyberpunk",
                            "mythological",
                            "scientific",
                        ],
                        "description": "Naming style",
                    },
                    "name": {
                        "type": "string",
                        "description": "Optional custom name for the agent",
                    },
                },
                "required": ["agent_id"],
            },
        },
        "create_ecs_offspring": {
            "name": "create_ecs_offspring",
            "description": "Create offspring agent from two parent agents using ECS",
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
        "enable_automatic_reproduction": {
            "name": "enable_automatic_reproduction",
            "description": "Enable or disable automatic reproduction in the ECS system",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "enabled": {
                        "type": "boolean",
                        "description": "Whether to enable automatic reproduction",
                        "default": True,
                    }
                },
            },
        },
        "get_ecs_agent_status": {
            "name": "get_ecs_agent_status",
            "description": "Get status of all agents in the ECS system",
            "inputSchema": {"type": "object", "properties": {}},
        },
        "get_ecs_agent_positions": {
            "name": "get_ecs_agent_positions",
            "description": "Get positions of all agents in the ECS system",
            "inputSchema": {"type": "object", "properties": {}},
        },
        "find_ecs_compatible_mates": {
            "name": "find_ecs_compatible_mates",
            "description": "Find compatible mates for an agent using ECS compatibility system",
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
        "analyze_ecs_compatibility": {
            "name": "analyze_ecs_compatibility",
            "description": "Analyze genetic compatibility between two agents using ECS",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent1_id": {"type": "string", "description": "First agent ID"},
                    "agent2_id": {"type": "string", "description": "Second agent ID"},
                },
                "required": ["agent1_id", "agent2_id"],
            },
        },
        "get_ecs_lineage": {
            "name": "get_ecs_lineage",
            "description": "Get family tree and lineage information for an agent using ECS",
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
        "update_ecs_world": {
            "name": "update_ecs_world",
            "description": "Update the ECS world (simulate time passage and run systems)",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "delta_time": {
                        "type": "number",
                        "description": "Time step for simulation",
                        "default": 1.0,
                    }
                },
            },
        },
        "search_agents_by_proximity": {
            "name": "search_agents_by_proximity",
            "description": "Find agents within a specified distance of a target position",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "x": {
                        "type": "number",
                        "description": "Target X coordinate",
                        "default": 0.0,
                    },
                    "y": {
                        "type": "number",
                        "description": "Target Y coordinate",
                        "default": 0.0,
                    },
                    "max_distance": {
                        "type": "number",
                        "description": "Maximum distance to search within",
                        "default": 100.0,
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum number of results to return",
                        "default": 10,
                    },
                },
            },
        },
        "search_agents_by_region": {
            "name": "search_agents_by_region",
            "description": "Find agents within a rectangular region",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "min_x": {
                        "type": "number",
                        "description": "Minimum X coordinate",
                        "default": 0.0,
                    },
                    "min_y": {
                        "type": "number",
                        "description": "Minimum Y coordinate",
                        "default": 0.0,
                    },
                    "max_x": {
                        "type": "number",
                        "description": "Maximum X coordinate",
                        "default": 1000.0,
                    },
                    "max_y": {
                        "type": "number",
                        "description": "Maximum Y coordinate",
                        "default": 1000.0,
                    },
                },
            },
        },
        "get_agent_movement_path": {
            "name": "get_agent_movement_path",
            "description": "Get the movement path and trajectory for a specific agent",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {
                        "type": "string",
                        "description": "Agent ID to get movement path for",
                    },
                },
                "required": ["agent_id"],
            },
        },
        "get_spatial_analytics": {
            "name": "get_spatial_analytics",
            "description": "Get comprehensive spatial analytics for all agents",
            "inputSchema": {
                "type": "object",
                "properties": {},
            },
        },
        "start_global_breeding": {
            "name": "start_global_breeding",
            "description": "Start the global breeding scheduler for automatic agent reproduction",
            "inputSchema": {
                "type": "object",
                "properties": {},
            },
        },
        "stop_global_breeding": {
            "name": "stop_global_breeding",
            "description": "Stop the global breeding scheduler",
            "inputSchema": {
                "type": "object",
                "properties": {},
            },
        },
        "get_breeding_statistics": {
            "name": "get_breeding_statistics",
            "description": "Get breeding statistics and history",
            "inputSchema": {
                "type": "object",
                "properties": {},
            },
        },
    }
