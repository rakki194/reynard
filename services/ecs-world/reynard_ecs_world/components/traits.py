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
        Generate default traits for an agent using FastAPI backend data.

        Returns:
            Dictionary of default trait data
        """
        import random
        import asyncio
        import httpx

        async def _fetch_trait_data():
            async with httpx.AsyncClient(timeout=10.0) as client:
                try:
                    # Get spirit trait profile from backend
                    response = await client.get("http://localhost:8000/api/ecs/traits/spirit/fox")
                    if response.status_code == 200:
                        profile_data = response.json()
                        base_personality = profile_data.get("personality_traits", {})
                        base_physical = profile_data.get("physical_traits", {})
                        base_abilities = profile_data.get("ability_traits", {})
                    else:
                        # Fallback to hardcoded values if backend unavailable
                        base_personality = {
                            "dominance": 0.6, "loyalty": 0.7, "cunning": 0.8,
                            "aggression": 0.3, "intelligence": 0.7, "creativity": 0.6,
                            "patience": 0.5, "charisma": 0.6, "perfectionism": 0.4,
                            "adaptability": 0.8, "playfulness": 0.5, "curiosity": 0.7,
                            "courage": 0.5, "empathy": 0.5, "determination": 0.6,
                            "spontaneity": 0.4, "independence": 0.6
                        }
                        base_physical = {
                            "size": 0.3, "strength": 0.4, "agility": 0.8,
                            "endurance": 0.6, "appearance": 0.7, "grace": 0.8,
                            "speed": 0.7, "coordination": 0.8, "stamina": 0.6,
                            "flexibility": 0.7, "reflexes": 0.8, "vitality": 0.6
                        }
                        base_abilities = {
                            "strategist": 0.8, "hunter": 0.6, "teacher": 0.5,
                            "artist": 0.6, "healer": 0.4, "inventor": 0.7,
                            "explorer": 0.7, "guardian": 0.5, "diplomat": 0.6,
                            "warrior": 0.4, "scholar": 0.7, "performer": 0.5,
                            "builder": 0.5, "navigator": 0.7, "communicator": 0.6,
                            "leader": 0.5
                        }

                    # Generate traits with variation from base values
                    personality = {}
                    for trait, base_value in base_personality.items():
                        variation = random.uniform(-0.2, 0.2)
                        personality[trait] = max(0.0, min(1.0, base_value + variation))

                    physical = {}
                    for trait, base_value in base_physical.items():
                        variation = random.uniform(-0.2, 0.2)
                        physical[trait] = max(0.0, min(1.0, base_value + variation))

                    abilities = {}
                    for trait, base_value in base_abilities.items():
                        variation = random.uniform(-0.2, 0.2)
                        abilities[trait] = max(0.0, min(1.0, base_value + variation))

                    return {
                        "personality": personality,
                        "physical": physical,
                        "abilities": abilities,
                        "spirit": "fox",
                        "style": "foundation",
                        "unique_id": f"agent_{random.randint(1000, 9999)}",
                        "mutation_count": 0,
                    }

                except Exception as e:
                    logger.warning(f"Failed to fetch trait data from backend: {e}")
                    # Fallback to simple random generation
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

        # Run the async function
        return asyncio.run(_fetch_trait_data())

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
