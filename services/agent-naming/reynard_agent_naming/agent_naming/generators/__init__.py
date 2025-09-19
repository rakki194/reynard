"""
Generator Package
================

Contains all specialized name generators for the agent naming system.
Each generator handles a specific naming style or scheme.
"""

from .alternative_generator import AlternativeNamingGenerator
from .animal_spirit_generator import AnimalSpiritGenerator
from .cyberpunk_generator import CyberpunkGenerator
from .destiny_generator import DestinyGenerator
from .exo_generator import ExoGenerator
from .foundation_generator import FoundationGenerator
from .hybrid_generator import HybridGenerator
from .mythological_generator import MythologicalGenerator
from .scientific_generator import ScientificGenerator

__all__ = [
    "AlternativeNamingGenerator",
    "AnimalSpiritGenerator",
    "CyberpunkGenerator",
    "DestinyGenerator",
    "ExoGenerator",
    "FoundationGenerator",
    "HybridGenerator",
    "MythologicalGenerator",
    "ScientificGenerator",
]
