#!/usr/bin/env python3
# ruff: noqa: S311
"""
Reynard Robot Name Generator
============================

Generates robot names inspired by Asimov's Foundation, Destiny's Exo, and other sci-fi universes,
but infused with diverse animal spirits and mythological references.

Note: This module uses Python's standard random module for non-cryptographic name generation.
The random choices are used purely for creative name generation, not for security purposes.

Naming Patterns:
- Foundation Style: [Animal Spirit] + [Tactical/Strategic Suffix] + [Generation Number]
- Exo Style: [Animal Spirit] + [Combat/Technical Suffix] + [Model Number]
- Hybrid Style: [Animal Spirit] + [Mythological/Historical Reference] + [Designation]
- Cyberpunk Style: [Tech Prefix] + [Animal Spirit] + [Cyber Suffix]
- Mythological Style: [Mythological Reference] + [Animal Spirit] + [Divine Suffix]
- Scientific Style: [Scientific Name] + [Technical Suffix] + [Classification]

Examples:
- Vulpine-7 (Fox spirit, Exo style)
- Lupus-Prime (Wolf spirit, Foundation style)
- Lutra-Protocol (Otter spirit, Hybrid style)
- Cyber-Axolotl-Nexus (Cyberpunk style)
- Apollo-Falcon-Divine (Mythological style)
- Panthera-Leo-Alpha (Scientific style)
"""

import random  # nosec B311 - Used for non-cryptographic name generation


