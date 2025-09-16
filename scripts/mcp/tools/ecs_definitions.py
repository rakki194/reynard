#!/usr/bin/env python3
"""
ECS Tool Definitions
====================

Tool definitions for ECS-based agent management.
Defines the MCP tool schemas for ECS operations.

Follows the 140-line axiom and modular architecture principles.
"""

from typing import Any, Dict


def get_ecs_tool_definitions() -> Dict[str, Dict[str, Any]]:
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
    }
