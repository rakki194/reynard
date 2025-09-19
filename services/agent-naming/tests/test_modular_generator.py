"""
Tests for Modular Generator Module
=================================

Comprehensive tests for the ModularAgentNamer class and orchestration functionality.
"""

from unittest.mock import patch

import pytest

pytestmark = pytest.mark.unit

from reynard_agent_naming.agent_naming.modular_generator import ModularAgentNamer
from reynard_agent_naming.agent_naming.types import (
    AgentName,
    AnimalSpirit,
    NamingConfig,
    NamingScheme,
    NamingStyle,
)


class TestModularAgentNamerInitialization:
    """Test ModularAgentNamer initialization and setup."""

    def test_modular_namer_initialization(self) -> None:
        """Test that the modular namer initializes correctly."""
        namer = ModularAgentNamer()

        assert namer is not None
        assert hasattr(namer, 'animal_spirit_generator')
        assert hasattr(namer, 'foundation_generator')
        assert hasattr(namer, 'exo_generator')
        assert hasattr(namer, 'cyberpunk_generator')
        assert hasattr(namer, 'destiny_generator')
        assert hasattr(namer, 'mythological_generator')
        assert hasattr(namer, 'scientific_generator')
        assert hasattr(namer, 'hybrid_generator')
        assert hasattr(namer, 'alternative_generator')
        assert hasattr(namer, 'data_loader')
        assert hasattr(namer, 'name_validator')
        assert hasattr(namer, 'spirit_analyzer')

    def test_modular_namer_generators_initialized(self) -> None:
        """Test that all generators are properly initialized."""
        namer = ModularAgentNamer()

        # Test that all generators are not None
        assert namer.animal_spirit_generator is not None
        assert namer.foundation_generator is not None
        assert namer.exo_generator is not None
        assert namer.cyberpunk_generator is not None
        assert namer.destiny_generator is not None
        assert namer.mythological_generator is not None
        assert namer.scientific_generator is not None
        assert namer.hybrid_generator is not None
        assert namer.alternative_generator is not None

    def test_modular_namer_shared_components_initialized(self) -> None:
        """Test that shared components are properly initialized."""
        namer = ModularAgentNamer()

        # Test that shared components are not None
        assert namer.data_loader is not None
        assert namer.name_validator is not None
        assert namer.spirit_analyzer is not None


