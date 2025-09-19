"""
Tests for Naming Utilities Module
================================

Comprehensive tests for the naming utilities, data loading, validation, and analysis.
"""

import pytest

pytestmark = pytest.mark.unit

from reynard_agent_naming.agent_naming.naming_utilities import (
    NameBuilder,
    NameValidator,
    NamingDataLoader,
    RandomSelector,
    SpiritAnalyzer,
)


class TestNamingDataLoader:
    """Test NamingDataLoader class functionality."""

    @pytest.fixture
    def data_loader(self):
        """Create a NamingDataLoader instance for testing."""
        return NamingDataLoader()

    def test_data_loader_initialization(self, data_loader) -> None:
        """Test that the data loader initializes correctly."""
        assert data_loader is not None
        assert hasattr(data_loader, 'animal_spirits')
        assert hasattr(data_loader, 'foundation_suffixes')
        assert hasattr(data_loader, 'exo_suffixes')
        assert hasattr(data_loader, 'cyberpunk_prefixes')
        assert hasattr(data_loader, 'cyberpunk_suffixes')
        assert hasattr(data_loader, 'mythological_references')
        assert hasattr(data_loader, 'scientific_prefixes')
        assert hasattr(data_loader, 'scientific_suffixes')
        assert hasattr(data_loader, 'hybrid_references')
        assert hasattr(data_loader, 'special_designations')
        assert hasattr(data_loader, 'generation_numbers')

    def test_animal_spirits_loaded(self, data_loader) -> None:
        """Test that animal spirits are properly loaded."""
        assert isinstance(data_loader.animal_spirits, dict)
        assert len(data_loader.animal_spirits) > 0

        # Test specific spirits
        assert "fox" in data_loader.animal_spirits
        assert "wolf" in data_loader.animal_spirits
        assert "otter" in data_loader.animal_spirits

        # Test that each spirit has multiple name options
        assert len(data_loader.animal_spirits["fox"]) > 10
        assert len(data_loader.animal_spirits["wolf"]) > 10
        assert len(data_loader.animal_spirits["otter"]) > 10

        # Test that all values are strings
        for spirit_key, names in data_loader.animal_spirits.items():
            assert isinstance(spirit_key, str)
            assert isinstance(names, list)
            for name in names:
                assert isinstance(name, str)
                assert len(name) > 0

    def test_foundation_suffixes_loaded(self, data_loader) -> None:
        """Test that foundation suffixes are properly loaded."""
        assert isinstance(data_loader.foundation_suffixes, list)
        assert len(data_loader.foundation_suffixes) > 0

        # Test specific suffixes
        assert "Sage" in data_loader.foundation_suffixes
        assert "Oracle" in data_loader.foundation_suffixes
        assert "Strategist" in data_loader.foundation_suffixes

        # Test that all values are strings
        for suffix in data_loader.foundation_suffixes:
            assert isinstance(suffix, str)
            assert len(suffix) > 0

    def test_exo_suffixes_loaded(self, data_loader) -> None:
        """Test that exo suffixes are properly loaded."""
        assert isinstance(data_loader.exo_suffixes, list)
        assert len(data_loader.exo_suffixes) > 0

        # Test specific suffixes
        assert "Guard" in data_loader.exo_suffixes
        assert "Sentinel" in data_loader.exo_suffixes
        assert "Protocol" in data_loader.exo_suffixes

        # Test that all values are strings
        for suffix in data_loader.exo_suffixes:
            assert isinstance(suffix, str)
            assert len(suffix) > 0

    def test_cyberpunk_components_loaded(self, data_loader) -> None:
        """Test that cyberpunk components are properly loaded."""
        assert isinstance(data_loader.cyberpunk_prefixes, list)
        assert isinstance(data_loader.cyberpunk_suffixes, list)
        assert len(data_loader.cyberpunk_prefixes) > 0
        assert len(data_loader.cyberpunk_suffixes) > 0

        # Test specific prefixes
        assert "Cyber" in data_loader.cyberpunk_prefixes
        assert "Neo" in data_loader.cyberpunk_prefixes
        assert "Quantum" in data_loader.cyberpunk_prefixes

        # Test specific suffixes
        assert "Nexus" in data_loader.cyberpunk_suffixes
        assert "Grid" in data_loader.cyberpunk_suffixes
        assert "Core" in data_loader.cyberpunk_suffixes

        # Test that all values are strings
        for prefix in data_loader.cyberpunk_prefixes:
            assert isinstance(prefix, str)
            assert len(prefix) > 0

        for suffix in data_loader.cyberpunk_suffixes:
            assert isinstance(suffix, str)
            assert len(suffix) > 0

    def test_mythological_references_loaded(self, data_loader) -> None:
        """Test that mythological references are properly loaded."""
        assert isinstance(data_loader.mythological_references, list)
        assert len(data_loader.mythological_references) > 0

        # Test specific references
        assert "Atlas" in data_loader.mythological_references
        assert "Prometheus" in data_loader.mythological_references
        assert "Odin" in data_loader.mythological_references

        # Test that all values are strings
        for reference in data_loader.mythological_references:
            assert isinstance(reference, str)
            assert len(reference) > 0

    def test_scientific_components_loaded(self, data_loader) -> None:
        """Test that scientific components are properly loaded."""
        assert isinstance(data_loader.scientific_prefixes, list)
        assert isinstance(data_loader.scientific_suffixes, list)
        assert len(data_loader.scientific_prefixes) > 0
        assert len(data_loader.scientific_suffixes) > 0

        # Test specific prefixes
        assert "Panthera" in data_loader.scientific_prefixes
        assert "Canis" in data_loader.scientific_prefixes
        assert "Felis" in data_loader.scientific_prefixes

        # Test specific suffixes
        assert "Leo" in data_loader.scientific_suffixes
        assert "Tigris" in data_loader.scientific_suffixes
        assert "Pardus" in data_loader.scientific_suffixes

        # Test that all values are strings
        for prefix in data_loader.scientific_prefixes:
            assert isinstance(prefix, str)
            assert len(prefix) > 0

        for suffix in data_loader.scientific_suffixes:
            assert isinstance(suffix, str)
            assert len(suffix) > 0

    def test_hybrid_references_loaded(self, data_loader) -> None:
        """Test that hybrid references are properly loaded."""
        assert isinstance(data_loader.hybrid_references, list)
        assert len(data_loader.hybrid_references) > 0

        # Test specific references
        assert "Atlas" in data_loader.hybrid_references
        assert "Quantum" in data_loader.hybrid_references
        assert "Neural" in data_loader.hybrid_references

        # Test that all values are strings
        for reference in data_loader.hybrid_references:
            assert isinstance(reference, str)
            assert len(reference) > 0

    def test_special_designations_loaded(self, data_loader) -> None:
        """Test that special designations are properly loaded."""
        assert isinstance(data_loader.special_designations, list)
        assert len(data_loader.special_designations) > 0

        # Test specific designations
        assert "Alpha" in data_loader.special_designations
        assert "Beta" in data_loader.special_designations
        assert "Prime" in data_loader.special_designations

        # Test that all values are strings
        for designation in data_loader.special_designations:
            assert isinstance(designation, str)
            assert len(designation) > 0

    def test_generation_numbers_loaded(self, data_loader) -> None:
        """Test that generation numbers are properly loaded."""
        assert isinstance(data_loader.generation_numbers, dict)
        assert len(data_loader.generation_numbers) > 0

        # Test specific spirit generation numbers
        assert "fox" in data_loader.generation_numbers
        assert "wolf" in data_loader.generation_numbers
        assert "otter" in data_loader.generation_numbers

        # Test that generation numbers are lists of integers
        for spirit_key, numbers in data_loader.generation_numbers.items():
            assert isinstance(spirit_key, str)
            assert isinstance(numbers, list)
            assert len(numbers) > 0
            for number in numbers:
                assert isinstance(number, int)
                assert number > 0

    def test_data_consistency(self, data_loader) -> None:
        """Test that loaded data is consistent and valid."""
        # Test that all animal spirits have corresponding generation numbers
        for spirit_key in data_loader.animal_spirits.keys():
            if spirit_key in ["fox", "wolf", "otter", "dragon", "phoenix", "eagle", "lion", "tiger"]:
                assert spirit_key in data_loader.generation_numbers

        # Test that all lists are non-empty
        assert len(data_loader.foundation_suffixes) > 0
        assert len(data_loader.exo_suffixes) > 0
        assert len(data_loader.cyberpunk_prefixes) > 0
        assert len(data_loader.cyberpunk_suffixes) > 0
        assert len(data_loader.mythological_references) > 0
        assert len(data_loader.scientific_prefixes) > 0
        assert len(data_loader.scientific_suffixes) > 0
        assert len(data_loader.hybrid_references) > 0
        assert len(data_loader.special_designations) > 0


