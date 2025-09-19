"""
Mythological Style Name Generator
================================

Generates Mythological-style names inspired by gods, heroes, and legendary beings.
Creates divine, mystical names with unique patterns that reflect the power
and majesty of mythological figures from various cultures.
"""

import random  # nosec B311 - Used for non-cryptographic name generation

from ..naming_utilities import NameBuilder, RandomSelector
from ..types import AgentName, AnimalSpirit, NamingStyle


class MythologicalGenerator:
    """Generates Mythological-style names with divine and mystical themes."""

    def __init__(self) -> None:
        """Initialize the Mythological generator."""
        self.name_builder = NameBuilder()
        self.selector = RandomSelector()
        self._load_mythological_data()

    def _load_mythological_data(self) -> None:
        """Load Mythological-specific naming data."""
        # Greek and Roman gods
        self.greek_roman_gods = [
            "Zeus", "Poseidon", "Hades", "Apollo", "Ares", "Hermes", "Dionysus",
            "Hephaestus", "Athena", "Artemis", "Aphrodite", "Hera", "Demeter", "Hestia",
            "Jupiter", "Neptune", "Pluto", "Mars", "Mercury", "Vulcan", "Minerva",
            "Diana", "Venus", "Juno", "Ceres", "Vesta", "Bacchus", "Cupid",
        ]

        # Norse gods and figures
        self.norse_gods = [
            "Odin", "Thor", "Loki", "Freyr", "Freya", "Tyr", "Heimdall", "Baldr",
            "Frigg", "Idunn", "Sif", "Njord", "Skadi", "Bragi", "Forseti", "Vidar",
            "Vali", "Ullr", "Mimir", "Kvasir", "Gullveig", "Angrboda", "Fenrir",
        ]

        # Egyptian gods and figures
        self.egyptian_gods = [
            "Ra", "Anubis", "Horus", "Isis", "Osiris", "Set", "Thoth", "Bastet",
            "Sekhmet", "Ptah", "Khnum", "Hathor", "Nephthys", "Sobek", "Taweret",
            "Maat", "Geb", "Nut", "Shu", "Tefnut", "Atum", "Khepri", "Amun",
        ]

        # Celtic and other European gods
        self.celtic_gods = [
            "Lugh", "Dagda", "Morrigan", "Brigid", "Cernunnos", "Epona", "Manannan",
            "Aengus", "Nuada", "Goibniu", "Dian Cecht", "Lir", "Danu", "Boann",
            "Macha", "Badb", "Nemain", "Fand", "Emer", "Deirdre", "Cuchulainn",
        ]

        # Divine titles and epithets
        self.divine_titles = [
            "Divine", "Sacred", "Holy", "Blessed", "Chosen", "Anointed", "Consecrated",
            "Hallowed", "Revered", "Venerated", "Exalted", "Transcendent", "Eternal",
            "Immortal", "Celestial", "Heavenly", "Divine", "Godlike", "Mighty", "Powerful",
            "Supreme", "Almighty", "Omnipotent", "Omniscient", "Omnipresent", "Infinite",
        ]

        # Mythological realms and places
        self.mythological_realms = [
            "Olympus", "Asgard", "Valhalla", "Helheim", "Niflheim", "Muspelheim",
            "Alfheim", "Svartalfheim", "Jotunheim", "Vanaheim", "Midgard", "Utgard",
            "Elysium", "Tartarus", "Hades", "Underworld", "Heaven", "Hell", "Paradise",
            "Nirvana", "Avalon", "Tir na Nog", "Annwn", "Otherworld", "Spirit World",
        ]

        # Mythological creatures and beings
        self.mythological_beings = [
            "Dragon", "Phoenix", "Griffin", "Unicorn", "Pegasus", "Centaur", "Minotaur",
            "Sphinx", "Chimera", "Hydra", "Cerberus", "Kraken", "Leviathan", "Basilisk",
            "Cockatrice", "Wyvern", "Manticore", "Harpy", "Siren", "Nymph", "Dryad",
            "Satyr", "Faun", "Troll", "Giant", "Titan", "Demon", "Angel", "Seraph",
        ]

        # Heroic titles and ranks
        self.heroic_titles = [
            "Hero", "Champion", "Warrior", "Guardian", "Defender", "Protector", "Savior",
            "Redeemer", "Liberator", "Conqueror", "Victor", "Champion", "Master", "Lord",
            "King", "Queen", "Prince", "Princess", "Duke", "Duchess", "Earl", "Count",
            "Baron", "Baroness", "Knight", "Paladin", "Crusader", "Templar", "Monk",
        ]

        # Mythological numbers and symbols
        self.mythological_numbers = [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
            21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
            41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
            61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
            81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100,
        ]

    def generate_mythological_name(
        self, spirit: AnimalSpirit | None = None, use_spirit: bool = True
    ) -> AgentName:
        """Generate a Mythological-style name."""
        if use_spirit and spirit:
            return self._generate_spirit_mythological_name(spirit)
        else:
            return self._generate_pure_mythological_name()

    def _generate_spirit_mythological_name(self, spirit: AnimalSpirit) -> AgentName:
        """Generate Mythological name with animal spirit integration."""
        # Use spirit name as base with Mythological styling
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
            spirit_names.get(spirit_key, ["Divine"]), "Divine"
        )

        # Choose a mythological figure to pair with the spirit
        mythological_figures = (
            self.greek_roman_gods + self.norse_gods + self.egyptian_gods + self.celtic_gods
        )
        mythological = self.selector.select_with_fallback(mythological_figures, "Zeus")

        divine_title = self.selector.select_with_fallback(self.divine_titles, "Divine")

        name = self.name_builder.build_hyphenated_name([mythological, base_name, divine_title])
        components = [mythological, base_name, divine_title]

        return AgentName(
            name=name,
            spirit=spirit,
            style=NamingStyle.MYTHOLOGICAL,
            components=components,
        )

    def _generate_pure_mythological_name(self) -> AgentName:
        """Generate pure Mythological name without animal spirit."""
        # Choose between different Mythological naming patterns
        pattern = random.choice([1, 2, 3, 4, 5, 6])  # nosec B311

        if pattern == 1:
            # Pattern: [God] + [Title] + [Number]
            gods = self.greek_roman_gods + self.norse_gods + self.egyptian_gods + self.celtic_gods
            god = self.selector.select_with_fallback(gods, "Zeus")
            title = self.selector.select_with_fallback(self.divine_titles, "Divine")
            number = self.selector.select_with_fallback(self.mythological_numbers, 1)
            name = self.name_builder.build_hyphenated_name([god, title, number])
            components = [god, title, str(number)]

        elif pattern == 2:
            # Pattern: [Heroic Title] + [Realm] + [Number]
            title = self.selector.select_with_fallback(self.heroic_titles, "Hero")
            realm = self.selector.select_with_fallback(self.mythological_realms, "Olympus")
            number = self.selector.select_with_fallback(self.mythological_numbers, 1)
            name = self.name_builder.build_hyphenated_name([title, realm, number])
            components = [title, realm, str(number)]

        elif pattern == 3:
            # Pattern: [Being] + [Divine Title] + [Number]
            being = self.selector.select_with_fallback(self.mythological_beings, "Dragon")
            title = self.selector.select_with_fallback(self.divine_titles, "Divine")
            number = self.selector.select_with_fallback(self.mythological_numbers, 1)
            name = self.name_builder.build_hyphenated_name([being, title, number])
            components = [being, title, str(number)]

        elif pattern == 4:
            # Pattern: [Realm] + [God] + [Title]
            realm = self.selector.select_with_fallback(self.mythological_realms, "Asgard")
            gods = self.greek_roman_gods + self.norse_gods + self.egyptian_gods + self.celtic_gods
            god = self.selector.select_with_fallback(gods, "Odin")
            title = self.selector.select_with_fallback(self.divine_titles, "Divine")
            name = self.name_builder.build_hyphenated_name([realm, god, title])
            components = [realm, god, title]

        elif pattern == 5:
            # Pattern: [Title] + [Being] + [Number]
            title = self.selector.select_with_fallback(self.heroic_titles, "Champion")
            being = self.selector.select_with_fallback(self.mythological_beings, "Phoenix")
            number = self.selector.select_with_fallback(self.mythological_numbers, 1)
            name = self.name_builder.build_hyphenated_name([title, being, number])
            components = [title, being, str(number)]

        else:
            # Pattern: [God] + [Being] + [Title]
            gods = self.greek_roman_gods + self.norse_gods + self.egyptian_gods + self.celtic_gods
            god = self.selector.select_with_fallback(gods, "Thor")
            being = self.selector.select_with_fallback(self.mythological_beings, "Griffin")
            title = self.selector.select_with_fallback(self.divine_titles, "Divine")
            name = self.name_builder.build_hyphenated_name([god, being, title])
            components = [god, being, title]

        return AgentName(
            name=name,
            spirit=None,
            style=NamingStyle.MYTHOLOGICAL,
            components=components,
            generation_number=number if 'number' in locals() else 1,
        )

    def generate_mythological_batch(self, count: int = 5) -> list[AgentName]:
        """Generate a batch of Mythological names with variety."""
        names = []
        for i in range(count):
            # Alternate between spirit and pure Mythological names
            use_spirit = i % 2 == 0
            if use_spirit:
                spirit = AnimalSpirit(random.choice(list(AnimalSpirit)))  # nosec B311
                name = self.generate_mythological_name(spirit, use_spirit=True)
            else:
                name = self.generate_mythological_name(use_spirit=False)
            names.append(name)
        return names
