"""
World Management Module

Provides world management, simulation, and singleton pattern implementation.
"""

from .agent_world import AgentWorld
from .simulation import WorldSimulation
from .singleton import get_world_instance, set_world_instance

__all__ = ["AgentWorld", "WorldSimulation", "get_world_instance", "set_world_instance"]
