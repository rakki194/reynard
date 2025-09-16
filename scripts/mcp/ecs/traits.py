"""
Agent Traits and Personality System
==================================

Comprehensive trait and personality system for agents with detailed
characteristics, inheritance patterns, and genetic diversity.

Follows the 140-line axiom and modular architecture principles.
"""

import random
from typing import Any, Dict, List, TypedDict


class TraitConfig(TypedDict):
    """Type definition for trait configuration."""

    min: float
    max: float
    description: str


class PersonalityTraits:
    """Core personality traits that define agent behavior and characteristics."""

    TRAITS: Dict[str, TraitConfig] = {
        # Core Personality Dimensions
        "dominance": {
            "min": 0.0,
            "max": 1.0,
            "description": "Leadership and assertiveness",
        },
        "loyalty": {"min": 0.0, "max": 1.0, "description": "Commitment to pack/family"},
        "cunning": {
            "min": 0.0,
            "max": 1.0,
            "description": "Strategic thinking and cleverness",
        },
        "aggression": {
            "min": 0.0,
            "max": 1.0,
            "description": "Combativeness and intensity",
        },
        "intelligence": {
            "min": 0.0,
            "max": 1.0,
            "description": "Problem-solving and learning",
        },
        "creativity": {
            "min": 0.0,
            "max": 1.0,
            "description": "Innovation and artistic ability",
        },
        "playfulness": {
            "min": 0.0,
            "max": 1.0,
            "description": "Joy and lightheartedness",
        },
        "protectiveness": {
            "min": 0.0,
            "max": 1.0,
            "description": "Defensive instincts",
        },
        # Social Traits
        "empathy": {
            "min": 0.0,
            "max": 1.0,
            "description": "Understanding others' emotions",
        },
        "charisma": {
            "min": 0.0,
            "max": 1.0,
            "description": "Social magnetism and influence",
        },
        "independence": {
            "min": 0.0,
            "max": 1.0,
            "description": "Self-reliance and autonomy",
        },
        "cooperation": {
            "min": 0.0,
            "max": 1.0,
            "description": "Teamwork and collaboration",
        },
        # Cognitive Traits
        "curiosity": {
            "min": 0.0,
            "max": 1.0,
            "description": "Desire to explore and learn",
        },
        "patience": {
            "min": 0.0,
            "max": 1.0,
            "description": "Tolerance for delays and challenges",
        },
        "adaptability": {
            "min": 0.0,
            "max": 1.0,
            "description": "Flexibility in changing situations",
        },
        "perfectionism": {
            "min": 0.0,
            "max": 1.0,
            "description": "Attention to detail and quality",
        },
    }

    @classmethod
    def generate_random_traits(cls) -> Dict[str, float]:
        """Generate random personality traits for a new agent."""
        traits = {}
        for trait_name, config in cls.TRAITS.items():
            # Generate with slight bias toward middle values for more realistic distribution
            base_value = random.uniform(config["min"], config["max"])
            # Add some variation with normal distribution around the base
            traits[trait_name] = max(
                config["min"], min(config["max"], base_value + random.gauss(0, 0.1))
            )
        return traits

    @classmethod
    def inherit_traits(
        cls, parent1_traits: Dict[str, float], parent2_traits: Dict[str, float]
    ) -> Dict[str, float]:
        """Inherit traits from two parents with 50/50 split and some mutation."""
        offspring_traits = {}

        for trait_name in cls.TRAITS.keys():
            # 50/50 inheritance from parents
            parent1_value = parent1_traits.get(trait_name, 0.5)
            parent2_value = parent2_traits.get(trait_name, 0.5)

            # Average the two parents' values
            inherited_value = (parent1_value + parent2_value) / 2.0

            # Add small random mutation (±5%)
            mutation = random.gauss(0, 0.05)
            final_value = inherited_value + mutation

            # Clamp to valid range
            config = cls.TRAITS[trait_name]
            offspring_traits[trait_name] = max(
                config["min"], min(config["max"], final_value)
            )

        return offspring_traits


class PhysicalTraits:
    """Physical characteristics and appearance traits."""

    TRAITS: Dict[str, TraitConfig] = {
        # Size and Build
        "size": {"min": 0.3, "max": 1.0, "description": "Overall body size"},
        "strength": {
            "min": 0.0,
            "max": 1.0,
            "description": "Physical power and muscle",
        },
        "agility": {"min": 0.0, "max": 1.0, "description": "Speed and flexibility"},
        "endurance": {"min": 0.0, "max": 1.0, "description": "Stamina and resilience"},
        # Appearance
        "fur_density": {"min": 0.0, "max": 1.0, "description": "Thickness of fur coat"},
        "marking_intensity": {
            "min": 0.0,
            "max": 1.0,
            "description": "Boldness of markings",
        },
        "eye_color_intensity": {
            "min": 0.0,
            "max": 1.0,
            "description": "Vividness of eye color",
        },
        "tail_length": {
            "min": 0.0,
            "max": 1.0,
            "description": "Length of tail relative to body",
        },
        # Sensory Abilities
        "hearing": {"min": 0.0, "max": 1.0, "description": "Auditory sensitivity"},
        "sight": {"min": 0.0, "max": 1.0, "description": "Visual acuity"},
        "smell": {"min": 0.0, "max": 1.0, "description": "Olfactory sensitivity"},
        "touch": {"min": 0.0, "max": 1.0, "description": "Tactile sensitivity"},
    }

    @classmethod
    def generate_random_traits(cls) -> Dict[str, float]:
        """Generate random physical traits for a new agent."""
        traits = {}
        for trait_name, config in cls.TRAITS.items():
            traits[trait_name] = random.uniform(config["min"], config["max"])
        return traits

    @classmethod
    def inherit_traits(
        cls, parent1_traits: Dict[str, float], parent2_traits: Dict[str, float]
    ) -> Dict[str, float]:
        """Inherit physical traits from two parents with 50/50 split."""
        offspring_traits = {}

        for trait_name in cls.TRAITS.keys():
            parent1_value = parent1_traits.get(trait_name, 0.5)
            parent2_value = parent2_traits.get(trait_name, 0.5)

            # 50/50 inheritance with small mutation
            inherited_value = (parent1_value + parent2_value) / 2.0
            mutation = random.gauss(0, 0.03)  # Smaller mutation for physical traits
            final_value = inherited_value + mutation

            # Clamp to valid range
            config = cls.TRAITS[trait_name]
            offspring_traits[trait_name] = max(
                config["min"], min(config["max"], final_value)
            )

        return offspring_traits


