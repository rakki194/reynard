"""
Reynard Robot Name Generator
===========================

Generates robot names inspired by Asimov's Foundation, Destiny's Exo, and other sci-fi universes,
but infused with diverse animal spirits and mythological references.

Note: This module uses Python's standard random module for non-cryptographic name generation.
The random choices are used purely for creative name generation, not for security purposes.
"""

import random  # nosec B311 - Used for non-cryptographic name generation

from .generators import AlternativeNamingGenerator
from .types import AgentName, AnimalSpirit, NamingConfig, NamingScheme, NamingStyle


class ReynardRobotNamer:
    """Generates robot names with animal spirit themes and sci-fi conventions."""

    def __init__(self) -> None:
        """Initialize the name generator with all naming data."""
        self._load_animal_spirits()
        self._load_naming_components()
        self._load_generation_numbers()
        self.alternative_generator = AlternativeNamingGenerator()

    def _load_animal_spirits(self) -> None:
        """Load animal spirit base names with diverse and exotic animals."""
        self.animal_spirits = {
            # Canines and Foxes
            "fox": [
                # Scientific and Latin
                "Vulpine",
                "Vulpes",
                "Fennec",
                "Arctic",
                "Kit",
                "Swift",
                "Cunning",
                # Mythological and Cultural
                "Reynard",
                "Kitsune",
                "Vixen",
                "Trickster",
                "Sly",
                "Wily",
                "Guile",
                "Slick",
                "Rascal",
                "Bandit",
                "Mischief",
                "Zorro",
                "Sage",
                "Clever",
                "Wit",
                "Crafty",
                "Shrewd",
                "Astute",
                "Sharp",
                "Bright",
                "Quick",
                # Color and Appearance
                "Rusty",
                "Amber",
                "Crimson",
                "Scarlet",
                "Copper",
                "Ginger",
                "Auburn",
                "Flame",
                "Ember",
                "Blaze",
                "Fire",
                "Sunset",
                "Autumn",
                "Maple",
                # Nature and Environment
                "Forest",
                "Woodland",
                "Meadow",
                "Prairie",
                "Desert",
                "Tundra",
                "Taiga",
                "Steppe",
                "Savanna",
                "Brush",
                "Thicket",
                "Grove",
                "Copse",
                "Glade",
                # Personality and Traits
                "Foxy",
                "Sneaky",
                "Elusive",
                "Graceful",
                "Agile",
                "Nimble",
                "Fleet",
                "Spry",
                "Lithe",
                "Supple",
                "Elegant",
                "Refined",
                "Sophisticated",
                "Charming",
                "Enchanting",
                "Alluring",
                "Captivating",
                "Mesmerizing",
            ],
            "wolf": [
                # Scientific and Latin
                "Lupus",
                "Canis",
                "Lycan",
                "Lobo",
                "Lupin",
                # Mythological and Cultural
                "Fenrir",
                "Amaruq",
                "Phelan",
                "Conan",
                "Ragnar",
                "Akela",
                "Anuk",
                # Pack and Hierarchy
                "Alpha",
                "Beta",
                "Gamma",
                "Pack",
                "Leader",
                "Chief",
                "Captain",
                "Commander",
                "General",
                "Marshal",
                "Patriarch",
                "Matriarch",
                "Elder",
                # Hunting and Predator
                "Hunter",
                "Predator",
                "Stalker",
                "Tracker",
                "Scout",
                "Sentinel",
                "Guardian",
                "Protector",
                "Defender",
                "Warrior",
                "Fighter",
                "Champion",
                # Nature and Environment
                "Shadow",
                "Storm",
                "Midnight",
                "Blaze",
                "Fang",
                "Claw",
                "Tooth",
                "Timber",
                "Ash",
                "River",
                "Stone",
                "Forest",
                "Mountain",
                "Valley",
                # Personality and Traits
                "Fierce",
                "Wild",
                "Free",
                "Proud",
                "Noble",
                "Majestic",
                "Regal",
                "Royal",
                "Imperial",
                "Sovereign",
                "Dominant",
                "Powerful",
                "Strong",
                "Mighty",
                "Brave",
                "Bold",
                "Courageous",
                "Fearless",
                "Valiant",
                "Loyal",
                "Faithful",
                "Devoted",
                "Steadfast",
                "Resolute",
                "Determined",
            ],
            "otter": [
                # Scientific and Latin
                "Lutra",
                "Enhydra",
                "Pteronura",
                "Aonyx",
                "Lontra",
                # Literature and Media
                "Tarka",
                "Emmet",
                "Ollie",
                "Ottilie",
                "Otis",
                "Otty",
                # Playful and Cute
                "Bubbles",
                "Squirt",
                "Nibbles",
                "Puddle",
                "Wiggles",
                "Splash",
                "Ripple",
                "Pebbles",
                "Snickers",
                "Cuddles",
                "Snuggles",
                "Whiskers",
                # Water and Aquatic
                "River",
                "Sea",
                "Brook",
                "Marina",
                "Aqua",
                "Wave",
                "Current",
                "Tide",
                "Flow",
                "Creek",
                "Stream",
                "Rapids",
                "Falls",
                "Cascade",
                # Personality and Traits
                "Playful",
                "Joyful",
                "Cheerful",
                "Merry",
                "Happy",
                "Jolly",
                "Lively",
                "Vibrant",
                "Energetic",
                "Spirited",
                "Bubbly",
                "Effervescent",
                "Animated",
                "Dynamic",
                "Active",
                "Agile",
                "Nimble",
                "Graceful",
                "Sleek",
                "Smooth",
                "Fluid",
                "Elegant",
                "Charming",
                "Endearing",
            ],
            # Add more spirits as needed - keeping this concise for now
            "dragon": ["Draco", "Wyrm", "Serpent", "Ancient", "Elder", "Primordial"],
            "phoenix": ["Phoenix", "Firebird", "Rebirth", "Renewal", "Eternal"],
            "eagle": ["Aquila", "Haliaeetus", "Golden", "Bald", "Harpy", "Crowned"],
            "lion": ["Panthera", "Leo", "King", "Mane", "Pride", "Regal"],
            "tiger": ["Panthera", "Tigris", "Bengal", "Siberian", "Striped", "Fierce"],
        }

    def _load_naming_components(self) -> None:
        """Load naming style components."""
        # Foundation-style suffixes (strategic, intellectual, leadership)
        self.foundation_suffixes = [
            "Prime",
            "Sage",
            "Oracle",
            "Prophet",
            "Architect",
            "Strategist",
            "Analyst",
            "Coordinator",
            "Director",
            "Commander",
            "Advisor",
            "Counselor",
            "Planner",
            "Designer",
            "Engineer",
            "Scientist",
            "Scholar",
            "Philosopher",
            "Theorist",
            "Visionary",
            "Master",
            "Grandmaster",
            "Elder",
            "Wise",
            "Keeper",
            "Guardian",
        ]

        # Exo-style suffixes (combat, technical, operational)
        self.exo_suffixes = [
            "Strike",
            "Guard",
            "Sentinel",
            "Hunter",
            "Scout",
            "Ranger",
            "Protocol",
            "System",
            "Core",
            "Unit",
            "Frame",
            "Chassis",
            "Interface",
            "Matrix",
            "Network",
            "Circuit",
            "Node",
            "Module",
            "Component",
            "Assembly",
            "Structure",
        ]

        # Cyberpunk-style prefixes and suffixes
        self.cyberpunk_prefixes = [
            "Cyber",
            "Neo",
            "Mega",
            "Ultra",
            "Hyper",
            "Super",
            "Meta",
            "Quantum",
            "Neural",
            "Digital",
            "Virtual",
            "Synthetic",
            "Artificial",
            "Bio",
            "Nano",
        ]

        self.cyberpunk_suffixes = [
            "Nexus",
            "Grid",
            "Web",
            "Net",
            "Link",
            "Chain",
            "Ring",
            "Sphere",
            "Core",
            "Heart",
            "Soul",
            "Spirit",
            "Essence",
            "Force",
            "Power",
            "Energy",
        ]

        # Mythological references
        self.mythological_references = [
            "Atlas",
            "Prometheus",
            "Vulcan",
            "Minerva",
            "Apollo",
            "Artemis",
            "Odysseus",
            "Achilles",
            "Hector",
            "Perseus",
            "Theseus",
            "Orion",
            "Hercules",
            "Jason",
            "Odin",
            "Thor",
            "Loki",
            "Freyja",
            "Freyr",
            "Tyr",
            "Heimdall",
            "Baldr",
            "Ra",
            "Anubis",
            "Horus",
            "Isis",
            "Osiris",
            "Set",
            "Thoth",
            "Bastet",
        ]

        # Scientific naming conventions
        self.scientific_prefixes = [
            "Panthera",
            "Canis",
            "Felis",
            "Ursus",
            "Elephas",
            "Loxodonta",
            "Balaena",
            "Megaptera",
            "Physeter",
            "Orcinus",
            "Delphinus",
            "Tursiops",
            "Carcharodon",
        ]

        self.scientific_suffixes = [
            "Leo",
            "Tigris",
            "Pardus",
            "Onca",
            "Jubatus",
            "Melanoleuca",
            "Acutorostrata",
            "Novaeangliae",
            "Macrocephalus",
            "Orca",
            "Truncatus",
            "Aduncus",
            "Carcharias",
        ]

        # Hybrid-style references
        self.hybrid_references = [
            "Atlas",
            "Prometheus",
            "Vulcan",
            "Minerva",
            "Apollo",
            "Artemis",
            "Odysseus",
            "Nexus",
            "Quantum",
            "Neural",
            "Cyber",
            "Digital",
            "Binary",
            "Odin",
            "Thor",
        ]

        # Special designations
        self.special_designations = [
            "Alpha",
            "Beta",
            "Gamma",
            "Delta",
            "Epsilon",
            "Zeta",
            "Eta",
            "Prime",
            "Ultra",
            "Mega",
            "Super",
            "Hyper",
            "Meta",
            "Neo",
        ]

    def _load_generation_numbers(self) -> None:
        """Load generation numbers with animal spirit significance."""
        self.generation_numbers = {
            "fox": [3, 7, 13, 21, 34, 55, 89],  # Fibonacci sequence (fox cunning)
            "wolf": [8, 16, 24, 32, 40, 48, 56],  # Pack multiples (wolf pack)
            "otter": [5, 10, 15, 20, 25, 30, 35],  # Water cycles (otter aquatic)
            "dragon": [1, 2, 4, 8, 16, 32, 64],  # Power of 2 (dragon power)
            "phoenix": [7, 14, 21, 28, 35, 42, 49],  # Rebirth cycles
            "eagle": [12, 24, 36, 48, 60, 72, 84],  # Soaring altitude levels
            "lion": [1, 2, 3, 5, 8, 13, 21],  # Pride hierarchy (Fibonacci)
            "tiger": [9, 18, 27, 36, 45, 54, 63],  # Stripe pattern sequences
        }

    def generate_foundation_style(
        self, spirit: AnimalSpirit | None = None
    ) -> AgentName:
        """Generate Foundation-style names: [Spirit] + [Suffix] + [Generation]"""
        if not spirit:
            spirit = AnimalSpirit(
                random.choice(list(self.animal_spirits.keys()))
            )  # nosec B311

        spirit_key = spirit.value
        if spirit_key not in self.animal_spirits:
            spirit_key = "fox"  # Default fallback

        base_name = random.choice(self.animal_spirits[spirit_key])  # nosec B311
        suffix = random.choice(self.foundation_suffixes)  # nosec B311
        generation = random.choice(
            self.generation_numbers.get(spirit_key, [1, 2, 3, 4, 5])
        )  # nosec B311

        name = f"{base_name}-{suffix}-{generation}"
        components = [base_name, suffix, str(generation)]

        return AgentName(
            name=name,
            spirit=spirit,
            style=NamingStyle.FOUNDATION,
            components=components,
            generation_number=generation,
        )

    def generate_exo_style(self, spirit: AnimalSpirit | None = None) -> AgentName:
        """Generate Exo-style names: [Spirit] + [Suffix] + [Model]"""
        if not spirit:
            spirit = AnimalSpirit(
                random.choice(list(self.animal_spirits.keys()))
            )  # nosec B311

        spirit_key = spirit.value
        if spirit_key not in self.animal_spirits:
            spirit_key = "fox"  # Default fallback

        base_name = random.choice(self.animal_spirits[spirit_key])  # nosec B311
        suffix = random.choice(self.exo_suffixes)  # nosec B311
        model = random.choice(
            self.generation_numbers.get(spirit_key, [1, 2, 3, 4, 5])
        )  # nosec B311

        name = f"{base_name}-{suffix}-{model}"
        components = [base_name, suffix, str(model)]

        return AgentName(
            name=name,
            spirit=spirit,
            style=NamingStyle.EXO,
            components=components,
            generation_number=model,
        )

    def generate_cyberpunk_style(self, spirit: AnimalSpirit | None = None) -> AgentName:
        """Generate Cyberpunk-style names: [Tech Prefix] + [Animal Spirit] + [Cyber Suffix]"""
        if not spirit:
            spirit = AnimalSpirit(
                random.choice(list(self.animal_spirits.keys()))
            )  # nosec B311

        spirit_key = spirit.value
        if spirit_key not in self.animal_spirits:
            spirit_key = "fox"  # Default fallback

        prefix = random.choice(self.cyberpunk_prefixes)  # nosec B311
        base_name = random.choice(self.animal_spirits[spirit_key])  # nosec B311
        suffix = random.choice(self.cyberpunk_suffixes)  # nosec B311

        name = f"{prefix}-{base_name}-{suffix}"
        components = [prefix, base_name, suffix]

        return AgentName(
            name=name,
            spirit=spirit,
            style=NamingStyle.CYBERPUNK,
            components=components,
        )

    def generate_mythological_style(
        self, spirit: AnimalSpirit | None = None
    ) -> AgentName:
        """Generate Mythological-style names: [Mythological Reference] + [Animal Spirit] + [Divine Suffix]"""
        if not spirit:
            spirit = AnimalSpirit(
                random.choice(list(self.animal_spirits.keys()))
            )  # nosec B311

        spirit_key = spirit.value
        if spirit_key not in self.animal_spirits:
            spirit_key = "fox"  # Default fallback

        myth_ref = random.choice(self.mythological_references)  # nosec B311
        base_name = random.choice(self.animal_spirits[spirit_key])  # nosec B311
        divine_suffix = random.choice(
            [  # nosec B311
                "Divine",
                "Sacred",
                "Holy",
                "Blessed",
                "Chosen",
                "Anointed",
                "Consecrated",
                "Hallowed",
                "Revered",
                "Venerated",
                "Exalted",
                "Transcendent",
                "Eternal",
            ]
        )

        name = f"{myth_ref}-{base_name}-{divine_suffix}"
        components = [myth_ref, base_name, divine_suffix]

        return AgentName(
            name=name,
            spirit=spirit,
            style=NamingStyle.MYTHOLOGICAL,
            components=components,
        )

    def generate_scientific_style(
        self, spirit: AnimalSpirit | None = None
    ) -> AgentName:
        """Generate Scientific-style names: [Scientific Name] + [Technical Suffix] + [Classification]"""
        # Note: spirit parameter is kept for API consistency but not used in scientific style
        _ = spirit  # Suppress unused parameter warning

        scientific_prefix = random.choice(self.scientific_prefixes)  # nosec B311
        scientific_suffix = random.choice(self.scientific_suffixes)  # nosec B311
        classification = random.choice(
            [  # nosec B311
                "Alpha",
                "Beta",
                "Gamma",
                "Delta",
                "Epsilon",
                "Zeta",
                "Eta",
                "Theta",
                "Prime",
                "Secondary",
                "Tertiary",
                "Type-A",
                "Type-B",
                "Class-1",
                "Class-2",
            ]
        )

        name = f"{scientific_prefix}-{scientific_suffix}-{classification}"
        components = [scientific_prefix, scientific_suffix, classification]

        return AgentName(
            name=name,
            spirit=AnimalSpirit.FOX,  # Default for scientific style
            style=NamingStyle.SCIENTIFIC,
            components=components,
        )

    def generate_hybrid_style(self, spirit: AnimalSpirit | None = None) -> AgentName:
        """Generate Hybrid-style names: [Spirit] + [Reference] + [Designation]"""
        if not spirit:
            spirit = AnimalSpirit(
                random.choice(list(self.animal_spirits.keys()))
            )  # nosec B311

        spirit_key = spirit.value
        if spirit_key not in self.animal_spirits:
            spirit_key = "fox"  # Default fallback

        base_name = random.choice(self.animal_spirits[spirit_key])  # nosec B311
        reference = random.choice(self.hybrid_references)  # nosec B311
        designation = random.choice(self.special_designations)  # nosec B311

        name = f"{base_name}-{reference}-{designation}"
        components = [base_name, reference, designation]

        return AgentName(
            name=name,
            spirit=spirit,
            style=NamingStyle.HYBRID,
            components=components,
        )

    def generate_random_style(self, spirit: AnimalSpirit | None = None) -> AgentName:
        """Generate a random style name."""
        styles = [
            self.generate_foundation_style,
            self.generate_exo_style,
            self.generate_hybrid_style,
            self.generate_cyberpunk_style,
            self.generate_mythological_style,
            self.generate_scientific_style,
        ]
        return random.choice(styles)(spirit)  # nosec B311

    def generate_single_name(self, config: NamingConfig) -> AgentName:
        """Generate a single name based on configuration."""
        try:
            # Check if using alternative naming scheme
            if config.scheme != NamingScheme.ANIMAL_SPIRIT:
                return self.alternative_generator.generate_name(config)

            # Use original animal spirit scheme
            style_generators = {
                NamingStyle.FOUNDATION: self.generate_foundation_style,
                NamingStyle.EXO: self.generate_exo_style,
                NamingStyle.HYBRID: self.generate_hybrid_style,
                NamingStyle.CYBERPUNK: self.generate_cyberpunk_style,
                NamingStyle.MYTHOLOGICAL: self.generate_mythological_style,
                NamingStyle.SCIENTIFIC: self.generate_scientific_style,
            }

            generator = style_generators.get(config.style, self.generate_random_style)
            return generator(config.spirit)
        except Exception:
            # Fallback to simple name
            return AgentName(
                name=f"Agent-{random.randint(1, 9999)}",  # nosec B311
                spirit=AnimalSpirit.FOX,
                style=NamingStyle.FOUNDATION,
                components=["Agent"],
            )

    def generate_batch(self, config: NamingConfig) -> list[AgentName]:
        """Generate multiple unique names."""
        names: set[str] = set()
        results: list[AgentName] = []
        attempts = 0
        max_attempts = max(config.count * 20, 100)

        while len(results) < config.count and attempts < max_attempts:
            attempts += 1
            agent_name = self.generate_single_name(config)

            if agent_name.name not in names and agent_name.name.strip():
                names.add(agent_name.name)
                results.append(agent_name)

        # If we couldn't generate enough unique names, add fallback names
        while len(results) < config.count:
            fallback_name = f"Agent-{len(results) + 1}"
            if fallback_name not in names:
                names.add(fallback_name)
                results.append(
                    AgentName(
                        name=fallback_name,
                        spirit=AnimalSpirit.FOX,
                        style=NamingStyle.FOUNDATION,
                        components=["Agent"],
                    )
                )

        return results

    def get_spirit_info(self, name: str) -> dict[str, str]:
        """Analyze a generated name to extract spirit information."""
        spirit = "unknown"
        style = "unknown"
        components = []

        # Detect spirit
        for spirit_key, bases in self.animal_spirits.items():
            for base in bases:
                if base.lower() in name.lower():
                    spirit = spirit_key
                    components.append(f"Base: {base}")
                    break
            if spirit != "unknown":
                break

        # Detect style
        style_checks = [
            (self.foundation_suffixes, "foundation"),
            (self.exo_suffixes, "exo"),
            (self.hybrid_references, "hybrid"),
            (self.cyberpunk_prefixes, "cyberpunk"),
            (self.mythological_references, "mythological"),
            (self.scientific_prefixes, "scientific"),
        ]

        for components_list, style_name in style_checks:
            if any(comp.lower() in name.lower() for comp in components_list):
                style = style_name
                break

        return {
            "spirit": spirit,
            "style": style,
            "components": components,
        }
