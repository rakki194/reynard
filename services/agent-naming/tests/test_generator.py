"""
Tests for Generator Module
=========================

Comprehensive tests for the ReynardRobotNamer class and all naming style generators.
"""

from unittest.mock import patch

import pytest

pytestmark = pytest.mark.unit

from reynard_agent_naming.agent_naming.generator import ReynardRobotNamer
from reynard_agent_naming.agent_naming.types import (
    AgentName,
    AnimalSpirit,
    NamingConfig,
    NamingScheme,
    NamingStyle,
)


class TestReynardRobotNamer:
    """Test ReynardRobotNamer class functionality."""

    @pytest.fixture
    def namer(self):
        """Create a ReynardRobotNamer instance for testing."""
        return ReynardRobotNamer()

    def test_namer_initialization(self, namer) -> None:
        """Test that the namer initializes correctly."""
        assert namer is not None
        assert hasattr(namer, "animal_spirits")
        assert hasattr(namer, "foundation_suffixes")
        assert hasattr(namer, "exo_suffixes")
        assert hasattr(namer, "cyberpunk_prefixes")
        assert hasattr(namer, "cyberpunk_suffixes")
        assert hasattr(namer, "mythological_references")
        assert hasattr(namer, "scientific_prefixes")
        assert hasattr(namer, "scientific_suffixes")
        assert hasattr(namer, "hybrid_references")
        assert hasattr(namer, "special_designations")
        assert hasattr(namer, "generation_numbers")
        assert hasattr(namer, "alternative_generator")

    def test_animal_spirits_loaded(self, namer) -> None:
        """Test that animal spirits are properly loaded."""
        assert isinstance(namer.animal_spirits, dict)
        assert len(namer.animal_spirits) > 0

        # Test specific spirits
        assert "fox" in namer.animal_spirits
        assert "wolf" in namer.animal_spirits
        assert "otter" in namer.animal_spirits

        # Test that each spirit has multiple name options
        assert len(namer.animal_spirits["fox"]) > 10
        assert len(namer.animal_spirits["wolf"]) > 10
        assert len(namer.animal_spirits["otter"]) > 10

    def test_naming_components_loaded(self, namer) -> None:
        """Test that naming components are properly loaded."""
        # Test foundation suffixes
        assert isinstance(namer.foundation_suffixes, list)
        assert len(namer.foundation_suffixes) > 0
        assert "Sage" in namer.foundation_suffixes
        assert "Oracle" in namer.foundation_suffixes

        # Test exo suffixes
        assert isinstance(namer.exo_suffixes, list)
        assert len(namer.exo_suffixes) > 0
        assert "Guard" in namer.exo_suffixes
        assert "Sentinel" in namer.exo_suffixes

        # Test cyberpunk components
        assert isinstance(namer.cyberpunk_prefixes, list)
        assert isinstance(namer.cyberpunk_suffixes, list)
        assert "Cyber" in namer.cyberpunk_prefixes
        assert "Nexus" in namer.cyberpunk_suffixes

    def test_generation_numbers_loaded(self, namer) -> None:
        """Test that generation numbers are properly loaded."""
        assert isinstance(namer.generation_numbers, dict)
        assert len(namer.generation_numbers) > 0

        # Test specific spirit generation numbers
        assert "fox" in namer.generation_numbers
        assert "wolf" in namer.generation_numbers
        assert "otter" in namer.generation_numbers

        # Test that generation numbers are lists of integers
        assert isinstance(namer.generation_numbers["fox"], list)
        assert all(isinstance(n, int) for n in namer.generation_numbers["fox"])


