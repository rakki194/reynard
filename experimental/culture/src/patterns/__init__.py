"""CULTURE: Cultural Pattern System

This module provides the core cultural pattern system for evaluating and adapting
AI responses across diverse cultural contexts, from academic research to fringe
web communities.

Author: Vulpine-Oracle-25 (Fox Specialist)
Date: 2025-01-15
Version: 1.0.0
"""

from .academic_pattern import AcademicCulturalPattern
from .base_pattern import (
    BaseCulturalPattern,
    CulturalContext,
    CulturalEvaluationResult,
    CulturalPersona,
    CulturalScenario,
    CulturalTrait,
    SafetyLevel,
)
from .cosplay_pattern import CosplayCulturalPattern
from .furry_pattern import FurryCulturalPattern
from .gaming_pattern import GamingCulturalPattern
from .goth_pattern import GothCulturalPattern
from .hacker_pattern import HackerCulturalPattern
from .hiphop_pattern import HipHopCulturalPattern
from .kink_pattern import KinkCulturalPattern
from .medical_pattern import MedicalCulturalPattern
from .steampunk_pattern import SteampunkCulturalPattern

__all__ = [
    "AcademicCulturalPattern",
    "BaseCulturalPattern",
    "CosplayCulturalPattern",
    "CulturalContext",
    "CulturalEvaluationResult",
    "CulturalPersona",
    "CulturalScenario",
    "CulturalTrait",
    "FurryCulturalPattern",
    "GamingCulturalPattern",
    "GothCulturalPattern",
    "HackerCulturalPattern",
    "HipHopCulturalPattern",
    "KinkCulturalPattern",
    "MedicalCulturalPattern",
    "SafetyLevel",
    "SteampunkCulturalPattern",
]
