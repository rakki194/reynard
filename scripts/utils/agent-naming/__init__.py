#!/usr/bin/env python3
"""
Reynard Agent Naming Package
============================

A modular robot name generator inspired by Asimov's Foundation, Destiny's Exo,
and other sci-fi universes, infused with diverse animal spirits and mythological references.

This package provides a clean, modular architecture for generating robot names
with various animal spirit themes and naming styles.

Main Components:
- ReynardRobotNamer: Main class for name generation and analysis
- Name generators for different styles (Foundation, Exo, Cyberpunk, etc.)
- Name pools with extensive animal spirit collections
- Name analyzer for reverse-engineering name components
- CLI interface for command-line usage

Quick Start:
    from reynard_naming import ReynardRobotNamer

    namer = ReynardRobotNamer()
    name = namer.generate_foundation_style("fox")
    print(name)  # e.g., "Vulpine-Sage-13"

    # Or use convenience functions
    from reynard_naming import generate_name, generate_names

    name = generate_name("wolf", "exo")
    names = generate_names(5, "otter", "cyberpunk")
"""

from .generation_numbers import GenerationNumbers
from .name_analyzer import NameAnalyzer
from .name_generators import (
    BatchGenerator,
    CyberpunkStyleGenerator,
    ExoStyleGenerator,
    FoundationStyleGenerator,
    HybridStyleGenerator,
    MythologicalStyleGenerator,
    RandomStyleGenerator,
    ScientificStyleGenerator,
)
from .name_pools import AnimalSpiritPools, MythologicalReferences
from .naming_conventions import (
    CyberpunkPrefixes,
    CyberpunkSuffixes,
    DivineSuffixes,
    ExoSuffixes,
    FoundationSuffixes,
    ScientificClassifications,
    ScientificPrefixes,
    ScientificSuffixes,
    SpecialDesignations,
)
from .reynard_namer import (
    ReynardRobotNamer,
    analyze_name,
    generate_name,
    generate_names,
    get_system_info,
)

# Import inheritance system modules
try:
    from .agent_lineage import LineageManager
    from .agent_traits import AgentTraits
    from .enhanced_agent_manager import EnhancedAgentManager
    from .inherited_name_generator import InheritedNameGenerator

    INHERITANCE_AVAILABLE = True
except ImportError:
    INHERITANCE_AVAILABLE = False

__version__ = "2.0.0"
__author__ = "Reynard Development Team"
__description__ = "Modular robot name generator with animal spirit themes"

__all__ = [
    # Main interface
    "ReynardRobotNamer",
    "generate_name",
    "generate_names",
    "analyze_name",
    "get_system_info",
    # Generators
    "FoundationStyleGenerator",
    "ExoStyleGenerator",
    "HybridStyleGenerator",
    "CyberpunkStyleGenerator",
    "MythologicalStyleGenerator",
    "ScientificStyleGenerator",
    "RandomStyleGenerator",
    "BatchGenerator",
    # Analysis
    "NameAnalyzer",
    # Data pools
    "AnimalSpiritPools",
    "MythologicalReferences",
    # Naming conventions
    "FoundationSuffixes",
    "ExoSuffixes",
    "CyberpunkPrefixes",
    "CyberpunkSuffixes",
    "ScientificPrefixes",
    "ScientificSuffixes",
    "SpecialDesignations",
    "DivineSuffixes",
    "ScientificClassifications",
    # Generation numbers
    "GenerationNumbers",
    # Inheritance system
    "INHERITANCE_AVAILABLE",
]

# Add inheritance modules to __all__ if available
if INHERITANCE_AVAILABLE:
    __all__.extend(
        [
            "AgentTraits",
            "EnhancedAgentManager",
            "InheritedNameGenerator",
            "LineageManager",
        ]
    )
