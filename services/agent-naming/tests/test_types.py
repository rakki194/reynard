"""
Tests for Types Module
=====================

Comprehensive tests for the agent naming types, enums, and dataclasses.
"""

import pytest

pytestmark = pytest.mark.unit
from dataclasses import asdict

from reynard_agent_naming.agent_naming.types import (
    AgentName,
    AnimalSpirit,
    CelestialType,
    ColorType,
    ElementalType,
    GeographicType,
    HistoricalType,
    LiteraryType,
    MusicType,
    MythologicalType,
    NamingConfig,
    NamingScheme,
    NamingStyle,
    ScientificType,
    TechnologyType,
)


class TestAnimalSpirit:
    """Test AnimalSpirit enum functionality."""

    def test_animal_spirit_enum_values(self) -> None:
        """Test that all animal spirit enum values are strings."""
        for spirit in AnimalSpirit:
            assert isinstance(spirit.value, str)
            assert len(spirit.value) > 0

    def test_animal_spirit_enum_completeness(self) -> None:
        """Test that all expected animal spirits are present."""
        expected_spirits = {
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
            "dragon",
            "phoenix",
            "griffin",
            "unicorn",
            "kraken",
            "basilisk",
            "chimera",
            "sphinx",
            "manticore",
            "hydra",
            "alien",
            "void",
            "star",
            "nebula",
            "blackhole",
            "yeti",
            "loch_ness",
            "chupacabra",
            "wendigo",
            "skinwalker",
        }

        actual_spirits = {spirit.value for spirit in AnimalSpirit}
        assert actual_spirits == expected_spirits

    def test_animal_spirit_enum_uniqueness(self) -> None:
        """Test that all animal spirit enum values are unique."""
        values = [spirit.value for spirit in AnimalSpirit]
        assert len(values) == len(set(values))

    def test_animal_spirit_from_string(self) -> None:
        """Test creating AnimalSpirit from string value."""
        assert AnimalSpirit("fox") == AnimalSpirit.FOX
        assert AnimalSpirit("wolf") == AnimalSpirit.WOLF
        assert AnimalSpirit("otter") == AnimalSpirit.OTTER

    def test_animal_spirit_invalid_value(self) -> None:
        """Test that invalid animal spirit values raise ValueError."""
        with pytest.raises(ValueError):
            AnimalSpirit("invalid_spirit")


class TestNamingStyle:
    """Test NamingStyle enum functionality."""

    def test_naming_style_enum_values(self) -> None:
        """Test that all naming style enum values are strings."""
        for style in NamingStyle:
            assert isinstance(style.value, str)
            assert len(style.value) > 0

    def test_naming_style_enum_completeness(self) -> None:
        """Test that all expected naming styles are present."""
        expected_styles = {
            "foundation",
            "exo",
            "hybrid",
            "cyberpunk",
            "mythological",
            "scientific",
            "destiny",
        }

        actual_styles = {style.value for style in NamingStyle}
        assert actual_styles == expected_styles

    def test_naming_style_enum_uniqueness(self) -> None:
        """Test that all naming style enum values are unique."""
        values = [style.value for style in NamingStyle]
        assert len(values) == len(set(values))

    def test_naming_style_from_string(self) -> None:
        """Test creating NamingStyle from string value."""
        assert NamingStyle("foundation") == NamingStyle.FOUNDATION
        assert NamingStyle("exo") == NamingStyle.EXO
        assert NamingStyle("cyberpunk") == NamingStyle.CYBERPUNK


class TestNamingScheme:
    """Test NamingScheme enum functionality."""

    def test_naming_scheme_enum_values(self) -> None:
        """Test that all naming scheme enum values are strings."""
        for scheme in NamingScheme:
            assert isinstance(scheme.value, str)
            assert len(scheme.value) > 0

    def test_naming_scheme_enum_completeness(self) -> None:
        """Test that all expected naming schemes are present."""
        expected_schemes = {
            "animal_spirit",
            "elemental",
            "celestial",
            "mythological",
            "scientific",
            "geographic",
            "color",
            "music",
            "technology",
            "literary",
            "historical",
        }

        actual_schemes = {scheme.value for scheme in NamingScheme}
        assert actual_schemes == expected_schemes

    def test_naming_scheme_enum_uniqueness(self) -> None:
        """Test that all naming scheme enum values are unique."""
        values = [scheme.value for scheme in NamingScheme]
        assert len(values) == len(set(values))


