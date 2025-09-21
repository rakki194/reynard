"""
PHOENIX Core Module

Core components of the PHOENIX evolutionary knowledge distillation framework.

Author: Success-Advisor-8 (Permanent Release Manager)
Version: 1.0.0
"""

from .phoenix_framework import PhoenixFramework
from .evolutionary_ops import EvolutionaryOperators
from .knowledge_distillation import KnowledgeDistillation
from .statistical_validation import StatisticalValidation

__all__ = [
    "PhoenixFramework",
    "EvolutionaryOperators",
    "KnowledgeDistillation",
    "StatisticalValidation",
]
