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
                "Cedar",
                "Fern",
                "Willow",
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
                "Dell",
                "Vale",
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
                "Bewitching",
                "Spellbinding",
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
                "Lobo",
                "Lupin",
                "Ralph",
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
                "Wise",
                "Sage",
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
                "Gladiator",
                "Knight",
                "Paladin",
                # Nature and Environment
                "Shadow",
                "Storm",
                "Midnight",
                "Blaze",
                "Fang",
                "Claw",
                "Tooth",
                "Talon",
                "Timber",
                "Ash",
                "River",
                "Stone",
                "Forest",
                "Mountain",
                "Valley",
                "Ridge",
                "Peak",
                "Summit",
                "Crest",
                "Aspen",
                "Sierra",
                "Dakota",
                "Raven",
                "Luna",
                "Moon",
                "Star",
                "Night",
                "Dawn",
                "Dusk",
                "Twilight",
                "Aurora",
                "Eclipse",
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
                "Heroic",
                "Loyal",
                "Faithful",
                "Devoted",
                "Steadfast",
                "Resolute",
                "Determined",
                "Persistent",
                "Tenacious",
                "Relentless",
                "Unwavering",
            ],
            "coyote": ["Canis", "Prairie", "Brush", "Desert", "Trickster", "Wily"],
            "jackal": ["Canis", "Golden", "Black", "Side", "Desert", "Stealth"],
            # Aquatic and Marine
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
                "Fuzzy",
                "Dabble",
                "Splish",
                "Splash",
                "Drip",
                "Drop",
                "Trickle",
                "Stream",
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
                "Fountain",
                "Spring",
                "Well",
                "Pool",
                "Pond",
                "Lake",
                "Bay",
                "Cove",
                "Harbor",
                "Delta",
                "Estuary",
                "Marsh",
                "Wetland",
                "Swamp",
                "Bog",
                "Fen",
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
                "Adorable",
                "Cute",
                "Sweet",
                "Gentle",
                "Kind",
                "Friendly",
                "Social",
                "Gregarious",
                "Outgoing",
                "Curious",
                "Inquisitive",
                "Explorer",
                "Adventurer",
                "Discoverer",
                "Seeker",
                "Wanderer",
                "Traveler",
                "Navigator",
                "Pilot",
                "Captain",
                "Skipper",
                "Mate",
                "Crew",
                "Team",
                "Squad",
                "Gang",
                "Band",
                "Group",
                "Flock",
                "Pod",
                "Colony",
                "Family",
                "Clan",
                "Tribe",
                "Community",
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
            "Arawn",
            "Pwyll",
            "Gwydion",
            "Arianrhod",
            "Lleu",
            "Blodeuwedd",
            "Math",
            "Don",
            "Gofannon",
            "Dylan",
            "Epona",
            "Sucellus",
            "Nantosuelta",
            "Taranis",
            "Esus",
            "Teutates",
            "Lugus",
            "Belenus",
            "Grannus",
            "Sirona",
            "Rosmerta",
            "Mercury",
            "Minerva",
            "Jupiter",
            "Mars",
            "Apollo",
            "Diana",
            "Venus",
            "Neptune",
            "Pluto",
            "Vesta",
            "Ceres",
            "Bacchus",
            "Vulcan",
            "Juno",
            "Saturn",
            "Janus",
            "Quirinus",
            "Bellona",
            "Fortuna",
            "Victoria",
            "Libertas",
            "Concordia",
            "Pax",
            "Spes",
            "Fides",
            "Pietas",
            "Virtus",
            "Honos",
            "Salus",
            "Ops",
            "Tellus",
            "Faunus",
            "Silvanus",
            "Pomona",
            "Flora",
            "Vertumnus",
            "Picus",
            "Circe",
            "Medea",
            "Jason",
            "Argonauts",
            "Golden",
            "Fleece",
            "Colchis",
            "Aeetes",
            "Chalciope",
            "Absyrtus",
            "Medus",
            "Perse",
            "Helios",
            "Phaethon",
            "Clymene",
            "Merops",
            "Cycnus",
            "Cygnus",
            "Phaeton",
            "Eridanus",
            "Phaethusa",
            "Lampetia",
            "Aegle",
            "Aetheria",
            "Dioxippe",
            "Heliades",
            "Phaethon",
            "Merops",
            "Clymene",
            "Cycnus",
            "Cygnus",
            "Phaeton",
            "Eridanus",
            "Phaethusa",
            "Lampetia",
            "Aegle",
            "Aetheria",
            "Dioxippe",
            "Heliades",
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
            "Kitsune",
            "Tanuki",
            "Tengu",
            "Oni",
            "Yuki",
            "Kappa",
            "Nekomata",
            "Bakeneko",
            "Kodama",
            "Shinigami",
            "Yokai",
            "Kami",
            "Ryujin",
            "Orochi",
            "Yamata",
            "Kusanagi",
            "Ame",
            "No",
            "Habakiri",
            "Totsuka",
            "Tsukuyomi",
            "Kagutsuchi",
            "Izanagi",
            "Izanami",
            "Ninigi",
            "Hoori",
            "Yamasachi",
            "Umisachi",
            "Toyotama",
            "Otohime",
            "Urashima",
            "Momotaro",
            "Kintaro",
            "Issun",
            "Boshi",
            "Urashima",
            "Taro",
            "Kaguya",
            "Hime",
            "Taketori",
            "Monogatari",
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

        # Ensure spirit exists in our data
        if spirit not in self.animal_spirits:
            spirit = "fox"  # Default fallback

        base_name = random.choice(self.animal_spirits[spirit])  # nosec B311
        suffix = random.choice(self.foundation_suffixes)  # nosec B311
        generation = random.choice(self.generation_numbers.get(spirit, [1, 2, 3, 4, 5]))  # nosec B311

        return f"{base_name}-{suffix}-{generation}"

    def generate_exo_style(self, spirit: str | None = None) -> str:
        """Generate Exo-style names: [Spirit] + [Suffix] + [Model]"""
        if not spirit:
            spirit = random.choice(list(self.animal_spirits.keys()))  # nosec B311

        # Ensure spirit exists in our data
        if spirit not in self.animal_spirits:
            spirit = "fox"  # Default fallback

        base_name = random.choice(self.animal_spirits[spirit])  # nosec B311
        suffix = random.choice(self.exo_suffixes)  # nosec B311
        model = random.choice(self.generation_numbers.get(spirit, [1, 2, 3, 4, 5]))  # nosec B311

        return f"{base_name}-{suffix}-{model}"

    def generate_hybrid_style(self, spirit: str | None = None) -> str:
        """Generate Hybrid-style names: [Spirit] + [Reference] + [Designation]"""
        if not spirit:
            spirit = random.choice(list(self.animal_spirits.keys()))  # nosec B311

        # Ensure spirit exists in our data
        if spirit not in self.animal_spirits:
            spirit = "fox"  # Default fallback

        base_name = random.choice(self.animal_spirits[spirit])  # nosec B311
        reference = random.choice(self.hybrid_references)  # nosec B311
        designation = random.choice(self.special_designations)  # nosec B311

        return f"{base_name}-{reference}-{designation}"

    def generate_cyberpunk_style(self, spirit: str | None = None) -> str:
        """Generate Cyberpunk-style names: [Tech Prefix] + [Animal Spirit] + [Cyber Suffix]"""
        if not spirit:
            spirit = random.choice(list(self.animal_spirits.keys()))  # nosec B311

        # Ensure spirit exists in our data
        if spirit not in self.animal_spirits:
            spirit = "fox"  # Default fallback

        prefix = random.choice(self.cyberpunk_prefixes)  # nosec B311
        base_name = random.choice(self.animal_spirits[spirit])  # nosec B311
        suffix = random.choice(self.cyberpunk_suffixes)  # nosec B311

        return f"{prefix}-{base_name}-{suffix}"

    def generate_mythological_style(self, spirit: str | None = None) -> str:
        """Generate Mythological-style names: [Mythological Reference] + [Animal Spirit] + [Divine Suffix]"""
        if not spirit:
            spirit = random.choice(list(self.animal_spirits.keys()))  # nosec B311

        # Ensure spirit exists in our data
        if spirit not in self.animal_spirits:
            spirit = "fox"  # Default fallback

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

    def _generate_single_name(
        self, spirit: str | None, style: str | None
    ) -> str | None:
        """Generate a single name based on style."""
        try:
            style_generators = {
                "foundation": self.generate_foundation_style,
                "exo": self.generate_exo_style,
                "hybrid": self.generate_hybrid_style,
                "cyberpunk": self.generate_cyberpunk_style,
                "mythological": self.generate_mythological_style,
                "scientific": self.generate_scientific_style,
            }

            generator = style_generators.get(style, self.generate_random)
            return generator(spirit)
        except Exception:
            return None

    def _add_fallback_names(self, result: list[str], count: int) -> list[str]:
        """Add fallback names to reach the requested count."""
        while len(result) < count:
            fallback_name = f"Agent-{len(result) + 1}"
            if fallback_name not in result:
                result.append(fallback_name)
        return result

    def generate_batch(
        self, count: int = 10, spirit: str | None = None, style: str | None = None
    ) -> list[str]:
        """Generate multiple unique names."""
        names: set[str] = set()
        attempts = 0
        # Increase max attempts and add fallback for small counts
        max_attempts = max(count * 20, 100)  # More generous limit

        while len(names) < count and attempts < max_attempts:
            attempts += 1
            name = self._generate_single_name(spirit, style)
            if name and name.strip():
                names.add(name)

        # If we couldn't generate enough unique names, return what we have
        # and add some fallback names to reach the requested count
        result = list(names)
        return self._add_fallback_names(result, count)

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
    import argparse
    import sys

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
        sys.stdout.write(f"Name Analysis: {args.analyze}\n")
        sys.stdout.write(f"Spirit: {info['spirit']}\n")
        sys.stdout.write(f"Style: {info['style']}\n")
        if info["components"]:
            sys.stdout.write(f"Components: {', '.join(info['components'])}\n")
        return

    # Generate names
    names = namer.generate_batch(args.count, args.spirit, args.style)

    if args.verbose:
        sys.stdout.write("Generated Robot Names:\n")
        sys.stdout.write("=" * 50 + "\n")
        for i, name in enumerate(names, 1):
            info = namer.get_spirit_info(name)
            sys.stdout.write(f"{i:2d}. {name}\n")
            sys.stdout.write(f"    Spirit: {info['spirit']} | Style: {info['style']}\n")
            if info["components"]:
                sys.stdout.write(f"    Components: {', '.join(info['components'])}\n")
            sys.stdout.write("\n")
    else:
        for name in names:
            sys.stdout.write(f"{name}\n")


if __name__ == "__main__":
    main()
