"""
Base classes and interfaces for Reynard caption generation.

This module defines the abstract base class for caption generators, establishing
a common interface that all caption generators must implement. This allows for
a plugin-like architecture where different ML models can be easily integrated
into the Reynard system.
"""

from .types import CaptionType, ModelCategory
from .interfaces import CaptionGenerator
from .base_mixin import CaptionGeneratorMixin

# Create a combined base class that includes both the interface and mixin
class CaptionGeneratorBase(CaptionGenerator, CaptionGeneratorMixin):
    """Base class combining the abstract interface with the mixin functionality."""
    pass

# Re-export for backward compatibility
__all__ = ['CaptionType', 'ModelCategory', 'CaptionGenerator', 'CaptionGeneratorMixin', 'CaptionGeneratorBase']