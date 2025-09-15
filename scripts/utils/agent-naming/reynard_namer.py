#!/usr/bin/env python3
"""
Reynard Robot Name Generator
============================

Main module for the Reynard robot name generator system.

This module provides a clean, unified interface to the modular Reynard
naming system, orchestrating all the different components for easy use.

Generates robot names inspired by Asimov's Foundation, Destiny's Exo, and other sci-fi universes,
but infused with diverse animal spirits and mythological references.

Naming Patterns:
- Foundation Style: [Animal Spirit] + [Tactical/Strategic Suffix] + [Generation Number]
- Exo Style: [Animal Spirit] + [Combat/Technical Suffix] + [Model Number]
- Hybrid Style: [Animal Spirit] + [Mythological/Historical Reference] + [Designation]
- Cyberpunk Style: [Tech Prefix] + [Animal Spirit] + [Cyber Suffix]
- Mythological Style: [Mythological Reference] + [Animal Spirit] + [Divine Suffix]
- Scientific Style: [Scientific Name] + [Technical Suffix] + [Classification]

Examples:
- Vulpine-Sage-13 (Fox spirit, Foundation style)
- Lupus-Guard-16 (Wolf spirit, Exo style)
- Lutra-Apollo-Prime (Otter spirit, Hybrid style)
- Cyber-Axolotl-Nexus (Cyberpunk style)
- Apollo-Falcon-Divine (Mythological style)
- Panthera-Leo-Alpha (Scientific style)
"""

from generation_numbers import GenerationNumbers
from name_analyzer import NameAnalyzer
from name_generators import (
    BatchGenerator,
    CyberpunkStyleGenerator,
    ExoStyleGenerator,
    FoundationStyleGenerator,
    HybridStyleGenerator,
    MythologicalStyleGenerator,
    RandomStyleGenerator,
    ScientificStyleGenerator,
)
from name_pools import AnimalSpiritPools, MythologicalReferences


