"""
Agent Naming Types
=================

Type definitions and enums for the agent naming system.
"""

from enum import Enum
from typing import Dict, List, Optional
from dataclasses import dataclass


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


@dataclass
class AgentName:
    """Represents a generated agent name with metadata."""

    name: str
    spirit: AnimalSpirit
    style: NamingStyle
    components: list[str]
    generation_number: int | None = None

    def __str__(self) -> str:
        return self.name

    def to_dict(self) -> dict[str, str]:
        """Convert to dictionary representation."""
        return {
            "name": self.name,
            "spirit": self.spirit.value,
            "style": self.style.value,
            "components": self.components,
            "generation_number": self.generation_number,
        }


@dataclass
class NamingConfig:
    """Configuration for agent naming generation."""

    spirit: AnimalSpirit | None = None
    style: NamingStyle | None = None
    count: int = 1
    weighted_distribution: bool = True

    def to_dict(self) -> dict[str, str]:
        """Convert to dictionary representation."""
        return {
            "spirit": self.spirit.value if self.spirit else None,
            "style": self.style.value if self.style else None,
            "count": self.count,
            "weighted_distribution": self.weighted_distribution,
        }