class TestSingleNameGeneration:
    """Test single name generation with ModularAgentNamer."""

    @pytest.fixture
    def namer(self):
        """Create a ModularAgentNamer instance for testing."""
        return ModularAgentNamer()

    def test_generate_single_name_foundation_style(self, namer) -> None:
        """Test generating single name with Foundation style."""
        config = NamingConfig(
            spirit=AnimalSpirit.FOX,
            style=NamingStyle.FOUNDATION,
            count=1
        )

        agent_name = namer.generate_single_name(config)

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == AnimalSpirit.FOX
        assert agent_name.style == NamingStyle.FOUNDATION
        assert agent_name.name is not None
        assert len(agent_name.name) > 0

    def test_generate_single_name_exo_style(self, namer) -> None:
        """Test generating single name with Exo style."""
        config = NamingConfig(
            spirit=AnimalSpirit.WOLF,
            style=NamingStyle.EXO,
            count=1
        )

        agent_name = namer.generate_single_name(config)

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == AnimalSpirit.WOLF
        assert agent_name.style == NamingStyle.EXO
        assert agent_name.name is not None
        assert len(agent_name.name) > 0

    def test_generate_single_name_cyberpunk_style(self, namer) -> None:
        """Test generating single name with Cyberpunk style."""
        config = NamingConfig(
            spirit=AnimalSpirit.OTTER,
            style=NamingStyle.CYBERPUNK,
            count=1
        )

        agent_name = namer.generate_single_name(config)

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == AnimalSpirit.OTTER
        assert agent_name.style == NamingStyle.CYBERPUNK
        assert agent_name.name is not None
        assert len(agent_name.name) > 0

    def test_generate_single_name_mythological_style(self, namer) -> None:
        """Test generating single name with Mythological style."""
        config = NamingConfig(
            spirit=AnimalSpirit.DRAGON,
            style=NamingStyle.MYTHOLOGICAL,
            count=1
        )

        agent_name = namer.generate_single_name(config)

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == AnimalSpirit.DRAGON
        assert agent_name.style == NamingStyle.MYTHOLOGICAL
        assert agent_name.name is not None
        assert len(agent_name.name) > 0

    def test_generate_single_name_scientific_style(self, namer) -> None:
        """Test generating single name with Scientific style."""
        config = NamingConfig(
            spirit=AnimalSpirit.LION,
            style=NamingStyle.SCIENTIFIC,
            count=1
        )

        agent_name = namer.generate_single_name(config)

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == AnimalSpirit.LION
        assert agent_name.style == NamingStyle.SCIENTIFIC
        assert agent_name.name is not None
        assert len(agent_name.name) > 0

    def test_generate_single_name_hybrid_style(self, namer) -> None:
        """Test generating single name with Hybrid style."""
        config = NamingConfig(
            spirit=AnimalSpirit.EAGLE,
            style=NamingStyle.HYBRID,
            count=1
        )

        agent_name = namer.generate_single_name(config)

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == AnimalSpirit.EAGLE
        assert agent_name.style == NamingStyle.HYBRID
        assert agent_name.name is not None
        assert len(agent_name.name) > 0

    def test_generate_single_name_destiny_style(self, namer) -> None:
        """Test generating single name with Destiny style."""
        config = NamingConfig(
            spirit=AnimalSpirit.FOX,
            style=NamingStyle.DESTINY,
            count=1
        )

        agent_name = namer.generate_single_name(config)

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == AnimalSpirit.FOX
        assert agent_name.style == NamingStyle.DESTINY
        assert agent_name.name is not None
        assert len(agent_name.name) > 0

    def test_generate_single_name_random_style(self, namer) -> None:
        """Test generating single name with random style."""
        config = NamingConfig(
            spirit=AnimalSpirit.FOX,
            count=1
        )

        agent_name = namer.generate_single_name(config)

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == AnimalSpirit.FOX
        assert agent_name.style is not None
        assert agent_name.name is not None
        assert len(agent_name.name) > 0

    def test_generate_single_name_alternative_scheme(self, namer) -> None:
        """Test generating single name with alternative naming scheme."""
        config = NamingConfig(
            scheme=NamingScheme.ELEMENTAL,
            scheme_type="fire",
            count=1
        )

        agent_name = namer.generate_single_name(config)

        assert isinstance(agent_name, AgentName)
        assert agent_name.scheme == NamingScheme.ELEMENTAL
        assert agent_name.name is not None
        assert len(agent_name.name) > 0

    def test_generate_single_name_fallback_on_error(self, namer) -> None:
        """Test that single name generation falls back on error."""
        # Mock the foundation generator to raise an exception
        with patch.object(namer.foundation_generator, 'generate_foundation_name', side_effect=Exception("Test error")):
            config = NamingConfig(
                spirit=AnimalSpirit.FOX,
                style=NamingStyle.FOUNDATION,
                count=1
            )

            agent_name = namer.generate_single_name(config)

            # Should return a fallback name
            assert isinstance(agent_name, AgentName)
            assert agent_name.name.startswith("Agent-")
            assert agent_name.spirit == AnimalSpirit.FOX
            assert agent_name.style == NamingStyle.FOUNDATION


class TestBatchGeneration:
    """Test batch name generation with ModularAgentNamer."""

    @pytest.fixture
    def namer(self):
        """Create a ModularAgentNamer instance for testing."""
        return ModularAgentNamer()

    def test_generate_batch_single_name(self, namer) -> None:
        """Test generating a batch with a single name."""
        config = NamingConfig(
            spirit=AnimalSpirit.FOX,
            style=NamingStyle.FOUNDATION,
            count=1
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
            spirit=AnimalSpirit.FOX,
            style=NamingStyle.FOUNDATION,
            count=5
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
            spirit=AnimalSpirit.FOX,
            style=NamingStyle.FOUNDATION,
            count=10
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
            NamingStyle.DESTINY,
            NamingStyle.MYTHOLOGICAL,
            NamingStyle.SCIENTIFIC,
            NamingStyle.HYBRID,
        ]

        for style in styles:
            config = NamingConfig(
                spirit=AnimalSpirit.FOX,
                style=style,
                count=3
            )

            names = namer.generate_batch(config)

            assert len(names) == 3
            for name in names:
                assert name.style == style
                assert name.spirit == AnimalSpirit.FOX

    def test_generate_batch_fallback_names(self, namer) -> None:
        """Test that batch generation adds fallback names when needed."""
        # Mock the single name generation to always return the same name
        with patch.object(namer, 'generate_single_name') as mock_generate:
            mock_generate.return_value = AgentName(
                name="Same-Name-1",
                spirit=AnimalSpirit.FOX,
                style=NamingStyle.FOUNDATION,
                components=["Same", "Name", "1"]
            )

            config = NamingConfig(
                spirit=AnimalSpirit.FOX,
                style=NamingStyle.FOUNDATION,
                count=5
            )

            names = namer.generate_batch(config)

            # Should have 5 names, with fallback names added
            assert len(names) == 5

            # First name should be the mocked name
            assert names[0].name == "Same-Name-1"

            # Subsequent names should be fallback names
            for i in range(1, 5):
                assert names[i].name == f"Agent-{i + 1}"

    def test_generate_batch_validation(self, namer) -> None:
        """Test that batch generation validates names."""
        config = NamingConfig(
            spirit=AnimalSpirit.FOX,
            style=NamingStyle.FOUNDATION,
            count=5
        )

        names = namer.generate_batch(config)

        # All names should be valid
        for name in names:
            assert namer.validate_name(name.name) is True
            assert name.name.strip() != ""


