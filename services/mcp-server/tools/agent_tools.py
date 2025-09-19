#!/usr/bin/env python3
"""
Agent Tool Handlers
===================

Handles agent-related MCP tool calls.
Now uses the new @register_tool decorator system for automatic registration.

Follows the 140-line axiom and modular architecture principles.
"""

import sys
from pathlib import Path
from typing import Any

# Add the agent naming package to the path
agent_naming_path = Path(__file__).parent.parent.parent / "services" / "agent-naming" / "reynard_agent_naming"
sys.path.insert(0, str(agent_naming_path))

from agent_naming import AgentNameManager
from protocol.tool_registry import register_tool

from .agent_management.base import BaseAgentTools
from .agent_management.ecs import ECSAgentTools
from .agent_management.persona import PersonaAgentTools
from .agent_management.breeding import BreedingAgentTools
from .agent_management.behavior import BehaviorAgentTools


# Initialize agent manager and tools
agent_manager = AgentNameManager()
base_tools = BaseAgentTools(agent_manager)
# Pass the world simulation from agent manager to ECS tools
ecs_tools = ECSAgentTools(agent_manager, agent_manager.world_simulation)
persona_tools = PersonaAgentTools(agent_manager)
breeding_tools = BreedingAgentTools(agent_manager)
behavior_tools = BehaviorAgentTools()


@register_tool(
    name="generate_agent_name",
    category="agent",
    description="Generate robot names with animal spirit themes",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def generate_agent_name(**kwargs) -> dict[str, Any]:
    """Generate a new robot name."""
    arguments = kwargs.get("arguments", {})
    return base_tools.generate_agent_name(arguments)


@register_tool(
    name="assign_agent_name",
    category="agent",
    description="Assign names to agents with persistence",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def assign_agent_name(**kwargs) -> dict[str, Any]:
    """Assign a name to an agent."""
    arguments = kwargs.get("arguments", {})
    return base_tools.assign_agent_name(arguments)


@register_tool(
    name="get_agent_name",
    category="agent",
    description="Retrieve current agent names",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def get_agent_name(**kwargs) -> dict[str, Any]:
    """Get the current name of an agent."""
    arguments = kwargs.get("arguments", {})
    return base_tools.get_agent_name(arguments)


@register_tool(
    name="list_agent_names",
    category="agent",
    description="List all agents and their names",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def list_agent_names(**kwargs) -> dict[str, Any]:
    """List all agents and their names."""
    arguments = kwargs.get("arguments", {})
    return base_tools.list_agent_names(arguments)


@register_tool(
    name="roll_agent_spirit",
    category="agent",
    description="Randomly select an animal spirit (weighted distribution)",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def roll_agent_spirit(**kwargs) -> dict[str, Any]:
    """Randomly select an animal spirit."""
    arguments = kwargs.get("arguments", {})
    return base_tools.roll_agent_spirit(arguments)


@register_tool(
    name="get_spirit_emoji",
    category="agent",
    description="Get emoji for animal spirit types",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def get_spirit_emoji(**kwargs) -> dict[str, Any]:
    """Get emoji for animal spirit types."""
    arguments = kwargs.get("arguments", {})
    return base_tools.get_spirit_emoji(arguments)


@register_tool(
    name="agent_startup_sequence",
    category="agent",
    description="Complete agent initialization with random spirit selection",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def agent_startup_sequence(**kwargs) -> dict[str, Any]:
    """Complete agent initialization with random spirit selection."""
    arguments = kwargs.get("arguments", {})
    return await ecs_tools.agent_startup_sequence(arguments)


@register_tool(
    name="get_agent_persona",
    category="agent",
    description="Get comprehensive agent persona from ECS system",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def get_agent_persona(**kwargs) -> dict[str, Any]:
    """Get comprehensive agent persona from ECS system."""
    arguments = kwargs.get("arguments", {})
    return persona_tools.get_agent_persona(arguments)


@register_tool(
    name="get_lora_config",
    category="agent",
    description="Get LoRA configuration for agent persona",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def get_lora_config(**kwargs) -> dict[str, Any]:
    """Get LoRA configuration for agent persona."""
    arguments = kwargs.get("arguments", {})
    return persona_tools.get_lora_config(arguments)