#!/usr/bin/env python3
"""
Agent Tool Handlers
===================

Handles agent-related MCP tool calls.
Follows the 140-line axiom and modular architecture principles.
"""

from typing import Any

from reynard_agent_naming.agent_naming import AgentNameManager

from .agent_tools_base import BaseAgentTools
from .agent_tools_ecs import ECSAgentTools
from .agent_tools_persona import PersonaAgentTools
from .agent_tools_breeding import BreedingAgentTools
from .agent_tools_behavior import BehaviorAgentTools


class AgentTools:
    """Handles agent-related tool operations using modular components."""

    def __init__(self, agent_manager: AgentNameManager, ecs_agent_tools: Any = None) -> None:
        self.agent_manager = agent_manager
        self.ecs_agent_tools = ecs_agent_tools

        # Initialize modular components
        self.base_tools = BaseAgentTools(agent_manager)
        self.ecs_tools = ECSAgentTools(agent_manager, ecs_agent_tools)
        self.persona_tools = PersonaAgentTools(agent_manager)
        self.breeding_tools = BreedingAgentTools(agent_manager)
        self.behavior_tools = BehaviorAgentTools()

    # Base agent tools delegation
    def generate_agent_name(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Generate a new robot name."""
        return self.base_tools.generate_agent_name(arguments)

    def assign_agent_name(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Assign a name to an agent."""
        return self.base_tools.assign_agent_name(arguments)

    def get_agent_name(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get the current name of an agent."""
        return self.base_tools.get_agent_name(arguments)

    def list_agent_names(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """List all agents and their names."""
        return self.base_tools.list_agent_names(arguments)

    def roll_agent_spirit(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Randomly select an animal spirit for agent initialization."""
        return self.base_tools.roll_agent_spirit(arguments)

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
