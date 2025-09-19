"""
Hybrid Style Name Generator
==========================

Generates Hybrid-style names that combine elements from multiple naming schemes.
Creates unique, eclectic names with mixed references that blend different
cultural, mythological, and technological themes.
"""

import random  # nosec B311 - Used for non-cryptographic name generation

from ..naming_utilities import NameBuilder, RandomSelector
from ..types import AgentName, AnimalSpirit, NamingStyle


class HybridGenerator:
    """Generates Hybrid-style names with mixed cultural and thematic references."""

    def __init__(self) -> None:
        """Initialize the Hybrid generator."""
        self.name_builder = NameBuilder()
        self.selector = RandomSelector()
        self._load_hybrid_data()

    def _load_hybrid_data(self) -> None:
        """Load Hybrid-specific naming data."""
        # Mythological and historical references
        self.mythological_references = [
            "Atlas", "Prometheus", "Vulcan", "Minerva", "Apollo", "Artemis", "Odysseus",
            "Achilles", "Hector", "Perseus", "Theseus", "Orion", "Hercules", "Jason",
            "Odin", "Thor", "Loki", "Freyja", "Freyr", "Tyr", "Heimdall", "Baldr",
            "Ra", "Anubis", "Horus", "Isis", "Osiris", "Set", "Thoth", "Bastet",
            "Zeus", "Poseidon", "Hades", "Ares", "Hermes", "Dionysus", "Hephaestus",
            "Athena", "Aphrodite", "Hera", "Demeter", "Hestia", "Jupiter", "Neptune",
        ]

        # Technological and futuristic terms
        self.technological_terms = [
            "Nexus", "Quantum", "Neural", "Cyber", "Digital", "Binary", "Matrix",
            "Protocol", "Interface", "Network", "System", "Core", "Node", "Grid",
            "Circuit", "Processor", "Memory", "Storage", "Drive", "Chip", "Module",
            "Component", "Assembly", "Structure", "Architecture", "Framework", "Platform",
        ]

        # Cultural and geographical references
        self.cultural_references = [
            "Atlas", "Prometheus", "Vulcan", "Minerva", "Apollo", "Artemis", "Odysseus",
            "Nexus", "Quantum", "Neural", "Cyber", "Digital", "Binary", "Odin", "Thor",
            "Athena", "Aphrodite", "Hera", "Demeter", "Hestia", "Jupiter", "Neptune",
            "Mars", "Venus", "Mercury", "Saturn", "Uranus", "Pluto", "Ceres", "Pallas",
            "Juno", "Vesta", "Eris", "Haumea", "Makemake", "Sedna", "Quaoar", "Orcus",
        ]

        # Special designations and titles
        self.special_designations = [
            "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta",
            "Iota", "Kappa", "Lambda", "Mu", "Nu", "Xi", "Omicron", "Pi", "Rho",
            "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi", "Omega", "Prime",
            "Ultra", "Mega", "Super", "Hyper", "Meta", "Neo", "Proto", "Pseudo",
        ]

        # Hybrid-specific combinations
        self.hybrid_combinations = [
            "Atlas", "Prometheus", "Vulcan", "Minerva", "Apollo", "Artemis", "Odysseus",
            "Nexus", "Quantum", "Neural", "Cyber", "Digital", "Binary", "Odin", "Thor",
            "Athena", "Aphrodite", "Hera", "Demeter", "Hestia", "Jupiter", "Neptune",
            "Mars", "Venus", "Mercury", "Saturn", "Uranus", "Pluto", "Ceres", "Pallas",
            "Juno", "Vesta", "Eris", "Haumea", "Makemake", "Sedna", "Quaoar", "Orcus",
            "Ixion", "Varuna", "Eris", "Haumea", "Makemake", "Sedna", "Quaoar", "Orcus",
        ]

        # Hybrid numbers and codes
        self.hybrid_numbers = [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
            21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
            41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
            61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
            81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100,
        ]

        # Hybrid-specific suffixes
        self.hybrid_suffixes = [
            "Prime", "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta",
            "Theta", "Iota", "Kappa", "Lambda", "Mu", "Nu", "Xi", "Omicron", "Pi",
            "Rho", "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi", "Omega",
            "Ultra", "Mega", "Super", "Hyper", "Meta", "Neo", "Proto", "Pseudo",
        ]

    def generate_hybrid_name(
        self, spirit: AnimalSpirit | None = None, use_spirit: bool = True
    ) -> AgentName:
        """Generate a Hybrid-style name."""
        if use_spirit and spirit:
            return self._generate_spirit_hybrid_name(spirit)
        else:
            return self._generate_pure_hybrid_name()

    def _generate_spirit_hybrid_name(self, spirit: AnimalSpirit) -> AgentName:
        """Generate Hybrid name with animal spirit integration."""
        # Use spirit name as base with Hybrid styling
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
            spirit_names.get(spirit_key, ["Hybrid"]), "Hybrid"
        )

        # Choose a hybrid reference
        reference = self.selector.select_with_fallback(self.hybrid_combinations, "Nexus")

        # Choose a designation
        designation = self.selector.select_with_fallback(self.special_designations, "Prime")

        name = self.name_builder.build_hyphenated_name([base_name, reference, designation])
        components = [base_name, reference, designation]

        return AgentName(
            name=name,
            spirit=spirit,
            style=NamingStyle.HYBRID,
            components=components,
        )

    def _generate_pure_hybrid_name(self) -> AgentName:
        """Generate pure Hybrid name without animal spirit."""
        # Choose between different Hybrid naming patterns
        pattern = random.choice([1, 2, 3, 4, 5, 6])  # nosec B311

        if pattern == 1:
            # Pattern: [Mythological] + [Technological] + [Designation]
            mythological = self.selector.select_with_fallback(self.mythological_references, "Atlas")
            technological = self.selector.select_with_fallback(self.technological_terms, "Nexus")
            designation = self.selector.select_with_fallback(self.special_designations, "Prime")
            name = self.name_builder.build_hyphenated_name([mythological, technological, designation])
            components = [mythological, technological, designation]

        elif pattern == 2:
            # Pattern: [Cultural] + [Reference] + [Number]
            cultural = self.selector.select_with_fallback(self.cultural_references, "Apollo")
            reference = self.selector.select_with_fallback(self.hybrid_combinations, "Quantum")
            number = self.selector.select_with_fallback(self.hybrid_numbers, 1)
            name = self.name_builder.build_hyphenated_name([cultural, reference, number])
            components = [cultural, reference, str(number)]

        elif pattern == 3:
            # Pattern: [Technological] + [Mythological] + [Suffix]
            technological = self.selector.select_with_fallback(self.technological_terms, "Neural")
            mythological = self.selector.select_with_fallback(self.mythological_references, "Thor")
            suffix = self.selector.select_with_fallback(self.hybrid_suffixes, "Alpha")
            name = self.name_builder.build_hyphenated_name([technological, mythological, suffix])
            components = [technological, mythological, suffix]

        elif pattern == 4:
            # Pattern: [Reference] + [Designation] + [Number]
            reference = self.selector.select_with_fallback(self.hybrid_combinations, "Prometheus")
            designation = self.selector.select_with_fallback(self.special_designations, "Ultra")
            number = self.selector.select_with_fallback(self.hybrid_numbers, 1)
            name = self.name_builder.build_hyphenated_name([reference, designation, number])
            components = [reference, designation, str(number)]

        elif pattern == 5:
            # Pattern: [Mythological] + [Cultural] + [Designation]
            mythological = self.selector.select_with_fallback(self.mythological_references, "Odin")
            cultural = self.selector.select_with_fallback(self.cultural_references, "Mars")
            designation = self.selector.select_with_fallback(self.special_designations, "Mega")
            name = self.name_builder.build_hyphenated_name([mythological, cultural, designation])
            components = [mythological, cultural, designation]

        else:
            # Pattern: [Technological] + [Reference] + [Suffix]
            technological = self.selector.select_with_fallback(self.technological_terms, "Cyber")
            reference = self.selector.select_with_fallback(self.hybrid_combinations, "Digital")
            suffix = self.selector.select_with_fallback(self.hybrid_suffixes, "Beta")
            name = self.name_builder.build_hyphenated_name([technological, reference, suffix])
            components = [technological, reference, suffix]

        return AgentName(
            name=name,
            spirit=None,
            style=NamingStyle.HYBRID,
            components=components,
            generation_number=number if 'number' in locals() else 1,
        )

    def generate_hybrid_batch(self, count: int = 5) -> list[AgentName]:
        """Generate a batch of Hybrid names with variety."""
        names = []
        for i in range(count):
            # Alternate between spirit and pure Hybrid names
            use_spirit = i % 2 == 0
            if use_spirit:
                spirit = AnimalSpirit(random.choice(list(AnimalSpirit)))  # nosec B311
                name = self.generate_hybrid_name(spirit, use_spirit=True)
            else:
                name = self.generate_hybrid_name(use_spirit=False)
            names.append(name)
        return names