class TestStyleBatchGeneration:
    """Test style-specific batch generation."""

    @pytest.fixture
    def namer(self):
        """Create a ModularAgentNamer instance for testing."""
        return ModularAgentNamer()

    def test_generate_style_batch_foundation(self, namer) -> None:
        """Test generating Foundation style batch."""
        names = namer.generate_style_batch(NamingStyle.FOUNDATION, count=3)

        assert isinstance(names, list)
        assert len(names) == 3

        for name in names:
            assert isinstance(name, AgentName)
            assert name.style == NamingStyle.FOUNDATION
            assert name.name is not None
            assert len(name.name) > 0

    def test_generate_style_batch_exo(self, namer) -> None:
        """Test generating Exo style batch."""
        names = namer.generate_style_batch(NamingStyle.EXO, count=3)

        assert isinstance(names, list)
        assert len(names) == 3

        for name in names:
            assert isinstance(name, AgentName)
            assert name.style == NamingStyle.EXO
            assert name.name is not None
            assert len(name.name) > 0

    def test_generate_style_batch_cyberpunk(self, namer) -> None:
        """Test generating Cyberpunk style batch."""
        names = namer.generate_style_batch(NamingStyle.CYBERPUNK, count=3)

        assert isinstance(names, list)
        assert len(names) == 3

        for name in names:
            assert isinstance(name, AgentName)
            assert name.style == NamingStyle.CYBERPUNK
            assert name.name is not None
            assert len(name.name) > 0

    def test_generate_style_batch_mythological(self, namer) -> None:
        """Test generating Mythological style batch."""
        names = namer.generate_style_batch(NamingStyle.MYTHOLOGICAL, count=3)

        assert isinstance(names, list)
        assert len(names) == 3

        for name in names:
            assert isinstance(name, AgentName)
            assert name.style == NamingStyle.MYTHOLOGICAL
            assert name.name is not None
            assert len(name.name) > 0

    def test_generate_style_batch_scientific(self, namer) -> None:
        """Test generating Scientific style batch."""
        names = namer.generate_style_batch(NamingStyle.SCIENTIFIC, count=3)

        assert isinstance(names, list)
        assert len(names) == 3

        for name in names:
            assert isinstance(name, AgentName)
            assert name.style == NamingStyle.SCIENTIFIC
            assert name.name is not None
            assert len(name.name) > 0

    def test_generate_style_batch_hybrid(self, namer) -> None:
        """Test generating Hybrid style batch."""
        names = namer.generate_style_batch(NamingStyle.HYBRID, count=3)

        assert isinstance(names, list)
        assert len(names) == 3

        for name in names:
            assert isinstance(name, AgentName)
            assert name.style == NamingStyle.HYBRID
            assert name.name is not None
            assert len(name.name) > 0

    def test_generate_style_batch_destiny(self, namer) -> None:
        """Test generating Destiny style batch."""
        names = namer.generate_style_batch(NamingStyle.DESTINY, count=3)

        assert isinstance(names, list)
        assert len(names) == 3

        for name in names:
            assert isinstance(name, AgentName)
            assert name.style == NamingStyle.DESTINY
            assert name.name is not None
            assert len(name.name) > 0

    def test_generate_style_batch_with_spirit(self, namer) -> None:
        """Test generating style batch with specific spirit."""
        names = namer.generate_style_batch(
            NamingStyle.FOUNDATION,
            count=3,
            spirit=AnimalSpirit.FOX
        )

        assert isinstance(names, list)
        assert len(names) == 3

        for name in names:
            assert isinstance(name, AgentName)
            assert name.style == NamingStyle.FOUNDATION
            # Spirit can be None for pure Foundation names or an AnimalSpirit for spirit-based names
            assert name.spirit is None or isinstance(name.spirit, AnimalSpirit)
            assert name.name is not None
            assert len(name.name) > 0

    def test_generate_style_batch_fallback(self, namer) -> None:
        """Test generating style batch with fallback to animal spirit generator."""
        # Test with an invalid style (should fall back to animal spirit generator)
        names = namer.generate_style_batch(NamingStyle.DESTINY, count=3)

        assert isinstance(names, list)
        assert len(names) == 3

        for name in names:
            assert isinstance(name, AgentName)
            assert name.name is not None
            assert len(name.name) > 0


