"""ECS World Integration for FastAPI Backend

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
    TaskPriority,
    TaskQueueComponent,
    TaskRequestComponent,
    TaskResultComponent,
    TaskStatus,
    TaskType,
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
from .systems.task_queue_system import TaskQueueSystem

# ECS World
from .world import AgentWorld

__all__ = [
    "AgentComponent",
    "AgentWorld",
    "Component",
    "ECSConfig",
    "ECSWorld",
    "ECSWorldService",
    "Entity",
    "GenderComponent",
    "GenderSystem",
    "InteractionComponent",
    "InteractionSystem",
    "KnowledgeComponent",
    "LearningSystem",
    "LifecycleComponent",
    "LineageComponent",
    "MemoryComponent",
    "MemorySystem",
    "PositionComponent",
    "ReproductionComponent",
    "SocialComponent",
    "SocialSystem",
    "System",
    "TaskPriority",
    "TaskQueueComponent",
    "TaskQueueSystem",
    "TaskRequestComponent",
    "TaskResultComponent",
    "TaskStatus",
    "TaskType",
    "TraitComponent",
    "get_ecs_world",
]
