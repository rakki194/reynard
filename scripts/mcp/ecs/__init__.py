#!/usr/bin/env python3
"""
Reynard ECS Agent System
========================

Entity Component System for managing agents, offspring, and inheritance.
This module provides a modular, organized approach to agent lifecycle management.

Follows the 140-line axiom and modular architecture principles.
"""

from .components import (
    AgentComponent,
    LifecycleComponent,
    LineageComponent,
    ReproductionComponent,
    TraitComponent,
)
from .core import Component, ECSWorld, Entity, System
from .systems import LifecycleSystem, ReproductionSystem
from .world import AgentWorld

__all__ = [
    "Entity",
    "Component",
    "System",
    "ECSWorld",
    "AgentComponent",
    "TraitComponent",
    "LineageComponent",
    "LifecycleComponent",
    "ReproductionComponent",
    "ReproductionSystem",
    "LifecycleSystem",
    "AgentWorld",
]