class ReynardRobotNamer:
    """Generates robot names with animal spirit themes and sci-fi conventions."""

    def __init__(self) -> None:
        # Expanded animal spirit base names with diverse and exotic animals
        self.animal_spirits = {
            # Canines and Foxes
            "fox": [
                "Vulpine",
                "Vulpes",
                "Reynard",
                "Fennec",
                "Arctic",
                "Kit",
                "Swift",
                "Cunning",
            ],
            "wolf": [
                "Lupus",
                "Canis",
                "Alpha",
                "Fenrir",
                "Lycan",
                "Pack",
                "Hunter",
                "Shadow",
            ],
            "coyote": ["Canis", "Prairie", "Brush", "Desert", "Trickster", "Wily"],
            "jackal": ["Canis", "Golden", "Black", "Side", "Desert", "Stealth"],
            # Aquatic and Marine
            "otter": [
                "Lutra",
                "Enhydra",
                "Pteronura",
                "Aonyx",
                "Lontra",
                "River",
                "Sea",
            ],
            "dolphin": [
                "Delphinus",
                "Tursiops",
                "Orca",
                "Bottlenose",
                "Spinner",
                "Risso",
            ],
            "whale": [
                "Balaena",
                "Megaptera",
                "Physeter",
                "Orcinus",
                "Humpback",
                "Sperm",
            ],
            "shark": [
                "Carcharodon",
                "Galeocerdo",
                "Sphyrna",
                "Great",
                "Hammer",
                "Tiger",
            ],
            "octopus": [
                "Octopus",
                "Cephalopod",
                "Ink",
                "Tentacle",
                "Camouflage",
                "Intelligence",
            ],
            "axolotl": [
                "Ambystoma",
                "Axolotl",
                "Regen",
                "Mexican",
                "Salamander",
                "Neotenic",
            ],
            # Birds of Prey and Flight
            "eagle": ["Aquila", "Haliaeetus", "Golden", "Bald", "Harpy", "Crowned"],
            "falcon": ["Falco", "Peregrine", "Kestrel", "Merlin", "Gyrfalcon", "Saker"],
            "raven": ["Corvus", "Raven", "Crow", "Intelligence", "Mystery", "Omen"],
            "owl": ["Bubo", "Strix", "Tyto", "Barn", "Snowy", "Great", "Horned"],
            "hawk": ["Accipiter", "Buteo", "Red", "Cooper", "Sharp", "Broad"],
            # Big Cats and Predators
            "lion": ["Panthera", "Leo", "King", "Mane", "Pride", "Regal"],
            "tiger": ["Panthera", "Tigris", "Bengal", "Siberian", "Striped", "Fierce"],
            "leopard": ["Panthera", "Pardus", "Spotted", "Stealth", "Agile", "Climber"],
            "jaguar": ["Panthera", "Onca", "Amazon", "Powerful", "Spotted", "Hunter"],
            "cheetah": ["Acinonyx", "Jubatus", "Speed", "Spotted", "Fast", "Graceful"],
            "lynx": ["Lynx", "Bobcat", "Ear", "Tufted", "Stealth", "Mountain"],
            # Bears and Large Mammals
            "bear": ["Ursus", "Grizzly", "Polar", "Black", "Brown", "Kodiak"],
            "panda": ["Ailuropoda", "Giant", "Bamboo", "Black", "White", "Gentle"],
            "elephant": ["Elephas", "Loxodonta", "Tusker", "Memory", "Wise", "Gentle"],
            "rhino": [
                "Rhinoceros",
                "Horn",
                "Armored",
                "Massive",
                "Ancient",
                "Powerful",
            ],
            # Primates and Intelligence
            "ape": [
                "Pan",
                "Gorilla",
                "Orangutan",
                "Chimpanzee",
                "Bonobo",
                "Intelligence",
            ],
            "monkey": ["Macaca", "Capuchin", "Spider", "Howler", "Marmoset", "Agile"],
            "lemur": ["Lemur", "Ring", "Sifaka", "Aye", "Aye", "Madagascar"],
            # Reptiles and Amphibians
            "snake": ["Serpens", "Python", "Cobra", "Viper", "Constrictor", "Venom"],
            "lizard": ["Lacerta", "Gecko", "Iguana", "Monitor", "Chameleon", "Dragon"],
            "turtle": ["Testudo", "Tortoise", "Shell", "Ancient", "Wise", "Slow"],
            "frog": ["Rana", "Tree", "Poison", "Dart", "Leap", "Amphibian"],
            # Insects and Arachnids
            "spider": ["Aranea", "Tarantula", "Web", "Silk", "Venom", "Eight"],
            "ant": ["Formica", "Colony", "Worker", "Queen", "Soldier", "Hive"],
            "bee": ["Apis", "Honey", "Queen", "Worker", "Drone", "Hive"],
            "mantis": ["Mantis", "Praying", "Preying", "Stealth", "Patience", "Strike"],
            "dragonfly": ["Odonata", "Dragon", "Fly", "Wing", "Agile", "Predator"],
            # Exotic and Unique
            "pangolin": ["Manis", "Scaly", "Anteater", "Armored", "Unique", "Rare"],
            "platypus": [
                "Ornithorhynchus",
                "Duck",
                "Bill",
                "Venom",
                "Unique",
                "Australian",
            ],
            "narwhal": ["Monodon", "Unicorn", "Tusk", "Arctic", "Mystical", "Whale"],
            "quokka": [
                "Setonix",
                "Smile",
                "Happy",
                "Marsupial",
                "Australian",
                "Friendly",
            ],
            "capybara": ["Hydrochoerus", "Giant", "Rodent", "Water", "Social", "Calm"],
            "aye": ["Daubentonia", "Aye", "Aye", "Madagascar", "Nocturnal", "Unique"],
            "kiwi": ["Apteryx", "Flightless", "New", "Zealand", "Nocturnal", "Unique"],
            "toucan": ["Ramphastos", "Beak", "Colorful", "Tropical", "Fruit", "Bright"],
            "flamingo": [
                "Phoenicopterus",
                "Pink",
                "Flamingo",
                "Graceful",
                "Standing",
                "Elegant",
            ],
            "peacock": [
                "Pavo",
                "Peacock",
                "Feather",
                "Display",
                "Colorful",
                "Majestic",
            ],
        }

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
            "Steward",
            "Curator",
            "Librarian",
            "Historian",
            "Chronicler",
            "Scribe",
            "Mentor",
            "Teacher",
            "Guide",
            "Navigator",
            "Pilot",
            "Captain",
            "Admiral",
            "General",
            "Marshal",
            "Chancellor",
            "Minister",
            "Ambassador",
            "Diplomat",
            "Negotiator",
            "Mediator",
            "Arbiter",
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
            "Framework",
            "Platform",
            "Engine",
            "Drive",
            "Motor",
            "Gear",
            "Cog",
            "Piston",
            "Valve",
            "Switch",
            "Button",
            "Lever",
            "Handle",
            "Grip",
            "Claw",
            "Pincer",
            "Blade",
            "Edge",
            "Point",
            "Tip",
            "Spike",
            "Barb",
            "Hook",
            "Shield",
            "Armor",
            "Plate",
            "Shell",
            "Casing",
            "Hull",
            "Body",
            "Form",
            "Shape",
            "Design",
            "Model",
            "Type",
            "Class",
            "Series",
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
            "Micro",
            "Macro",
            "Proto",
            "Alpha",
            "Beta",
            "Gamma",
            "Delta",
            "Epsilon",
            "Zeta",
            "Eta",
            "Theta",
            "Lambda",
            "Omega",
            "Prime",
            "Zero",
            "One",
            "Binary",
            "Hex",
            "Octal",
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
            "Cube",
            "Pyramid",
            "Cone",
            "Cylinder",
            "Prism",
            "Crystal",
            "Gem",
            "Core",
            "Heart",
            "Soul",
            "Spirit",
            "Essence",
            "Force",
            "Power",
            "Energy",
            "Wave",
            "Pulse",
            "Signal",
            "Beam",
            "Ray",
            "Laser",
            "Plasma",
            "Ion",
            "Photon",
            "Electron",
            "Neutron",
            "Proton",
            "Quark",
            "Lepton",
            "Boson",
            "Fermion",
            "String",
            "Field",
            "Space",
            "Void",
            "Null",
            "Void",
            "Zero",
            "Infinity",
        ]

        # Mythological references (expanded from various cultures)
        self.mythological_references = [
            # Greek/Roman
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
            "Bellerophon",
            "Cadmus",
            "Perseus",
            "Theseus",
            "Ares",
            "Athena",
            "Hera",
            "Zeus",
            "Poseidon",
            "Hades",
            "Dionysus",
            "Hermes",
            "Hephaestus",
            "Aphrodite",
            "Demeter",
            "Persephone",
            # Norse
            "Odin",
            "Thor",
            "Loki",
            "Freyja",
            "Freyr",
            "Tyr",
            "Heimdall",
            "Baldr",
            "Vidar",
            "Vali",
            "Fenrir",
            "Jormungandr",
            "Hel",
            "Sleipnir",
            "Gullinbursti",
            "Huginn",
            "Muninn",
            "Geri",
            "Freki",
            # Egyptian
            "Ra",
            "Anubis",
            "Horus",
            "Isis",
            "Osiris",
            "Set",
            "Thoth",
            "Bastet",
            "Sekhmet",
            "Hathor",
            "Ptah",
            "Sobek",
            "Khnum",
            "Maat",
            "Nephthys",
            "Geb",
            "Nut",
            "Shu",
            "Tefnut",
            # Celtic
            "Cernunnos",
            "Brigid",
            "Lugh",
            "Morrigan",
            "Dagda",
            "Aengus",
            "Manannan",
            "Bran",
            "Rhiannon",
            "Cerridwen",
            "Taliesin",
            # Japanese
            "Amaterasu",
            "Susanoo",
            "Tsukuyomi",
            "Raijin",
            "Fujin",
            "Inari",
            "Benzaiten",
            "Bishamonten",
            "Daikokuten",
            "Hotei",
            "Jurojin",
            "Fukurokuju",
            "Ebisu",
            "Kannon",
            "Jizo",
            "Fudo",
            "Aizen",
            # Hindu
            "Vishnu",
            "Shiva",
            "Brahma",
            "Krishna",
            "Rama",
            "Hanuman",
            "Ganesha",
            "Kali",
            "Durga",
            "Lakshmi",
            "Saraswati",
            "Indra",
            "Agni",
            "Varuna",
            "Vayu",
            "Surya",
            "Chandra",
            "Yama",
            # Chinese
            "Jade",
            "Emperor",
            "Dragon",
            "King",
            "Phoenix",
            "Tiger",
            "Turtle",
            "Snake",
            "Monkey",
            "Rooster",
            "Dog",
            "Pig",
            "Rat",
            "Ox",
            "Rabbit",
            "Horse",
            "Goat",
            "Zodiac",
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
            "Galeocerdo",
            "Sphyrna",
            "Octopus",
            "Ambystoma",
            "Aquila",
            "Haliaeetus",
            "Falco",
            "Corvus",
            "Bubo",
            "Strix",
            "Tyto",
            "Accipiter",
            "Buteo",
            "Acinonyx",
            "Ailuropoda",
            "Rhinoceros",
            "Pan",
            "Gorilla",
            "Macaca",
            "Serpens",
            "Lacerta",
            "Testudo",
            "Rana",
            "Aranea",
            "Formica",
            "Apis",
            "Manis",
            "Ornithorhynchus",
            "Monodon",
            "Setonix",
            "Hydrochoerus",
            "Daubentonia",
            "Apteryx",
            "Ramphastos",
            "Phoenicopterus",
            "Pavo",
            "Lutra",
            "Enhydra",
            "Pteronura",
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
            "Cuvier",
            "Leucas",
            "Vulgaris",
            "Mexicanum",
            "Chrysaetos",
            "Leucocephalus",
            "Peregrinus",
            "Corax",
            "Scandiaca",
            "Alba",
            "Jamaicensis",
            "Gentilis",
            "Coopersii",
            "Striatus",
            "Gigantea",
            "Maritimus",
            "Americanus",
            "Arctos",
            "Horribilis",
            "Bicolor",
            "Maximus",
            "Africana",
            "Sumatrensis",
            "Troglodytes",
            "Gorilla",
            "Pongo",
            "Sylvanus",
            "Catta",
            "Constrictor",
            "Naja",
            "Vipera",
            "Gecko",
            "Iguana",
            "Monitor",
            "Chameleon",
            "Tortoise",
            "Temporaria",
            "Dendrobates",
            "Tarantula",
            "Aranea",
            "Colony",
            "Mellifera",
            "Tricuspis",
            "Anatinus",
            "Monoceros",
            "Brachyurus",
            "Hydrochaeris",
            "Madagascariensis",
            "Australis",
            "Toco",
            "Ruber",
            "Cristatus",
            "Vulgaris",
            "Lutris",
            "Brasiliensis",
            "Gigas",
        ]

        # Hybrid-style references (mythological, historical, technical)
        self.hybrid_references = [
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
            "Nexus",
            "Quantum",
            "Neural",
            "Cyber",
            "Digital",
            "Binary",
            "Odin",
            "Thor",
            "Loki",
            "Freyja",
            "Ra",
            "Anubis",
            "Horus",
            "Cernunnos",
            "Brigid",
            "Lugh",
            "Amaterasu",
            "Susanoo",
            "Vishnu",
            "Shiva",
            "Brahma",
            "Krishna",
            "Rama",
            "Hanuman",
            "Ganesha",
            "Jade",
            "Emperor",
            "Dragon",
            "King",
            "Phoenix",
            "Tiger",
        ]

        # Generation/Model numbers with animal spirit significance
        self.generation_numbers = {
            # Canines and Foxes
            "fox": [3, 7, 13, 21, 34, 55, 89],  # Fibonacci sequence (fox cunning)
            "wolf": [8, 16, 24, 32, 40, 48, 56],  # Pack multiples (wolf pack)
            "coyote": [4, 8, 12, 16, 20, 24, 28],  # Desert survival cycles
            "jackal": [6, 12, 18, 24, 30, 36, 42],  # Nocturnal hunting patterns
            # Aquatic and Marine
            "otter": [5, 10, 15, 20, 25, 30, 35],  # Water cycles (otter aquatic)
            "dolphin": [7, 14, 21, 28, 35, 42, 49],  # Pod communication frequencies
            "whale": [11, 22, 33, 44, 55, 66, 77],  # Deep ocean depths
            "shark": [9, 18, 27, 36, 45, 54, 63],  # Predator efficiency cycles
            "octopus": [8, 16, 24, 32, 40, 48, 56],  # Tentacle coordination
            "axolotl": [2, 4, 8, 16, 32, 64, 128],  # Regeneration powers of 2
            # Birds of Prey and Flight
            "eagle": [12, 24, 36, 48, 60, 72, 84],  # Soaring altitude levels
            "falcon": [15, 30, 45, 60, 75, 90, 105],  # Dive speed ratios
            "raven": [13, 26, 39, 52, 65, 78, 91],  # Intelligence complexity
            "owl": [6, 12, 18, 24, 30, 36, 42],  # Nocturnal hunting cycles
            "hawk": [10, 20, 30, 40, 50, 60, 70],  # Precision targeting
            # Big Cats and Predators
            "lion": [1, 2, 3, 5, 8, 13, 21],  # Pride hierarchy (Fibonacci)
            "tiger": [9, 18, 27, 36, 45, 54, 63],  # Stripe pattern sequences
            "leopard": [7, 14, 21, 28, 35, 42, 49],  # Spot pattern density
            "jaguar": [5, 10, 15, 20, 25, 30, 35],  # Amazon ecosystem cycles
            "cheetah": [11, 22, 33, 44, 55, 66, 77],  # Speed burst patterns
            "lynx": [4, 8, 12, 16, 20, 24, 28],  # Mountain terrain adaptation
            # Bears and Large Mammals
            "bear": [6, 12, 18, 24, 30, 36, 42],  # Hibernation cycles
            "panda": [3, 6, 9, 12, 15, 18, 21],  # Bamboo growth cycles
            "elephant": [8, 16, 24, 32, 40, 48, 56],  # Memory formation patterns
            "rhino": [7, 14, 21, 28, 35, 42, 49],  # Armor plate sequences
            # Primates and Intelligence
            "ape": [5, 10, 15, 20, 25, 30, 35],  # Social group dynamics
            "monkey": [6, 12, 18, 24, 30, 36, 42],  # Agile movement patterns
            "lemur": [4, 8, 12, 16, 20, 24, 28],  # Madagascar isolation cycles
            # Reptiles and Amphibians
            "snake": [11, 22, 33, 44, 55, 66, 77],  # Shedding cycles
            "lizard": [7, 14, 21, 28, 35, 42, 49],  # Regeneration patterns
            "turtle": [9, 18, 27, 36, 45, 54, 63],  # Longevity milestones
            "frog": [3, 6, 9, 12, 15, 18, 21],  # Metamorphosis stages
            # Insects and Arachnids
            "spider": [8, 16, 24, 32, 40, 48, 56],  # Web construction patterns
            "ant": [12, 24, 36, 48, 60, 72, 84],  # Colony organization
            "bee": [6, 12, 18, 24, 30, 36, 42],  # Hive communication
            "mantis": [5, 10, 15, 20, 25, 30, 35],  # Prayer position cycles
            "dragonfly": [4, 8, 12, 16, 20, 24, 28],  # Wing beat frequencies
            # Exotic and Unique
            "pangolin": [7, 14, 21, 28, 35, 42, 49],  # Scale armor patterns
            "platypus": [2, 4, 8, 16, 32, 64, 128],  # Unique evolution powers of 2
            "narwhal": [9, 18, 27, 36, 45, 54, 63],  # Tusk spiral patterns
            "quokka": [3, 6, 9, 12, 15, 18, 21],  # Smile frequency cycles
            "capybara": [8, 16, 24, 32, 40, 48, 56],  # Social group sizes
            "aye": [5, 10, 15, 20, 25, 30, 35],  # Nocturnal foraging patterns
            "kiwi": [6, 12, 18, 24, 30, 36, 42],  # Flightless adaptation cycles
            "toucan": [7, 14, 21, 28, 35, 42, 49],  # Beak color patterns
            "flamingo": [11, 22, 33, 44, 55, 66, 77],  # Flock formation patterns
            "peacock": [9, 18, 27, 36, 45, 54, 63],  # Display feather sequences
        }

        # Special designations for unique names
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

    def generate_foundation_style(self, spirit: str | None = None) -> str:
        """Generate Foundation-style names: [Spirit] + [Suffix] + [Generation]"""
        if not spirit:
            spirit = random.choice(list(self.animal_spirits.keys()))  # nosec B311

        base_name = random.choice(self.animal_spirits[spirit])  # nosec B311
        suffix = random.choice(self.foundation_suffixes)  # nosec B311
        generation = random.choice(self.generation_numbers[spirit])  # nosec B311

        return f"{base_name}-{suffix}-{generation}"

    def generate_exo_style(self, spirit: str | None = None) -> str:
        """Generate Exo-style names: [Spirit] + [Suffix] + [Model]"""
        if not spirit:
            spirit = random.choice(list(self.animal_spirits.keys()))  # nosec B311

        base_name = random.choice(self.animal_spirits[spirit])  # nosec B311
        suffix = random.choice(self.exo_suffixes)  # nosec B311
        model = random.choice(self.generation_numbers[spirit])  # nosec B311

        return f"{base_name}-{suffix}-{model}"

    def generate_hybrid_style(self, spirit: str | None = None) -> str:
        """Generate Hybrid-style names: [Spirit] + [Reference] + [Designation]"""
        if not spirit:
            spirit = random.choice(list(self.animal_spirits.keys()))  # nosec B311

        base_name = random.choice(self.animal_spirits[spirit])  # nosec B311
        reference = random.choice(self.hybrid_references)  # nosec B311
        designation = random.choice(self.special_designations)  # nosec B311

        return f"{base_name}-{reference}-{designation}"

    def generate_cyberpunk_style(self, spirit: str | None = None) -> str:
        """Generate Cyberpunk-style names: [Tech Prefix] + [Animal Spirit] + [Cyber Suffix]"""
        if not spirit:
            spirit = random.choice(list(self.animal_spirits.keys()))  # nosec B311

        prefix = random.choice(self.cyberpunk_prefixes)  # nosec B311
        base_name = random.choice(self.animal_spirits[spirit])  # nosec B311
        suffix = random.choice(self.cyberpunk_suffixes)  # nosec B311

        return f"{prefix}-{base_name}-{suffix}"

    def generate_mythological_style(self, spirit: str | None = None) -> str:
        """Generate Mythological-style names: [Mythological Reference] + [Animal Spirit] + [Divine Suffix]"""
        if not spirit:
            spirit = random.choice(list(self.animal_spirits.keys()))  # nosec B311

        myth_ref = random.choice(self.mythological_references)  # nosec B311
        base_name = random.choice(self.animal_spirits[spirit])  # nosec B311
        divine_suffix = random.choice(  # nosec B311
            [
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
                "Immortal",
                "Celestial",
                "Cosmic",
                "Stellar",
                "Lunar",
                "Solar",
                "Astral",
                "Ethereal",
                "Mystical",
                "Arcane",
                "Enchanted",
                "Magical",
                "Supernatural",
                "Otherworldly",
            ]
        )

        return f"{myth_ref}-{base_name}-{divine_suffix}"

    def generate_scientific_style(self, spirit: str | None = None) -> str:
        """Generate Scientific-style names: [Scientific Name] + [Technical Suffix] + [Classification]"""
        # Note: spirit parameter is kept for API consistency but not used in scientific style
        _ = spirit  # Suppress unused parameter warning

        scientific_prefix = random.choice(self.scientific_prefixes)  # nosec B311
        scientific_suffix = random.choice(self.scientific_suffixes)  # nosec B311
        classification = random.choice(  # nosec B311
            [
                "Alpha",
                "Beta",
                "Gamma",
                "Delta",
                "Epsilon",
                "Zeta",
                "Eta",
                "Theta",
                "Iota",
                "Kappa",
                "Lambda",
                "Mu",
                "Nu",
                "Xi",
                "Omicron",
                "Pi",
                "Rho",
                "Sigma",
                "Tau",
                "Upsilon",
                "Phi",
                "Chi",
                "Psi",
                "Omega",
                "Prime",
                "Secondary",
                "Tertiary",
                "Quaternary",
                "Quintary",
                "Primary",
                "Secondary",
                "Tertiary",
                "Quaternary",
                "Quintary",
                "Type-A",
                "Type-B",
                "Type-C",
                "Type-D",
                "Type-E",
                "Type-F",
                "Class-1",
                "Class-2",
                "Class-3",
                "Class-4",
                "Class-5",
                "Class-6",
                "Series-A",
                "Series-B",
                "Series-C",
                "Series-D",
                "Series-E",
                "Series-F",
                "Model-1",
                "Model-2",
                "Model-3",
                "Model-4",
                "Model-5",
                "Model-6",
                "Variant-A",
                "Variant-B",
                "Variant-C",
                "Variant-D",
                "Variant-E",
                "Variant-F",
                "Strain-1",
                "Strain-2",
                "Strain-3",
                "Strain-4",
                "Strain-5",
                "Strain-6",
                "Subspecies-A",
                "Subspecies-B",
                "Subspecies-C",
                "Subspecies-D",
                "Subspecies-E",
                "Subspecies-F",
            ]
        )

        return f"{scientific_prefix}-{scientific_suffix}-{classification}"

    def generate_random(self, spirit: str | None = None) -> str:
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

    def generate_batch(
        self, count: int = 10, spirit: str | None = None, style: str | None = None
    ) -> list[str]:
        """Generate multiple unique names."""
        names: set[str] = set()
        attempts = 0
        max_attempts = count * 10  # Prevent infinite loops

        while len(names) < count and attempts < max_attempts:
            attempts += 1

            if style == "foundation":
                name = self.generate_foundation_style(spirit)
            elif style == "exo":
                name = self.generate_exo_style(spirit)
            elif style == "hybrid":
                name = self.generate_hybrid_style(spirit)
            elif style == "cyberpunk":
                name = self.generate_cyberpunk_style(spirit)
            elif style == "mythological":
                name = self.generate_mythological_style(spirit)
            elif style == "scientific":
                name = self.generate_scientific_style(spirit)
            else:
                name = self.generate_random(spirit)

            names.add(name)

        return list(names)

    def _detect_spirit(self, name: str) -> tuple[str, list[str]]:
        """Detect animal spirit from name components."""
        components = []
        for spirit, bases in self.animal_spirits.items():
            for base in bases:
                if base.lower() in name.lower():
                    components.append(f"Base: {base}")
                    return spirit, components
        return "unknown", components

    def _detect_style(self, name: str) -> str:
        """Detect naming style from name components."""
        style_checks = [
            (self.foundation_suffixes, "foundation"),
            (self.exo_suffixes, "exo"),
            (self.hybrid_references, "hybrid"),
            (self.cyberpunk_prefixes, "cyberpunk"),
            (self.mythological_references, "mythological"),
            (self.scientific_prefixes, "scientific"),
        ]

        for components, style in style_checks:
            if any(comp.lower() in name.lower() for comp in components):
                return style
        return "unknown"

    def get_spirit_info(self, name: str) -> dict[str, str | list[str]]:
        """Analyze a generated name to extract spirit information."""
        spirit, components = self._detect_spirit(name)
        style = self._detect_style(name)

        return {
            "spirit": spirit,
            "style": style,
            "components": components,
        }