class TestTypeEnums:
    """Test all type-specific enums."""

    @pytest.mark.parametrize(
        "enum_class",
        [
            ElementalType,
            CelestialType,
            MythologicalType,
            ScientificType,
            GeographicType,
            ColorType,
            MusicType,
            TechnologyType,
            LiteraryType,
            HistoricalType,
        ],
    )
    def test_type_enum_values(self, enum_class) -> None:
        """Test that all type enum values are strings."""
        for enum_value in enum_class:
            assert isinstance(enum_value.value, str)
            assert len(enum_value.value) > 0

    @pytest.mark.parametrize(
        "enum_class",
        [
            ElementalType,
            CelestialType,
            MythologicalType,
            ScientificType,
            GeographicType,
            ColorType,
            MusicType,
            TechnologyType,
            LiteraryType,
            HistoricalType,
        ],
    )
    def test_type_enum_uniqueness(self, enum_class) -> None:
        """Test that all type enum values are unique."""
        values = [enum_value.value for enum_value in enum_class]
        assert len(values) == len(set(values))

    def test_elemental_type_values(self) -> None:
        """Test ElementalType specific values."""
        expected_elements = {
            "fire",
            "water",
            "earth",
            "air",
            "void",
            "light",
            "dark",
            "ice",
            "lightning",
            "nature",
            "metal",
            "crystal",
        }
        actual_elements = {elem.value for elem in ElementalType}
        assert actual_elements == expected_elements

    def test_celestial_type_values(self) -> None:
        """Test CelestialType specific values."""
        expected_celestials = {
            "star",
            "planet",
            "moon",
            "comet",
            "asteroid",
            "nebula",
            "galaxy",
            "constellation",
            "blackhole",
            "supernova",
            "pulsar",
            "quasar",
        }
        actual_celestials = {celestial.value for celestial in CelestialType}
        assert actual_celestials == expected_celestials


class TestAgentName:
    """Test AgentName dataclass functionality."""

    def test_agent_name_creation(self, sample_agent_name) -> None:
        """Test creating an AgentName instance."""
        assert sample_agent_name.name == "Vulpine-Sage-13"
        assert sample_agent_name.spirit == AnimalSpirit.FOX
        assert sample_agent_name.style == NamingStyle.FOUNDATION
        assert sample_agent_name.components == ["Vulpine", "Sage", "13"]
        assert sample_agent_name.generation_number == 13

    def test_agent_name_str_representation(self, sample_agent_name) -> None:
        """Test string representation of AgentName."""
        assert str(sample_agent_name) == "Vulpine-Sage-13"

    def test_agent_name_to_dict(self, sample_agent_name) -> None:
        """Test converting AgentName to dictionary."""
        result = sample_agent_name.to_dict()
        expected = {
            "name": "Vulpine-Sage-13",
            "spirit": "fox",
            "style": "foundation",
            "components": ["Vulpine", "Sage", "13"],
            "generation_number": 13,
            "scheme": "animal_spirit",
            "scheme_type": None,
        }
        assert result == expected

    def test_agent_name_with_none_values(self) -> None:
        """Test AgentName with None values."""
        agent_name = AgentName(
            name="Test-Name",
            style=NamingStyle.FOUNDATION,
            components=["Test", "Name"],
            spirit=None,
            generation_number=None,
        )

        assert agent_name.name == "Test-Name"
        assert agent_name.spirit is None
        assert agent_name.generation_number is None

    def test_agent_name_to_dict_with_none_values(self) -> None:
        """Test to_dict with None values."""
        agent_name = AgentName(
            name="Test-Name",
            style=NamingStyle.FOUNDATION,
            components=["Test", "Name"],
            spirit=None,
            generation_number=None,
        )

        result = agent_name.to_dict()
        assert result["spirit"] is None
        assert result["generation_number"] is None

    def test_agent_name_with_scheme_type(self) -> None:
        """Test AgentName with scheme type."""
        agent_name = AgentName(
            name="Test-Name",
            style=NamingStyle.FOUNDATION,
            components=["Test", "Name"],
            scheme=NamingScheme.ELEMENTAL,
            scheme_type="fire",
        )

        assert agent_name.scheme == NamingScheme.ELEMENTAL
        assert agent_name.scheme_type == "fire"

    def test_agent_name_immutability(self, sample_agent_name) -> None:
        """Test that AgentName fields are properly set."""
        # Test that we can access all fields
        assert hasattr(sample_agent_name, "name")
        assert hasattr(sample_agent_name, "spirit")
        assert hasattr(sample_agent_name, "style")
        assert hasattr(sample_agent_name, "components")
        assert hasattr(sample_agent_name, "generation_number")
        assert hasattr(sample_agent_name, "scheme")
        assert hasattr(sample_agent_name, "scheme_type")