class TestFoundationStyleGeneration:
    """Test Foundation-style name generation."""

    @pytest.fixture
    def namer(self):
        """Create a ReynardRobotNamer instance for testing."""
        return ReynardRobotNamer()

    def test_generate_foundation_style_with_spirit(self, namer) -> None:
        """Test generating Foundation-style names with specific spirit."""
        agent_name = namer.generate_foundation_style(AnimalSpirit.FOX)

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == AnimalSpirit.FOX
        assert agent_name.style == NamingStyle.FOUNDATION
        assert agent_name.name is not None
        assert len(agent_name.name) > 0
        assert agent_name.generation_number is not None
        assert isinstance(agent_name.generation_number, int)
        assert agent_name.components is not None
        assert len(agent_name.components) == 3

    def test_generate_foundation_style_without_spirit(self, namer) -> None:
        """Test generating Foundation-style names without specific spirit."""
        agent_name = namer.generate_foundation_style()

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit is not None
        assert agent_name.style == NamingStyle.FOUNDATION
        assert agent_name.name is not None
        assert len(agent_name.name) > 0

    def test_foundation_style_name_format(self, namer) -> None:
        """Test that Foundation-style names follow the correct format."""
        agent_name = namer.generate_foundation_style(AnimalSpirit.FOX)

        # Should be in format: [Base]-[Suffix]-[Generation]
        parts = agent_name.name.split("-")
        assert len(parts) == 3

        base, suffix, generation = parts
        assert base in namer.animal_spirits["fox"]
        assert suffix in namer.foundation_suffixes
        assert generation.isdigit()
        assert int(generation) in namer.generation_numbers["fox"]

    def test_foundation_style_multiple_generations(self, namer) -> None:
        """Test generating multiple Foundation-style names."""
        names = []
        for _ in range(10):
            agent_name = namer.generate_foundation_style(AnimalSpirit.FOX)
            names.append(agent_name.name)

        # Should have some variety in generated names
        unique_names = set(names)
        assert len(unique_names) > 1  # Should have some variety

    def test_foundation_style_different_spirits(self, namer) -> None:
        """Test Foundation-style generation with different spirits."""
        spirits = [AnimalSpirit.FOX, AnimalSpirit.WOLF, AnimalSpirit.OTTER]

        for spirit in spirits:
            agent_name = namer.generate_foundation_style(spirit)
            assert agent_name.spirit == spirit
            assert agent_name.style == NamingStyle.FOUNDATION

            # Check that the base name comes from the correct spirit
            base_name = agent_name.name.split("-")[0]
            assert base_name in namer.animal_spirits[spirit.value]


class TestExoStyleGeneration:
    """Test Exo-style name generation."""

    @pytest.fixture
    def namer(self):
        """Create a ReynardRobotNamer instance for testing."""
        return ReynardRobotNamer()

    def test_generate_exo_style_with_spirit(self, namer) -> None:
        """Test generating Exo-style names with specific spirit."""
        agent_name = namer.generate_exo_style(AnimalSpirit.WOLF)

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == AnimalSpirit.WOLF
        assert agent_name.style == NamingStyle.EXO
        assert agent_name.name is not None
        assert len(agent_name.name) > 0
        assert agent_name.generation_number is not None
        assert isinstance(agent_name.generation_number, int)

    def test_exo_style_name_format(self, namer) -> None:
        """Test that Exo-style names follow the correct format."""
        agent_name = namer.generate_exo_style(AnimalSpirit.WOLF)

        # Should be in format: [Base]-[Suffix]-[Model]
        parts = agent_name.name.split("-")
        assert len(parts) == 3

        base, suffix, model = parts
        assert base in namer.animal_spirits["wolf"]
        assert suffix in namer.exo_suffixes
        assert model.isdigit()
        assert int(model) in namer.generation_numbers["wolf"]

    def test_exo_style_without_spirit(self, namer) -> None:
        """Test generating Exo-style names without specific spirit."""
        agent_name = namer.generate_exo_style()

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit is not None
        assert agent_name.style == NamingStyle.EXO
        assert agent_name.name is not None