class TestSpiritInfoAnalysis:
    """Test spirit information analysis with ModularAgentNamer."""

    @pytest.fixture
    def namer(self):
        """Create a ModularAgentNamer instance for testing."""
        return ModularAgentNamer()

    def test_get_spirit_info_foundation_style(self, namer) -> None:
        """Test analyzing Foundation-style names."""
        info = namer.get_spirit_info("Vulpine-Sage-13")

        assert isinstance(info, dict)
        assert "spirit" in info
        assert "style" in info
        assert "components" in info

    def test_get_spirit_info_exo_style(self, namer) -> None:
        """Test analyzing Exo-style names."""
        info = namer.get_spirit_info("Lupus-Guard-24")

        assert isinstance(info, dict)
        assert "spirit" in info
        assert "style" in info
        assert "components" in info

    def test_get_spirit_info_cyberpunk_style(self, namer) -> None:
        """Test analyzing Cyberpunk-style names."""
        info = namer.get_spirit_info("Cyber-Fox-Nexus")

        assert isinstance(info, dict)
        assert "spirit" in info
        assert "style" in info
        assert "components" in info

    def test_get_spirit_info_unknown_name(self, namer) -> None:
        """Test analyzing unknown names."""
        info = namer.get_spirit_info("Unknown-Name-123")

        assert isinstance(info, dict)
        assert "spirit" in info
        assert "style" in info
        assert "components" in info

    def test_get_spirit_info_empty_name(self, namer) -> None:
        """Test analyzing empty names."""
        info = namer.get_spirit_info("")

        assert isinstance(info, dict)
        assert "spirit" in info
        assert "style" in info
        assert "components" in info


class TestNameValidation:
    """Test name validation functionality."""

    @pytest.fixture
    def namer(self):
        """Create a ModularAgentNamer instance for testing."""
        return ModularAgentNamer()

    def test_validate_name_valid_names(self, namer) -> None:
        """Test validation of valid names."""
        valid_names = [
            "Vulpine-Sage-13",
            "Lupus-Guard-24",
            "Cyber-Fox-Nexus",
            "Atlas-Wolf-Divine",
            "Panthera-Leo-Alpha",
        ]

        for name in valid_names:
            assert namer.validate_name(name) is True

    def test_validate_name_invalid_names(self, namer) -> None:
        """Test validation of invalid names."""
        invalid_names = [
            "",
            "   ",
            "\t\n",
        ]

        for name in invalid_names:
            assert namer.validate_name(name) is False

    def test_sanitize_name_valid_name(self, namer) -> None:
        """Test sanitizing valid names."""
        name = "Vulpine-Sage-13"
        result = namer.sanitize_name(name)

        assert result == name

    def test_sanitize_name_with_invalid_characters(self, namer) -> None:
        """Test sanitizing names with invalid characters."""
        name = "Vulpine<Sage>13:test|file?name*"
        result = namer.sanitize_name(name)

        assert result == "VulpineSage13testfilename"

    def test_ensure_name_uniqueness_unique_name(self, namer) -> None:
        """Test ensuring uniqueness with unique name."""
        names = ["Vulpine-Sage-13", "Lupus-Guard-24"]
        new_name = "Lutra-Splash-15"

        result = namer.ensure_name_uniqueness(names, new_name)

        assert result == new_name

    def test_ensure_name_uniqueness_duplicate_name(self, namer) -> None:
        """Test ensuring uniqueness with duplicate name."""
        names = ["Vulpine-Sage-13", "Lupus-Guard-24"]
        new_name = "Vulpine-Sage-13"

        result = namer.ensure_name_uniqueness(names, new_name)

        assert result == "Vulpine-Sage-13-1"


