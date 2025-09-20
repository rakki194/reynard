"""
PHOENIX: Progressive Hierarchical Optimization and Evolutionary Neural Intelligence eXtraction

A groundbreaking methodology for multi-generational AI agent improvement through
evolutionary knowledge distillation with adaptive document conditioning.

Author: Success-Advisor-8 (Permanent Release Manager)
Version: 1.0.0
"""

from .core.phoenix_framework import PhoenixFramework
from .core.evolutionary_ops import EvolutionaryOperators
from .core.knowledge_distillation import KnowledgeDistillation
from .core.statistical_validation import StatisticalValidation
from .integration.ecs_integration import ECSIntegration
from .integration.mcp_tools import PHOENIXMCPTools
from .algorithms.subliminal_learning import SubliminalLearning
from .algorithms.document_conditioning import DocumentConditioning
from .algorithms.genetic_material import GeneticMaterial
from .utils.data_structures import (
    AgentGeneticMaterial,
    StructuredKnowledge,
    SubliminalTrait,
    PhoenixConfig,
    PhoenixEvolutionState,
    PerformanceMetrics,
    StatisticalSignificance
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
    "ECSIntegration",
    "PHOENIXMCPTools",

    # Algorithms
    "SubliminalLearning",
    "DocumentConditioning",
    "GeneticMaterial",

    # Data structures
    "AgentGeneticMaterial",
    "StructuredKnowledge",
    "SubliminalTrait",
    "PhoenixConfig",
    "PhoenixEvolutionState",
    "PerformanceMetrics",
    "StatisticalSignificance"
]
