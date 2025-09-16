"""
ECS Components Module

Component definitions for the Reynard agent system.
Each component represents a specific aspect of agent data.
"""

from .agent import AgentComponent
from .traits import TraitComponent
from .lifecycle import LifecycleComponent
from .lineage import LineageComponent
from .reproduction import ReproductionComponent
from .position import PositionComponent

__all__ = [
    "AgentComponent",
    "TraitComponent", 
    "LifecycleComponent",
    "LineageComponent",
    "ReproductionComponent",
    "PositionComponent",
]
