#!/usr/bin/env python3
"""
Agent Management Tool Definitions
=================================

Tool definitions for agent management functionality.
"""

from typing import Any


def get_agent_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get agent management tool definitions."""
    return {
        "generate_agent_name": {
            "name": "generate_agent_name",
            "description": "Generate a new robot name with animal spirit themes",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "spirit": {
                        "type": "string",
                        "description": "Animal spirit (fox, wolf, otter, etc.)",
                        "enum": ["fox", "wolf", "otter", "eagle", "lion", "tiger", "dolphin", "bear", "rabbit", "owl", "raven", "shark", "penguin", "elephant", "giraffe", "zebra", "cheetah", "panther", "lynx", "bobcat", "coyote", "hyena", "jaguar", "leopard", "cougar", "puma", "mountain_lion", "snow_leopard", "clouded_leopard", "margay", "ocelot", "serval", "caracal", "sand_cat", "black_footed_cat", "rusty_spotted_cat", "pallas_cat", "manul", "jungle_cat", "chaus", "fishing_cat", "flat_headed_cat", "bornean_bay_cat", "asian_golden_cat", "african_golden_cat", "pampas_cat", "geoffroy_cat", "kodkod", "oncilla", "tigrina", "margay", "ocelot", "serval", "caracal", "sand_cat", "black_footed_cat", "rusty_spotted_cat", "pallas_cat", "manul", "jungle_cat", "chaus", "fishing_cat", "flat_headed_cat", "bornean_bay_cat", "asian_golden_cat", "african_golden_cat", "pampas_cat", "geoffroy_cat", "kodkod", "oncilla", "tigrina"]
                    },
                    "style": {
                        "type": "string",
                        "description": "Naming style",
                        "enum": ["foundation", "exo", "hybrid", "cyberpunk", "mythological", "scientific"]
                    }
                }
            }
        },
        "assign_agent_name": {
            "name": "assign_agent_name",
            "description": "Assign a name to an agent with persistence",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {
                        "type": "string",
                        "description": "Unique identifier for the agent"
                    },
                    "name": {
                        "type": "string",
                        "description": "Name to assign to the agent"
                    }
                },
                "required": ["agent_id", "name"]
            }
        },
        "get_agent_name": {
            "name": "get_agent_name",
            "description": "Get the current name of an agent",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {
                        "type": "string",
                        "description": "Unique identifier for the agent"
                    }
                },
                "required": ["agent_id"]
            }
        },
        "list_agent_names": {
            "name": "list_agent_names",
            "description": "List all agents and their names",
            "inputSchema": {
                "type": "object",
                "properties": {}
            }
        },
        "roll_agent_spirit": {
            "name": "roll_agent_spirit",
            "description": "Randomly select an animal spirit (weighted distribution)",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "weighted": {
                        "type": "boolean",
                        "description": "Use weighted distribution (default: true)",
                        "default": True
                    }
                }
            }
        },
        "agent_startup_sequence": {
            "name": "agent_startup_sequence",
            "description": "Complete agent initialization with random spirit selection",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {
                        "type": "string",
                        "description": "Unique identifier for the agent",
                        "default": "current-session"
                    },
                    "preferred_style": {
                        "type": "string",
                        "description": "Preferred naming style",
                        "enum": ["foundation", "exo", "hybrid", "cyberpunk", "mythological", "scientific"],
                        "default": "foundation"
                    }
                }
            }
        },
        "get_current_time": {
            "name": "get_current_time",
            "description": "Get current date and time",
            "inputSchema": {
                "type": "object",
                "properties": {}
            }
        },
        "get_current_location": {
            "name": "get_current_location",
            "description": "Get location based on IP address",
            "inputSchema": {
                "type": "object",
                "properties": {}
            }
        },
        "send_desktop_notification": {
            "name": "send_desktop_notification",
            "description": "Send desktop notifications using libnotify",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Notification title"
                    },
                    "message": {
                        "type": "string",
                        "description": "Notification message"
                    },
                    "urgency": {
                        "type": "string",
                        "description": "Notification urgency level",
                        "enum": ["low", "normal", "critical"],
                        "default": "normal"
                    }
                },
                "required": ["title", "message"]
            }
        }
    }

