"""
ECS World Integration for FastAPI Backend

Provides ECS world integration as a singleton service for the Reynard backend.
"""

# ECS Components
from .components import (
    AgentComponent,
    GenderComponent,
    InteractionComponent,
    KnowledgeComponent,
    LifecycleComponent,
    LineageComponent,
    MemoryComponent,
    PositionComponent,
    ReproductionComponent,
    SocialComponent,
    TraitComponent,
)
from .config import ECSConfig

# Core ECS components
from .core import Component, ECSWorld, Entity, System
from .service import ECSWorldService, get_ecs_world

# ECS Systems
from .systems import (
    GenderSystem,
    InteractionSystem,
    LearningSystem,
    MemorySystem,
    SocialSystem,
)

# ECS World
from .world import AgentWorld

__all__ = [
    "ECSConfig",
    "ECSWorldService",
    "get_ecs_world",
    "Component",
    "Entity",
    "System",
    "ECSWorld",
    "AgentComponent",
    "PositionComponent",
    "LifecycleComponent",
    "LineageComponent",
    "ReproductionComponent",
    "TraitComponent",
    "SocialComponent",
    "GenderComponent",
    "MemoryComponent",
    "KnowledgeComponent",
    "InteractionComponent",
    "MemorySystem",
    "LearningSystem",
    "InteractionSystem",
    "SocialSystem",
    "GenderSystem",
    "AgentWorld",
]
