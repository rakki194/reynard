#!/usr/bin/env python3
"""
Social Tool Definitions
=======================

Defines social interaction MCP tools and their schemas.
Follows the 140-line axiom and modular architecture principles.
"""

from typing import Any


def get_social_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get all social MCP tool definitions."""
    return {
        "initiate_interaction": {
            "name": "initiate_interaction",
            "description": "Initiate an interaction between two agents",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent1_id": {
                        "type": "string",
                        "description": "First agent ID"
                    },
                    "agent2_id": {
                        "type": "string", 
                        "description": "Second agent ID"
                    },
                    "interaction_type": {
                        "type": "string",
                        "description": "Type of interaction",
                        "enum": ["communication", "social", "collaboration", "conflict"],
                        "default": "communication"
                    }
                },
                "required": ["agent1_id", "agent2_id"]
            }
        },
        "send_chat_message": {
            "name": "send_chat_message",
            "description": "Send a chat message from one agent to another",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "sender_id": {
                        "type": "string",
                        "description": "Agent sending the message"
                    },
                    "receiver": {
                        "type": "string",
                        "description": "Agent receiving the message (ID or name - will be automatically resolved)"
                    },
                    "message": {
                        "type": "string",
                        "description": "Message content"
                    },
                    "interaction_type": {
                        "type": "string",
                        "description": "Type of interaction",
                        "enum": ["communication", "social", "collaboration"],
                        "default": "communication"
                    }
                },
                "required": ["sender_id", "receiver", "message"]
            }
        },
        "get_interaction_history": {
            "name": "get_interaction_history",
            "description": "Get the interaction history for an agent",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {
                        "type": "string",
                        "description": "Agent to get history for"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of interactions to return",
                        "default": 10
                    }
                },
                "required": ["agent_id"]
            }
        },
        "get_agent_relationships": {
            "name": "get_agent_relationships",
            "description": "Get all relationships for an agent",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {
                        "type": "string",
                        "description": "Agent to get relationships for"
                    }
                },
                "required": ["agent_id"]
            }
        },
        "get_agent_social_stats": {
            "name": "get_agent_social_stats",
            "description": "Get social interaction statistics for an agent",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {
                        "type": "string",
                        "description": "Agent to get stats for"
                    }
                },
                "required": ["agent_id"]
            }
        },
        "get_nearby_agents": {
            "name": "get_nearby_agents",
            "description": "Get all agents within a certain radius of an agent",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {
                        "type": "string",
                        "description": "Agent to check around"
                    },
                    "radius": {
                        "type": "number",
                        "description": "Search radius in world units",
                        "default": 100.0
                    }
                },
                "required": ["agent_id"]
            }
        },
        "find_ecs_agent": {
            "name": "find_ecs_agent",
            "description": "Find an agent in the ECS world by name or ID with flexible matching",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Name or ID to search for"
                    },
                    "exact_match": {
                        "type": "boolean",
                        "description": "Whether to require exact match",
                        "default": False
                    }
                },
                "required": ["query"]
            }
        },
        "get_ecs_world_status": {
            "name": "get_ecs_world_status",
            "description": "Get the current status of the ECS world including agent counts and system health",
            "inputSchema": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    }