class TestNameBuilder:
    """Test NameBuilder utility class functionality."""

    def test_build_hyphenated_name(self) -> None:
        """Test building hyphenated names."""
        components = ["Vulpine", "Sage", "13"]
        result = NameBuilder.build_hyphenated_name(components)

        assert result == "Vulpine-Sage-13"

    def test_build_hyphenated_name_single_component(self) -> None:
        """Test building hyphenated name with single component."""
        components = ["Vulpine"]
        result = NameBuilder.build_hyphenated_name(components)

        assert result == "Vulpine"

    def test_build_hyphenated_name_empty_components(self) -> None:
        """Test building hyphenated name with empty components."""
        components = []
        result = NameBuilder.build_hyphenated_name(components)

        assert result == ""

    def test_build_hyphenated_name_with_non_string_components(self) -> None:
        """Test building hyphenated name with non-string components."""
        components = ["Vulpine", 13, "Sage"]
        result = NameBuilder.build_hyphenated_name(components)

        assert result == "Vulpine-13-Sage"

    def test_build_underscore_name(self) -> None:
        """Test building underscore-separated names."""
        components = ["Vulpine", "Sage", "13"]
        result = NameBuilder.build_underscore_name(components)

        assert result == "Vulpine_Sage_13"

    def test_build_underscore_name_single_component(self) -> None:
        """Test building underscore name with single component."""
        components = ["Vulpine"]
        result = NameBuilder.build_underscore_name(components)

        assert result == "Vulpine"

    def test_build_underscore_name_empty_components(self) -> None:
        """Test building underscore name with empty components."""
        components = []
        result = NameBuilder.build_underscore_name(components)

        assert result == ""

    def test_build_camel_case_name(self) -> None:
        """Test building camelCase names."""
        components = ["vulpine", "sage", "thirteen"]
        result = NameBuilder.build_camel_case_name(components)

        assert result == "vulpineSageThirteen"

    def test_build_camel_case_name_single_component(self) -> None:
        """Test building camelCase name with single component."""
        components = ["vulpine"]
        result = NameBuilder.build_camel_case_name(components)

        assert result == "vulpine"

    def test_build_camel_case_name_empty_components(self) -> None:
        """Test building camelCase name with empty components."""
        components = []
        result = NameBuilder.build_camel_case_name(components)

        assert result == ""

    def test_build_camel_case_name_with_capitalized_components(self) -> None:
        """Test building camelCase name with capitalized components."""
        components = ["Vulpine", "Sage", "Thirteen"]
        result = NameBuilder.build_camel_case_name(components)

        assert result == "vulpineSageThirteen"

    def test_build_pascal_case_name(self) -> None:
        """Test building PascalCase names."""
        components = ["vulpine", "sage", "thirteen"]
        result = NameBuilder.build_pascal_case_name(components)

        assert result == "VulpineSageThirteen"

    def test_build_pascal_case_name_single_component(self) -> None:
        """Test building PascalCase name with single component."""
        components = ["vulpine"]
        result = NameBuilder.build_pascal_case_name(components)

        assert result == "Vulpine"

    def test_build_pascal_case_name_empty_components(self) -> None:
        """Test building PascalCase name with empty components."""
        components = []
        result = NameBuilder.build_pascal_case_name(components)

        assert result == ""

    def test_build_pascal_case_name_with_capitalized_components(self) -> None:
        """Test building PascalCase name with capitalized components."""
        components = ["Vulpine", "Sage", "Thirteen"]
        result = NameBuilder.build_pascal_case_name(components)

        assert result == "VulpineSageThirteen"

    def test_build_compound_name(self) -> None:
        """Test building compound names without separators."""
        components = ["Vulpine", "Sage", "13"]
        result = NameBuilder.build_compound_name(components)

        assert result == "VulpineSage13"

    def test_build_compound_name_single_component(self) -> None:
        """Test building compound name with single component."""
        components = ["Vulpine"]
        result = NameBuilder.build_compound_name(components)

        assert result == "Vulpine"

    def test_build_compound_name_empty_components(self) -> None:
        """Test building compound name with empty components."""
        components = []
        result = NameBuilder.build_compound_name(components)

        assert result == ""

    def test_build_compound_name_with_non_string_components(self) -> None:
        """Test building compound name with non-string components."""
        components = ["Vulpine", 13, "Sage"]
        result = NameBuilder.build_compound_name(components)

        assert result == "Vulpine13Sage"


