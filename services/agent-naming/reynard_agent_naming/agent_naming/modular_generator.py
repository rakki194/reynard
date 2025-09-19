"""
Modular Agent Name Generator
===========================

Main generator that orchestrates all the specialized naming generators.
Provides a unified interface for generating names using the modular architecture
with shared components and unique generators for each naming style.
"""

import random  # nosec B311 - Used for non-cryptographic name generation
from typing import Any

from .generators import (
    AlternativeNamingGenerator,
    AnimalSpiritGenerator,
    CyberpunkGenerator,
    DestinyGenerator,
    ExoGenerator,
    FoundationGenerator,
    HybridGenerator,
    MythologicalGenerator,
    ScientificGenerator,
)
from .naming_utilities import NameValidator, NamingDataLoader, SpiritAnalyzer
from .types import AgentName, AnimalSpirit, NamingConfig, NamingScheme, NamingStyle


class ModularAgentNamer:
    """Main generator that orchestrates all specialized naming generators."""

    def __init__(self) -> None:
        """Initialize the modular agent namer."""
        # Initialize all specialized generators
        self.animal_spirit_generator = AnimalSpiritGenerator()
        self.foundation_generator = FoundationGenerator()
        self.exo_generator = ExoGenerator()
        self.cyberpunk_generator = CyberpunkGenerator()
        self.destiny_generator = DestinyGenerator()
        self.mythological_generator = MythologicalGenerator()
        self.scientific_generator = ScientificGenerator()
        self.hybrid_generator = HybridGenerator()
        self.alternative_generator = AlternativeNamingGenerator()

        # Initialize shared components
        self.data_loader = NamingDataLoader()
        self.name_validator = NameValidator()
        self.spirit_analyzer = SpiritAnalyzer(self.data_loader)

    def generate_single_name(self, config: NamingConfig) -> AgentName:
        """Generate a single name based on configuration."""
        try:
            # Check if using alternative naming scheme
            if config.scheme != NamingScheme.ANIMAL_SPIRIT:
                return self.alternative_generator.generate_name(config)

            # Use animal spirit scheme with specific style generators
            return self._generate_animal_spirit_name(config)

        except Exception:
            # Fallback to simple name
            return self._create_fallback_name()

    def _generate_animal_spirit_name(self, config: NamingConfig) -> AgentName:
        """Generate name using animal spirit scheme."""
        style_generators = {
            NamingStyle.FOUNDATION: lambda: self.foundation_generator.generate_foundation_name(
                config.spirit, use_spirit=True
            ),
            NamingStyle.EXO: lambda: self.exo_generator.generate_exo_name(
                config.spirit, use_spirit=True
            ),
            NamingStyle.CYBERPUNK: lambda: self.cyberpunk_generator.generate_cyberpunk_name(
                config.spirit, use_spirit=True
            ),
            NamingStyle.MYTHOLOGICAL: lambda: self.mythological_generator.generate_mythological_name(
                config.spirit, use_spirit=True
            ),
            NamingStyle.SCIENTIFIC: lambda: self.scientific_generator.generate_scientific_name(
                config.spirit, use_spirit=True
            ),
            NamingStyle.HYBRID: lambda: self.hybrid_generator.generate_hybrid_name(
                config.spirit, use_spirit=True
            ),
            NamingStyle.DESTINY: lambda: self.destiny_generator.generate_destiny_name(
                config.spirit, use_spirit=True
            ),
        }

        if config.style in style_generators:
            return style_generators[config.style]()

        # Random style selection
        return self.animal_spirit_generator.generate_random_spirit_name(config.spirit)

    def _create_fallback_name(self) -> AgentName:
        """Create a fallback name when generation fails."""
        return AgentName(
            name=f"Agent-{random.randint(1, 9999)}",  # nosec B311
            spirit=AnimalSpirit.FOX,
            style=NamingStyle.FOUNDATION,
            components=["Agent"],
        )

    def generate_batch(self, config: NamingConfig) -> list[AgentName]:
        """Generate multiple unique names."""
        names: set[str] = set()
        results: list[AgentName] = []
        attempts = 0
        max_attempts = max(config.count * 20, 100)

        while len(results) < config.count and attempts < max_attempts:
            attempts += 1
            agent_name = self.generate_single_name(config)

            if (
                self.name_validator.is_valid_name(agent_name.name)
                and agent_name.name not in names
                and agent_name.name.strip()
            ):
                names.add(agent_name.name)
                results.append(agent_name)

        # If we couldn't generate enough unique names, add fallback names
        while len(results) < config.count:
            fallback_name = f"Agent-{len(results) + 1}"
            if fallback_name not in names:
                names.add(fallback_name)
                results.append(
                    AgentName(
                        name=fallback_name,
                        spirit=AnimalSpirit.FOX,
                        style=NamingStyle.FOUNDATION,
                        components=["Agent"],
                    )
                )

        return results

    def generate_style_batch(
        self, style: NamingStyle, count: int = 5, spirit: AnimalSpirit | None = None
    ) -> list[AgentName]:
        """Generate a batch of names for a specific style."""
        batch_generators = {
            NamingStyle.FOUNDATION: lambda: self.foundation_generator.generate_foundation_batch(count),
            NamingStyle.EXO: lambda: self.exo_generator.generate_exo_batch(count),
            NamingStyle.CYBERPUNK: lambda: self.cyberpunk_generator.generate_cyberpunk_batch(count),
            NamingStyle.MYTHOLOGICAL: lambda: self.mythological_generator.generate_mythological_batch(count),
            NamingStyle.SCIENTIFIC: lambda: self.scientific_generator.generate_scientific_batch(count),
            NamingStyle.HYBRID: lambda: self.hybrid_generator.generate_hybrid_batch(count),
            NamingStyle.DESTINY: lambda: self.destiny_generator.generate_destiny_batch(count),
        }

        if style in batch_generators:
            return batch_generators[style]()

        # Fallback to animal spirit generator
        return self._generate_animal_spirit_batch(count, spirit, style)

    def _generate_animal_spirit_batch(
        self, count: int, spirit: AnimalSpirit | None, style: NamingStyle
    ) -> list[AgentName]:
        """Generate batch using animal spirit generator."""
        results = []
        for _ in range(count):
            if spirit:
                name = self.animal_spirit_generator.generate_spirit_name(spirit, style)
            else:
                name = self.animal_spirit_generator.generate_random_spirit_name()
            results.append(name)
        return results

    def get_spirit_info(self, name: str) -> dict[str, str]:
        """Analyze a generated name to extract spirit information."""
        return self.spirit_analyzer.analyze_name(name)

    def validate_name(self, name: str) -> bool:
        """Validate a generated name."""
        return self.name_validator.is_valid_name(name)

    def sanitize_name(self, name: str) -> str:
        """Sanitize a generated name."""
        return self.name_validator.sanitize_name(name)

    def ensure_name_uniqueness(self, names: list[str], new_name: str) -> str:
        """Ensure a name is unique within a list."""
        return self.name_validator.ensure_uniqueness(names, new_name)

    def get_available_styles(self) -> list[NamingStyle]:
        """Get list of available naming styles."""
        return list(NamingStyle)

    def get_available_spirits(self) -> list[AnimalSpirit]:
        """Get list of available animal spirits."""
        return list(AnimalSpirit)

    def get_available_schemes(self) -> list[NamingScheme]:
        """Get list of available naming schemes."""
        return list(NamingScheme)

    def generate_random_style_name(
        self, spirit: AnimalSpirit | None = None
    ) -> AgentName:
        """Generate a name with a random style."""
        if not spirit:
            spirit = AnimalSpirit(random.choice(list(AnimalSpirit)))  # nosec B311

        style = NamingStyle(random.choice(list(NamingStyle)))  # nosec B311
        return self.animal_spirit_generator.generate_spirit_name(spirit, style)

    def generate_random_scheme_name(self) -> AgentName:
        """Generate a name with a random scheme."""
        scheme = NamingScheme(random.choice(list(NamingScheme)))  # nosec B311
        config = NamingConfig(scheme=scheme, count=1)
        return self.generate_single_name(config)

    def get_generator_info(self) -> dict[str, Any]:
        """Get information about the modular generator system."""
        return {
            "generator_type": "ModularAgentNamer",
            "available_generators": [
                "AnimalSpiritGenerator",
                "FoundationGenerator",
                "ExoGenerator",
                "CyberpunkGenerator",
                "DestinyGenerator",
                "MythologicalGenerator",
                "ScientificGenerator",
                "HybridGenerator",
                "AlternativeNamingGenerator",
            ],
            "shared_components": [
                "NamingDataLoader",
                "NameBuilder",
                "RandomSelector",
                "NameValidator",
                "SpiritAnalyzer",
            ],
            "total_styles": len(NamingStyle),
            "total_spirits": len(AnimalSpirit),
            "total_schemes": len(NamingScheme),
        }