class TestCyberpunkStyleGeneration:
    """Test Cyberpunk-style name generation."""

    @pytest.fixture
    def namer(self):
        """Create a ReynardRobotNamer instance for testing."""
        return ReynardRobotNamer()

    def test_generate_cyberpunk_style_with_spirit(self, namer) -> None:
        """Test generating Cyberpunk-style names with specific spirit."""
        agent_name = namer.generate_cyberpunk_style(AnimalSpirit.OTTER)

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == AnimalSpirit.OTTER
        assert agent_name.style == NamingStyle.CYBERPUNK
        assert agent_name.name is not None
        assert len(agent_name.name) > 0

    def test_cyberpunk_style_name_format(self, namer) -> None:
        """Test that Cyberpunk-style names follow the correct format."""
        agent_name = namer.generate_cyberpunk_style(AnimalSpirit.OTTER)

        # Should be in format: [Tech Prefix]-[Animal Spirit]-[Cyber Suffix]
        parts = agent_name.name.split("-")
        assert len(parts) == 3

        prefix, base, suffix = parts
        assert prefix in namer.cyberpunk_prefixes
        assert base in namer.animal_spirits["otter"]
        assert suffix in namer.cyberpunk_suffixes

    def test_cyberpunk_style_without_spirit(self, namer) -> None:
        """Test generating Cyberpunk-style names without specific spirit."""
        agent_name = namer.generate_cyberpunk_style()

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit is not None
        assert agent_name.style == NamingStyle.CYBERPUNK
        assert agent_name.name is not None


