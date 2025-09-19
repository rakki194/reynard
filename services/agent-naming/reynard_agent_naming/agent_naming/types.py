"""
Agent Naming Types
=================

Type definitions and enums for the agent naming system.
"""

from dataclasses import dataclass
from enum import Enum


class AnimalSpirit(Enum):
    """Available animal spirits for agent naming."""

    # Canines and Foxes
    FOX = "fox"
    WOLF = "wolf"
    COYOTE = "coyote"
    JACKAL = "jackal"

    # Aquatic and Marine
    OTTER = "otter"
    DOLPHIN = "dolphin"
    WHALE = "whale"
    SHARK = "shark"
    OCTOPUS = "octopus"
    AXOLOTL = "axolotl"

    # Birds of Prey and Flight
    EAGLE = "eagle"
    FALCON = "falcon"
    RAVEN = "raven"
    OWL = "owl"
    HAWK = "hawk"

    # Big Cats and Predators
    LION = "lion"
    TIGER = "tiger"
    LEOPARD = "leopard"
    JAGUAR = "jaguar"
    CHEETAH = "cheetah"
    LYNX = "lynx"

    # Bears and Large Mammals
    BEAR = "bear"
    PANDA = "panda"
    ELEPHANT = "elephant"
    RHINO = "rhino"

    # Primates and Intelligence
    APE = "ape"
    MONKEY = "monkey"
    LEMUR = "lemur"

    # Reptiles and Amphibians
    SNAKE = "snake"
    LIZARD = "lizard"
    TURTLE = "turtle"
    FROG = "frog"

    # Insects and Arachnids
    SPIDER = "spider"
    ANT = "ant"
    BEE = "bee"
    MANTIS = "mantis"
    DRAGONFLY = "dragonfly"

    # Exotic and Unique
    PANGOLIN = "pangolin"
    PLATYPUS = "platypus"
    NARWHAL = "narwhal"
    QUOKKA = "quokka"
    CAPYBARA = "capybara"
    AYE = "aye"
    KIWI = "kiwi"
    TOUCAN = "toucan"
    FLAMINGO = "flamingo"
    PEACOCK = "peacock"

    # Mythical and Legendary
    DRAGON = "dragon"
    PHOENIX = "phoenix"
    GRIFFIN = "griffin"
    UNICORN = "unicorn"
    KRAKEN = "kraken"
    BASILISK = "basilisk"
    CHIMERA = "chimera"
    SPHINX = "sphinx"
    MANTICORE = "manticore"
    HYDRA = "hydra"

    # Extraterrestrial and Cosmic
    ALIEN = "alien"
    VOID = "void"
    STAR = "star"
    NEBULA = "nebula"
    BLACKHOLE = "blackhole"

    # Mythical and Legendary
    YETI = "yeti"
    LOCH_NESS = "loch_ness"
    CHUPACABRA = "chupacabra"
    WENDIGO = "wendigo"
    SKINWALKER = "skinwalker"


class NamingStyle(Enum):
    """Available naming styles for agent generation."""

    FOUNDATION = "foundation"
    EXO = "exo"
    HYBRID = "hybrid"
    CYBERPUNK = "cyberpunk"
    MYTHOLOGICAL = "mythological"
    SCIENTIFIC = "scientific"
    DESTINY = "destiny"


class NamingScheme(Enum):
    """Available naming schemes for agent generation."""

    # Original animal spirit scheme
    ANIMAL_SPIRIT = "animal_spirit"

    # Elemental schemes
    ELEMENTAL = "elemental"
    CELESTIAL = "celestial"
    MYTHOLOGICAL = "mythological"
    SCIENTIFIC = "scientific"
    GEOGRAPHIC = "geographic"
    COLOR = "color"
    MUSIC = "music"
    TECHNOLOGY = "technology"
    LITERARY = "literary"
    HISTORICAL = "historical"


class ElementalType(Enum):
    """Elemental types for elemental naming scheme."""

    FIRE = "fire"
    WATER = "water"
    EARTH = "earth"
    AIR = "air"
    VOID = "void"
    LIGHT = "light"
    DARK = "dark"
    ICE = "ice"
    LIGHTNING = "lightning"
    NATURE = "nature"
    METAL = "metal"
    CRYSTAL = "crystal"


class CelestialType(Enum):
    """Celestial types for celestial naming scheme."""

    STAR = "star"
    PLANET = "planet"
    MOON = "moon"
    COMET = "comet"
    ASTEROID = "asteroid"
    NEBULA = "nebula"
    GALAXY = "galaxy"
    CONSTELLATION = "constellation"
    BLACKHOLE = "blackhole"
    SUPERNOVA = "supernova"
    PULSAR = "pulsar"
    QUASAR = "quasar"


