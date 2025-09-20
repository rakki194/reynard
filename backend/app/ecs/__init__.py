"""
ECS World Integration for FastAPI Backend

Provides ECS world integration as a singleton service for the Reynard backend.
"""

from .config import ECSConfig
from .service import ECSWorldService, get_ecs_world

# Core ECS components
from .core import Component, Entity, System, ECSWorld

# ECS Components
from .components import (
    AgentComponent,
    PositionComponent,
    LifecycleComponent,
    LineageComponent,
    ReproductionComponent,
    TraitComponent,
    SocialComponent,
    GenderComponent,
    MemoryComponent,
    KnowledgeComponent,
    InteractionComponent
)

# ECS Systems
from .systems import (
    MemorySystem,
    LearningSystem,
    InteractionSystem,
    SocialSystem,
    GenderSystem
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
    "AgentWorld"
]