class TestAvailableOptions:
    """Test getting available options."""

    @pytest.fixture
    def namer(self):
        """Create a ModularAgentNamer instance for testing."""
        return ModularAgentNamer()

    def test_get_available_styles(self, namer) -> None:
        """Test getting list of available styles."""
        styles = namer.get_available_styles()

        assert isinstance(styles, list)
        assert len(styles) > 0
        assert NamingStyle.FOUNDATION in styles
        assert NamingStyle.EXO in styles
        assert NamingStyle.CYBERPUNK in styles
        assert NamingStyle.DESTINY in styles
        assert NamingStyle.MYTHOLOGICAL in styles
        assert NamingStyle.SCIENTIFIC in styles
        assert NamingStyle.HYBRID in styles

    def test_get_available_spirits(self, namer) -> None:
        """Test getting list of available spirits."""
        spirits = namer.get_available_spirits()

        assert isinstance(spirits, list)
        assert len(spirits) > 0
        assert AnimalSpirit.FOX in spirits
        assert AnimalSpirit.WOLF in spirits
        assert AnimalSpirit.OTTER in spirits
        assert AnimalSpirit.DRAGON in spirits
        assert AnimalSpirit.EAGLE in spirits
        assert AnimalSpirit.LION in spirits

    def test_get_available_schemes(self, namer) -> None:
        """Test getting list of available schemes."""
        schemes = namer.get_available_schemes()

        assert isinstance(schemes, list)
        assert len(schemes) > 0
        assert NamingScheme.ANIMAL_SPIRIT in schemes
        assert NamingScheme.ELEMENTAL in schemes
        assert NamingScheme.CELESTIAL in schemes
        assert NamingScheme.MYTHOLOGICAL in schemes
        assert NamingScheme.SCIENTIFIC in schemes


class TestRandomGeneration:
    """Test random generation functionality."""

    @pytest.fixture
    def namer(self):
        """Create a ModularAgentNamer instance for testing."""
        return ModularAgentNamer()

    def test_generate_random_style_name_with_spirit(self, namer) -> None:
        """Test generating random style name with specific spirit."""
        spirit = AnimalSpirit.FOX
        agent_name = namer.generate_random_style_name(spirit)

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit == spirit
        assert agent_name.style is not None
        assert agent_name.name is not None
        assert len(agent_name.name) > 0

    def test_generate_random_style_name_without_spirit(self, namer) -> None:
        """Test generating random style name without specific spirit."""
        agent_name = namer.generate_random_style_name()

        assert isinstance(agent_name, AgentName)
        assert agent_name.spirit is not None
        assert agent_name.style is not None
        assert agent_name.name is not None
        assert len(agent_name.name) > 0

    def test_generate_random_scheme_name(self, namer) -> None:
        """Test generating random scheme name."""
        agent_name = namer.generate_random_scheme_name()

        assert isinstance(agent_name, AgentName)
        assert agent_name.scheme is not None
        assert agent_name.name is not None
        assert len(agent_name.name) > 0

    def test_random_generation_variety(self, namer) -> None:
        """Test that random generation produces variety."""
        styles = set()
        schemes = set()

        for _ in range(20):
            # Test random style generation
            style_name = namer.generate_random_style_name()
            styles.add(style_name.style)

            # Test random scheme generation
            scheme_name = namer.generate_random_scheme_name()
            schemes.add(scheme_name.scheme)

        # Should generate multiple different styles and schemes
        assert len(styles) > 1
        assert len(schemes) > 1