class SpecialAbilities:
    """Unique special abilities and talents."""

    ABILITIES = {
        "hunter": {"description": "Exceptional hunting and tracking skills"},
        "healer": {"description": "Natural healing and medicinal knowledge"},
        "scout": {"description": "Reconnaissance and stealth abilities"},
        "guardian": {"description": "Protective instincts and defensive skills"},
        "diplomat": {"description": "Negotiation and conflict resolution"},
        "inventor": {"description": "Creative problem-solving and innovation"},
        "teacher": {"description": "Mentoring and knowledge transfer"},
        "explorer": {"description": "Curiosity and discovery drive"},
        "artist": {"description": "Creative expression and aesthetic sense"},
        "strategist": {"description": "Long-term planning and tactical thinking"},
    }

    @classmethod
    def generate_random_abilities(cls, count: int = 2) -> List[str]:
        """Generate random special abilities for an agent."""
        available_abilities = list(cls.ABILITIES.keys())
        return random.sample(available_abilities, min(count, len(available_abilities)))

    @classmethod
    def inherit_abilities(
        cls, parent1_abilities: List[str], parent2_abilities: List[str]
    ) -> List[str]:
        """Inherit abilities from parents with some chance of new abilities."""
        # Combine parent abilities
        all_parent_abilities = list(set(parent1_abilities + parent2_abilities))

        # Each parent ability has 50% chance of being inherited
        inherited = []
        for ability in all_parent_abilities:
            if random.random() < 0.5:
                inherited.append(ability)

        # Small chance of developing a new ability
        if random.random() < 0.2:  # 20% chance
            available_new = [a for a in cls.ABILITIES.keys() if a not in inherited]
            if available_new:
                inherited.append(random.choice(available_new))

        return inherited[:3]  # Limit to 3 abilities max


class AgentTraits:
    """Complete trait system combining personality, physical, and abilities."""

    def __init__(self, spirit: str = "fox", style: str = "foundation"):
        self.spirit = spirit
        self.style = style
        self.personality = PersonalityTraits.generate_random_traits()
        self.physical = PhysicalTraits.generate_random_traits()
        self.abilities = SpecialAbilities.generate_random_abilities()
        self.unique_id = self._generate_unique_id()

    def _generate_unique_id(self) -> str:
        """Generate a unique identifier based on traits."""
        # Create a hash-like identifier from key traits
        key_traits = [
            self.personality.get("dominance", 0),
            self.personality.get("intelligence", 0),
            self.physical.get("size", 0),
            self.physical.get("strength", 0),
        ]
        trait_sum = sum(key_traits)
        return f"trait_{int(trait_sum * 1000)}_{random.randint(100, 999)}"

    @classmethod
    def create_offspring(
        cls, parent1: "AgentTraits", parent2: "AgentTraits"
    ) -> "AgentTraits":
        """Create offspring traits from two parents."""
        offspring = cls.__new__(cls)
        offspring.spirit = random.choice([parent1.spirit, parent2.spirit])
        offspring.style = "foundation"  # Offspring default to foundation style

        # Inherit traits with 50/50 split
        offspring.personality = PersonalityTraits.inherit_traits(
            parent1.personality, parent2.personality
        )
        offspring.physical = PhysicalTraits.inherit_traits(
            parent1.physical, parent2.physical
        )
        offspring.abilities = SpecialAbilities.inherit_abilities(
            parent1.abilities, parent2.abilities
        )

        offspring.unique_id = offspring._generate_unique_id()
        return offspring

    def get_summary(self) -> Dict[str, Any]:
        """Get a summary of all traits for display."""
        return {
            "unique_id": self.unique_id,
            "spirit": self.spirit,
            "style": self.style,
            "personality": self.personality,
            "physical": self.physical,
            "abilities": self.abilities,
            "dominant_traits": self._get_dominant_traits(),
        }

    def _get_dominant_traits(self) -> List[str]:
        """Get the top 3 most dominant personality traits."""
        sorted_traits = sorted(
            self.personality.items(), key=lambda x: x[1], reverse=True
        )
        return [trait[0] for trait in sorted_traits[:3]]

    def get_compatibility_score(self, other: "AgentTraits") -> float:
        """Calculate compatibility score with another agent."""
        # Compare personality traits
        personality_diff = 0.0
        for trait in self.personality:
            diff = abs(self.personality[trait] - other.personality[trait])
            personality_diff += diff

        # Normalize and invert (lower difference = higher compatibility)
        personality_compatibility = 1.0 - (personality_diff / len(self.personality))

        # Bonus for shared abilities
        shared_abilities = len(set(self.abilities) & set(other.abilities))
        ability_bonus = shared_abilities * 0.1

        return min(1.0, personality_compatibility + ability_bonus)
