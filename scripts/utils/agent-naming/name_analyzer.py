#!/usr/bin/env python3
"""
Reynard Name Analyzer
=====================

Contains logic for analyzing generated names to extract spirit information,
naming style, and component breakdown.

This module provides functionality to reverse-engineer name components
and identify the animal spirit and style used in generation.
"""

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


class NameAnalyzer:
    """Analyzes generated names to extract spirit and style information."""

    # Validation constants
    MIN_NAME_LENGTH = 5
    MAX_NAME_LENGTH = 50
    MIN_HYPHEN_COUNT = 1
    MAX_HYPHEN_COUNT = 3

    def __init__(self) -> None:
        self.animal_pools = AnimalSpiritPools()
        self.mythological_refs = MythologicalReferences()
        self.foundation_suffixes = FoundationSuffixes()
        self.exo_suffixes = ExoSuffixes()
        self.cyberpunk_prefixes = CyberpunkPrefixes()
        self.cyberpunk_suffixes = CyberpunkSuffixes()
        self.scientific_prefixes = ScientificPrefixes()
        self.scientific_suffixes = ScientificSuffixes()
        self.special_designations = SpecialDesignations()
        self.divine_suffixes = DivineSuffixes()
        self.scientific_classifications = ScientificClassifications()

    def _detect_spirit(self, name: str) -> tuple[str, list[str]]:
        """Detect animal spirit from name components."""
        components = []
        name_lower = name.lower()

        for spirit, bases in self.animal_pools.animal_spirits.items():
            for base in bases:
                if base.lower() in name_lower:
                    components.append(f"Base: {base}")
                    return spirit, components
        return "unknown", components

    def _detect_style(self, name: str) -> str:
        """Detect naming style from name components."""
        name_lower = name.lower()

        # Define style detection rules with priority order
        style_checks = [
            # Foundation style (highest priority)
            (
                "foundation",
                lambda: any(
                    suffix.lower() in name_lower
                    for suffix in self.foundation_suffixes.get_suffixes()
                ),
            ),
            # Exo style
            (
                "exo",
                lambda: any(
                    suffix.lower() in name_lower
                    for suffix in self.exo_suffixes.get_suffixes()
                ),
            ),
            # Mythological style (requires both mythological refs AND divine suffixes)
            (
                "mythological",
                lambda: (
                    any(
                        ref.lower() in name_lower
                        for ref in self.mythological_refs.get_references()
                    )
                    and any(
                        suffix.lower() in name_lower
                        for suffix in self.divine_suffixes.get_suffixes()
                    )
                ),
            ),
            # Cyberpunk style
            (
                "cyberpunk",
                lambda: (
                    any(
                        prefix.lower() in name_lower
                        for prefix in self.cyberpunk_prefixes.get_prefixes()
                    )
                    or any(
                        suffix.lower() in name_lower
                        for suffix in self.cyberpunk_suffixes.get_suffixes()
                    )
                ),
            ),
            # Hybrid style (mythological refs without divine suffixes)
            (
                "hybrid",
                lambda: any(
                    ref.lower() in name_lower
                    for ref in self.mythological_refs.get_references()
                ),
            ),
            # Scientific style (lowest priority)
            (
                "scientific",
                lambda: (
                    any(
                        prefix.lower() in name_lower
                        for prefix in self.scientific_prefixes.get_prefixes()
                    )
                    or any(
                        suffix.lower() in name_lower
                        for suffix in self.scientific_suffixes.get_suffixes()
                    )
                    or any(
                        classification.lower() in name_lower
                        for classification in self.scientific_classifications.get_classifications()
                    )
                ),
            ),
        ]

        # Check each style in priority order
        for style_name, check_function in style_checks:
            if check_function():
                return style_name

        return "unknown"

    def _extract_animal_components(self, name_lower: str) -> list[str]:
        """Extract animal spirit base components."""
        components = []
        components.extend(
            f"Base: {base}"
            for bases in self.animal_pools.animal_spirits.values()
            for base in bases
            if base.lower() in name_lower
        )
        return components

    def _extract_mythological_components(self, name_lower: str) -> list[str]:
        """Extract mythological reference components."""
        return [
            f"Mythological: {ref}"
            for ref in self.mythological_refs.get_references()
            if ref.lower() in name_lower
        ]

    def _extract_foundation_components(self, name_lower: str) -> list[str]:
        """Extract Foundation style components."""
        return [
            f"Foundation Suffix: {suffix}"
            for suffix in self.foundation_suffixes.get_suffixes()
            if suffix.lower() in name_lower
        ]

    def _extract_exo_components(self, name_lower: str) -> list[str]:
        """Extract Exo style components."""
        return [
            f"Exo Suffix: {suffix}"
            for suffix in self.exo_suffixes.get_suffixes()
            if suffix.lower() in name_lower
        ]

    def _extract_cyberpunk_components(self, name_lower: str) -> list[str]:
        """Extract Cyberpunk style components."""
        components = []
        components.extend(
            f"Cyberpunk Prefix: {prefix}"
            for prefix in self.cyberpunk_prefixes.get_prefixes()
            if prefix.lower() in name_lower
        )
        components.extend(
            f"Cyberpunk Suffix: {suffix}"
            for suffix in self.cyberpunk_suffixes.get_suffixes()
            if suffix.lower() in name_lower
        )
        return components

    def _extract_scientific_components(self, name_lower: str) -> list[str]:
        """Extract Scientific style components."""
        components = []
        components.extend(
            f"Scientific Prefix: {prefix}"
            for prefix in self.scientific_prefixes.get_prefixes()
            if prefix.lower() in name_lower
        )
        components.extend(
            f"Scientific Suffix: {suffix}"
            for suffix in self.scientific_suffixes.get_suffixes()
            if suffix.lower() in name_lower
        )
        return components

    def _extract_style_components(self, name_lower: str) -> list[str]:
        """Extract style-specific components (foundation, exo, cyberpunk, scientific)."""
        components = []
        components.extend(self._extract_foundation_components(name_lower))
        components.extend(self._extract_exo_components(name_lower))
        components.extend(self._extract_cyberpunk_components(name_lower))
        components.extend(self._extract_scientific_components(name_lower))
        return components

    def _extract_special_components(self, name_lower: str) -> list[str]:
        """Extract special designation and classification components."""
        components = []
        components.extend(
            f"Divine Suffix: {suffix}"
            for suffix in self.divine_suffixes.get_suffixes()
            if suffix.lower() in name_lower
        )
        components.extend(
            f"Special Designation: {designation}"
            for designation in self.special_designations.get_designations()
            if designation.lower() in name_lower
        )
        components.extend(
            f"Scientific Classification: {classification}"
            for classification in self.scientific_classifications.get_classifications()
            if classification.lower() in name_lower
        )
        return components

    def _extract_components(self, name: str) -> list[str]:
        """Extract all identifiable components from a name."""
        name_lower = name.lower()

        # Combine all component extractions
        components = []
        components.extend(self._extract_animal_components(name_lower))
        components.extend(self._extract_mythological_components(name_lower))
        components.extend(self._extract_style_components(name_lower))
        components.extend(self._extract_special_components(name_lower))

        return components

    def get_spirit_info(self, name: str) -> dict[str, str | list[str]]:
        """Analyze a generated name to extract spirit information."""
        spirit, _ = self._detect_spirit(name)
        style = self._detect_style(name)
        all_components = self._extract_components(name)

        return {
            "spirit": spirit,
            "style": style,
            "components": all_components,
        }

    def analyze_name_breakdown(self, name: str) -> dict[str, str | list[str]]:
        """Provide detailed breakdown of name components."""
        info = self.get_spirit_info(name)

        # Add additional analysis
        return {
            "original_name": name,
            "spirit": info["spirit"],
            "style": info["style"],
            "components": info["components"],
            "component_count": len(info["components"]),
            "name_length": len(name),
            "word_count": len(name.split("-")),
        }

    def get_available_spirits(self) -> list[str]:
        """Get list of all available animal spirits."""
        return self.animal_pools.get_all_spirits()

    def get_available_styles(self) -> list[str]:
        """Get list of all available naming styles."""
        return [
            "foundation",
            "exo",
            "hybrid",
            "cyberpunk",
            "mythological",
            "scientific",
        ]

    def validate_name_format(self, name: str) -> dict[str, bool | str]:
        """Validate if a name follows expected naming conventions."""
        validation = {
            "is_valid": True,
            "errors": [],
            "warnings": [],
        }

        # Check for minimum length
        if len(name) < self.MIN_NAME_LENGTH:
            validation["is_valid"] = False
            validation["errors"].append(
                f"Name too short (minimum {self.MIN_NAME_LENGTH} characters)"
            )

        # Check for maximum length
        if len(name) > self.MAX_NAME_LENGTH:
            validation["warnings"].append(
                f"Name quite long (over {self.MAX_NAME_LENGTH} characters)"
            )

        # Check for proper hyphenation
        if "-" not in name:
            validation["warnings"].append(
                "No hyphens found (unusual for Reynard names)"
            )

        # Check for multiple hyphens (should be 2 for most styles)
        hyphen_count = name.count("-")
        if hyphen_count < self.MIN_HYPHEN_COUNT:
            validation["errors"].append("No hyphens found")
        elif hyphen_count > self.MAX_HYPHEN_COUNT:
            validation["warnings"].append(f"Many hyphens found ({hyphen_count})")

        # Check for empty components
        components = name.split("-")
        if any(not component.strip() for component in components):
            validation["is_valid"] = False
            validation["errors"].append("Empty components found")

        # Check for unrecognized spirit
        spirit, _ = self._detect_spirit(name)
        if spirit == "unknown":
            validation["warnings"].append("No recognizable animal spirit found")

        # Check for unrecognized style
        style = self._detect_style(name)
        if style == "unknown":
            validation["warnings"].append("No recognizable naming style found")

        return validation