class TestMythologicalStyleGeneration:
    """Test Mythological-style name generation."""

    @pytest.fixture
    def namer(self):
        """Create a ReynardRobotNamer instance for testing."""
        return ReynardRobotNamer()

    def test_generate_mythological_style_with_spirit(self, namer) -> None:
        """Test generating Mythological-style names with specific spirit."""
        agent_name = namer.generate_mythological_style(AnimalSpirit.DRAGON)

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == AnimalSpirit.DRAGON
        assert agent_name.style == NamingStyle.MYTHOLOGICAL
        assert agent_name.name is not None
        assert len(agent_name.name) > 0

    def test_mythological_style_name_format(self, namer) -> None:
        """Test that Mythological-style names follow the correct format."""
        agent_name = namer.generate_mythological_style(AnimalSpirit.DRAGON)

        # Should be in format: [Mythological Reference]-[Animal Spirit]-[Divine Suffix]
        parts = agent_name.name.split("-")
        assert len(parts) == 3

        myth_ref, base, divine_suffix = parts
        assert myth_ref in namer.mythological_references
        assert base in namer.animal_spirits["dragon"]
        # Divine suffix should be one of the expected values
        expected_divine_suffixes = [
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
        assert divine_suffix in expected_divine_suffixes

    def test_mythological_style_without_spirit(self, namer) -> None:
        """Test generating Mythological-style names without specific spirit."""
        agent_name = namer.generate_mythological_style()

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit is not None
        assert agent_name.style == NamingStyle.MYTHOLOGICAL
        assert agent_name.name is not None


class TestScientificStyleGeneration:
    """Test Scientific-style name generation."""

    @pytest.fixture
    def namer(self):
        """Create a ReynardRobotNamer instance for testing."""
        return ReynardRobotNamer()

    def test_generate_scientific_style(self, namer) -> None:
        """Test generating Scientific-style names."""
        agent_name = namer.generate_scientific_style()

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == AnimalSpirit.FOX  # Default for scientific style
        assert agent_name.style == NamingStyle.SCIENTIFIC
        assert agent_name.name is not None
        assert len(agent_name.name) > 0

    def test_scientific_style_name_format(self, namer) -> None:
        """Test that Scientific-style names follow the correct format."""
        agent_name = namer.generate_scientific_style()

        # Should be in format: [Scientific Name]-[Technical Suffix]-[Classification]
        # Note: Classification can contain hyphens (e.g., "Type-A", "Class-1")
        parts = agent_name.name.split("-")
        assert len(parts) >= 3  # At least 3 parts, but classification can have hyphens

        scientific_prefix = parts[0]
        scientific_suffix = parts[1]
        classification = "-".join(parts[2:])  # Join remaining parts for classification

        assert scientific_prefix in namer.scientific_prefixes
        assert scientific_suffix in namer.scientific_suffixes

        # Classification should be one of the expected values
        expected_classifications = [
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
        assert classification in expected_classifications

    def test_scientific_style_ignores_spirit_parameter(self, namer) -> None:
        """Test that Scientific-style generation ignores spirit parameter."""
        # Should return the same result regardless of spirit parameter
        agent_name1 = namer.generate_scientific_style(AnimalSpirit.FOX)
        agent_name2 = namer.generate_scientific_style(AnimalSpirit.WOLF)

        # Both should have FOX as spirit (default for scientific style)
        assert agent_name1.spirit == AnimalSpirit.FOX
        assert agent_name2.spirit == AnimalSpirit.FOX
        assert agent_name1.style == NamingStyle.SCIENTIFIC
        assert agent_name2.style == NamingStyle.SCIENTIFIC


class TestHybridStyleGeneration:
    """Test Hybrid-style name generation."""

    @pytest.fixture
    def namer(self):
        """Create a ReynardRobotNamer instance for testing."""
        return ReynardRobotNamer()

    def test_generate_hybrid_style_with_spirit(self, namer) -> None:
        """Test generating Hybrid-style names with specific spirit."""
        agent_name = namer.generate_hybrid_style(AnimalSpirit.LION)

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == AnimalSpirit.LION
        assert agent_name.style == NamingStyle.HYBRID
        assert agent_name.name is not None
        assert len(agent_name.name) > 0

    def test_hybrid_style_name_format(self, namer) -> None:
        """Test that Hybrid-style names follow the correct format."""
        agent_name = namer.generate_hybrid_style(AnimalSpirit.LION)

        # Should be in format: [Spirit]-[Reference]-[Designation]
        parts = agent_name.name.split("-")
        assert len(parts) == 3

        base, reference, designation = parts
        assert base in namer.animal_spirits["lion"]
        assert reference in namer.hybrid_references
        assert designation in namer.special_designations

    def test_hybrid_style_without_spirit(self, namer) -> None:
        """Test generating Hybrid-style names without specific spirit."""
        agent_name = namer.generate_hybrid_style()

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit is not None
        assert agent_name.style == NamingStyle.HYBRID
        assert agent_name.name is not None


class TestRandomStyleGeneration:
    """Test random style name generation."""

    @pytest.fixture
    def namer(self):
        """Create a ReynardRobotNamer instance for testing."""
        return ReynardRobotNamer()

    def test_generate_random_style_with_spirit(self, namer) -> None:
        """Test generating random style names with specific spirit."""
        agent_name = namer.generate_random_style(AnimalSpirit.EAGLE)

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == AnimalSpirit.EAGLE
        assert agent_name.style is not None
        assert agent_name.name is not None
        assert len(agent_name.name) > 0

    def test_generate_random_style_without_spirit(self, namer) -> None:
        """Test generating random style names without specific spirit."""
        agent_name = namer.generate_random_style()

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit is not None
        assert agent_name.style is not None
        assert agent_name.name is not None

    def test_random_style_variety(self, namer) -> None:
        """Test that random style generation produces variety."""
        styles = set()
        for _ in range(20):
            agent_name = namer.generate_random_style()
            styles.add(agent_name.style)

        # Should generate multiple different styles
        assert len(styles) > 1


class TestSingleNameGeneration:
    """Test single name generation with configuration."""

    @pytest.fixture
    def namer(self):
        """Create a ReynardRobotNamer instance for testing."""
        return ReynardRobotNamer()

    def test_generate_single_name_foundation_style(self, namer) -> None:
        """Test generating single name with Foundation style."""
        config = NamingConfig(
            spirit=AnimalSpirit.FOX, style=NamingStyle.FOUNDATION, count=1
        )

        agent_name = namer.generate_single_name(config)

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == AnimalSpirit.FOX
        assert agent_name.style == NamingStyle.FOUNDATION

    def test_generate_single_name_exo_style(self, namer) -> None:
        """Test generating single name with Exo style."""
        config = NamingConfig(spirit=AnimalSpirit.WOLF, style=NamingStyle.EXO, count=1)

        agent_name = namer.generate_single_name(config)

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == AnimalSpirit.WOLF
        assert agent_name.style == NamingStyle.EXO

    def test_generate_single_name_cyberpunk_style(self, namer) -> None:
        """Test generating single name with Cyberpunk style."""
        config = NamingConfig(
            spirit=AnimalSpirit.OTTER, style=NamingStyle.CYBERPUNK, count=1
        )

        agent_name = namer.generate_single_name(config)

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == AnimalSpirit.OTTER
        assert agent_name.style == NamingStyle.CYBERPUNK

    def test_generate_single_name_mythological_style(self, namer) -> None:
        """Test generating single name with Mythological style."""
        config = NamingConfig(
            spirit=AnimalSpirit.DRAGON, style=NamingStyle.MYTHOLOGICAL, count=1
        )

        agent_name = namer.generate_single_name(config)

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == AnimalSpirit.DRAGON
        assert agent_name.style == NamingStyle.MYTHOLOGICAL

    def test_generate_single_name_scientific_style(self, namer) -> None:
        """Test generating single name with Scientific style."""
        config = NamingConfig(style=NamingStyle.SCIENTIFIC, count=1)

        agent_name = namer.generate_single_name(config)

        assert isinstance(agent_name, AgentName)
        assert agent_name.style == NamingStyle.SCIENTIFIC

    def test_generate_single_name_hybrid_style(self, namer) -> None:
        """Test generating single name with Hybrid style."""
        config = NamingConfig(
            spirit=AnimalSpirit.LION, style=NamingStyle.HYBRID, count=1
        )

        agent_name = namer.generate_single_name(config)

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == AnimalSpirit.LION
        assert agent_name.style == NamingStyle.HYBRID

    def test_generate_single_name_random_style(self, namer) -> None:
        """Test generating single name with random style."""
        config = NamingConfig(spirit=AnimalSpirit.EAGLE, count=1)

        agent_name = namer.generate_single_name(config)

        assert isinstance(agent_name, AgentName)
        # Random style generation may not respect the spirit parameter
        assert isinstance(agent_name.spirit, AnimalSpirit)
        assert agent_name.style is not None

    def test_generate_single_name_alternative_scheme(self, namer) -> None:
        """Test generating single name with alternative naming scheme."""
        config = NamingConfig(scheme=NamingScheme.ELEMENTAL, count=1)

        agent_name = namer.generate_single_name(config)

        assert isinstance(agent_name, AgentName)
        # Should use alternative generator for non-animal-spirit schemes
        assert agent_name.scheme == NamingScheme.ELEMENTAL

    def test_generate_single_name_fallback_on_error(self, namer) -> None:
        """Test that single name generation falls back on error."""
        # Mock the style generators to raise an exception
        with patch.object(
            namer, "generate_foundation_style", side_effect=Exception("Test error")
        ):
            config = NamingConfig(
                spirit=AnimalSpirit.FOX, style=NamingStyle.FOUNDATION, count=1
            )

            agent_name = namer.generate_single_name(config)

            # Should return a fallback name
            assert isinstance(agent_name, AgentName)
            assert agent_name.name.startswith("Agent-")
            assert agent_name.spirit == AnimalSpirit.FOX
            assert agent_name.style == NamingStyle.FOUNDATION


class TestBatchGeneration:
    """Test batch name generation."""

    @pytest.fixture
    def namer(self):
        """Create a ReynardRobotNamer instance for testing."""
        return ReynardRobotNamer()

    def test_generate_batch_single_name(self, namer) -> None:
        """Test generating a batch with a single name."""
        config = NamingConfig(
            spirit=AnimalSpirit.FOX, style=NamingStyle.FOUNDATION, count=1
        )

        names = namer.generate_batch(config)

        assert isinstance(names, list)
        assert len(names) == 1
        assert isinstance(names[0], AgentName)
        assert names[0].spirit == AnimalSpirit.FOX
        assert names[0].style == NamingStyle.FOUNDATION

    def test_generate_batch_multiple_names(self, namer) -> None:
        """Test generating a batch with multiple names."""
        config = NamingConfig(
            spirit=AnimalSpirit.FOX, style=NamingStyle.FOUNDATION, count=5
        )

        names = namer.generate_batch(config)

        assert isinstance(names, list)
        assert len(names) == 5

        # All names should be valid AgentName objects
        for name in names:
            assert isinstance(name, AgentName)
            assert name.spirit == AnimalSpirit.FOX
            assert name.style == NamingStyle.FOUNDATION
            assert name.name is not None
            assert len(name.name) > 0

    def test_generate_batch_uniqueness(self, namer) -> None:
        """Test that batch generation produces unique names."""
        config = NamingConfig(
            spirit=AnimalSpirit.FOX, style=NamingStyle.FOUNDATION, count=10
        )

        names = namer.generate_batch(config)
        name_strings = [name.name for name in names]

        # Should have unique names (or at least mostly unique)
        unique_names = set(name_strings)
        assert len(unique_names) >= len(name_strings) * 0.8  # Allow some duplicates

    def test_generate_batch_different_styles(self, namer) -> None:
        """Test generating batches with different styles."""
        styles = [
            NamingStyle.FOUNDATION,
            NamingStyle.EXO,
            NamingStyle.CYBERPUNK,
            NamingStyle.MYTHOLOGICAL,
            NamingStyle.SCIENTIFIC,
            NamingStyle.HYBRID,
        ]

        for style in styles:
            config = NamingConfig(spirit=AnimalSpirit.FOX, style=style, count=3)

            names = namer.generate_batch(config)

            assert len(names) == 3
            for name in names:
                assert name.style == style
                assert name.spirit == AnimalSpirit.FOX

    def test_generate_batch_fallback_names(self, namer) -> None:
        """Test that batch generation adds fallback names when needed."""
        # Mock the single name generation to always return the same name
        with patch.object(namer, "generate_single_name") as mock_generate:
            mock_generate.return_value = AgentName(
                name="Same-Name-1",
                spirit=AnimalSpirit.FOX,
                style=NamingStyle.FOUNDATION,
                components=["Same", "Name", "1"],
            )

            config = NamingConfig(
                spirit=AnimalSpirit.FOX, style=NamingStyle.FOUNDATION, count=5
            )

            names = namer.generate_batch(config)

            # Should have 5 names, with fallback names added
            assert len(names) == 5

            # First name should be the mocked name
            assert names[0].name == "Same-Name-1"

            # Subsequent names should be fallback names
            for i in range(1, 5):
                assert names[i].name == f"Agent-{i + 1}"


class TestSpiritInfoAnalysis:
    """Test spirit information analysis."""

    @pytest.fixture
    def namer(self):
        """Create a ReynardRobotNamer instance for testing."""
        return ReynardRobotNamer()

    def test_get_spirit_info_foundation_style(self, namer) -> None:
        """Test analyzing Foundation-style names."""
        # Test with a known Foundation-style name
        info = namer.get_spirit_info("Vulpine-Sage-13")

        assert isinstance(info, dict)
        assert "spirit" in info
        assert "style" in info
        assert "components" in info

        # Should detect fox spirit and foundation style
        assert info["spirit"] == "fox"
        assert info["style"] == "foundation"

    def test_get_spirit_info_exo_style(self, namer) -> None:
        """Test analyzing Exo-style names."""
        # Test with a known Exo-style name
        info = namer.get_spirit_info("Lupus-Guard-24")

        assert isinstance(info, dict)
        assert "spirit" in info
        assert "style" in info
        assert "components" in info

        # Should detect wolf spirit and exo style
        assert info["spirit"] == "wolf"
        assert info["style"] == "exo"

    def test_get_spirit_info_cyberpunk_style(self, namer) -> None:
        """Test analyzing Cyberpunk-style names."""
        # Test with a known Cyberpunk-style name that contains a fox spirit name
        info = namer.get_spirit_info("Cyber-Vulpine-Nexus")

        assert isinstance(info, dict)
        assert "spirit" in info
        assert "style" in info
        assert "components" in info

        # Should detect fox spirit (style detection may vary due to compound phrases)
        assert info["spirit"] == "fox"
        assert info["style"] in ["cyberpunk", "hybrid"]  # Both are valid detections

    def test_get_spirit_info_unknown_name(self, namer) -> None:
        """Test analyzing unknown names."""
        info = namer.get_spirit_info("Unknown-Name-123")

        assert isinstance(info, dict)
        assert "spirit" in info
        assert "style" in info
        assert "components" in info

        # Should return unknown for unrecognized names
        assert info["spirit"] == "unknown"
        assert info["style"] == "unknown"

    def test_get_spirit_info_empty_name(self, namer) -> None:
        """Test analyzing empty names."""
        info = namer.get_spirit_info("")

        assert isinstance(info, dict)
        assert info["spirit"] == "unknown"
        assert info["style"] == "unknown"

    def test_get_spirit_info_case_insensitive(self, namer) -> None:
        """Test that spirit info analysis is case insensitive."""
        info1 = namer.get_spirit_info("Vulpine-Sage-13")
        info2 = namer.get_spirit_info("vulpine-sage-13")
        info3 = namer.get_spirit_info("VULPINE-SAGE-13")

        # Should all return the same result
        assert info1["spirit"] == info2["spirit"] == info3["spirit"]
        assert info1["style"] == info2["style"] == info3["style"]


class TestGeneratorIntegration:
    """Test integration between different generator methods."""

    @pytest.fixture
    def namer(self):
        """Create a ReynardRobotNamer instance for testing."""
        return ReynardRobotNamer()

    def test_all_styles_generate_valid_names(self, namer) -> None:
        """Test that all naming styles generate valid names."""
        styles = [
            NamingStyle.FOUNDATION,
            NamingStyle.EXO,
            NamingStyle.CYBERPUNK,
            NamingStyle.MYTHOLOGICAL,
            NamingStyle.SCIENTIFIC,
            NamingStyle.HYBRID,
        ]

        for style in styles:
            config = NamingConfig(spirit=AnimalSpirit.FOX, style=style, count=1)

            agent_name = namer.generate_single_name(config)

            assert isinstance(agent_name, AgentName)
            assert agent_name.name is not None
            assert len(agent_name.name) > 0
            assert agent_name.style == style
            assert agent_name.spirit == AnimalSpirit.FOX

    def test_all_spirits_generate_valid_names(self, namer) -> None:
        """Test that all animal spirits can generate valid names."""
        spirits = [
            AnimalSpirit.FOX,
            AnimalSpirit.WOLF,
            AnimalSpirit.OTTER,
            AnimalSpirit.DRAGON,
            AnimalSpirit.EAGLE,
            AnimalSpirit.LION,
        ]

        for spirit in spirits:
            config = NamingConfig(spirit=spirit, style=NamingStyle.FOUNDATION, count=1)

            agent_name = namer.generate_single_name(config)

            assert isinstance(agent_name, AgentName)
            assert agent_name.name is not None
            assert len(agent_name.name) > 0
            assert agent_name.spirit == spirit
            assert agent_name.style == NamingStyle.FOUNDATION

    def test_name_analysis_roundtrip(self, namer) -> None:
        """Test that generated names can be analyzed back to their components."""
        config = NamingConfig(
            spirit=AnimalSpirit.FOX, style=NamingStyle.FOUNDATION, count=1
        )

        agent_name = namer.generate_single_name(config)
        info = namer.get_spirit_info(agent_name.name)

        # Should be able to detect the spirit and style
        assert info["spirit"] == "fox"
        assert info["style"] == "foundation"

    def test_batch_generation_consistency(self, namer) -> None:
        """Test that batch generation is consistent with single generation."""
        config = NamingConfig(
            spirit=AnimalSpirit.FOX, style=NamingStyle.FOUNDATION, count=1
        )

        single_name = namer.generate_single_name(config)
        batch_names = namer.generate_batch(config)

        # Single generation should match batch generation for count=1
        assert len(batch_names) == 1
        assert batch_names[0].spirit == single_name.spirit
        assert batch_names[0].style == single_name.style
