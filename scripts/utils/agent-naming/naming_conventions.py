#!/usr/bin/env python3
"""
Reynard Naming Conventions
==========================

Contains all naming suffixes, prefixes, and conventions for different
naming styles in the Reynard robot name generator.

This module provides organized collections of suffixes and prefixes
for Foundation, Exo, Cyberpunk, Scientific, and other naming styles.
"""


class FoundationSuffixes:
    """Foundation-style suffixes for strategic and intellectual naming."""

    def __init__(self) -> None:
        self.suffixes = [
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

    def get_suffixes(self) -> list[str]:
        """Get all Foundation-style suffixes."""
        return self.suffixes.copy()

    def get_suffix_count(self) -> int:
        """Get the number of Foundation-style suffixes."""
        return len(self.suffixes)


class ExoSuffixes:
    """Exo-style suffixes for combat and technical naming."""

    def __init__(self) -> None:
        self.suffixes = [
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

    def get_suffixes(self) -> list[str]:
        """Get all Exo-style suffixes."""
        return self.suffixes.copy()

    def get_suffix_count(self) -> int:
        """Get the number of Exo-style suffixes."""
        return len(self.suffixes)


class CyberpunkPrefixes:
    """Cyberpunk-style prefixes for futuristic naming."""

    def __init__(self) -> None:
        self.prefixes = [
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

    def get_prefixes(self) -> list[str]:
        """Get all Cyberpunk-style prefixes."""
        return self.prefixes.copy()

    def get_prefix_count(self) -> int:
        """Get the number of Cyberpunk-style prefixes."""
        return len(self.prefixes)


class CyberpunkSuffixes:
    """Cyberpunk-style suffixes for futuristic naming."""

    def __init__(self) -> None:
        self.suffixes = [
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
            "Zero",
            "Infinity",
        ]

    def get_suffixes(self) -> list[str]:
        """Get all Cyberpunk-style suffixes."""
        return self.suffixes.copy()

    def get_suffix_count(self) -> int:
        """Get the number of Cyberpunk-style suffixes."""
        return len(self.suffixes)


class ScientificPrefixes:
    """Scientific naming prefixes based on Latin genus names."""

    def __init__(self) -> None:
        self.prefixes = [
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

    def get_prefixes(self) -> list[str]:
        """Get all scientific prefixes."""
        return self.prefixes.copy()

    def get_prefix_count(self) -> int:
        """Get the number of scientific prefixes."""
        return len(self.prefixes)


class ScientificSuffixes:
    """Scientific naming suffixes based on Latin species names."""

    def __init__(self) -> None:
        self.suffixes = [
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

    def get_suffixes(self) -> list[str]:
        """Get all scientific suffixes."""
        return self.suffixes.copy()

    def get_suffix_count(self) -> int:
        """Get the number of scientific suffixes."""
        return len(self.suffixes)


class SpecialDesignations:
    """Special designations for unique naming patterns."""

    def __init__(self) -> None:
        self.designations = [
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

    def get_designations(self) -> list[str]:
        """Get all special designations."""
        return self.designations.copy()

    def get_designation_count(self) -> int:
        """Get the number of special designations."""
        return len(self.designations)


class DivineSuffixes:
    """Divine suffixes for mythological naming."""

    def __init__(self) -> None:
        self.suffixes = [
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

    def get_suffixes(self) -> list[str]:
        """Get all divine suffixes."""
        return self.suffixes.copy()

    def get_suffix_count(self) -> int:
        """Get the number of divine suffixes."""
        return len(self.suffixes)


class ScientificClassifications:
    """Scientific classification terms for naming."""

    def __init__(self) -> None:
        self.classifications = [
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

    def get_classifications(self) -> list[str]:
        """Get all scientific classifications."""
        return self.classifications.copy()

    def get_classification_count(self) -> int:
        """Get the number of scientific classifications."""
        return len(self.classifications)
