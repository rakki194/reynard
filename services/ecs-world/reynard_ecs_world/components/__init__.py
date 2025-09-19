"""
ECS Components Module

Component definitions for the Reynard agent system.
Each component represents a specific aspect of agent data.
"""

from .agent import AgentComponent
from .interaction import (
    InteractionComponent,
    Interaction,
    InteractionType,
    InteractionOutcome,
    CommunicationStyle,
    Relationship,
)
from .knowledge import (
    KnowledgeComponent,
    Knowledge,
    KnowledgeType,
    LearningMethod,
    KnowledgeLevel,
    LearningOpportunity,
)
from .lifecycle import LifecycleComponent
from .lineage import LineageComponent
from .memory import MemoryComponent, Memory, MemoryType
from .position import PositionComponent
from .reproduction import ReproductionComponent
from .social import (
    SocialComponent,
    SocialGroup,
    SocialConnection,
    SocialRole,
    SocialStatus,
    GroupType,
)
from .traits import TraitComponent

__all__ = [
    "AgentComponent",
    "InteractionComponent",
    "Interaction",
    "InteractionType",
    "InteractionOutcome",
    "CommunicationStyle",
    "Relationship",
    "KnowledgeComponent",
    "Knowledge",
    "KnowledgeType",
    "LearningMethod",
    "KnowledgeLevel",
    "LearningOpportunity",
    "LifecycleComponent",
    "LineageComponent",
    "MemoryComponent",
    "Memory",
    "MemoryType",
    "PositionComponent",
    "ReproductionComponent",
    "SocialComponent",
    "SocialGroup",
    "SocialConnection",
    "SocialRole",
    "SocialStatus",
    "GroupType",
    "TraitComponent",
]
