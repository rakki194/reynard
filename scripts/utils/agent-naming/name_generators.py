#!/usr/bin/env python3
"""
Reynard Name Generators
=======================

Contains the core name generation logic for different naming styles
in the Reynard robot name generator.

This module provides generators for Foundation, Exo, Cyberpunk,
Mythological, Scientific, and Hybrid naming styles.
"""

import random  # nosec B311 - Used for non-cryptographic name generation

from generation_numbers import GenerationNumbers
from name_pools import AnimalSpiritPools, MythologicalReferences
from naming_conventions import (
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


class NameGenerator:
    """Base class for name generation with common functionality."""

    def __init__(self) -> None:
        self.animal_pools = AnimalSpiritPools()
        self.mythological_refs = MythologicalReferences()
        self.generation_numbers = GenerationNumbers()

    def _get_random_spirit(self) -> str:
        """Get a random animal spirit."""
        return random.choice(self.animal_pools.get_all_spirits())  # nosec B311

    def _get_random_spirit_name(self, spirit: str) -> str:
        """Get a random name for a specific spirit."""
        names = self.animal_pools.get_spirit_names(spirit)
        return random.choice(names) if names else "Unknown"  # nosec B311


class FoundationStyleGenerator(NameGenerator):
    """Generator for Foundation-style names: [Spirit] + [Suffix] + [Generation]"""

    def __init__(self) -> None:
        super().__init__()
        self.foundation_suffixes = FoundationSuffixes()

    def generate(self, spirit: str | None = None) -> str:
        """Generate Foundation-style name."""
        if not spirit:
            spirit = self._get_random_spirit()

        base_name = self._get_random_spirit_name(spirit)
        suffix = random.choice(self.foundation_suffixes.get_suffixes())  # nosec B311
        generation = random.choice(
            self.generation_numbers.get_numbers(spirit)
        )  # nosec B311

        return f"{base_name}-{suffix}-{generation}"


class ExoStyleGenerator(NameGenerator):
    """Generator for Exo-style names: [Spirit] + [Suffix] + [Model]"""

    def __init__(self) -> None:
        super().__init__()
        self.exo_suffixes = ExoSuffixes()

    def generate(self, spirit: str | None = None) -> str:
        """Generate Exo-style name."""
        if not spirit:
            spirit = self._get_random_spirit()

        base_name = self._get_random_spirit_name(spirit)
        suffix = random.choice(self.exo_suffixes.get_suffixes())  # nosec B311
        model = random.choice(self.generation_numbers.get_numbers(spirit))  # nosec B311

        return f"{base_name}-{suffix}-{model}"


class HybridStyleGenerator(NameGenerator):
    """Generator for Hybrid-style names: [Spirit] + [Reference] + [Designation]"""

    def __init__(self) -> None:
        super().__init__()
        self.special_designations = SpecialDesignations()

    def generate(self, spirit: str | None = None) -> str:
        """Generate Hybrid-style name."""
        if not spirit:
            spirit = self._get_random_spirit()

        base_name = self._get_random_spirit_name(spirit)
        reference = random.choice(self.mythological_refs.get_references())  # nosec B311
        designation = random.choice(
            self.special_designations.get_designations()
        )  # nosec B311

        return f"{base_name}-{reference}-{designation}"


class CyberpunkStyleGenerator(NameGenerator):
    """Generator for Cyberpunk-style names: [Tech Prefix] + [Animal Spirit] + [Cyber Suffix]"""

    def __init__(self) -> None:
        super().__init__()
        self.cyberpunk_prefixes = CyberpunkPrefixes()
        self.cyberpunk_suffixes = CyberpunkSuffixes()

    def generate(self, spirit: str | None = None) -> str:
        """Generate Cyberpunk-style name."""
        if not spirit:
            spirit = self._get_random_spirit()

        prefix = random.choice(self.cyberpunk_prefixes.get_prefixes())  # nosec B311
        base_name = self._get_random_spirit_name(spirit)
        suffix = random.choice(self.cyberpunk_suffixes.get_suffixes())  # nosec B311

        return f"{prefix}-{base_name}-{suffix}"


class MythologicalStyleGenerator(NameGenerator):
    """Generator for Mythological-style names: [Mythological Reference] + [Animal Spirit] + [Divine Suffix]"""

    def __init__(self) -> None:
        super().__init__()
        self.divine_suffixes = DivineSuffixes()

    def generate(self, spirit: str | None = None) -> str:
        """Generate Mythological-style name."""
        if not spirit:
            spirit = self._get_random_spirit()

        myth_ref = random.choice(self.mythological_refs.get_references())  # nosec B311
        base_name = self._get_random_spirit_name(spirit)
        divine_suffix = random.choice(self.divine_suffixes.get_suffixes())  # nosec B311

        return f"{myth_ref}-{base_name}-{divine_suffix}"


class ScientificStyleGenerator(NameGenerator):
    """Generator for Scientific-style names: [Scientific Name] + [Technical Suffix] + [Classification]"""

    def __init__(self) -> None:
        super().__init__()
        self.scientific_prefixes = ScientificPrefixes()
        self.scientific_suffixes = ScientificSuffixes()
        self.scientific_classifications = ScientificClassifications()

    def generate(self, spirit: str | None = None) -> str:
        """Generate Scientific-style name."""
        # Note: spirit parameter is kept for API consistency but not used in scientific style
        _ = spirit  # Suppress unused parameter warning

        scientific_prefix = random.choice(
            self.scientific_prefixes.get_prefixes()
        )  # nosec B311
        scientific_suffix = random.choice(
            self.scientific_suffixes.get_suffixes()
        )  # nosec B311
        classification = random.choice(
            self.scientific_classifications.get_classifications()
        )  # nosec B311

        return f"{scientific_prefix}-{scientific_suffix}-{classification}"


class RandomStyleGenerator(NameGenerator):
    """Generator that randomly selects from all available styles."""

    def __init__(self) -> None:
        super().__init__()
        self.foundation_generator = FoundationStyleGenerator()
        self.exo_generator = ExoStyleGenerator()
        self.hybrid_generator = HybridStyleGenerator()
        self.cyberpunk_generator = CyberpunkStyleGenerator()
        self.mythological_generator = MythologicalStyleGenerator()
        self.scientific_generator = ScientificStyleGenerator()

    def generate(self, spirit: str | None = None) -> str:
        """Generate a random style name."""
        generators = [
            self.foundation_generator,
            self.exo_generator,
            self.hybrid_generator,
            self.cyberpunk_generator,
            self.mythological_generator,
            self.scientific_generator,
        ]
        generator = random.choice(generators)  # nosec B311
        return generator.generate(spirit)


class BatchGenerator:
    """Generator for creating multiple unique names."""

    def __init__(self) -> None:
        self.random_generator = RandomStyleGenerator()

    def generate_batch(
        self, count: int = 10, spirit: str | None = None, style: str | None = None
    ) -> list[str]:
        """Generate multiple unique names."""
        names: set[str] = set()
        attempts = 0
        max_attempts = count * 10  # Prevent infinite loops

        # Select appropriate generator based on style
        if style == "foundation":
            generator = FoundationStyleGenerator()
        elif style == "exo":
            generator = ExoStyleGenerator()
        elif style == "hybrid":
            generator = HybridStyleGenerator()
        elif style == "cyberpunk":
            generator = CyberpunkStyleGenerator()
        elif style == "mythological":
            generator = MythologicalStyleGenerator()
        elif style == "scientific":
            generator = ScientificStyleGenerator()
        else:
            generator = self.random_generator

        while len(names) < count and attempts < max_attempts:
            attempts += 1
            name = generator.generate(spirit)
            names.add(name)

        return list(names)