class MythologicalType(Enum):
    """Mythological types for mythological naming scheme."""

    GOD = "god"
    GODDESS = "goddess"
    HERO = "hero"
    DEMIGOD = "demigod"
    TITAN = "titan"
    SPIRIT = "spirit"
    ARTIFACT = "artifact"
    CREATURE = "creature"
    REALM = "realm"
    FORCE = "force"


class ScientificType(Enum):
    """Scientific types for scientific naming scheme."""

    ELEMENT = "element"
    COMPOUND = "compound"
    PARTICLE = "particle"
    FORCE = "force"
    THEORY = "theory"
    LAW = "law"
    PROCESS = "process"
    STRUCTURE = "structure"
    SYSTEM = "system"
    PHENOMENON = "phenomenon"


class GeographicType(Enum):
    """Geographic types for geographic naming scheme."""

    MOUNTAIN = "mountain"
    RIVER = "river"
    OCEAN = "ocean"
    FOREST = "forest"
    DESERT = "desert"
    CITY = "city"
    LANDMARK = "landmark"
    REGION = "region"
    ISLAND = "island"
    VALLEY = "valley"


class ColorType(Enum):
    """Color types for color naming scheme."""

    RED = "red"
    BLUE = "blue"
    GREEN = "green"
    YELLOW = "yellow"
    PURPLE = "purple"
    ORANGE = "orange"
    PINK = "pink"
    CYAN = "cyan"
    MAGENTA = "magenta"
    GOLD = "gold"
    SILVER = "silver"
    COPPER = "copper"


class MusicType(Enum):
    """Music types for music naming scheme."""

    NOTE = "note"
    INSTRUMENT = "instrument"
    COMPOSER = "composer"
    GENRE = "genre"
    SCALE = "scale"
    CHORD = "chord"
    RHYTHM = "rhythm"
    MELODY = "melody"
    HARMONY = "harmony"
    TEMPO = "tempo"


class TechnologyType(Enum):
    """Technology types for technology naming scheme."""

    COMPONENT = "component"
    PROTOCOL = "protocol"
    ARCHITECTURE = "architecture"
    ALGORITHM = "algorithm"
    FRAMEWORK = "framework"
    PLATFORM = "platform"
    SYSTEM = "system"
    NETWORK = "network"
    DATABASE = "database"
    INTERFACE = "interface"


class LiteraryType(Enum):
    """Literary types for literary naming scheme."""

    CHARACTER = "character"
    AUTHOR = "author"
    WORK = "work"
    GENRE = "genre"
    THEME = "theme"
    SYMBOL = "symbol"
    METAPHOR = "metaphor"
    NARRATIVE = "narrative"
    POETRY = "poetry"
    PROSE = "prose"


class HistoricalType(Enum):
    """Historical types for historical naming scheme."""

    ERA = "era"
    CIVILIZATION = "civilization"
    LEADER = "leader"
    EVENT = "event"
    INVENTION = "invention"
    DISCOVERY = "discovery"
    WAR = "war"
    PEACE = "peace"
    CULTURE = "culture"
    TRADITION = "tradition"


@dataclass
class AgentName:
    """Represents a generated agent name with metadata."""

    name: str
    style: NamingStyle
    components: list[str]
    spirit: AnimalSpirit | None = None
    generation_number: int | None = None
    scheme: NamingScheme = NamingScheme.ANIMAL_SPIRIT
    scheme_type: str | None = None  # The specific type within the scheme

    def __str__(self) -> str:
        return self.name

    def to_dict(self) -> dict[str, str | list[str] | int | None]:
        """Convert to dictionary representation."""
        return {
            "name": self.name,
            "spirit": self.spirit.value if self.spirit else None,
            "style": self.style.value,
            "components": self.components,
            "generation_number": self.generation_number,
            "scheme": self.scheme.value,
            "scheme_type": self.scheme_type,
        }


@dataclass
class NamingConfig:
    """Configuration for agent naming generation."""

    spirit: AnimalSpirit | None = None
    style: NamingStyle | None = None
    scheme: NamingScheme = NamingScheme.ANIMAL_SPIRIT
    scheme_type: str | None = None  # The specific type within the scheme
    count: int = 1
    weighted_distribution: bool = True

    def to_dict(self) -> dict[str, str | int | bool | None]:
        """Convert to dictionary representation."""
        return {
            "spirit": self.spirit.value if self.spirit else None,
            "style": self.style.value if self.style else None,
            "scheme": self.scheme.value,
            "scheme_type": self.scheme_type,
            "count": self.count,
            "weighted_distribution": self.weighted_distribution,
        }