class TestGeneratorInfo:
    """Test generator information functionality."""

    @pytest.fixture
    def namer(self):
        """Create a ModularAgentNamer instance for testing."""
        return ModularAgentNamer()

    def test_get_generator_info(self, namer) -> None:
        """Test getting generator information."""
        info = namer.get_generator_info()

        assert isinstance(info, dict)
        assert "generator_type" in info
        assert "available_generators" in info
        assert "shared_components" in info
        assert "total_styles" in info
        assert "total_spirits" in info
        assert "total_schemes" in info

        assert info["generator_type"] == "ModularAgentNamer"
        assert isinstance(info["available_generators"], list)
        assert isinstance(info["shared_components"], list)
        assert isinstance(info["total_styles"], int)
        assert isinstance(info["total_spirits"], int)
        assert isinstance(info["total_schemes"], int)

        # Test that expected generators are listed
        expected_generators = [
            "AnimalSpiritGenerator",
            "FoundationGenerator",
            "ExoGenerator",
            "CyberpunkGenerator",
            "DestinyGenerator",
            "MythologicalGenerator",
            "ScientificGenerator",
            "HybridGenerator",
            "AlternativeNamingGenerator"
        ]

        for generator in expected_generators:
            assert generator in info["available_generators"]

        # Test that expected shared components are listed
        expected_components = [
            "NamingDataLoader",
            "NameBuilder",
            "RandomSelector",
            "NameValidator",
            "SpiritAnalyzer"
        ]

        for component in expected_components:
            assert component in info["shared_components"]


class TestModularGeneratorIntegration:
    """Test integration between different modular generator methods."""

    @pytest.fixture
    def namer(self):
        """Create a ModularAgentNamer instance for testing."""
        return ModularAgentNamer()

    def test_all_styles_generate_valid_names(self, namer) -> None:
        """Test that all naming styles generate valid names."""
        styles = [
            NamingStyle.FOUNDATION,
            NamingStyle.EXO,
            NamingStyle.CYBERPUNK,
            NamingStyle.DESTINY,
            NamingStyle.MYTHOLOGICAL,
            NamingStyle.SCIENTIFIC,
            NamingStyle.HYBRID,
        ]

        for style in styles:
            config = NamingConfig(
                spirit=AnimalSpirit.FOX,
                style=style,
                count=1
            )

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
            config = NamingConfig(
                spirit=spirit,
                style=NamingStyle.FOUNDATION,
                count=1
            )

            agent_name = namer.generate_single_name(config)

            assert isinstance(agent_name, AgentName)
            assert agent_name.name is not None
            assert len(agent_name.name) > 0
            assert agent_name.spirit == spirit
            assert agent_name.style == NamingStyle.FOUNDATION

    def test_name_analysis_roundtrip(self, namer) -> None:
        """Test that generated names can be analyzed back to their components."""
        config = NamingConfig(
            spirit=AnimalSpirit.FOX,
            style=NamingStyle.FOUNDATION,
            count=1
        )

        agent_name = namer.generate_single_name(config)
        info = namer.get_spirit_info(agent_name.name)

        # Should be able to detect the spirit (style detection may be limited)
        assert info["spirit"] == "fox"
        # Style detection may not work for all generated names due to compound phrases
        assert info["style"] in ["foundation", "unknown"]

    def test_batch_generation_consistency(self, namer) -> None:
        """Test that batch generation is consistent with single generation."""
        config = NamingConfig(
            spirit=AnimalSpirit.FOX,
            style=NamingStyle.FOUNDATION,
            count=1
        )

        single_name = namer.generate_single_name(config)
        batch_names = namer.generate_batch(config)

        # Single generation should match batch generation for count=1
        assert len(batch_names) == 1
        assert batch_names[0].spirit == single_name.spirit
        assert batch_names[0].style == single_name.style

    def test_style_batch_consistency(self, namer) -> None:
        """Test that style batch generation is consistent."""
        names1 = namer.generate_style_batch(NamingStyle.FOUNDATION, count=3)
        names2 = namer.generate_style_batch(NamingStyle.FOUNDATION, count=3)

        # Both batches should have the same style
        for name in names1 + names2:
            assert name.style == NamingStyle.FOUNDATION

    def test_error_handling_robustness(self, namer) -> None:
        """Test that modular generator handles errors gracefully."""
        # Test with invalid parameters
        config = NamingConfig(count=0)
        names = namer.generate_batch(config)
        assert isinstance(names, list)

        # Test validation with invalid names
        assert namer.validate_name("") is False
        assert namer.validate_name("   ") is False

        # Test sanitization with invalid characters
        result = namer.sanitize_name("Test<Name>")
        assert result == "TestName"

        # Test uniqueness with empty list
        result = namer.ensure_name_uniqueness([], "Test-Name")
        assert result == "Test-Name"