class ReynardRobotNamer:
    """
    Main class for the Reynard robot name generator.

    Provides a unified interface to all naming functionality including
    generation, analysis, and information retrieval.
    """

    def __init__(self) -> None:
        """Initialize the Reynard name generator with all components."""
        # Core components
        self.animal_pools = AnimalSpiritPools()
        self.mythological_refs = MythologicalReferences()
        self.generation_numbers = GenerationNumbers()
        self.name_analyzer = NameAnalyzer()

        # Generators
        self.foundation_generator = FoundationStyleGenerator()
        self.exo_generator = ExoStyleGenerator()
        self.hybrid_generator = HybridStyleGenerator()
        self.cyberpunk_generator = CyberpunkStyleGenerator()
        self.mythological_generator = MythologicalStyleGenerator()
        self.scientific_generator = ScientificStyleGenerator()
        self.random_generator = RandomStyleGenerator()
        self.batch_generator = BatchGenerator()

    # Generation Methods
    def generate_foundation_style(self, spirit: str | None = None) -> str:
        """Generate Foundation-style names: [Spirit] + [Suffix] + [Generation]"""
        return self.foundation_generator.generate(spirit)

    def generate_exo_style(self, spirit: str | None = None) -> str:
        """Generate Exo-style names: [Spirit] + [Suffix] + [Model]"""
        return self.exo_generator.generate(spirit)

    def generate_hybrid_style(self, spirit: str | None = None) -> str:
        """Generate Hybrid-style names: [Spirit] + [Reference] + [Designation]"""
        return self.hybrid_generator.generate(spirit)

    def generate_cyberpunk_style(self, spirit: str | None = None) -> str:
        """Generate Cyberpunk-style names: [Tech Prefix] + [Animal Spirit] + [Cyber Suffix]"""
        return self.cyberpunk_generator.generate(spirit)

    def generate_mythological_style(self, spirit: str | None = None) -> str:
        """Generate Mythological-style names: [Mythological Reference] + [Animal Spirit] + [Divine Suffix]"""
        return self.mythological_generator.generate(spirit)

    def generate_scientific_style(self, spirit: str | None = None) -> str:
        """Generate Scientific-style names: [Scientific Name] + [Technical Suffix] + [Classification]"""
        return self.scientific_generator.generate(spirit)

    def generate_random(self, spirit: str | None = None) -> str:
        """Generate a random style name."""
        return self.random_generator.generate(spirit)

    def generate_batch(
        self, count: int = 10, spirit: str | None = None, style: str | None = None
    ) -> list[str]:
        """Generate multiple unique names."""
        return self.batch_generator.generate_batch(count, spirit, style)

    # Analysis Methods
    def get_spirit_info(self, name: str) -> dict[str, str | list[str]]:
        """Analyze a generated name to extract spirit information."""
        return self.name_analyzer.get_spirit_info(name)

    def analyze_name_breakdown(self, name: str) -> dict[str, str | list[str]]:
        """Provide detailed breakdown of name components."""
        return self.name_analyzer.analyze_name_breakdown(name)

    def validate_name_format(self, name: str) -> dict[str, bool | str]:
        """Validate if a name follows expected naming conventions."""
        return self.name_analyzer.validate_name_format(name)

    # Information Methods
    def get_available_spirits(self) -> list[str]:
        """Get list of all available animal spirits."""
        return self.animal_pools.get_all_spirits()

    def get_available_styles(self) -> list[str]:
        """Get list of all available naming styles."""
        return self.name_analyzer.get_available_styles()

    def get_spirit_names(self, spirit: str) -> list[str]:
        """Get all names available for a specific animal spirit."""
        return self.animal_pools.get_spirit_names(spirit)

    def get_spirit_count(self, spirit: str) -> int:
        """Get the number of names available for a spirit."""
        return self.animal_pools.get_spirit_count(spirit)

    def get_generation_numbers(self, spirit: str) -> list[int]:
        """Get generation numbers for a specific animal spirit."""
        return self.generation_numbers.get_numbers(spirit)

    def get_spirit_significance(self, spirit: str) -> str:
        """Get the significance explanation for a spirit's numbers."""
        return self.generation_numbers.get_spirit_significance(spirit)

    def get_mythological_references(self) -> list[str]:
        """Get all mythological references."""
        return self.mythological_refs.get_references()

    def get_mythological_count(self) -> int:
        """Get the number of mythological references."""
        return self.mythological_refs.get_reference_count()

    # Statistics Methods
    def get_total_spirit_names(self) -> int:
        """Get total number of animal spirit names across all spirits."""
        total = 0
        for spirit in self.get_available_spirits():
            total += self.get_spirit_count(spirit)
        return total

    def get_spirit_statistics(self) -> dict[str, int]:
        """Get statistics for all animal spirits."""
        stats = {}
        for spirit in self.get_available_spirits():
            stats[spirit] = self.get_spirit_count(spirit)
        return stats

    def get_system_statistics(self) -> dict[str, int | list[str]]:
        """Get comprehensive system statistics."""
        return {
            "total_spirits": len(self.get_available_spirits()),
            "total_spirit_names": self.get_total_spirit_names(),
            "total_mythological_references": self.get_mythological_count(),
            "available_styles": len(self.get_available_styles()),
            "spirits": self.get_available_spirits(),
            "styles": self.get_available_styles(),
        }


# Convenience functions for direct module usage
def generate_name(spirit: str | None = None, style: str | None = None) -> str:
    """Generate a single name with optional spirit and style constraints."""
    namer = ReynardRobotNamer()

    # Define style generation methods
    style_generators = {
        "foundation": namer.generate_foundation_style,
        "exo": namer.generate_exo_style,
        "hybrid": namer.generate_hybrid_style,
        "cyberpunk": namer.generate_cyberpunk_style,
        "mythological": namer.generate_mythological_style,
        "scientific": namer.generate_scientific_style,
    }

    # Generate name based on style or random if no style specified
    if style and style in style_generators:
        return style_generators[style](spirit)

    return namer.generate_random(spirit)


def generate_names(
    count: int = 10, spirit: str | None = None, style: str | None = None
) -> list[str]:
    """Generate multiple names with optional constraints."""
    namer = ReynardRobotNamer()
    return namer.generate_batch(count, spirit, style)


def analyze_name(name: str) -> dict[str, str | list[str]]:
    """Analyze a name to extract spirit and style information."""
    namer = ReynardRobotNamer()
    return namer.get_spirit_info(name)


def get_system_info() -> dict[str, int | list[str]]:
    """Get comprehensive system information."""
    namer = ReynardRobotNamer()
    return namer.get_system_statistics()