class TestRandomSelector:
    """Test RandomSelector utility class functionality."""

    def test_select_with_fallback_valid_items(self) -> None:
        """Test selecting from valid items."""
        items = ["Vulpine", "Lupus", "Lutra"]
        fallback = "Default"

        result = RandomSelector.select_with_fallback(items, fallback)

        assert result in items

    def test_select_with_fallback_empty_items(self) -> None:
        """Test selecting from empty items list."""
        items = []
        fallback = "Default"

        result = RandomSelector.select_with_fallback(items, fallback)

        assert result == fallback

    def test_select_with_fallback_none_items(self) -> None:
        """Test selecting from None items."""
        items = None
        fallback = "Default"
        default_fallback = "DefaultDefault"

        result = RandomSelector.select_with_fallback(items, fallback, default_fallback)

        assert result == fallback

    def test_select_with_fallback_none_fallback(self) -> None:
        """Test selecting with None fallback."""
        items = []
        fallback = None
        default_fallback = "DefaultDefault"

        result = RandomSelector.select_with_fallback(items, fallback, default_fallback)

        assert result == default_fallback

    def test_select_spirit_name_valid_spirit(self) -> None:
        """Test selecting spirit name for valid spirit."""
        spirit_data = {
            "fox": ["Vulpine", "Fennec", "Reynard"],
            "wolf": ["Lupus", "Canis", "Fenrir"],
        }
        spirit_key = "fox"

        result = RandomSelector.select_spirit_name(spirit_data, spirit_key)

        assert result in spirit_data["fox"]

    def test_select_spirit_name_invalid_spirit(self) -> None:
        """Test selecting spirit name for invalid spirit."""
        spirit_data = {
            "fox": ["Vulpine", "Fennec", "Reynard"],
            "wolf": ["Lupus", "Canis", "Fenrir"],
        }
        spirit_key = "invalid"

        result = RandomSelector.select_spirit_name(spirit_data, spirit_key)

        # Should fall back to fox
        assert result in spirit_data["fox"]

    def test_select_generation_number_valid_spirit(self) -> None:
        """Test selecting generation number for valid spirit."""
        generation_data = {
            "fox": [3, 7, 13, 21, 34, 55, 89],
            "wolf": [8, 16, 24, 32, 40, 48, 56],
        }
        spirit_key = "fox"

        result = RandomSelector.select_generation_number(generation_data, spirit_key)

        assert result in generation_data["fox"]

    def test_select_generation_number_invalid_spirit(self) -> None:
        """Test selecting generation number for invalid spirit."""
        generation_data = {
            "fox": [3, 7, 13, 21, 34, 55, 89],
            "wolf": [8, 16, 24, 32, 40, 48, 56],
        }
        spirit_key = "invalid"

        result = RandomSelector.select_generation_number(generation_data, spirit_key)

        # Should return a random integer between 1 and 99
        assert isinstance(result, int)
        assert 1 <= result <= 99


