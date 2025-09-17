"""
Singleton World Manager

Provides singleton pattern for the ECS world to ensure only one world instance exists.
"""

import logging
from typing import Optional

from .agent_world import AgentWorld

logger = logging.getLogger(__name__)

# Global world instance
_world_instance: Optional[AgentWorld] = None


def get_world_instance() -> AgentWorld:
    """
    Get the singleton world instance.
    
    Creates a new world instance if none exists.
    
    Returns:
        The singleton AgentWorld instance
    """
    global _world_instance
    
    if _world_instance is None:
        logger.info("Creating new singleton ECS world instance")
        _world_instance = AgentWorld()
    
    return _world_instance


def set_world_instance(world: AgentWorld) -> None:
    """
    Set the singleton world instance.
    
    Args:
        world: The AgentWorld instance to set as singleton
        
    Raises:
        ValueError: If world is None
    """
    global _world_instance
    
    if world is None:
        raise ValueError("World instance cannot be None")
    
    logger.info("Setting new singleton ECS world instance")
    _world_instance = world


def clear_world_instance() -> None:
    """Clear the singleton world instance."""
    global _world_instance
    
    if _world_instance is not None:
        logger.info("Clearing singleton ECS world instance")
        _world_instance = None


def has_world_instance() -> bool:
    """
    Check if a world instance exists.
    
    Returns:
        True if a world instance exists, False otherwise
    """
    return _world_instance is not None
