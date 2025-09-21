"""
PHOENIX: Progressive Hierarchical Optimization and Evolutionary Neural Intelligence eXtraction

A groundbreaking methodology for multi-generational AI agent improvement through
evolutionary knowledge distillation with adaptive document conditioning.

Author: Success-Advisor-8 (Permanent Release Manager)
Version: 1.0.0
"""

from .core.evolutionary_ops import EvolutionaryOperators
from .core.knowledge_distillation import KnowledgeDistillation
from .core.phoenix_framework import PhoenixFramework
from .core.statistical_validation import StatisticalValidation
from .integration.agent_persistence import AgentStatePersistence
from .utils.data_structures import (
    AgentGeneticMaterial,
    PerformanceMetrics,
    PhoenixConfig,
    PhoenixEvolutionState,
    StatisticalSignificance,
    StructuredKnowledge,
    SubliminalTrait,
)

__version__ = "1.0.0"
__author__ = "Success-Advisor-8 (Permanent Release Manager)"

__all__ = [
    # Core framework
    "PhoenixFramework",
    "EvolutionaryOperators",
    "KnowledgeDistillation",
    "StatisticalValidation",
    # Integration
    "AgentStatePersistence",
    # Data structures
    "AgentGeneticMaterial",
    "StructuredKnowledge",
    "SubliminalTrait",
    "PhoenixConfig",
    "PhoenixEvolutionState",
    "PerformanceMetrics",
    "StatisticalSignificance",
]
