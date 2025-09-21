"""
Enhanced Humility Detector - Core Module
Part of the Reynard project's commitment to humble communication.

This module provides the core components for advanced humility detection
using state-of-the-art NLP, machine learning, and psychological research.
"""

from .detector import HumilityDetector
from .models import HumilityFinding, SeverityLevel, ConfidenceLevel, DetectionCategory
from .config import HumilityConfig

__all__ = [
    "HumilityDetector",
    "HumilityFinding",
    "SeverityLevel",
    "ConfidenceLevel",
    "DetectionCategory",
    "HumilityConfig",
]
