#!/usr/bin/env python3
"""
🦊 Reynard MCP Agent Tool Handlers
==================================

Comprehensive agent management system for the Reynard MCP server, providing
sophisticated agent lifecycle management, persona generation, and ECS world
integration. This module serves as the central hub for all agent-related
operations within the Reynard ecosystem.

The agent tools system provides:
- Agent naming and identity management with animal spirit themes
- Complete agent initialization and startup sequences
- ECS world integration for agent simulation and interaction
- Persona generation with trait-based personality systems
- LoRA configuration for AI personality modeling
- Breeding and genetic compatibility analysis
- Behavioral pattern management and social interaction tracking

Architecture:
- Modular tool registration using @register_tool decorators
- Separation of concerns across specialized tool classes
- Integration with backend agent manager and ECS world simulation
- Support for both synchronous and asynchronous operations
- Comprehensive error handling and validation

Tool Categories:
- Base Agent Tools: Core naming and identity management
- ECS Agent Tools: World simulation and agent lifecycle
- Persona Tools: Personality generation and trait management
- Breeding Tools: Genetic compatibility and offspring creation
- Behavior Tools: Social interaction and behavioral patterns

The system follows the 140-line axiom and modular architecture principles,
ensuring maintainable and focused tool implementations.

Author: Reynard Development Team
Version: 1.0.0
"""

import sys
from pathlib import Path
from typing import Any

from services.backend_agent_manager import BackendAgentManager
from protocol.tool_registry import register_tool

from .agent_management.base import BaseAgentTools
from .agent_management.ecs import ECSAgentTools
from .agent_management.persona import PersonaAgentTools
from .agent_management.breeding import BreedingAgentTools
from .agent_management.behavior import BehaviorAgentTools


# Initialize agent manager and tools
agent_manager = BackendAgentManager()
base_tools = BaseAgentTools(agent_manager)
# Pass the world simulation from agent manager to ECS tools  
ecs_tools = ECSAgentTools(agent_manager, None)
persona_tools = PersonaAgentTools(agent_manager)
breeding_tools = BreedingAgentTools(agent_manager)
behavior_tools = BehaviorAgentTools()


@register_tool(
    name="generate_agent_name",
    category="agent",
    description="Generate robot names with animal spirit themes",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def generate_agent_name(**kwargs) -> dict[str, Any]:
    """
    Generate a new robot name with animal spirit themes and strategic naming conventions.
    
    Creates unique agent names using the Reynard naming system, which combines
    animal spirit themes with various naming styles (foundation, exo, hybrid,
    cyberpunk, mythological, scientific). The system generates names that reflect
    the agent's specialization and provide meaningful identity within the ecosystem.
    
    The naming system supports 105+ animal spirits with weighted distribution,
    ensuring balanced representation across different specializations while
    maintaining the strategic focus of the Reynard ecosystem.
    
    Args:
        **kwargs: Tool execution context containing:
            arguments (dict): Tool arguments including:
                - spirit (str, optional): Animal spirit type (fox, wolf, otter, etc.)
                - style (str, optional): Naming style (foundation, exo, hybrid, etc.)
                - weighted (bool, optional): Use weighted distribution (default: True)
    
    Returns:
        dict[str, Any]: Response containing:
            - success (bool): Whether the operation succeeded
            - name (str): Generated agent name
            - spirit (str): Selected animal spirit
            - style (str): Used naming style
            - metadata (dict): Additional generation information
    
    Raises:
        ValueError: If invalid spirit or style parameters are provided
        RuntimeError: If the naming system is unavailable
        
    Example:
        ```python
        result = await generate_agent_name(arguments={
            "spirit": "fox",
            "style": "foundation"
        })
        # Returns: {"name": "Strategic-Prime-13", "spirit": "fox", "style": "foundation"}
        ```
    """
    arguments = kwargs.get("arguments", {})
    return await base_tools.generate_agent_name(arguments)


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
    """
    Assign a generated name to an agent with persistent storage.
    
    Associates a previously generated agent name with a specific agent ID,
    storing the assignment in persistent storage for future retrieval. This
    function is part of the two-step agent naming workflow: first generate
    a name, then assign it to an agent.
    
    The assignment system ensures that agent names are unique and properly
    tracked within the Reynard ecosystem, enabling consistent agent identity
    management across sessions and interactions.
    
    Args:
        **kwargs: Tool execution context containing:
            arguments (dict): Tool arguments including:
                - agent_id (str): Unique identifier for the agent
                - name (str): Generated name to assign to the agent
    
    Returns:
        dict[str, Any]: Response containing:
            - success (bool): Whether the assignment succeeded
            - agent_id (str): The agent identifier
            - name (str): The assigned name
            - timestamp (str): Assignment timestamp
            - metadata (dict): Additional assignment information
    
    Raises:
        ValueError: If agent_id or name is missing or invalid
        RuntimeError: If the assignment system is unavailable
        
    Example:
        ```python
        result = assign_agent_name(arguments={
            "agent_id": "agent-12345",
            "name": "Strategic-Prime-13"
        })
        # Returns: {"success": True, "agent_id": "agent-12345", "name": "Strategic-Prime-13"}
        ```
    """
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
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def roll_agent_spirit(**kwargs) -> dict[str, Any]:
    """Randomly select an animal spirit."""
    arguments = kwargs.get("arguments", {})
    return await base_tools.roll_agent_spirit(arguments)


@register_tool(
    name="get_spirit_emoji",
    category="agent",
    description="Get emoji for animal spirit types",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def get_spirit_emoji(**kwargs) -> dict[str, Any]:
    """Get emoji for animal spirit types."""
    arguments = kwargs.get("arguments", {})
    return await base_tools.get_spirit_emoji(arguments)


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
    """
    Complete agent initialization with ECS world integration and enhanced persona generation.
    
    Performs comprehensive agent initialization including spirit selection, name generation,
    ECS world creation, persona generation, and LoRA configuration. This is the primary
    entry point for creating fully-realized digital agents within the Reynard ecosystem.
    
    The startup sequence includes:
    1. Random spirit selection with weighted distribution (fox 40%, otter 35%, wolf 25%)
    2. Strategic name generation using the selected spirit and style
    3. ECS world agent creation with spatial positioning
    4. Enhanced persona generation with 44 total traits
    5. LoRA configuration for AI personality modeling
    6. Temporal and geographical context establishment
    
    This function creates agents that are immediately ready for interaction within
    the ECS world simulation, with complete personality profiles and behavioral
    characteristics.
    
    Args:
        **kwargs: Tool execution context containing:
            arguments (dict): Tool arguments including:
                - agent_id (str, optional): Custom agent ID (default: "current-session")
                - preferred_style (str, optional): Preferred naming style (default: "foundation")
    
    Returns:
        dict[str, Any]: Complete startup response containing:
            - agent_id (str): Generated or provided agent ID
            - name (str): Generated agent name
            - spirit (str): Selected animal spirit
            - style (str): Used naming style
            - persona (dict): Complete personality profile
            - lora_config (dict): LoRA configuration for AI modeling
            - ecs_data (dict): ECS world integration data
            - temporal_context (dict): Current time and location
            - metadata (dict): Additional startup information
    
    Raises:
        RuntimeError: If ECS world or persona generation fails
        ValueError: If invalid parameters are provided
        
    Example:
        ```python
        result = await agent_startup_sequence(arguments={
            "agent_id": "my-agent-123",
            "preferred_style": "foundation"
        })
        # Returns complete agent initialization data with persona and ECS integration
        ```
    """
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