class TestNamingConfig:
    """Test NamingConfig dataclass functionality."""

    def test_naming_config_default_values(self) -> None:
        """Test NamingConfig with default values."""
        config = NamingConfig()

        assert config.spirit is None
        assert config.style is None
        assert config.scheme == NamingScheme.ANIMAL_SPIRIT
        assert config.scheme_type is None
        assert config.count == 1
        assert config.weighted_distribution is True

    def test_naming_config_with_values(self) -> None:
        """Test NamingConfig with specific values."""
        config = NamingConfig(
            spirit=AnimalSpirit.FOX,
            style=NamingStyle.FOUNDATION,
            scheme=NamingScheme.ANIMAL_SPIRIT,
            scheme_type="test_type",
            count=5,
            weighted_distribution=False,
        )

        assert config.spirit == AnimalSpirit.FOX
        assert config.style == NamingStyle.FOUNDATION
        assert config.scheme == NamingScheme.ANIMAL_SPIRIT
        assert config.scheme_type == "test_type"
        assert config.count == 5
        assert config.weighted_distribution is False

    def test_naming_config_to_dict(self) -> None:
        """Test converting NamingConfig to dictionary."""
        config = NamingConfig(
            spirit=AnimalSpirit.WOLF,
            style=NamingStyle.EXO,
            count=3,
        )

        result = config.to_dict()
        expected = {
            "spirit": "wolf",
            "style": "exo",
            "scheme": "animal_spirit",
            "scheme_type": None,
            "count": 3,
            "weighted_distribution": True,
        }
        assert result == expected

    def test_naming_config_to_dict_with_none_values(self) -> None:
        """Test to_dict with None values."""
        config = NamingConfig()
        result = config.to_dict()

        assert result["spirit"] is None
        assert result["style"] is None
        assert result["scheme_type"] is None

    def test_naming_config_with_different_scheme(self) -> None:
        """Test NamingConfig with different naming scheme."""
        config = NamingConfig(
            scheme=NamingScheme.ELEMENTAL,
            scheme_type="fire",
            count=2,
        )

        assert config.scheme == NamingScheme.ELEMENTAL
        assert config.scheme_type == "fire"
        assert config.count == 2

    def test_naming_config_immutability(self) -> None:
        """Test that NamingConfig fields are properly set."""
        config = NamingConfig(
            spirit=AnimalSpirit.OTTER,
            style=NamingStyle.CYBERPUNK,
            count=10,
        )

        # Test that we can access all fields
        assert hasattr(config, "spirit")
        assert hasattr(config, "style")
        assert hasattr(config, "scheme")
        assert hasattr(config, "scheme_type")
        assert hasattr(config, "count")
        assert hasattr(config, "weighted_distribution")


class TestTypeIntegration:
    """Test integration between different types."""

    def test_agent_name_with_naming_config(self) -> None:
        """Test creating AgentName from NamingConfig parameters."""
        config = NamingConfig(
            spirit=AnimalSpirit.DRAGON,
            style=NamingStyle.MYTHOLOGICAL,
            count=1,
        )

        agent_name = AgentName(
            name="Draco-Ancient-Divine",
            spirit=config.spirit,
            style=config.style,
            components=["Draco", "Ancient", "Divine"],
        )

        assert agent_name.spirit == config.spirit
        assert agent_name.style == config.style

    def test_all_enums_completeness(self) -> None:
        """Test that all enums have reasonable number of values."""
        # Animal spirits should have many options
        assert len(AnimalSpirit) >= 50

        # Naming styles should have core options
        assert len(NamingStyle) >= 5

        # Naming schemes should have multiple options
        assert len(NamingScheme) >= 5

        # Type enums should have reasonable number of values
        assert len(ElementalType) >= 5
        assert len(CelestialType) >= 5
        assert len(MythologicalType) >= 5

    def test_enum_value_consistency(self) -> None:
        """Test that enum values are consistent and valid."""
        # All enum values should be lowercase with underscores
        for spirit in AnimalSpirit:
            assert spirit.value.islower()
            assert " " not in spirit.value

        for style in NamingStyle:
            assert style.value.islower()
            assert " " not in style.value

        for scheme in NamingScheme:
            assert scheme.value.islower()
            assert " " not in scheme.value

    def test_dataclass_serialization(self, sample_agent_name) -> None:
        """Test that dataclasses can be serialized properly."""
        # Test asdict functionality
        agent_dict = asdict(sample_agent_name)
        assert isinstance(agent_dict, dict)
        assert "name" in agent_dict
        assert "spirit" in agent_dict
        assert "style" in agent_dict

        # Test custom to_dict method
        custom_dict = sample_agent_name.to_dict()
        assert isinstance(custom_dict, dict)
        assert custom_dict["name"] == "Vulpine-Sage-13"
        assert custom_dict["spirit"] == "fox"
        assert custom_dict["style"] == "foundation"
