"""
Destiny Style Name Generator
===========================

Generates Destiny-style names inspired by the Destiny and Destiny 2 universe.
Creates epic, mystical, and powerful names that reflect the cosmic scope,
paracausal forces, and legendary guardians of the Destiny universe.
"""

import random  # nosec B311 - Used for non-cryptographic name generation

from ..naming_utilities import NameBuilder, RandomSelector
from ..types import AgentName, AnimalSpirit, NamingStyle


class DestinyGenerator:
    """Generates Destiny-style names with cosmic and mystical themes."""

    def __init__(self) -> None:
        """Initialize the Destiny generator."""
        self.name_builder = NameBuilder()
        self.selector = RandomSelector()
        self._load_destiny_data()

    def _load_destiny_data(self) -> None:
        """Load Destiny-specific naming data."""
        # Guardian classes and roles
        self.guardian_classes = [
            "Hunter", "Titan", "Warlock", "Guardian", "Lightbearer", "Chosen",
            "Risen", "Ghost", "Vanguard", "Crusader", "Paladin", "Knight",
            "Mage", "Sage", "Oracle", "Prophet", "Seer", "Visionary",
            "Champion", "Hero", "Legend", "Myth", "Paragon", "Exemplar",
            "Defender", "Protector", "Guardian", "Sentinel", "Warden",
            "Custodian", "Keeper", "Steward", "Overseer", "Commander",
            "Captain", "Lieutenant", "Sergeant", "Corporal", "Private",
            "Elite", "Veteran", "Master", "Grandmaster", "Archon",
            "Hierophant", "Hierarch", "Patriarch", "Matriarch", "Elder",
            "Ancient", "Primordial", "Firstborn", "Lastborn", "Chosen",
            "Elect", "Anointed", "Blessed", "Sacred", "Divine",
            "Celestial", "Cosmic", "Stellar", "Galactic", "Universal",
            "Infinite", "Eternal", "Timeless", "Immortal", "Undying",
            "Resurrected", "Reborn", "Renewed", "Restored", "Revived",
        ]

        # Destiny locations and places
        self.destiny_locations = [
            "Tower", "Last-City", "Earth", "Moon", "Mars", "Venus", "Mercury",
            "Jupiter", "Saturn", "Neptune", "Uranus", "Pluto", "Europa",
            "Io", "Ganymede", "Callisto", "Titan", "Enceladus", "Triton",
            "Nessus", "Tangled-Shore", "Dreaming-City", "Reef", "Asteroid-Belt",
            "Kuiper-Belt", "Oort-Cloud", "Alpha-Centauri", "Proxima-Centauri",
            "Sirius", "Vega", "Arcturus", "Betelgeuse", "Rigel", "Antares",
            "Pleiades", "Orion", "Andromeda", "Milky-Way", "Local-Group",
            "Virgo-Supercluster", "Laniakea", "Observable-Universe",
            "Cosmic-Web", "Dark-Matter", "Dark-Energy", "Void", "Light",
            "Darkness", "Paracausal", "Causal", "Quantum", "Subatomic",
            "Molecular", "Atomic", "Elemental", "Fundamental", "Primordial",
            "Cosmic", "Stellar", "Galactic", "Universal", "Infinite",
            "Eternal", "Timeless", "Immortal", "Undying", "Resurrected",
            "Reborn", "Renewed", "Restored", "Revived", "Transcendent",
            "Ascendant", "Divine", "Celestial", "Heavenly", "Sacred",
            "Blessed", "Anointed", "Elect", "Chosen", "Destined",
            "Fated", "Prophesied", "Foretold", "Predicted", "Calculated",
            "Simulated", "Modeled", "Projected", "Forecasted", "Anticipated",
        ]

        # Destiny weapons and gear
        self.destiny_weapons = [
            "Thorn", "Last-Word", "Ace-of-Spades", "Hawkmoon", "Fatebringer",
            "Vision-of-Confluence", "Gjallarhorn", "Ice-Breaker", "Black-Hammer",
            "Vex-Mythoclast", "Necrochasm", "Touch-of-Malice", "Outbreak-Prime",
            "Rat-King", "MIDA-Multi-Tool", "Sturm", "Drang", "Sunshot",
            "Graviton-Lance", "Riskrunner", "Coldheart", "Prometheus-Lens",
            "Telesto", "Merciless", "Wardcliff-Coil", "Tractor-Cannon",
            "Legend-of-Acrius", "Polaris-Lance", "Sleeper-Simulant",
            "Whisper-of-the-Worm", "One-Thousand-Voices", "Anarchy",
            "Divinity", "Xenophage", "Deathbringer", "Leviathan's-Breath",
            "Eriana's-Vow", "Symmetry", "Tommy's-Matchbook", "Heir-Apparent",
            "Ruinous-Effigy", "Traveler's-Chosen", "No-Time-to-Explain",
            "Cloudstrike", "Duality", "Ticuu's-Divination", "Cryosthesia",
            "Lorentz-Driver", "Ager's-Scepter", "Vex-Mythoclast", "Gjallarhorn",
            "Forerunner", "Glaive", "Osteo-Striga", "Parasite", "Grand-Overture",
            "Dead-Messenger", "Collective-Obligation", "Heartshadow",
            "Delicate-Tomb", "Hierarchy-of-Needs", "Final-Warning",
            "Winterbite", "Deterministic-Chaos", "Wicked-Implement",
            "The-Navigator", "Cenotaph-Mask", "Briar's-Contempt",
            "Abyss-Defiant", "Song-of-Ir-Yut", "Word-of-Crota",
            "Fang-of-Ir-Yut", "Oversoul-Edict", "Abyss-Defiant",
            "Song-of-Ir-Yut", "Word-of-Crota", "Fang-of-Ir-Yut",
            "Oversoul-Edict", "Abyss-Defiant", "Song-of-Ir-Yut",
        ]

        # Destiny enemies and factions
        self.destiny_enemies = [
            "Fallen", "Hive", "Vex", "Cabal", "Taken", "Scorn", "Shadow",
            "Darkness", "Light", "Paracausal", "Causal", "Quantum",
            "Subatomic", "Molecular", "Atomic", "Elemental", "Fundamental",
            "Primordial", "Cosmic", "Stellar", "Galactic", "Universal",
            "Infinite", "Eternal", "Timeless", "Immortal", "Undying",
            "Resurrected", "Reborn", "Renewed", "Restored", "Revived",
            "Transcendent", "Ascendant", "Divine", "Celestial", "Heavenly",
            "Sacred", "Blessed", "Anointed", "Elect", "Chosen", "Destined",
            "Fated", "Prophesied", "Foretold", "Predicted", "Calculated",
            "Simulated", "Modeled", "Projected", "Forecasted", "Anticipated",
            "Oryx", "Crota", "Skolas", "Atheon", "Aksis", "Calus",
            "Ghaul", "Riven", "Savathun", "Xivu-Arath", "Rhulk",
            "Nezarec", "Eramis", "Eramis", "Taniks", "Taniks",
            "Skolas", "Atheon", "Aksis", "Calus", "Ghaul", "Riven",
            "Savathun", "Xivu-Arath", "Rhulk", "Nezarec", "Eramis",
        ]

        # Destiny concepts and themes
        self.destiny_concepts = [
            "Light", "Darkness", "Paracausal", "Causal", "Quantum",
            "Subatomic", "Molecular", "Atomic", "Elemental", "Fundamental",
            "Primordial", "Cosmic", "Stellar", "Galactic", "Universal",
            "Infinite", "Eternal", "Timeless", "Immortal", "Undying",
            "Resurrected", "Reborn", "Renewed", "Restored", "Revived",
            "Transcendent", "Ascendant", "Divine", "Celestial", "Heavenly",
            "Sacred", "Blessed", "Anointed", "Elect", "Chosen", "Destined",
            "Fated", "Prophesied", "Foretold", "Predicted", "Calculated",
            "Simulated", "Modeled", "Projected", "Forecasted", "Anticipated",
            "Traveler", "Pyramid", "Vault", "Raid", "Strike", "Nightfall",
            "Crucible", "Gambit", "Iron-Banner", "Trials", "Dungeon",
            "Exotic", "Legendary", "Rare", "Uncommon", "Common", "White",
            "Green", "Blue", "Purple", "Gold", "Exotic", "Adept",
            "Timelost", "Harrowed", "Vaulted", "Sunset", "Sunrise",
            "Dawn", "Dusk", "Twilight", "Midnight", "Noon", "Eclipse",
            "Solstice", "Equinox", "Vernal", "Autumnal", "Summer", "Winter",
            "Spring", "Fall", "Season", "Year", "Month", "Week", "Day",
            "Hour", "Minute", "Second", "Moment", "Instant", "Eternity",
        ]

        # Destiny numbers with cosmic significance
        self.destiny_numbers = [
            1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987,  # Fibonacci
            2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096,  # Powers of 2
            3, 9, 27, 81, 243, 729, 2187, 6561,  # Powers of 3
            5, 25, 125, 625, 3125, 15625,  # Powers of 5
            7, 49, 343, 2401, 16807,  # Powers of 7
            11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97,  # Primes
            1000, 10000, 100000, 1000000, 10000000,  # Powers of 10
            12, 24, 36, 48, 60, 72, 84, 96, 108, 120,  # Multiples of 12 (time cycles)
            30, 60, 90, 120, 150, 180, 210, 240, 270, 300,  # Multiples of 30 (years)
            365, 730, 1095, 1460, 1825, 2190, 2555, 2920,  # Multiples of 365 (days)
            100, 200, 300, 400, 500, 600, 700, 800, 900,  # Centuries
            1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000,  # Millennia
            42, 69, 1337, 2024, 2025,  # Special numbers
            7, 14, 21, 28, 35, 42, 49, 56, 63, 70,  # Multiples of 7 (lucky)
            9, 18, 27, 36, 45, 54, 63, 72, 81, 90,  # Multiples of 9 (completion)
            13, 26, 39, 52, 65, 78, 91, 104, 117, 130,  # Multiples of 13 (unlucky)
        ]

        # Destiny-specific titles and ranks
        self.destiny_titles = [
            "Guardian", "Lightbearer", "Chosen", "Risen", "Ghost", "Vanguard",
            "Crusader", "Paladin", "Knight", "Mage", "Sage", "Oracle", "Prophet",
            "Seer", "Visionary", "Champion", "Hero", "Legend", "Myth", "Paragon",
            "Exemplar", "Defender", "Protector", "Sentinel", "Warden", "Custodian",
            "Keeper", "Steward", "Overseer", "Commander", "Captain", "Lieutenant",
            "Sergeant", "Corporal", "Private", "Elite", "Veteran", "Master",
            "Grandmaster", "Archon", "Hierophant", "Hierarch", "Patriarch",
            "Matriarch", "Elder", "Ancient", "Primordial", "Firstborn", "Lastborn",
            "Elect", "Anointed", "Blessed", "Sacred", "Divine", "Celestial",
            "Cosmic", "Stellar", "Galactic", "Universal", "Infinite", "Eternal",
            "Timeless", "Immortal", "Undying", "Resurrected", "Reborn", "Renewed",
            "Restored", "Revived", "Transcendent", "Ascendant", "Heavenly",
            "Destined", "Fated", "Prophesied", "Foretold", "Predicted",
            "Calculated", "Simulated", "Modeled", "Projected", "Forecasted",
            "Anticipated", "Expected", "Planned", "Intended", "Designed",
            "Engineered", "Crafted", "Forged", "Created", "Born", "Made",
            "Shaped", "Molded", "Formed", "Built", "Constructed", "Assembled",
        ]

        # Destiny-specific suffixes and prefixes
        self.destiny_suffixes = [
            "of-Light", "of-Darkness", "of-the-Traveler", "of-the-Pyramid",
            "of-the-Vault", "of-the-Raid", "of-the-Strike", "of-the-Nightfall",
            "of-the-Crucible", "of-Gambit", "of-Iron-Banner", "of-Trials",
            "of-the-Dungeon", "of-the-Exotic", "of-the-Legendary", "of-the-Rare",
            "of-the-Uncommon", "of-the-Common", "of-the-White", "of-the-Green",
            "of-the-Blue", "of-the-Purple", "of-the-Gold", "of-the-Exotic",
            "of-the-Adept", "of-the-Timelost", "of-the-Harrowed", "of-the-Vaulted",
            "of-the-Sunset", "of-the-Sunrise", "of-the-Dawn", "of-the-Dusk",
            "of-the-Twilight", "of-the-Midnight", "of-the-Noon", "of-the-Eclipse",
            "of-the-Solstice", "of-the-Equinox", "of-the-Vernal", "of-the-Autumnal",
            "of-the-Summer", "of-the-Winter", "of-the-Spring", "of-the-Fall",
            "of-the-Season", "of-the-Year", "of-the-Month", "of-the-Week",
            "of-the-Day", "of-the-Hour", "of-the-Minute", "of-the-Second",
            "of-the-Moment", "of-the-Instant", "of-the-Eternity", "of-the-Infinite",
            "of-the-Eternal", "of-the-Timeless", "of-the-Immortal", "of-the-Undying",
            "of-the-Resurrected", "of-the-Reborn", "of-the-Renewed", "of-the-Restored",
            "of-the-Revived", "of-the-Transcendent", "of-the-Ascendant", "of-the-Divine",
            "of-the-Celestial", "of-the-Heavenly", "of-the-Sacred", "of-the-Blessed",
            "of-the-Anointed", "of-the-Elect", "of-the-Chosen", "of-the-Destined",
            "of-the-Fated", "of-the-Prophesied", "of-the-Foretold", "of-the-Predicted",
            "of-the-Calculated", "of-the-Simulated", "of-the-Modeled", "of-the-Projected",
            "of-the-Forecasted", "of-the-Anticipated", "of-the-Expected", "of-the-Planned",
            "of-the-Intended", "of-the-Designed", "of-the-Engineered", "of-the-Crafted",
            "of-the-Forged", "of-the-Created", "of-the-Born", "of-the-Made",
            "of-the-Shaped", "of-the-Molded", "of-the-Formed", "of-the-Built",
            "of-the-Constructed", "of-the-Assembled", "of-the-Primordial",
            "of-the-Cosmic", "of-the-Stellar", "of-the-Galactic", "of-the-Universal",
        ]

        # Destiny-specific prefixes
        self.destiny_prefixes = [
            "Light-", "Darkness-", "Traveler-", "Pyramid-", "Vault-", "Raid-",
            "Strike-", "Nightfall-", "Crucible-", "Gambit-", "Iron-Banner-",
            "Trials-", "Dungeon-", "Exotic-", "Legendary-", "Rare-", "Uncommon-",
            "Common-", "White-", "Green-", "Blue-", "Purple-", "Gold-",
            "Adept-", "Timelost-", "Harrowed-", "Vaulted-", "Sunset-", "Sunrise-",
            "Dawn-", "Dusk-", "Twilight-", "Midnight-", "Noon-", "Eclipse-",
            "Solstice-", "Equinox-", "Vernal-", "Autumnal-", "Summer-", "Winter-",
            "Spring-", "Fall-", "Season-", "Year-", "Month-", "Week-", "Day-",
            "Hour-", "Minute-", "Second-", "Moment-", "Instant-", "Eternity-",
            "Infinite-", "Eternal-", "Timeless-", "Immortal-", "Undying-",
            "Resurrected-", "Reborn-", "Renewed-", "Restored-", "Revived-",
            "Transcendent-", "Ascendant-", "Divine-", "Celestial-", "Heavenly-",
            "Sacred-", "Blessed-", "Anointed-", "Elect-", "Chosen-", "Destined-",
            "Fated-", "Prophesied-", "Foretold-", "Predicted-", "Calculated-",
            "Simulated-", "Modeled-", "Projected-", "Forecasted-", "Anticipated-",
            "Expected-", "Planned-", "Intended-", "Designed-", "Engineered-",
            "Crafted-", "Forged-", "Created-", "Born-", "Made-", "Shaped-",
            "Molded-", "Formed-", "Built-", "Constructed-", "Assembled-",
            "Primordial-", "Cosmic-", "Stellar-", "Galactic-", "Universal-",
        ]

    def generate_destiny_name(
        self, spirit: AnimalSpirit | None = None, use_spirit: bool = True
    ) -> AgentName:
        """Generate a Destiny-style name."""
        if use_spirit and spirit:
            return self._generate_spirit_destiny_name(spirit)
        return self._generate_pure_destiny_name()

    def _generate_spirit_destiny_name(self, spirit: AnimalSpirit) -> AgentName:
        """Generate Destiny name with animal spirit integration."""
        # Use spirit name as base - expanded for all animal spirits
        spirit_names = {
            "fox": ["Vulpine", "Reynard", "Kitsune", "Sly", "Cunning", "Swift"],
            "wolf": ["Lupus", "Fenrir", "Alpha", "Hunter", "Pack", "Fierce"],
            "otter": ["Lutra", "Aqua", "Playful", "Graceful", "Sleek", "Fluid"],
            "dragon": ["Draco", "Wyrm", "Ancient", "Elder", "Primordial", "Mighty"],
            "phoenix": ["Phoenix", "Firebird", "Rebirth", "Renewal", "Eternal", "Radiant"],
            "eagle": ["Aquila", "Golden", "Soaring", "Majestic", "Noble", "Regal"],
            "lion": ["Leo", "King", "Mane", "Pride", "Royal", "Imperial"],
            "tiger": ["Tigris", "Bengal", "Siberian", "Striped", "Fierce", "Powerful"],
            "bear": ["Ursa", "Grizzly", "Polar", "Mountain", "Forest", "Wild"],
            "rabbit": ["Lepus", "Swift", "Agile", "Quick", "Bounding", "Fleet"],
            "owl": ["Strix", "Wise", "Nocturnal", "Sage", "Watching", "Silent"],
            "raven": ["Corvus", "Dark", "Mysterious", "Clever", "Wise", "Ancient"],
            "shark": ["Carcharodon", "Ocean", "Predator", "Swift", "Fierce", "Deep"],
            "penguin": ["Spheniscus", "Antarctic", "Waddle", "Ice", "Colony", "Graceful"],
            "elephant": ["Elephas", "Memory", "Wise", "Gentle", "Giant", "Noble"],
            "giraffe": ["Giraffa", "Tall", "Graceful", "Reaching", "Gentle", "Majestic"],
            "zebra": ["Equus", "Striped", "Wild", "Running", "Free", "Pattern"],
            "cheetah": ["Acinonyx", "Speed", "Swift", "Hunting", "Graceful", "Fast"],
            "panther": ["Panthera", "Shadow", "Stealth", "Dark", "Powerful", "Silent"],
            "lynx": ["Lynx", "Wild", "Mountain", "Fierce", "Independent", "Sharp"],
            "bobcat": ["Lynx", "Wild", "Forest", "Fierce", "Independent", "Sharp"],
            "coyote": ["Canis", "Trickster", "Wild", "Clever", "Adaptable", "Survivor"],
            "hyena": ["Crocuta", "Laughing", "Pack", "Fierce", "Clever", "Wild"],
            "jaguar": ["Panthera", "Jungle", "Powerful", "Stealth", "Fierce", "Wild"],
            "leopard": ["Panthera", "Spotted", "Stealth", "Fierce", "Wild", "Graceful"],
            "cougar": ["Puma", "Mountain", "Stealth", "Powerful", "Wild", "Silent"],
            "puma": ["Puma", "Mountain", "Stealth", "Powerful", "Wild", "Silent"],
            "mountain_lion": ["Puma", "Mountain", "Stealth", "Powerful", "Wild", "Silent"],
            "snow_leopard": ["Panthera", "Snow", "Mountain", "Stealth", "Fierce", "Wild"],
            "clouded_leopard": ["Neofelis", "Clouded", "Stealth", "Fierce", "Wild", "Mysterious"],
            "margay": ["Leopardus", "Tree", "Agile", "Climbing", "Wild", "Graceful"],
            "ocelot": ["Leopardus", "Spotted", "Wild", "Fierce", "Independent", "Graceful"],
            "serval": ["Leptailurus", "Tall", "Wild", "Fierce", "Independent", "Graceful"],
            "caracal": ["Caracal", "Ears", "Wild", "Fierce", "Independent", "Graceful"],
            "sand_cat": ["Felis", "Desert", "Wild", "Fierce", "Independent", "Survivor"],
            "black_footed_cat": ["Felis", "Small", "Wild", "Fierce", "Independent", "Tiny"],
            "rusty_spotted_cat": ["Prionailurus", "Spotted", "Wild", "Fierce", "Independent", "Small"],
            "pallas_cat": ["Otocolobus", "Manul", "Wild", "Fierce", "Independent", "Fluffy"],
            "manul": ["Otocolobus", "Manul", "Wild", "Fierce", "Independent", "Fluffy"],
            "jungle_cat": ["Felis", "Jungle", "Wild", "Fierce", "Independent", "Adaptable"],
            "chaus": ["Felis", "Jungle", "Wild", "Fierce", "Independent", "Adaptable"],
            "fishing_cat": ["Prionailurus", "Water", "Wild", "Fierce", "Independent", "Swimming"],
            "flat_headed_cat": ["Prionailurus", "Flat", "Wild", "Fierce", "Independent", "Unique"],
            "bornean_bay_cat": ["Catopuma", "Bay", "Wild", "Fierce", "Independent", "Rare"],
            "asian_golden_cat": ["Catopuma", "Golden", "Wild", "Fierce", "Independent", "Beautiful"],
            "african_golden_cat": ["Caracal", "Golden", "Wild", "Fierce", "Independent", "Beautiful"],
            "pampas_cat": ["Leopardus", "Pampas", "Wild", "Fierce", "Independent", "Grassland"],
            "geoffroy_cat": ["Leopardus", "Geoffroy", "Wild", "Fierce", "Independent", "Spotted"],
            "kodkod": ["Leopardus", "Kodkod", "Wild", "Fierce", "Independent", "Small"],
            "oncilla": ["Leopardus", "Oncilla", "Wild", "Fierce", "Independent", "Spotted"],
            "tigrina": ["Leopardus", "Tigrina", "Wild", "Fierce", "Independent", "Striped"],
            "spider": ["Arachnid", "Web", "Silent", "Patient", "Clever", "Stealthy"],
            "star": ["Stellar", "Cosmic", "Bright", "Radiant", "Eternal", "Shining"],
            "alien": ["Xeno", "Otherworldly", "Mysterious", "Advanced", "Strange", "Unknown"],
            "nebula": ["Cosmic", "Cloud", "Mysterious", "Ethereal", "Beautiful", "Vast"],
            "kraken": ["Deep", "Ocean", "Mysterious", "Powerful", "Ancient", "Tentacled"],
            "manticore": ["Mythical", "Lion", "Scorpion", "Fierce", "Ancient", "Legendary"],
            "griffin": ["Mythical", "Eagle", "Lion", "Noble", "Ancient", "Legendary"],
            "peacock": ["Pavo", "Colorful", "Proud", "Beautiful", "Majestic", "Display"],
            "monkey": ["Simian", "Clever", "Agile", "Playful", "Curious", "Intelligent"],
            "whale": ["Cetacean", "Ocean", "Gentle", "Massive", "Wise", "Deep"],
            "octopus": ["Cephalopod", "Eight", "Clever", "Flexible", "Ocean", "Intelligent"],
            "rhino": ["Rhinoceros", "Horn", "Powerful", "Ancient", "Massive", "Wild"],
            "lemur": ["Primate", "Madagascar", "Agile", "Playful", "Curious", "Tree"],
            "unicorn": ["Mythical", "Horn", "Pure", "Magical", "Ancient", "Legendary"],
            "chimera": ["Mythical", "Mixed", "Fierce", "Ancient", "Legendary", "Powerful"],
            "frog": ["Anura", "Amphibian", "Leaping", "Water", "Green", "Croaking"],
            "pangolin": ["Manis", "Scaly", "Armored", "Anteater", "Unique", "Ancient"],
            "loch_ness": ["Nessie", "Mysterious", "Deep", "Ancient", "Legendary", "Water"],
            "wendigo": ["Mythical", "Winter", "Fierce", "Ancient", "Legendary", "Wild"],
            "platypus": ["Ornithorhynchus", "Duck", "Bill", "Unique", "Water", "Mysterious"],
            "capybara": ["Hydrochoerus", "Water", "Pig", "Gentle", "Large", "Social"],
            "dolphin": ["Delphinus", "Ocean", "Intelligent", "Playful", "Social", "Wise"],
            "skinwalker": ["Mythical", "Shape", "Shifter", "Mysterious", "Ancient", "Legendary"],
            "kiwi": ["Apteryx", "Flightless", "Nocturnal", "Unique", "New", "Zealand"],
            "flamingo": ["Phoenicopterus", "Pink", "Graceful", "Water", "Elegant", "Standing"],
            "narwhal": ["Monodon", "Unicorn", "Whale", "Arctic", "Tusked", "Mysterious"],
            "aye": ["Aye", "Aye", "Nocturnal", "Primate", "Madagascar", "Lemur"],
            "dragonfly": ["Odonata", "Winged", "Swift", "Flying", "Graceful", "Ancient"],
            "snake": ["Serpens", "Slithering", "Sinuous", "Wise", "Ancient", "Mysterious"],
            "ape": ["Simian", "Primate", "Intelligent", "Clever", "Strong", "Wise"],
            "blackhole": ["Cosmic", "Void", "Gravitational", "Mysterious", "Powerful", "Infinite"],
            "jackal": ["Canis", "Wild", "Clever", "Adaptable", "Survivor", "Pack"],
            "quokka": ["Setonix", "Smiling", "Happy", "Marsupial", "Australia", "Cute"],
            "hydra": ["Mythical", "Multi", "Headed", "Ancient", "Legendary", "Regenerating"],
            "basilisk": ["Mythical", "Serpent", "King", "Ancient", "Legendary", "Deadly"],
            "yeti": ["Mythical", "Snow", "Man", "Mountain", "Ancient", "Legendary"],
            "lizard": ["Lacerta", "Scaly", "Reptile", "Quick", "Agile", "Ancient"],
            "toucan": ["Ramphastos", "Colorful", "Beak", "Tropical", "Bright", "Vibrant"],
            "falcon": ["Falco", "Swift", "Hunting", "Fierce", "Flying", "Predator"],
            "void": ["Empty", "Nothing", "Void", "Mysterious", "Infinite", "Dark"],
            "chupacabra": ["Mythical", "Goat", "Sucker", "Mysterious", "Legendary", "Cryptid"],
            "mantis": ["Mantis", "Praying", "Insect", "Patient", "Stealthy", "Predator"],
            "sphinx": ["Mythical", "Riddle", "Wise", "Ancient", "Legendary", "Mysterious"],
            "turtle": ["Testudo", "Shell", "Ancient", "Wise", "Slow", "Patient"],
            "bee": ["Apis", "Honey", "Worker", "Busy", "Swarm", "Industrious"],
            "panda": ["Ailuropoda", "Bamboo", "Gentle", "Black", "White", "Cute"],
            "hawk": ["Accipiter", "Swift", "Hunting", "Fierce", "Flying", "Predator"],
        }

        # Choose between different spirit-based patterns
        pattern = random.choice([1, 2, 3, 4, 5])  # nosec B311

        spirit_key = spirit.value
        base_name = self.selector.select_with_fallback(
            spirit_names.get(spirit_key, ["Guardian"]), "Guardian"
        )

        if pattern == 1:
            # Pattern: [Spirit] + [Guardian-Class] + [Number]
            guardian_class = self.selector.select_with_fallback(self.guardian_classes, "Guardian")
            number = self.selector.select_with_fallback(self.destiny_numbers, 1)
            name = self.name_builder.build_hyphenated_name([base_name, guardian_class, number])
            components = [base_name, guardian_class, str(number)]
        elif pattern == 2:
            # Pattern: [Spirit] + [Weapon] + [Number]
            weapon = self.selector.select_with_fallback(self.destiny_weapons, "Thorn")
            number = self.selector.select_with_fallback(self.destiny_numbers, 1)
            name = self.name_builder.build_hyphenated_name([base_name, weapon, number])
            components = [base_name, weapon, str(number)]
        elif pattern == 3:
            # Pattern: [Spirit] + [Location] + [Number]
            location = self.selector.select_with_fallback(self.destiny_locations, "Tower")
            number = self.selector.select_with_fallback(self.destiny_numbers, 1)
            name = self.name_builder.build_hyphenated_name([base_name, location, number])
            components = [base_name, location, str(number)]
        elif pattern == 4:
            # Pattern: [Spirit] + [Title] + [Number]
            title = self.selector.select_with_fallback(self.destiny_titles, "Guardian")
            number = self.selector.select_with_fallback(self.destiny_numbers, 1)
            name = self.name_builder.build_hyphenated_name([base_name, title, number])
            components = [base_name, title, str(number)]
        else:
            # Pattern: [Spirit] + [Concept] + [Number]
            concept = self.selector.select_with_fallback(self.destiny_concepts, "Light")
            number = self.selector.select_with_fallback(self.destiny_numbers, 1)
            name = self.name_builder.build_hyphenated_name([base_name, concept, number])
            components = [base_name, concept, str(number)]

        return AgentName(
            name=name,
            spirit=spirit,
            style=NamingStyle.DESTINY,
            components=components,
            generation_number=number,
        )

    def _generate_pure_destiny_name(self) -> AgentName:
        """Generate pure Destiny name without animal spirit."""
        # Choose between different Destiny naming patterns
        pattern = random.choice([1, 2, 3, 4, 5, 6, 7, 8])  # nosec B311

        if pattern == 1:
            # Pattern: [Guardian-Class] + [Weapon] + [Number]
            guardian_class = self.selector.select_with_fallback(self.guardian_classes, "Guardian")
            weapon = self.selector.select_with_fallback(self.destiny_weapons, "Thorn")
            number = self.selector.select_with_fallback(self.destiny_numbers, 1)
            name = self.name_builder.build_hyphenated_name([guardian_class, weapon, number])
            components = [guardian_class, weapon, str(number)]
        elif pattern == 2:
            # Pattern: [Location] + [Title] + [Number]
            location = self.selector.select_with_fallback(self.destiny_locations, "Tower")
            title = self.selector.select_with_fallback(self.destiny_titles, "Guardian")
            number = self.selector.select_with_fallback(self.destiny_numbers, 1)
            name = self.name_builder.build_hyphenated_name([location, title, number])
            components = [location, title, str(number)]
        elif pattern == 3:
            # Pattern: [Weapon] + [Location] + [Number]
            weapon = self.selector.select_with_fallback(self.destiny_weapons, "Thorn")
            location = self.selector.select_with_fallback(self.destiny_locations, "Tower")
            number = self.selector.select_with_fallback(self.destiny_numbers, 1)
            name = self.name_builder.build_hyphenated_name([weapon, location, number])
            components = [weapon, location, str(number)]
        elif pattern == 4:
            # Pattern: [Title] + [Concept] + [Number]
            title = self.selector.select_with_fallback(self.destiny_titles, "Guardian")
            concept = self.selector.select_with_fallback(self.destiny_concepts, "Light")
            number = self.selector.select_with_fallback(self.destiny_numbers, 1)
            name = self.name_builder.build_hyphenated_name([title, concept, number])
            components = [title, concept, str(number)]
        elif pattern == 5:
            # Pattern: [Concept] + [Guardian-Class] + [Number]
            concept = self.selector.select_with_fallback(self.destiny_concepts, "Light")
            guardian_class = self.selector.select_with_fallback(self.guardian_classes, "Guardian")
            number = self.selector.select_with_fallback(self.destiny_numbers, 1)
            name = self.name_builder.build_hyphenated_name([concept, guardian_class, number])
            components = [concept, guardian_class, str(number)]
        elif pattern == 6:
            # Pattern: [Enemy] + [Weapon] + [Number]
            enemy = self.selector.select_with_fallback(self.destiny_enemies, "Fallen")
            weapon = self.selector.select_with_fallback(self.destiny_weapons, "Thorn")
            number = self.selector.select_with_fallback(self.destiny_numbers, 1)
            name = self.name_builder.build_hyphenated_name([enemy, weapon, number])
            components = [enemy, weapon, str(number)]
        elif pattern == 7:
            # Pattern: [Prefix] + [Guardian-Class] + [Number]
            prefix = self.selector.select_with_fallback(self.destiny_prefixes, "Light-")
            guardian_class = self.selector.select_with_fallback(self.guardian_classes, "Guardian")
            number = self.selector.select_with_fallback(self.destiny_numbers, 1)
            name = self.name_builder.build_hyphenated_name([prefix, guardian_class, number])
            components = [prefix, guardian_class, str(number)]
        else:
            # Pattern: [Guardian-Class] + [Suffix] + [Number]
            guardian_class = self.selector.select_with_fallback(self.guardian_classes, "Guardian")
            suffix = self.selector.select_with_fallback(self.destiny_suffixes, "of-Light")
            number = self.selector.select_with_fallback(self.destiny_numbers, 1)
            name = self.name_builder.build_hyphenated_name([guardian_class, suffix, number])
            components = [guardian_class, suffix, str(number)]

        return AgentName(
            name=name,
            spirit=None,
            style=NamingStyle.DESTINY,
            components=components,
            generation_number=number if 'number' in locals() else 1,
        )

    def generate_destiny_batch(self, count: int = 5) -> list[AgentName]:
        """Generate a batch of Destiny names with variety."""
        names = []
        for i in range(count):
            # Alternate between spirit and pure Destiny names
            use_spirit = i % 2 == 0
            if use_spirit:
                spirit = AnimalSpirit(random.choice(list(AnimalSpirit)))  # nosec B311
                name = self.generate_destiny_name(spirit, use_spirit=True)
            else:
                name = self.generate_destiny_name(use_spirit=False)
            names.append(name)
        return names
