#!/usr/bin/env python3
"""
Agent Tool Handlers
===================

Handles agent-related MCP tool calls.
Follows the 140-line axiom and modular architecture principles.
"""

from typing import Any

import sys
from pathlib import Path

# Add the services path
services_path = Path(__file__).parent.parent.parent / "services"
sys.path.insert(0, str(services_path))

from services.backend_agent_manager import BackendAgentManager

from tools.agent_management.base import BaseAgentTools
from tools.agent_management.behavior import BehaviorAgentTools
from tools.agent_management.breeding import BreedingAgentTools
from tools.agent_management.ecs import ECSAgentTools
from tools.agent_management.persona import PersonaAgentTools


class AgentTools:
    """Handles agent-related tool operations using modular components."""

    def __init__(
        self, agent_manager: BackendAgentManager, ecs_agent_tools: Any = None
    ) -> None:
        self.agent_manager = agent_manager
        self.ecs_agent_tools = ecs_agent_tools

        # Initialize modular components
        self.base_tools = BaseAgentTools(agent_manager)
        self.ecs_tools = ECSAgentTools(agent_manager, ecs_agent_tools)
        self.persona_tools = PersonaAgentTools(agent_manager)
        self.breeding_tools = BreedingAgentTools(agent_manager)
        self.behavior_tools = BehaviorAgentTools()

    # Base agent tools delegation
    async def generate_agent_name(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Generate a new robot name."""
        return await self.base_tools.generate_agent_name(arguments)

    def assign_agent_name(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Assign a name to an agent."""
        return self.base_tools.assign_agent_name(arguments)

    def get_agent_name(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get the current name of an agent."""
        return self.base_tools.get_agent_name(arguments)

    def list_agent_names(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """List all agents and their names."""
        return self.base_tools.list_agent_names(arguments)

    async def roll_agent_spirit(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Randomly select an animal spirit for agent initialization."""
        return await self.base_tools.roll_agent_spirit(arguments)

    # ECS agent tools delegation
    async def agent_startup_sequence(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Complete agent initialization sequence with ECS integration and trait inheritance."""
        return await self.ecs_tools.agent_startup_sequence(arguments)

    def get_simulation_status(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get comprehensive simulation status."""
        return self.ecs_tools.get_simulation_status(arguments)

    def accelerate_time(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Adjust time acceleration factor for world simulation."""
        return self.ecs_tools.accelerate_time(arguments)

    def nudge_time(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Nudge simulation time forward (for MCP actions)."""
        return self.ecs_tools.nudge_time(arguments)

    # Persona agent tools delegation
    def get_agent_persona(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get comprehensive agent persona from ECS system."""
        return self.persona_tools.get_agent_persona(arguments)

    def get_lora_config(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get LoRA configuration for agent."""
        return self.persona_tools.get_lora_config(arguments)

    # Breeding agent tools delegation
    def create_offspring(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Create offspring agent from two parent agents using ECS system."""
        return self.breeding_tools.create_offspring(arguments)

    def get_agent_lineage(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get family tree and lineage information for an agent using ECS system."""
        return self.breeding_tools.get_agent_lineage(arguments)

    def analyze_genetic_compatibility(
        self, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Analyze genetic compatibility between two agents using ECS system."""
        return self.breeding_tools.analyze_genetic_compatibility(arguments)

    def find_compatible_mates(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Find agents with compatible traits for breeding using ECS system."""
        return self.breeding_tools.find_compatible_mates(arguments)

    # Behavior tools delegation
    def _generate_behavioral_instructions(
        self, persona: dict, spirit: str, style: str
    ) -> str:
        """Generate behavioral instructions based on agent traits and characteristics."""
        return self.behavior_tools.generate_behavioral_instructions(
            persona, spirit, style
        )


def get_agent_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get agent tool definitions for MCP server."""
    return {
        "generate_agent_name": {
            "description": "Generate a new robot name with animal spirit themes",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "spirit": {
                        "type": "string",
                        "description": "Animal spirit (fox, wolf, otter, etc.)",
                        "enum": [
                            "fox",
                            "wolf",
                            "otter",
                            "dragon",
                            "phoenix",
                            "void",
                            "alien",
                            "kraken",
                            "basilisk",
                            "chimera",
                        ],
                    },
                    "style": {
                        "type": "string",
                        "description": "Naming style",
                        "enum": [
                            "foundation",
                            "exo",
                            "hybrid",
                            "cyberpunk",
                            "mythological",
                            "scientific",
                        ],
                    },
                },
            },
        },
        "assign_agent_name": {
            "description": "Assign a name to an agent",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {"type": "string", "description": "Agent identifier"},
                    "name": {"type": "string", "description": "Name to assign"},
                },
                "required": ["agent_id", "name"],
            },
        },
        "get_agent_name": {
            "description": "Get the current name of an agent",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {"type": "string", "description": "Agent identifier"}
                },
                "required": ["agent_id"],
            },
        },
        "list_agent_names": {
            "description": "List all agents and their names",
            "inputSchema": {"type": "object", "properties": {}},
        },
        "roll_agent_spirit": {
            "description": "Randomly select an animal spirit for agent initialization",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "weighted": {
                        "type": "boolean",
                        "description": "Use weighted selection",
                        "default": True,
                    }
                },
            },
        },
        "agent_startup_sequence": {
            "description": "Complete agent initialization sequence with ECS integration",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {
                        "type": "string",
                        "description": "Agent identifier",
                        "default": "current-session",
                    },
                    "preferred_style": {
                        "type": "string",
                        "description": "Preferred naming style",
                    },
                    "force_spirit": {
                        "type": "string",
                        "description": "Force specific spirit",
                    },
                },
            },
        },
        "get_agent_persona": {
            "description": "Get comprehensive agent persona from ECS system",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {"type": "string", "description": "Agent identifier"}
                },
                "required": ["agent_id"],
            },
        },
        "get_lora_config": {
            "description": "Get LoRA configuration for agent",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {"type": "string", "description": "Agent identifier"}
                },
                "required": ["agent_id"],
            },
        },
        "get_simulation_status": {
            "description": "Get comprehensive simulation status",
            "inputSchema": {"type": "object", "properties": {}},
        },
        "accelerate_time": {
            "description": "Adjust time acceleration factor for world simulation",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "factor": {
                        "type": "number",
                        "description": "Time acceleration factor",
                        "default": 10.0,
                    }
                },
            },
        },
        "nudge_time": {
            "description": "Nudge simulation time forward (for MCP actions)",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "amount": {
                        "type": "number",
                        "description": "Time amount to nudge",
                        "default": 0.1,
                    }
                },
            },
        },
        "create_offspring": {
            "description": "Create offspring agent from two parent agents using ECS system",
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
                        "description": "Offspring agent ID",
                    },
                },
                "required": ["parent1_id", "parent2_id", "offspring_id"],
            },
        },
        "get_agent_lineage": {
            "description": "Get family tree and lineage information for an agent using ECS system",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {"type": "string", "description": "Agent identifier"},
                    "depth": {
                        "type": "integer",
                        "description": "Lineage depth",
                        "default": 3,
                    },
                },
                "required": ["agent_id"],
            },
        },
        "analyze_genetic_compatibility": {
            "description": "Analyze genetic compatibility between two agents using ECS system",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent1_id": {"type": "string", "description": "First agent ID"},
                    "agent2_id": {"type": "string", "description": "Second agent ID"},
                },
                "required": ["agent1_id", "agent2_id"],
            },
        },
        "find_compatible_mates": {
            "description": "Find agents with compatible traits for breeding using ECS system",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent_id": {"type": "string", "description": "Agent identifier"},
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum results",
                        "default": 5,
                    },
                },
                "required": ["agent_id"],
            },
        },
    }
