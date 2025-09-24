"""ECS Components Module

Component definitions for the Reynard agent system.
Each component represents a specific aspect of agent data.
"""

from .agent import AgentComponent
from .gender import (
    GenderComponent,
    GenderExpression,
    GenderIdentity,
    GenderProfile,
    PronounSet,
    PronounType,
)
from .interaction import (
    CommunicationStyle,
    Interaction,
    InteractionComponent,
    InteractionOutcome,
    InteractionType,
    Relationship,
)
from .knowledge import (
    Knowledge,
    KnowledgeComponent,
    KnowledgeLevel,
    KnowledgeType,
    LearningMethod,
    LearningOpportunity,
)
from .lifecycle import LifecycleComponent
from .lineage import LineageComponent
from .memory import Memory, MemoryComponent, MemoryType
from .position import PositionComponent
from .reproduction import ReproductionComponent
from .social import (
    GroupType,
    SocialComponent,
    SocialConnection,
    SocialGroup,
    SocialRole,
    SocialStatus,
)
from .traits import TraitComponent

__all__ = [
    "AgentComponent",
    "CommunicationStyle",
    "GenderComponent",
    "GenderExpression",
    "GenderIdentity",
    "GenderProfile",
    "GroupType",
    "Interaction",
    "InteractionComponent",
    "InteractionOutcome",
    "InteractionType",
    "Knowledge",
    "KnowledgeComponent",
    "KnowledgeLevel",
    "KnowledgeType",
    "LearningMethod",
    "LearningOpportunity",
    "LifecycleComponent",
    "LineageComponent",
    "Memory",
    "MemoryComponent",
    "MemoryType",
    "PositionComponent",
    "PronounSet",
    "PronounType",
    "Relationship",
    "ReproductionComponent",
    "SocialComponent",
    "SocialConnection",
    "SocialGroup",
    "SocialRole",
    "SocialStatus",
    "TraitComponent",
]