def main() -> None:
    """Main CLI interface for the robot name generator."""
    # pylint: disable=print-statement,consider-using-sys-exit
    import argparse

    parser = argparse.ArgumentParser(
        description="Generate robot names with Reynard animal spirit themes",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python robot-name-generator.py                                    # Generate one random name
  python robot-name-generator.py --count 5                          # Generate 5 random names
  python robot-name-generator.py --spirit fox                       # Generate fox-themed name
  python robot-name-generator.py --spirit axolotl                   # Generate axolotl-themed name
  python robot-name-generator.py --style foundation                 # Generate Foundation-style name
  python robot-name-generator.py --style cyberpunk                  # Generate Cyberpunk-style name
  python robot-name-generator.py --style mythological               # Generate Mythological-style name
  python robot-name-generator.py --spirit dolphin --style exo --count 3  # Dolphin Exo names
  python robot-name-generator.py --spirit eagle --style scientific  # Eagle Scientific name
  python robot-name-generator.py --spirit narwhal --style cyberpunk # Narwhal Cyberpunk name
        """,
    )

    parser.add_argument(
        "--count",
        "-c",
        type=int,
        default=1,
        help="Number of names to generate (default: 1)",
    )
    parser.add_argument(
        "--spirit",
        "-s",
        choices=[
            "fox",
            "wolf",
            "coyote",
            "jackal",
            "otter",
            "dolphin",
            "whale",
            "shark",
            "octopus",
            "axolotl",
            "eagle",
            "falcon",
            "raven",
            "owl",
            "hawk",
            "lion",
            "tiger",
            "leopard",
            "jaguar",
            "cheetah",
            "lynx",
            "bear",
            "panda",
            "elephant",
            "rhino",
            "ape",
            "monkey",
            "lemur",
            "snake",
            "lizard",
            "turtle",
            "frog",
            "spider",
            "ant",
            "bee",
            "mantis",
            "dragonfly",
            "pangolin",
            "platypus",
            "narwhal",
            "quokka",
            "capybara",
            "aye",
            "kiwi",
            "toucan",
            "flamingo",
            "peacock",
        ],
        help="Animal spirit theme (fox, wolf, otter, dolphin, eagle, lion, etc.)",
    )
    parser.add_argument(
        "--style",
        choices=[
            "foundation",
            "exo",
            "hybrid",
            "cyberpunk",
            "mythological",
            "scientific",
        ],
        help="Naming style (foundation, exo, hybrid, cyberpunk, mythological, scientific)",
    )
    parser.add_argument(
        "--analyze",
        "-a",
        type=str,
        help="Analyze a specific name for spirit information",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Show detailed information about generated names",
    )

    args = parser.parse_args()

    namer = ReynardRobotNamer()

    if args.analyze:
        # Analyze mode
        info = namer.get_spirit_info(args.analyze)
        print(f"Name Analysis: {args.analyze}")
        print(f"Spirit: {info['spirit']}")
        print(f"Style: {info['style']}")
        if info["components"]:
            print(f"Components: {', '.join(info['components'])}")
        return

    # Generate names
    names = namer.generate_batch(args.count, args.spirit, args.style)

    if args.verbose:
        print("Generated Robot Names:")
        print("=" * 50)
        for i, name in enumerate(names, 1):
            info = namer.get_spirit_info(name)
            print(f"{i:2d}. {name}")
            print(f"    Spirit: {info['spirit']} | Style: {info['style']}")
            if info["components"]:
                print(f"    Components: {', '.join(info['components'])}")
            print()
    else:
        for name in names:
            print(name)


if __name__ == "__main__":
    main()
