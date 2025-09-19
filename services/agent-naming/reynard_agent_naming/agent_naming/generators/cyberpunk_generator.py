"""
Cyberpunk Style Name Generator
=============================

Generates Cyberpunk-style names inspired by cyberpunk fiction and culture.
Creates tech-prefixed, futuristic names with unique patterns that reflect
the high-tech, low-life aesthetic of cyberpunk worlds.
"""

import random  # nosec B311 - Used for non-cryptographic name generation

from ..naming_utilities import NameBuilder, RandomSelector
from ..types import AgentName, AnimalSpirit, NamingStyle


class CyberpunkGenerator:
    """Generates Cyberpunk-style names with tech and futuristic themes."""

    def __init__(self) -> None:
        """Initialize the Cyberpunk generator."""
        self.name_builder = NameBuilder()
        self.selector = RandomSelector()
        self._load_cyberpunk_data()

    def _load_cyberpunk_data(self) -> None:
        """Load Cyberpunk-specific naming data."""
        # Tech prefixes
        self.tech_prefixes = [
            "Cyber", "Neo", "Mega", "Ultra", "Hyper", "Super", "Meta", "Quantum",
            "Neural", "Digital", "Virtual", "Synthetic", "Artificial", "Bio", "Nano",
            "Micro", "Macro", "Proto", "Pseudo", "Quasi", "Semi", "Multi", "Omni",
            "Trans", "Inter", "Intra", "Extra", "Sub", "Super", "Pre", "Post",
            "Auto", "Tele", "Holo", "Haptic", "Kinetic", "Static", "Dynamic",
        ]

        # Cyberpunk core concepts
        self.cyberpunk_cores = [
            "Nexus", "Grid", "Web", "Net", "Link", "Chain", "Ring", "Sphere",
            "Core", "Heart", "Soul", "Spirit", "Essence", "Force", "Power", "Energy",
            "Matrix", "System", "Network", "Protocol", "Interface", "Gateway", "Portal",
            "Node", "Hub", "Center", "Base", "Station", "Terminal", "Console",
        ]

        # Cyberpunk suffixes and endings
        self.cyberpunk_suffixes = [
            "Net", "Grid", "Web", "Link", "Chain", "Ring", "Sphere", "Core",
            "Heart", "Soul", "Spirit", "Essence", "Force", "Power", "Energy",
            "Zone", "Space", "Realm", "Dimension", "Plane", "Level", "Tier",
            "Class", "Type", "Model", "Version", "Build", "Release", "Update",
        ]

        # Street and underground terms
        self.street_terms = [
            "Street", "Alley", "Lane", "Avenue", "Boulevard", "Drive", "Way",
            "Corner", "Cross", "Junction", "Intersection", "Plaza", "Square",
            "District", "Zone", "Sector", "Block", "Tower", "Building", "Complex",
            "Underground", "Subway", "Tunnel", "Passage", "Corridor", "Hall",
        ]

        # Cyberpunk character archetypes
        self.cyberpunk_archetypes = [
            "Runner", "Hacker", "Netrunner", "Decker", "Cracker", "Phreaker",
            "Samurai", "Ninja", "Assassin", "Hunter", "Tracker", "Scout",
            "Fixer", "Dealer", "Smuggler", "Pirate", "Thief", "Burglar",
            "Corporate", "Executive", "Manager", "Director", "CEO", "President",
            "Cop", "Detective", "Agent", "Officer", "Guard", "Security",
        ]

        # Tech and hardware terms
        self.tech_hardware = [
            "Chip", "Processor", "Memory", "Storage", "Drive", "Disk", "Core",
            "Circuit", "Board", "Module", "Component", "Unit", "Device", "Gadget",
            "Tool", "Weapon", "Gun", "Blade", "Sword", "Knife", "Dagger",
            "Armor", "Shield", "Helmet", "Mask", "Glove", "Boot", "Suit",
        ]

        # Cyberpunk numbers and codes
        self.cyberpunk_numbers = [
            "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
            "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
            "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
            "31", "32", "33", "34", "35", "36", "37", "38", "39", "40",
            "41", "42", "43", "44", "45", "46", "47", "48", "49", "50",
            "51", "52", "53", "54", "55", "56", "57", "58", "59", "60",
            "61", "62", "63", "64", "65", "66", "67", "68", "69", "70",
            "71", "72", "73", "74", "75", "76", "77", "78", "79", "80",
            "81", "82", "83", "84", "85", "86", "87", "88", "89", "90",
            "91", "92", "93", "94", "95", "96", "97", "98", "99", "00",
        ]

    def generate_cyberpunk_name(
        self, spirit: AnimalSpirit | None = None, use_spirit: bool = True
    ) -> AgentName:
        """Generate a Cyberpunk-style name."""
        if use_spirit and spirit:
            return self._generate_spirit_cyberpunk_name(spirit)
        else:
            return self._generate_pure_cyberpunk_name()

    def _generate_spirit_cyberpunk_name(self, spirit: AnimalSpirit) -> AgentName:
        """Generate Cyberpunk name with animal spirit integration."""
        # Use spirit name as base with Cyberpunk styling
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
            spirit_names.get(spirit_key, ["Cyber"]), "Cyber"
        )

        prefix = self.selector.select_with_fallback(self.tech_prefixes, "Cyber")
        suffix = self.selector.select_with_fallback(self.cyberpunk_suffixes, "Net")

        name = self.name_builder.build_hyphenated_name([prefix, base_name, suffix])
        components = [prefix, base_name, suffix]

        return AgentName(
            name=name,
            spirit=spirit,
            style=NamingStyle.CYBERPUNK,
            components=components,
        )

    def _generate_pure_cyberpunk_name(self) -> AgentName:
        """Generate pure Cyberpunk name without animal spirit."""
        # Choose between different Cyberpunk naming patterns
        pattern = random.choice([1, 2, 3, 4, 5, 6])  # nosec B311

        if pattern == 1:
            # Pattern: [Tech Prefix] + [Core] + [Suffix]
            prefix = self.selector.select_with_fallback(self.tech_prefixes, "Cyber")
            core = self.selector.select_with_fallback(self.cyberpunk_cores, "Nexus")
            suffix = self.selector.select_with_fallback(self.cyberpunk_suffixes, "Net")
            name = self.name_builder.build_hyphenated_name([prefix, core, suffix])
            components = [prefix, core, suffix]

        elif pattern == 2:
            # Pattern: [Archetype] + [Street] + [Number]
            archetype = self.selector.select_with_fallback(self.cyberpunk_archetypes, "Runner")
            street = self.selector.select_with_fallback(self.street_terms, "Street")
            number = self.selector.select_with_fallback(self.cyberpunk_numbers, "01")
            name = self.name_builder.build_hyphenated_name([archetype, street, number])
            components = [archetype, street, number]

        elif pattern == 3:
            # Pattern: [Tech Prefix] + [Hardware] + [Number]
            prefix = self.selector.select_with_fallback(self.tech_prefixes, "Neural")
            hardware = self.selector.select_with_fallback(self.tech_hardware, "Chip")
            number = self.selector.select_with_fallback(self.cyberpunk_numbers, "01")
            name = self.name_builder.build_hyphenated_name([prefix, hardware, number])
            components = [prefix, hardware, number]

        elif pattern == 4:
            # Pattern: [Core] + [Archetype] + [Suffix]
            core = self.selector.select_with_fallback(self.cyberpunk_cores, "Matrix")
            archetype = self.selector.select_with_fallback(self.cyberpunk_archetypes, "Hacker")
            suffix = self.selector.select_with_fallback(self.cyberpunk_suffixes, "Zone")
            name = self.name_builder.build_hyphenated_name([core, archetype, suffix])
            components = [core, archetype, suffix]

        elif pattern == 5:
            # Pattern: [Hardware] + [Tech Prefix] + [Number]
            hardware = self.selector.select_with_fallback(self.tech_hardware, "Processor")
            prefix = self.selector.select_with_fallback(self.tech_prefixes, "Quantum")
            number = self.selector.select_with_fallback(self.cyberpunk_numbers, "01")
            name = self.name_builder.build_hyphenated_name([hardware, prefix, number])
            components = [hardware, prefix, number]

        else:
            # Pattern: [Street] + [Archetype] + [Suffix]
            street = self.selector.select_with_fallback(self.street_terms, "Alley")
            archetype = self.selector.select_with_fallback(self.cyberpunk_archetypes, "Samurai")
            suffix = self.selector.select_with_fallback(self.cyberpunk_suffixes, "Core")
            name = self.name_builder.build_hyphenated_name([street, archetype, suffix])
            components = [street, archetype, suffix]

        return AgentName(
            name=name,
            spirit=None,
            style=NamingStyle.CYBERPUNK,
            components=components,
        )

    def generate_cyberpunk_batch(self, count: int = 5) -> list[AgentName]:
        """Generate a batch of Cyberpunk names with variety."""
        names = []
        for i in range(count):
            # Alternate between spirit and pure Cyberpunk names
            use_spirit = i % 2 == 0
            if use_spirit:
                spirit = AnimalSpirit(random.choice(list(AnimalSpirit)))  # nosec B311
                name = self.generate_cyberpunk_name(spirit, use_spirit=True)
            else:
                name = self.generate_cyberpunk_name(use_spirit=False)
            names.append(name)
        return names
