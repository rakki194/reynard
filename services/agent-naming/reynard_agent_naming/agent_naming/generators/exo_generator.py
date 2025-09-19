"""
Exo Style Name Generator
=======================

Generates Exo-style names inspired by Destiny's Exo race.
Creates combat-focused, technical, and operational names with
unique patterns that reflect the Exo's military origins and
cybernetic nature.
"""

import random  # nosec B311 - Used for non-cryptographic name generation

from ..naming_utilities import NameBuilder, RandomSelector
from ..types import AgentName, AnimalSpirit, NamingStyle


class ExoGenerator:
    """Generates Exo-style names with combat and technical themes."""

    def __init__(self) -> None:
        """Initialize the Exo generator."""
        self.name_builder = NameBuilder()
        self.selector = RandomSelector()
        self._load_exo_data()

    def _load_exo_data(self) -> None:
        """Load Exo-specific naming data."""
        # Combat and military designations
        self.combat_designations = [
            "Strike", "Guard", "Sentinel", "Hunter", "Scout", "Ranger", "Patrol",
            "Watch", "Vigil", "Defense", "Protection", "Security", "Shield", "Barrier",
            "Fortress", "Bastion", "Stronghold", "Outpost", "Garrison", "Base",
            "Station", "Post", "Checkpoint", "Perimeter", "Frontier", "Border",
        ]

        # Technical and operational terms
        self.technical_terms = [
            "Protocol", "System", "Core", "Unit", "Frame", "Chassis", "Interface",
            "Matrix", "Network", "Circuit", "Node", "Module", "Component", "Assembly",
            "Structure", "Architecture", "Framework", "Platform", "Engine", "Drive",
            "Processor", "Memory", "Storage", "Buffer", "Cache", "Registry", "Database",
        ]

        # Exo-specific model numbers and designations
        self.exo_models = [
            "Mark-I", "Mark-II", "Mark-III", "Mark-IV", "Mark-V", "Mark-VI", "Mark-VII",
            "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta",
            "Prime", "Ultra", "Mega", "Super", "Hyper", "Neo", "Proto", "Meta",
            "Series-A", "Series-B", "Series-C", "Series-D", "Series-E", "Series-F",
            "Model-1", "Model-2", "Model-3", "Model-4", "Model-5", "Model-6",
        ]

        # Combat roles and specializations
        self.combat_roles = [
            "Assault", "Defense", "Recon", "Support", "Heavy", "Light", "Elite",
            "Specialist", "Operator", "Agent", "Officer", "Commander", "Captain",
            "Lieutenant", "Sergeant", "Corporal", "Private", "Recruit", "Veteran",
            "Expert", "Master", "Ace", "Champion", "Hero", "Legend", "Myth",
        ]

        # Technical specifications
        self.technical_specs = [
            "v1.0", "v2.0", "v3.0", "v4.0", "v5.0", "v6.0", "v7.0", "v8.0",
            "Rev-A", "Rev-B", "Rev-C", "Rev-D", "Rev-E", "Rev-F", "Rev-G",
            "Build-1", "Build-2", "Build-3", "Build-4", "Build-5", "Build-6",
            "Gen-1", "Gen-2", "Gen-3", "Gen-4", "Gen-5", "Gen-6", "Gen-7",
        ]

        # Exo generation numbers (military-style)
        self.exo_numbers = [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
            21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
            41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
            61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
            81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100,
        ]

    def generate_exo_name(
        self, spirit: AnimalSpirit | None = None, use_spirit: bool = True
    ) -> AgentName:
        """Generate an Exo-style name."""
        if use_spirit and spirit:
            return self._generate_spirit_exo_name(spirit)
        else:
            return self._generate_pure_exo_name()

    def _generate_spirit_exo_name(self, spirit: AnimalSpirit) -> AgentName:
        """Generate Exo name with animal spirit integration."""
        # Use spirit name as base with Exo styling
        spirit_names = {
            "fox": ["Vulpine", "Reynard", "Kitsune", "Sly", "Cunning", "Swift"],
            "wolf": ["Lupus", "Fenrir", "Alpha", "Hunter", "Pack", "Fierce"],
            "otter": ["Lutra", "Aqua", "Playful", "Graceful", "Sleek", "Fluid"],
            "dragon": ["Draco", "Wyrm", "Ancient", "Elder", "Primordial", "Mighty"],
            "phoenix": ["Phoenix", "Firebird", "Rebirth", "Renewal", "Eternal", "Radiant"],
            "eagle": ["Aquila", "Golden", "Soaring", "Majestic", "Noble", "Regal"],
            "lion": ["Leo", "King", "Mane", "Pride", "Royal", "Imperial"],
            "tiger": ["Tigris", "Bengal", "Siberian", "Striped", "Fierce", "Powerful"],
        }

        spirit_key = spirit.value
        base_name = self.selector.select_with_fallback(
            spirit_names.get(spirit_key, ["Exo"]), "Exo"
        )

        designation = self.selector.select_with_fallback(self.combat_designations, "Unit")
        number = self.selector.select_with_fallback(self.exo_numbers, 1)

        name = self.name_builder.build_hyphenated_name([base_name, designation, number])
        components = [base_name, designation, str(number)]

        return AgentName(
            name=name,
            spirit=spirit,
            style=NamingStyle.EXO,
            components=components,
            generation_number=number,
        )

    def _generate_pure_exo_name(self) -> AgentName:
        """Generate pure Exo name without animal spirit."""
        # Choose between different Exo naming patterns
        pattern = random.choice([1, 2, 3, 4, 5])  # nosec B311

        if pattern == 1:
            # Pattern: [Combat] + [Technical] + [Number]
            combat = self.selector.select_with_fallback(self.combat_designations, "Unit")
            technical = self.selector.select_with_fallback(self.technical_terms, "Core")
            number = self.selector.select_with_fallback(self.exo_numbers, 1)
            name = self.name_builder.build_hyphenated_name([combat, technical, number])
            components = [combat, technical, str(number)]

        elif pattern == 2:
            # Pattern: [Role] + [Model] + [Spec]
            role = self.selector.select_with_fallback(self.combat_roles, "Operator")
            model = self.selector.select_with_fallback(self.exo_models, "Mark-I")
            spec = self.selector.select_with_fallback(self.technical_specs, "v1.0")
            name = self.name_builder.build_hyphenated_name([role, model, spec])
            components = [role, model, spec]

        elif pattern == 3:
            # Pattern: [Technical] + [Combat] + [Number]
            technical = self.selector.select_with_fallback(self.technical_terms, "System")
            combat = self.selector.select_with_fallback(self.combat_designations, "Guard")
            number = self.selector.select_with_fallback(self.exo_numbers, 1)
            name = self.name_builder.build_hyphenated_name([technical, combat, number])
            components = [technical, combat, str(number)]

        elif pattern == 4:
            # Pattern: [Model] + [Role] + [Number]
            model = self.selector.select_with_fallback(self.exo_models, "Alpha")
            role = self.selector.select_with_fallback(self.combat_roles, "Agent")
            number = self.selector.select_with_fallback(self.exo_numbers, 1)
            name = self.name_builder.build_hyphenated_name([model, role, number])
            components = [model, role, str(number)]

        else:
            # Pattern: [Combat] + [Model] + [Spec]
            combat = self.selector.select_with_fallback(self.combat_designations, "Strike")
            model = self.selector.select_with_fallback(self.exo_models, "Prime")
            spec = self.selector.select_with_fallback(self.technical_specs, "v2.0")
            name = self.name_builder.build_hyphenated_name([combat, model, spec])
            components = [combat, model, spec]

        return AgentName(
            name=name,
            spirit=None,
            style=NamingStyle.EXO,
            components=components,
            generation_number=number if 'number' in locals() else 1,
        )

    def generate_exo_batch(self, count: int = 5) -> list[AgentName]:
        """Generate a batch of Exo names with variety."""
        names = []
        for i in range(count):
            # Alternate between spirit and pure Exo names
            use_spirit = i % 2 == 0
            if use_spirit:
                spirit = AnimalSpirit(random.choice(list(AnimalSpirit)))  # nosec B311
                name = self.generate_exo_name(spirit, use_spirit=True)
            else:
                name = self.generate_exo_name(use_spirit=False)
            names.append(name)
        return names