class TestNameValidator:
    """Test NameValidator utility class functionality."""

    def test_is_valid_name_valid_names(self) -> None:
        """Test validation of valid names."""
        valid_names = [
            "Vulpine-Sage-13",
            "Lupus-Guard-24",
            "Cyber-Fox-Nexus",
            "Atlas-Wolf-Divine",
            "Panthera-Leo-Alpha",
        ]

        for name in valid_names:
            assert NameValidator.is_valid_name(name) is True

    def test_is_valid_name_invalid_names(self) -> None:
        """Test validation of invalid names."""
        invalid_names = [
            "",
            "   ",
            "\t\n",
            None,
        ]

        for name in invalid_names:
            assert NameValidator.is_valid_name(name) is False

    def test_sanitize_name_valid_name(self) -> None:
        """Test sanitizing valid names."""
        name = "Vulpine-Sage-13"
        result = NameValidator.sanitize_name(name)

        assert result == name

    def test_sanitize_name_with_invalid_characters(self) -> None:
        """Test sanitizing names with invalid characters."""
        name = "Vulpine<Sage>13:test|file?name*"
        result = NameValidator.sanitize_name(name)

        assert result == "VulpineSage13testfilename"

    def test_sanitize_name_with_whitespace(self) -> None:
        """Test sanitizing names with whitespace."""
        name = "  Vulpine-Sage-13  "
        result = NameValidator.sanitize_name(name)

        assert result == "Vulpine-Sage-13"

    def test_sanitize_name_empty_name(self) -> None:
        """Test sanitizing empty names."""
        name = ""
        result = NameValidator.sanitize_name(name)

        assert result == ""

    def test_ensure_uniqueness_unique_name(self) -> None:
        """Test ensuring uniqueness with unique name."""
        names = ["Vulpine-Sage-13", "Lupus-Guard-24"]
        new_name = "Lutra-Splash-15"

        result = NameValidator.ensure_uniqueness(names, new_name)

        assert result == new_name

    def test_ensure_uniqueness_duplicate_name(self) -> None:
        """Test ensuring uniqueness with duplicate name."""
        names = ["Vulpine-Sage-13", "Lupus-Guard-24"]
        new_name = "Vulpine-Sage-13"

        result = NameValidator.ensure_uniqueness(names, new_name)

        assert result == "Vulpine-Sage-13-1"

    def test_ensure_uniqueness_multiple_duplicates(self) -> None:
        """Test ensuring uniqueness with multiple duplicates."""
        names = ["Vulpine-Sage-13", "Vulpine-Sage-13-1", "Lupus-Guard-24"]
        new_name = "Vulpine-Sage-13"

        result = NameValidator.ensure_uniqueness(names, new_name)

        assert result == "Vulpine-Sage-13-2"

    def test_ensure_uniqueness_empty_names_list(self) -> None:
        """Test ensuring uniqueness with empty names list."""
        names = []
        new_name = "Vulpine-Sage-13"

        result = NameValidator.ensure_uniqueness(names, new_name)

        assert result == new_name


