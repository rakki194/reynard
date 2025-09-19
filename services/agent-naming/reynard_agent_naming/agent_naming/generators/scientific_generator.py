"""
Scientific Style Name Generator
==============================

Generates Scientific-style names inspired by Latin scientific classifications.
Creates systematic, taxonomic names with unique patterns that reflect
the precision and methodology of scientific naming conventions.
"""

import random  # nosec B311 - Used for non-cryptographic name generation

from ..naming_utilities import NameBuilder, RandomSelector
from ..types import AgentName, AnimalSpirit, NamingStyle


class ScientificGenerator:
    """Generates Scientific-style names with Latin taxonomic themes."""

    def __init__(self) -> None:
        """Initialize the Scientific generator."""
        self.name_builder = NameBuilder()
        self.selector = RandomSelector()
        self._load_scientific_data()

    def _load_scientific_data(self) -> None:
        """Load Scientific-specific naming data."""
        # Latin genus names
        self.latin_genera = [
            "Panthera", "Canis", "Felis", "Ursus", "Elephas", "Loxodonta", "Balaena",
            "Megaptera", "Physeter", "Orcinus", "Delphinus", "Tursiops", "Carcharodon",
            "Homo", "Pan", "Gorilla", "Pongo", "Macaca", "Papio", "Cercopithecus",
            "Equus", "Bos", "Ovis", "Capra", "Sus", "Cervus", "Alces", "Rangifer",
            "Vulpes", "Lupus", "Lynx", "Puma", "Acinonyx", "Neofelis", "Leopardus",
        ]

        # Latin species names
        self.latin_species = [
            "Leo", "Tigris", "Pardus", "Onca", "Jubatus", "Melanoleuca", "Acutorostrata",
            "Novaeangliae", "Macrocephalus", "Orca", "Truncatus", "Aduncus", "Carcharias",
            "Sapiens", "Troglodytes", "Gorilla", "Pygmaeus", "Mulatta", "Anubis", "Aethiops",
            "Caballus", "Taurus", "Aries", "Hircus", "Scrofa", "Elaphus", "Alces", "Tarandus",
            "Vulpes", "Lupus", "Lynx", "Concolor", "Jubatus", "Nebulosa", "Pardalis",
        ]

        # Scientific classifications
        self.scientific_classifications = [
            "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta",
            "Iota", "Kappa", "Lambda", "Mu", "Nu", "Xi", "Omicron", "Pi", "Rho",
            "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi", "Omega", "Prime",
            "Secondary", "Tertiary", "Quaternary", "Type-A", "Type-B", "Type-C",
            "Class-1", "Class-2", "Class-3", "Class-4", "Class-5", "Class-6",
        ]

        # Scientific prefixes
        self.scientific_prefixes = [
            "Proto", "Pseudo", "Quasi", "Semi", "Multi", "Omni", "Trans", "Inter",
            "Intra", "Extra", "Sub", "Super", "Pre", "Post", "Auto", "Tele",
            "Holo", "Haptic", "Kinetic", "Static", "Dynamic", "Meta", "Neo",
            "Ultra", "Hyper", "Mega", "Micro", "Nano", "Pico", "Femto", "Atto",
        ]

        # Scientific suffixes
        self.scientific_suffixes = [
            "Osis", "Asis", "Esis", "Isis", "Usis", "Aris", "Eris", "Iris",
            "Oris", "Uris", "Ace", "Ice", "Oce", "Uce", "Ate", "Ete", "Ite",
            "Ote", "Ute", "Ane", "Ene", "Ine", "One", "Une", "Ade", "Ede",
            "Ide", "Ode", "Ude", "Ame", "Eme", "Ime", "Ome", "Ume",
        ]

        # Chemical elements
        self.chemical_elements = [
            "Hydrogen", "Helium", "Lithium", "Beryllium", "Boron", "Carbon", "Nitrogen",
            "Oxygen", "Fluorine", "Neon", "Sodium", "Magnesium", "Aluminum", "Silicon",
            "Phosphorus", "Sulfur", "Chlorine", "Argon", "Potassium", "Calcium",
            "Scandium", "Titanium", "Vanadium", "Chromium", "Manganese", "Iron",
            "Cobalt", "Nickel", "Copper", "Zinc", "Gallium", "Germanium", "Arsenic",
            "Selenium", "Bromine", "Krypton", "Rubidium", "Strontium", "Yttrium",
        ]

        # Scientific units and measurements
        self.scientific_units = [
            "Meter", "Gram", "Second", "Ampere", "Kelvin", "Mole", "Candela",
            "Newton", "Joule", "Watt", "Pascal", "Volt", "Ohm", "Farad", "Henry",
            "Weber", "Tesla", "Siemens", "Becquerel", "Gray", "Sievert", "Katal",
            "Hertz", "Lux", "Lumen", "Steradian", "Radian", "Degree", "Minute",
        ]

        # Scientific numbers and codes
        self.scientific_numbers = [
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

    def generate_scientific_name(
        self, spirit: AnimalSpirit | None = None, use_spirit: bool = True
    ) -> AgentName:
        """Generate a Scientific-style name."""
        if use_spirit and spirit:
            return self._generate_spirit_scientific_name(spirit)
        else:
            return self._generate_pure_scientific_name()

    def _generate_spirit_scientific_name(self, spirit: AnimalSpirit) -> AgentName:
        """Generate Scientific name with animal spirit integration."""
        # Use spirit name as base with Scientific styling
        spirit_names = {
            "fox": ["Vulpes", "Vulpine", "Fennec", "Arctic", "Kit", "Swift"],
            "wolf": ["Canis", "Lupus", "Lycan", "Lobo", "Lupin", "Fenrir"],
            "otter": ["Lutra", "Enhydra", "Pteronura", "Aonyx", "Lontra", "Aqua"],
            "dragon": ["Draco", "Wyrm", "Serpent", "Ancient", "Elder", "Primordial"],
            "phoenix": ["Phoenix", "Firebird", "Rebirth", "Renewal", "Eternal", "Radiant"],
            "eagle": ["Aquila", "Haliaeetus", "Golden", "Bald", "Harpy", "Crowned"],
            "lion": ["Panthera", "Leo", "King", "Mane", "Pride", "Regal"],
            "tiger": ["Panthera", "Tigris", "Bengal", "Siberian", "Striped", "Fierce"],
        }

        spirit_key = spirit.value
        base_name = self.selector.select_with_fallback(
            spirit_names.get(spirit_key, ["Canis"]), "Canis"
        )

        # Choose a scientific classification
        classification = self.selector.select_with_fallback(self.scientific_classifications, "Alpha")

        # Add a scientific suffix
        suffix = self.selector.select_with_fallback(self.scientific_suffixes, "Osis")

        name = self.name_builder.build_hyphenated_name([base_name, classification, suffix])
        components = [base_name, classification, suffix]

        return AgentName(
            name=name,
            spirit=spirit,
            style=NamingStyle.SCIENTIFIC,
            components=components,
        )

    def _generate_pure_scientific_name(self) -> AgentName:
        """Generate pure Scientific name without animal spirit."""
        # Choose between different Scientific naming patterns
        pattern = random.choice([1, 2, 3, 4, 5, 6])  # nosec B311

        if pattern == 1:
            # Pattern: [Genus] + [Species] + [Classification]
            genus = self.selector.select_with_fallback(self.latin_genera, "Canis")
            species = self.selector.select_with_fallback(self.latin_species, "Lupus")
            classification = self.selector.select_with_fallback(self.scientific_classifications, "Alpha")
            name = self.name_builder.build_hyphenated_name([genus, species, classification])
            components = [genus, species, classification]

        elif pattern == 2:
            # Pattern: [Element] + [Prefix] + [Number]
            element = self.selector.select_with_fallback(self.chemical_elements, "Carbon")
            prefix = self.selector.select_with_fallback(self.scientific_prefixes, "Proto")
            number = self.selector.select_with_fallback(self.scientific_numbers, "01")
            name = self.name_builder.build_hyphenated_name([element, prefix, number])
            components = [element, prefix, number]

        elif pattern == 3:
            # Pattern: [Prefix] + [Unit] + [Suffix]
            prefix = self.selector.select_with_fallback(self.scientific_prefixes, "Mega")
            unit = self.selector.select_with_fallback(self.scientific_units, "Meter")
            suffix = self.selector.select_with_fallback(self.scientific_suffixes, "Osis")
            name = self.name_builder.build_hyphenated_name([prefix, unit, suffix])
            components = [prefix, unit, suffix]

        elif pattern == 4:
            # Pattern: [Genus] + [Prefix] + [Number]
            genus = self.selector.select_with_fallback(self.latin_genera, "Panthera")
            prefix = self.selector.select_with_fallback(self.scientific_prefixes, "Neo")
            number = self.selector.select_with_fallback(self.scientific_numbers, "01")
            name = self.name_builder.build_hyphenated_name([genus, prefix, number])
            components = [genus, prefix, number]

        elif pattern == 5:
            # Pattern: [Element] + [Species] + [Classification]
            element = self.selector.select_with_fallback(self.chemical_elements, "Iron")
            species = self.selector.select_with_fallback(self.latin_species, "Ferrum")
            classification = self.selector.select_with_fallback(self.scientific_classifications, "Beta")
            name = self.name_builder.build_hyphenated_name([element, species, classification])
            components = [element, species, classification]

        else:
            # Pattern: [Unit] + [Prefix] + [Number]
            unit = self.selector.select_with_fallback(self.scientific_units, "Watt")
            prefix = self.selector.select_with_fallback(self.scientific_prefixes, "Kilo")
            number = self.selector.select_with_fallback(self.scientific_numbers, "01")
            name = self.name_builder.build_hyphenated_name([unit, prefix, number])
            components = [unit, prefix, number]

        return AgentName(
            name=name,
            spirit=None,
            style=NamingStyle.SCIENTIFIC,
            components=components,
        )

    def generate_scientific_batch(self, count: int = 5) -> list[AgentName]:
        """Generate a batch of Scientific names with variety."""
        names = []
        for i in range(count):
            # Alternate between spirit and pure Scientific names
            use_spirit = i % 2 == 0
            if use_spirit:
                spirit = AnimalSpirit(random.choice(list(AnimalSpirit)))  # nosec B311
                name = self.generate_scientific_name(spirit, use_spirit=True)
            else:
                name = self.generate_scientific_name(use_spirit=False)
            names.append(name)
        return names
