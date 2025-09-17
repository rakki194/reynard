#!/usr/bin/env python3
"""
Reynard Inherited Name Generator
=================================

Generates names for offspring agents that reflect inherited traits and lineage.
This module creates names that show genetic inheritance, family connections,
and trait-based characteristics.

Follows the 140-line axiom and modular architecture principles.
"""

import random  # nosec B311 - Used for non-cryptographic name generation
from typing import Any

from agent_traits import AgentTraits
from name_pools import AnimalSpiritPools
from naming_conventions import ExoSuffixes, FoundationSuffixes


class InheritedNameGenerator:
    """Generates names that reflect agent inheritance and traits."""

    def __init__(self) -> None:
        """Initialize inherited name generator."""
        self.traits_system = AgentTraits()
        self.animal_pools = AnimalSpiritPools()
        self.foundation_suffixes = FoundationSuffixes()
        self.exo_suffixes = ExoSuffixes()

        # Trait-based suffixes
        self.trait_suffixes = {
            "high_dominance": ["Alpha", "Prime", "Leader", "Chief", "Commander"],
            "high_loyalty": ["Faithful", "Devoted", "Steadfast", "True", "Loyal"],
            "high_cunning": ["Sage", "Oracle", "Strategist", "Tactician", "Wise"],
            "high_aggression": ["Fury", "Storm", "Thunder", "Blade", "Fierce"],
            "high_intelligence": ["Brilliant", "Genius", "Master", "Scholar", "Wise"],
            "high_creativity": [
                "Innovator",
                "Creator",
                "Artist",
                "Dreamer",
                "Visionary",
            ],
            "high_playfulness": ["Joy", "Merry", "Bright", "Spark", "Cheerful"],
            "high_protectiveness": [
                "Guardian",
                "Shield",
                "Ward",
                "Sentinel",
                "Protector",
            ],
        }

        # Inheritance patterns
        self.inheritance_patterns = {
            "direct_inheritance": 0.4,  # 40% chance
            "trait_combination": 0.3,  # 30% chance
            "hybrid_fusion": 0.2,  # 20% chance
            "mutation_novel": 0.1,  # 10% chance
        }

    def generate_inherited_name(
        self,
        offspring_traits: dict[str, Any],
        parent1_name: str,
        parent2_name: str,
        generation: int,
    ) -> str:
        """Generate name reflecting inheritance and traits."""
        # Choose inheritance pattern
        pattern = self._choose_inheritance_pattern()

        if pattern == "direct_inheritance":
            return self._generate_direct_inheritance_name(
                parent1_name, parent2_name, generation
            )
        if pattern == "trait_combination":
            return self._generate_trait_combination_name(
                offspring_traits, parent1_name, parent2_name, generation
            )
        if pattern == "hybrid_fusion":
            return self._generate_hybrid_fusion_name(
                offspring_traits, parent1_name, parent2_name, generation
            )
        # mutation_novel
        return self._generate_mutation_novel_name(offspring_traits, generation)

    def _choose_inheritance_pattern(self) -> str:
        """Choose inheritance pattern based on probabilities."""
        rand = random.random()  # nosec B311
        cumulative = 0.0

        for pattern, probability in self.inheritance_patterns.items():
            cumulative += probability
            if rand <= cumulative:
                return pattern

        return "direct_inheritance"  # fallback

    def _generate_direct_inheritance_name(
        self, parent1_name: str, parent2_name: str, generation: int
    ) -> str:
        """Generate name showing direct inheritance from parents."""
        # Extract components from parent names
        p1_parts = parent1_name.split("-")

        # Choose inheritance style
        style = random.choice(["spawn", "heir", "scion", "offspring"])  # nosec B311

        # Use first parent's base name with inheritance suffix
        base_name = p1_parts[0] if p1_parts else "Unknown"
        return f"{base_name}-{style.title()}-{generation}"

    def _generate_trait_combination_name(
        self,
        offspring_traits: dict[str, Any],
        parent1_name: str,
        parent2_name: str,
        generation: int,
    ) -> str:
        """Generate name combining traits from both parents."""
        # Extract base names from parents
        p1_base = parent1_name.split("-")[0] if "-" in parent1_name else parent1_name
        p2_base = parent2_name.split("-")[0] if "-" in parent2_name else parent2_name

        # Choose trait-based suffix
        trait_suffix = self._get_trait_based_suffix(offspring_traits["personality"])

        # Combine parent bases
        combined_base = f"{p1_base}-{p2_base}"
        return f"{combined_base}-{trait_suffix}-{generation}"

    def _generate_hybrid_fusion_name(
        self,
        offspring_traits: dict[str, Any],
        parent1_name: str,
        parent2_name: str,
        generation: int,
    ) -> str:
        """Generate name using mythological fusion of parent spirits."""
        # Get spirit names from traits
        spirit1 = offspring_traits["spirit"]
        spirit2 = self._get_secondary_spirit(parent1_name, parent2_name)

        # Get mythological names for spirits
        spirit1_names = self.animal_pools.get_spirit_names(spirit1)
        spirit2_names = self.animal_pools.get_spirit_names(spirit2)

        # Choose mythological names
        name1 = (
            random.choice(spirit1_names) if spirit1_names else "Unknown"
        )  # nosec B311
        name2 = (
            random.choice(spirit2_names) if spirit2_names else "Unknown"
        )  # nosec B311

        # Create fusion
        fusion_suffix = random.choice(
            ["Fusion", "Hybrid", "Blend", "Union"]
        )  # nosec B311
        return f"{name1}-{name2}-{fusion_suffix}-{generation}"

    def _generate_mutation_novel_name(
        self, offspring_traits: dict[str, Any], generation: int
    ) -> str:
        """Generate completely new name influenced by traits."""
        spirit = offspring_traits["spirit"]
        personality = offspring_traits["personality"]

        # Get spirit names
        spirit_names = self.animal_pools.get_spirit_names(spirit)
        base_name = (
            random.choice(spirit_names) if spirit_names else "Unknown"
        )  # nosec B311

        # Get trait-based suffix
        trait_suffix = self._get_trait_based_suffix(personality)

        # Add mutation indicator
        mutation_prefix = random.choice(
            ["New", "Evolved", "Adapted", "Enhanced"]
        )  # nosec B311

        return f"{mutation_prefix}-{base_name}-{trait_suffix}-{generation}"

    def _get_trait_based_suffix(self, personality: dict[str, float]) -> str:
        """Get suffix based on dominant personality traits."""
        # Find highest trait
        dominant_trait = max(personality.items(), key=lambda x: x[1])
        trait_name, trait_value = dominant_trait

        # Map trait to suffix category
        trait_mapping = {
            "dominance": "high_dominance",
            "loyalty": "high_loyalty",
            "cunning": "high_cunning",
            "aggression": "high_aggression",
            "intelligence": "high_intelligence",
            "creativity": "high_creativity",
            "playfulness": "high_playfulness",
            "protectiveness": "high_protectiveness",
        }

        suffix_category = trait_mapping.get(trait_name, "high_intelligence")
        suffixes = self.trait_suffixes.get(suffix_category, ["Unknown"])

        return random.choice(suffixes)  # nosec B311

    def _get_secondary_spirit(self, parent1_name: str, parent2_name: str) -> str:
        """Determine secondary spirit from parent names."""
        # Simple heuristic: if parents have different spirits, choose the other one
        # This is a simplified approach - in practice, you'd analyze the names more deeply

        # For now, return a random secondary spirit
        spirits = ["fox", "wolf", "otter"]
        return random.choice(spirits)  # nosec B311

    def analyze_name_inheritance(self, name: str) -> dict[str, Any]:
        """Analyze a name to determine inheritance patterns."""
        parts = name.split("-")

        analysis = {
            "pattern": "unknown",
            "inheritance_indicators": [],
            "trait_indicators": [],
            "generation": None,
        }

        # Look for inheritance indicators
        inheritance_words = ["spawn", "heir", "scion", "offspring", "fusion", "hybrid"]
        for word in inheritance_words:
            if word.lower() in [part.lower() for part in parts]:
                analysis["inheritance_indicators"].append(word)
                analysis["pattern"] = "inheritance"

        # Look for trait indicators
        for trait_category, suffixes in self.trait_suffixes.items():
            for suffix in suffixes:
                if suffix in parts:
                    analysis["trait_indicators"].append(suffix)
                    break

        # Extract generation number
        for part in parts:
            if part.isdigit():
                analysis["generation"] = int(part)
                break

        return analysis