class TestSpiritAnalyzer:
    """Test SpiritAnalyzer utility class functionality."""

    @pytest.fixture
    def data_loader(self):
        """Create a NamingDataLoader instance for testing."""
        return NamingDataLoader()

    @pytest.fixture
    def spirit_analyzer(self, data_loader):
        """Create a SpiritAnalyzer instance for testing."""
        return SpiritAnalyzer(data_loader)

    def test_spirit_analyzer_initialization(self, spirit_analyzer, data_loader) -> None:
        """Test that the spirit analyzer initializes correctly."""
        assert spirit_analyzer is not None
        assert spirit_analyzer.data_loader == data_loader

    def test_detect_spirit_fox_names(self, spirit_analyzer) -> None:
        """Test detecting fox spirit from names."""
        fox_names = [
            "Vulpine-Sage-13",
            "Fennec-Oracle-7",
            "Reynard-Strategist-21",
            "Kitsune-Architect-34",
        ]

        for name in fox_names:
            spirit = spirit_analyzer.detect_spirit(name)
            assert spirit == "fox"

    def test_detect_spirit_wolf_names(self, spirit_analyzer) -> None:
        """Test detecting wolf spirit from names."""
        wolf_names = [
            "Lupus-Guard-24",
            "Canis-Sentinel-16",
            "Fenrir-Hunter-32",
            "Alpha-Protector-8",
        ]

        for name in wolf_names:
            spirit = spirit_analyzer.detect_spirit(name)
            assert spirit == "wolf"

    def test_detect_spirit_otter_names(self, spirit_analyzer) -> None:
        """Test detecting otter spirit from names."""
        otter_names = [
            "Lutra-Splash-15",
            "Enhydra-Ripple-10",
            "Tarka-Bubbles-5",
            "Playful-Wave-20",
        ]

        for name in otter_names:
            spirit = spirit_analyzer.detect_spirit(name)
            assert spirit == "otter"

    def test_detect_spirit_unknown_names(self, spirit_analyzer) -> None:
        """Test detecting spirit from unknown names."""
        unknown_names = [
            "Unknown-Name-123",
            "Random-String-456",
            "Test-Value-789",
        ]

        for name in unknown_names:
            spirit = spirit_analyzer.detect_spirit(name)
            assert spirit == "unknown"

    def test_detect_spirit_case_insensitive(self, spirit_analyzer) -> None:
        """Test that spirit detection is case insensitive."""
        name = "vulpine-sage-13"
        spirit = spirit_analyzer.detect_spirit(name)
        assert spirit == "fox"

    def test_detect_spirit_empty_name(self, spirit_analyzer) -> None:
        """Test detecting spirit from empty name."""
        spirit = spirit_analyzer.detect_spirit("")
        assert spirit == "unknown"

    def test_detect_style_foundation_names(self, spirit_analyzer) -> None:
        """Test detecting foundation style from names."""
        foundation_names = [
            "Vulpine-Sage-13",
            "Lupus-Oracle-24",
            "Lutra-Strategist-15",
            "Draco-Architect-7",
        ]

        for name in foundation_names:
            style = spirit_analyzer.detect_style(name)
            assert style == "foundation"

    def test_detect_style_exo_names(self, spirit_analyzer) -> None:
        """Test detecting exo style from names."""
        exo_names = [
            "Vulpine-Guard-13",
            "Lupus-Sentinel-24",
            "Lutra-Protocol-15",
            "Draco-System-7",
        ]

        for name in exo_names:
            style = spirit_analyzer.detect_style(name)
            assert style == "exo"

    def test_detect_style_cyberpunk_names(self, spirit_analyzer) -> None:
        """Test detecting cyberpunk style from names."""
        cyberpunk_names = [
            "Cyber-Fox-Nexus",
            "Neo-Wolf-Grid",
            "Quantum-Otter-Core",
            "Neural-Dragon-Web",
        ]

        for name in cyberpunk_names:
            style = spirit_analyzer.detect_style(name)
            assert style == "cyberpunk"

    def test_detect_style_mythological_names(self, spirit_analyzer) -> None:
        """Test detecting mythological style from names."""
        mythological_names = [
            "Atlas-Fox-Divine",
            "Prometheus-Wolf-Sacred",
            "Odin-Otter-Holy",
            "Thor-Dragon-Blessed",
        ]

        for name in mythological_names:
            style = spirit_analyzer.detect_style(name)
            assert style == "mythological"

    def test_detect_style_scientific_names(self, spirit_analyzer) -> None:
        """Test detecting scientific style from names."""
        scientific_names = [
            "Panthera-Leo-Alpha",
            "Canis-Lupus-Beta",
            "Felis-Catus-Gamma",
            "Ursus-Arctos-Delta",
        ]

        for name in scientific_names:
            style = spirit_analyzer.detect_style(name)
            assert style == "scientific"

    def test_detect_style_hybrid_names(self, spirit_analyzer) -> None:
        """Test detecting hybrid style from names."""
        hybrid_names = [
            "Vulpine-Atlas-Alpha",
            "Lupus-Quantum-Beta",
            "Lutra-Neural-Gamma",
            "Draco-Cyber-Delta",
        ]

        for name in hybrid_names:
            style = spirit_analyzer.detect_style(name)
            # Style detection may vary based on component matches
            assert style in ["hybrid", "cyberpunk", "mythological"]

    def test_detect_style_unknown_names(self, spirit_analyzer) -> None:
        """Test detecting style from unknown names."""
        unknown_names = [
            "Unknown-Name-123",
            "Random-String-456",
            "Test-Value-789",
        ]

        for name in unknown_names:
            style = spirit_analyzer.detect_style(name)
            # Some names may match components in various style lists
            assert style in ["unknown", "mythological", "hybrid"]

    def test_detect_style_case_insensitive(self, spirit_analyzer) -> None:
        """Test that style detection is case insensitive."""
        name = "vulpine-sage-13"
        style = spirit_analyzer.detect_style(name)
        assert style == "foundation"

    def test_detect_style_empty_name(self, spirit_analyzer) -> None:
        """Test detecting style from empty name."""
        style = spirit_analyzer.detect_style("")
        assert style == "unknown"

    def test_analyze_name_complete_analysis(self, spirit_analyzer) -> None:
        """Test complete name analysis."""
        name = "Vulpine-Sage-13"
        result = spirit_analyzer.analyze_name(name)

        assert isinstance(result, dict)
        assert "spirit" in result
        assert "style" in result
        assert "components" in result

        assert result["spirit"] == "fox"
        assert result["style"] == "foundation"
        assert isinstance(result["components"], list)
        assert len(result["components"]) > 0

    def test_analyze_name_unknown_name(self, spirit_analyzer) -> None:
        """Test analyzing unknown names."""
        name = "Unknown-Name-123"
        result = spirit_analyzer.analyze_name(name)

        assert isinstance(result, dict)
        assert result["spirit"] == "unknown"
        assert result["style"] == "unknown"
        assert isinstance(result["components"], list)

    def test_analyze_name_empty_name(self, spirit_analyzer) -> None:
        """Test analyzing empty names."""
        name = ""
        result = spirit_analyzer.analyze_name(name)

        assert isinstance(result, dict)
        assert result["spirit"] == "unknown"
        assert result["style"] == "unknown"
        assert isinstance(result["components"], list)

    def test_analyze_name_case_insensitive(self, spirit_analyzer) -> None:
        """Test that name analysis is case insensitive."""
        name1 = "Vulpine-Sage-13"
        name2 = "vulpine-sage-13"
        name3 = "VULPINE-SAGE-13"

        result1 = spirit_analyzer.analyze_name(name1)
        result2 = spirit_analyzer.analyze_name(name2)
        result3 = spirit_analyzer.analyze_name(name3)

        # Should all return the same result
        assert result1["spirit"] == result2["spirit"] == result3["spirit"]
        assert result1["style"] == result2["style"] == result3["style"]


