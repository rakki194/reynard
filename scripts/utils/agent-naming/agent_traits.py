#!/usr/bin/env python3
"""
Reynard Agent Traits System
============================

Contains the core trait system for agent inheritance and personality modeling.
This module provides inheritable traits, personality characteristics, and
genetic algorithms for creating offspring agents.

Follows the 140-line axiom and modular architecture principles.
"""

import random  # nosec B311 - Used for non-cryptographic trait generation
from typing import Any


class AgentTraits:
    """Core trait system for agent personality and characteristics."""

    def __init__(self) -> None:
        """Initialize trait system with base trait definitions."""
        self.base_traits = {
            "fox": {
                "dominance": 0.6,
                "loyalty": 0.7,
                "cunning": 0.9,
                "aggression": 0.4,
                "intelligence": 0.8,
                "creativity": 0.7,
                "playfulness": 0.6,
                "protectiveness": 0.6,
            },
            "wolf": {
                "dominance": 0.8,
                "loyalty": 0.9,
                "cunning": 0.6,
                "aggression": 0.8,
                "intelligence": 0.7,
                "creativity": 0.5,
                "playfulness": 0.4,
                "protectiveness": 0.9,
            },
            "otter": {
                "dominance": 0.4,
                "loyalty": 0.8,
                "cunning": 0.5,
                "aggression": 0.3,
                "intelligence": 0.6,
                "creativity": 0.8,
                "playfulness": 0.9,
                "protectiveness": 0.7,
            },
        }

        self.physical_traits = {
            "size": ["small", "medium", "large"],
            "color_pattern": ["solid", "striped", "spotted", "mixed"],
            "markings": ["none", "alpha_stripe", "beta_mark", "gamma_dot"],
            "build": ["lean", "muscular", "stocky", "athletic"],
        }

    def get_base_traits(self, spirit: str) -> dict[str, float]:
        """Get base trait values for a spirit."""
        return self.base_traits.get(spirit, self.base_traits["fox"]).copy()

    def generate_random_traits(self, spirit: str) -> dict[str, Any]:
        """Generate random traits with spirit-based variations."""
        base = self.get_base_traits(spirit)

        # Add random variation (±0.2)
        personality = {}
        for trait, value in base.items():
            variation = random.uniform(-0.2, 0.2)  # nosec B311
            personality[trait] = max(0.0, min(1.0, value + variation))

        # Generate physical traits
        physical = {}
        for trait, options in self.physical_traits.items():
            physical[trait] = random.choice(options)  # nosec B311

        return {
            "personality": personality,
            "physical": physical,
            "spirit": spirit,
        }

    def crossover_traits(
        self, parent1_traits: dict[str, Any], parent2_traits: dict[str, Any]
    ) -> dict[str, Any]:
        """Create offspring traits through genetic crossover."""
        offspring_personality = {}

        # Crossover personality traits (weighted average with dominance)
        for trait in parent1_traits["personality"]:
            p1_val = parent1_traits["personality"][trait]
            p2_val = parent2_traits["personality"][trait]

            # 70% chance dominant trait wins, 30% average
            if random.random() < 0.7:  # nosec B311
                offspring_personality[trait] = max(p2_val, p1_val)
            else:
                offspring_personality[trait] = (p1_val + p2_val) / 2

        # Crossover physical traits (random selection from parents)
        offspring_physical = {}
        for trait in parent1_traits["physical"]:
            offspring_physical[trait] = random.choice(
                [  # nosec B311
                    parent1_traits["physical"][trait],
                    parent2_traits["physical"][trait],
                ]
            )

        # Determine dominant spirit
        dominant_spirit = self._determine_dominant_spirit(
            parent1_traits["spirit"], parent2_traits["spirit"]
        )

        return {
            "personality": offspring_personality,
            "physical": offspring_physical,
            "spirit": dominant_spirit,
        }

    def apply_mutations(
        self, traits: dict[str, Any], mutation_rate: float = 0.1
    ) -> dict[str, Any]:
        """Apply random mutations to traits."""
        mutated = traits.copy()

        # Mutate personality traits
        for trait in mutated["personality"]:
            if random.random() < mutation_rate:  # nosec B311
                mutation = random.uniform(-0.3, 0.3)  # nosec B311
                mutated["personality"][trait] = max(
                    0.0, min(1.0, mutated["personality"][trait] + mutation)
                )

        # Mutate physical traits (rare)
        if random.random() < mutation_rate * 0.5:  # nosec B311
            trait_to_mutate = random.choice(list(mutated["physical"].keys()))  # nosec B311
            options = self.physical_traits[trait_to_mutate]
            mutated["physical"][trait_to_mutate] = random.choice(options)  # nosec B311

        return mutated

    def _determine_dominant_spirit(self, spirit1: str, spirit2: str) -> str:
        """Determine dominant spirit based on trait dominance."""
        # Simple dominance hierarchy: wolf > fox > otter
        dominance_order = {"wolf": 3, "fox": 2, "otter": 1}

        if dominance_order.get(spirit1, 0) >= dominance_order.get(spirit2, 0):
            return spirit1
        return spirit2

    def get_trait_summary(self, traits: dict[str, Any]) -> str:
        """Get a human-readable summary of traits."""
        personality = traits["personality"]
        physical = traits["physical"]

        # Find dominant personality traits
        dominant_traits = sorted(personality.items(), key=lambda x: x[1], reverse=True)[
            :3
        ]

        summary = f"Spirit: {traits['spirit']}, "
        summary += f"Size: {physical['size']}, "
        summary += f"Build: {physical['build']}, "
        summary += (
            f"Top traits: {', '.join([f'{t}({v:.1f})' for t, v in dominant_traits])}"
        )

        return summary
