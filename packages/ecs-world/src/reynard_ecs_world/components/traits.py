"""
Traits Component

Agent comprehensive traits including personality, physical, and abilities component.
"""

from typing import Any

from ..core.component import Component


class TraitComponent(Component):
    """
    Agent comprehensive traits including personality, physical, and abilities.

    Contains all the trait data for an agent including personality traits,
    physical characteristics, and special abilities.
    """

    def __init__(self, traits_data: dict[str, Any] | None = None) -> None:
        """
        Initialize the traits component.

        Args:
            traits_data: Optional dictionary of trait data
        """
        super().__init__()

        # Default traits if none provided
        if traits_data is None:
            traits_data = self._generate_default_traits()

        self.personality = traits_data.get("personality", {})
        self.physical = traits_data.get("physical", {})
        self.abilities = traits_data.get("abilities", {})
        self.spirit = traits_data.get("spirit", "fox")
        self.style = traits_data.get("style", "foundation")
        self.unique_id = traits_data.get("unique_id", "unknown")
        self.mutation_count = traits_data.get("mutation_count", 0)

    def _generate_default_traits(self) -> dict[str, Any]:
        """
        Generate default traits for an agent.

        Returns:
            Dictionary of default trait data
        """
        import random

        return {
            "personality": {
                "dominance": random.uniform(0.0, 1.0),
                "loyalty": random.uniform(0.0, 1.0),
                "cunning": random.uniform(0.0, 1.0),
                "aggression": random.uniform(0.0, 1.0),
                "intelligence": random.uniform(0.0, 1.0),
                "creativity": random.uniform(0.0, 1.0),
            },
            "physical": {
                "size": random.uniform(0.0, 1.0),
                "strength": random.uniform(0.0, 1.0),
                "agility": random.uniform(0.0, 1.0),
                "endurance": random.uniform(0.0, 1.0),
            },
            "abilities": {
                "hunter": random.uniform(0.0, 1.0),
                "healer": random.uniform(0.0, 1.0),
                "scout": random.uniform(0.0, 1.0),
                "guardian": random.uniform(0.0, 1.0),
            },
            "spirit": "fox",
            "style": "foundation",
            "unique_id": f"agent_{random.randint(1000, 9999)}",
            "mutation_count": 0,
        }

    def get_dominant_traits(self, count: int = 3) -> dict[str, float]:
        """
        Get the dominant personality traits.

        Args:
            count: Number of dominant traits to return

        Returns:
            Dictionary of dominant traits and their values
        """
        sorted_traits = sorted(
            self.personality.items(), key=lambda x: x[1], reverse=True
        )
        return dict(sorted_traits[:count])

    def calculate_compatibility(self, other: "TraitComponent") -> float:
        """
        Calculate compatibility with another agent's traits.

        Args:
            other: Another TraitComponent

        Returns:
            Compatibility score between 0.0 and 1.0
        """
        if not self.personality or not other.personality:
            return 0.0

        # Simple compatibility based on trait similarity
        total_diff = 0.0
        trait_count = 0

        for trait in self.personality:
            if trait in other.personality:
                diff = abs(self.personality[trait] - other.personality[trait])
                total_diff += diff
                trait_count += 1

        if trait_count == 0:
            return 0.0

        # Convert difference to similarity (lower difference = higher compatibility)
        avg_diff = total_diff / trait_count
        compatibility = 1.0 - avg_diff

        return max(0.0, min(1.0, compatibility))

    def __repr__(self) -> str:
        """String representation of the traits component."""
        return f"TraitComponent(spirit={self.spirit}, style={self.style}, mutations={self.mutation_count})"