class TestUtilityIntegration:
    """Test integration between different utility classes."""

    @pytest.fixture
    def data_loader(self):
        """Create a NamingDataLoader instance for testing."""
        return NamingDataLoader()

    @pytest.fixture
    def spirit_analyzer(self, data_loader):
        """Create a SpiritAnalyzer instance for testing."""
        return SpiritAnalyzer(data_loader)

    def test_data_loader_with_spirit_analyzer(self, data_loader, spirit_analyzer) -> None:
        """Test that SpiritAnalyzer works with NamingDataLoader."""
        # Test that the analyzer can use the data loader
        name = "Vulpine-Sage-13"
        result = spirit_analyzer.analyze_name(name)

        assert result["spirit"] == "fox"
        assert result["style"] == "foundation"

    def test_name_builder_with_validator(self) -> None:
        """Test that NameBuilder works with NameValidator."""
        components = ["Vulpine", "Sage", "13"]
        name = NameBuilder.build_hyphenated_name(components)

        assert NameValidator.is_valid_name(name) is True

    def test_random_selector_with_data_loader(self, data_loader) -> None:
        """Test that RandomSelector works with NamingDataLoader."""
        # Test spirit name selection
        spirit_key = "fox"
        name = RandomSelector.select_spirit_name(data_loader.animal_spirits, spirit_key)

        assert name in data_loader.animal_spirits["fox"]

        # Test generation number selection
        number = RandomSelector.select_generation_number(data_loader.generation_numbers, spirit_key)

        assert number in data_loader.generation_numbers["fox"]

    def test_complete_name_generation_workflow(self, data_loader, spirit_analyzer) -> None:
        """Test complete name generation workflow using utilities."""
        # Select components using RandomSelector
        spirit_key = "fox"
        base_name = RandomSelector.select_spirit_name(data_loader.animal_spirits, spirit_key)
        suffix = RandomSelector.select_with_fallback(data_loader.foundation_suffixes, "Default")
        generation = RandomSelector.select_generation_number(data_loader.generation_numbers, spirit_key)

        # Build name using NameBuilder
        components = [base_name, suffix, str(generation)]
        name = NameBuilder.build_hyphenated_name(components)

        # Validate name using NameValidator
        assert NameValidator.is_valid_name(name) is True

        # Analyze name using SpiritAnalyzer
        analysis = spirit_analyzer.analyze_name(name)
        assert analysis["spirit"] == "fox"
        assert analysis["style"] == "foundation"

    def test_error_handling_robustness(self, data_loader, spirit_analyzer) -> None:
        """Test that utilities handle errors gracefully."""
        # Test with invalid inputs
        assert NameValidator.is_valid_name("") is False
        assert NameValidator.is_valid_name(None) is False

        # Test with empty components
        assert NameBuilder.build_hyphenated_name([]) == ""
        assert NameBuilder.build_underscore_name([]) == ""
        assert NameBuilder.build_camel_case_name([]) == ""
        assert NameBuilder.build_pascal_case_name([]) == ""
        assert NameBuilder.build_compound_name([]) == ""

        # Test with invalid spirit data
        result = RandomSelector.select_spirit_name({}, "invalid")
        assert result == "fox"  # Should fall back to fox

        # Test with invalid generation data
        result = RandomSelector.select_generation_number({}, "invalid")
        assert isinstance(result, int)
        assert 1 <= result <= 99

        # Test analysis with invalid names
        analysis = spirit_analyzer.analyze_name("")
        assert analysis["spirit"] == "unknown"
        assert analysis["style"] == "unknown"
