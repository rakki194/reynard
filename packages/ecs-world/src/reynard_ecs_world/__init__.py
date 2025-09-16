"""
Reynard ECS World Package

A comprehensive Entity Component System implementation for agent simulation,
trait inheritance, and world management in the Reynard framework.

This package provides:
- Core ECS architecture (Entity, Component, System, World)
- Agent management with trait inheritance
- World simulation with time acceleration
- Breeding and reproduction systems
- Event system and notifications
- FastAPI integration support
"""

from .core.entity import Entity
from .core.component import Component
from .core.system import System
from .core.world import ECSWorld
from .world.agent_world import AgentWorld
from .world.simulation import WorldSimulation
from .world.singleton import get_world_instance, set_world_instance

__version__ = "1.0.0"
__author__ = "Reynard Framework"

__all__ = [
    "Entity",
    "Component", 
    "System",
    "ECSWorld",
    "AgentWorld",
    "WorldSimulation",
    "get_world_instance",
    "set_world_instance",
]
