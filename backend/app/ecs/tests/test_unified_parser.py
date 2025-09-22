"""
Tests for Unified CHANGELOG Parser

Comprehensive tests for the unified CHANGELOG parser that leverages
existing implementations and extends them for Success-Advisor-8 tracking.
"""

import sys
import tempfile
from datetime import datetime
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

sys.path.append(str(Path(__file__).parent.parent))

from legacy_tracking.unified_parser import UnifiedChangelogParser


class TestUnifiedChangelogParser:
    """Test cases for UnifiedChangelogParser."""

    @pytest.fixture
    def sample_changelog_content(self):
        """Sample CHANGELOG content for testing."""
        return """# Changelog

## [Unreleased]

### Added
- **Success-Advisor-8 Integration**: Complete legacy tracking system (Success-Advisor-8)
- **Unified Agent Manager**: Single source of truth for agent state (Success-Advisor-8)

### Changed
- **ECS Backend Integration**: Consolidated agent naming into FastAPI ECS backend (Success-Advisor-8)

## [1.0.0] - 2025-01-15

### Added
- **Initial Release**: Success-Advisor-8 legacy tracking system (Success-Advisor-8)
- **CHANGELOG Parser**: Unified parser for Success-Advisor-8 activities (Success-Advisor-8)

### Fixed
- **Bug Fix**: Resolved import issues in agent manager (Success-Advisor-8)

## [0.9.0] - 2025-01-10

### Added
- **Feature**: Basic agent state management (Success-Advisor-8)
"""

    @pytest.fixture
    def temp_changelog(self, sample_changelog_content):
        """Create temporary CHANGELOG.md for testing."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".md", delete=False) as f:
            f.write(sample_changelog_content)
            temp_path = f.name

        yield temp_path

        # Cleanup
        Path(temp_path).unlink(missing_ok=True)

    def test_parser_initialization_with_existing_parser(self, temp_changelog):
        """Test parser initialization with existing ChangelogParser available."""
        with patch(
            "legacy_tracking.unified_parser.ChangelogParser"
        ) as mock_parser_class:
            mock_parser = MagicMock()
            mock_parser_class.return_value = mock_parser

            parser = UnifiedChangelogParser(temp_changelog)

            assert parser.changelog_path == Path(temp_changelog)
            assert parser.existing_parser == mock_parser
            assert parser._existing_parser_available is True
            mock_parser_class.assert_called_once_with(temp_changelog)

    def test_parser_initialization_without_existing_parser(self, temp_changelog):
        """Test parser initialization without existing ChangelogParser."""
        with patch("legacy_tracking.unified_parser.ChangelogParser", None):
            parser = UnifiedChangelogParser(temp_changelog)

            assert parser.changelog_path == Path(temp_changelog)
            assert parser.existing_parser is None
            assert parser._existing_parser_available is False

    def test_parse_success_advisor_8_activities_with_existing_parser(
        self, temp_changelog
    ):
        """Test parsing Success-Advisor-8 activities with existing parser."""
        # Mock existing parser
        mock_contribution = MagicMock()
        mock_contribution.description = "Success-Advisor-8 feature implementation"
        mock_contribution.title = "Test Feature"
        mock_contribution.agent_name = "Success-Advisor-8"
        mock_contribution.category = "Added"

        with patch(
            "legacy_tracking.unified_parser.ChangelogParser"
        ) as mock_parser_class:
            mock_parser = MagicMock()
            mock_parser.parse_changelog.return_value = [mock_contribution]
            mock_parser_class.return_value = mock_parser

            parser = UnifiedChangelogParser(temp_changelog)
            activities = parser.parse_success_advisor_8_activities()

            assert len(activities) == 1
            assert (
                activities[0].description == "Success-Advisor-8 feature implementation"
            )
            assert activities[0].activity_type == "feature"
            assert "Success-Advisor-8" in activities[0].context["agent_name"]

    def test_parse_success_advisor_8_activities_fallback(self, temp_changelog):
        """Test parsing Success-Advisor-8 activities with fallback implementation."""
        with patch("legacy_tracking.unified_parser.ChangelogParser", None):
            parser = UnifiedChangelogParser(temp_changelog)
            activities = parser.parse_success_advisor_8_activities()

            # Should find Success-Advisor-8 references in the sample content
            assert len(activities) > 0
            assert all(
                "Success-Advisor-8" in activity.description for activity in activities
            )

    def test_parse_success_advisor_8_activities_no_changelog(self):
        """Test parsing when CHANGELOG doesn't exist."""
        parser = UnifiedChangelogParser("nonexistent_changelog.md")
        activities = parser.parse_success_advisor_8_activities()

        assert len(activities) == 0

    def test_classify_activity_type(self, temp_changelog):
        """Test activity type classification."""
        parser = UnifiedChangelogParser(temp_changelog)

        # Test different activity types
        assert parser._classify_activity_type("Release version 1.0.0") == "release"
        assert (
            parser._classify_activity_type("Quality assurance improvements") == "other"
        )
        assert (
            parser._classify_activity_type("Documentation updates") == "documentation"
        )
        assert parser._classify_activity_type("Code implementation") == "feature"
        assert parser._classify_activity_type("Bug fix for issue #123") == "fix"
        assert parser._classify_activity_type("General activity") == "other"

    def test_analyze_activity_trends(self, temp_changelog):
        """Test activity trends analysis."""
        parser = UnifiedChangelogParser(temp_changelog)
        activities = parser.parse_success_advisor_8_activities()

        trends = parser.analyze_activity_trends()

        assert "activity_types" in trends
        assert "versions" in trends
        assert "time_range" in trends
        assert "total_activities" in trends
        assert trends["total_activities"] == len(activities)

    def test_generate_activity_summary(self, temp_changelog):
        """Test activity summary generation."""
        parser = UnifiedChangelogParser(temp_changelog)
        summary = parser.generate_activity_summary()

        assert isinstance(summary, str)
        assert "Success-Advisor-8 Activity Summary" in summary
        assert "Total Activities:" in summary
        assert "Activity Types:" in summary

    def test_get_parser_info(self, temp_changelog):
        """Test parser info retrieval."""
        parser = UnifiedChangelogParser(temp_changelog)
        info = parser.get_parser_info()

        assert info["parser_type"] == "unified"
        assert "existing_parser_available" in info
        assert info["changelog_path"] == temp_changelog
        assert info["changelog_exists"] is True
        assert "success_advisor_pattern" in info

    def test_get_changelog_stats(self, temp_changelog):
        """Test changelog statistics retrieval."""
        parser = UnifiedChangelogParser(temp_changelog)
        stats = parser.get_changelog_stats()

        assert "total_lines" in stats
        assert "total_characters" in stats
        assert "success_advisor_references" in stats
        assert "file_size_bytes" in stats
        assert "last_modified" in stats
        assert stats["success_advisor_references"] > 0

    def test_get_changelog_stats_no_file(self):
        """Test changelog statistics when file doesn't exist."""
        parser = UnifiedChangelogParser("nonexistent_changelog.md")
        stats = parser.get_changelog_stats()

        assert "error" in stats
        assert "not found" in stats["error"]

    def test_validate_changelog_format(self, temp_changelog):
        """Test changelog format validation."""
        parser = UnifiedChangelogParser(temp_changelog)
        validation = parser.validate_changelog_format()

        assert "valid" in validation
        assert "warnings" in validation
        assert "errors" in validation
        assert "sections" in validation
        assert "version_headers" in validation
        assert len(validation["version_headers"]) > 0
        assert len(validation["sections"]) > 0

    def test_validate_changelog_format_no_file(self):
        """Test changelog validation when file doesn't exist."""
        parser = UnifiedChangelogParser("nonexistent_changelog.md")
        validation = parser.validate_changelog_format()

        assert validation["valid"] is False
        assert "error" in validation
        assert "not found" in validation["error"]

    def test_convert_to_success_advisor_activity(self, temp_changelog):
        """Test conversion of AgentContribution to SuccessAdvisor8Activity."""
        # Mock AgentContribution
        mock_contribution = MagicMock()
        mock_contribution.description = "Success-Advisor-8 feature implementation"
        mock_contribution.title = "Test Title"
        mock_contribution.agent_name = "Success-Advisor-8"
        mock_contribution.category = "Added"

        parser = UnifiedChangelogParser(temp_changelog)
        activity = parser._convert_to_success_advisor_activity(mock_contribution)

        assert activity.description == "Success-Advisor-8 feature implementation"
        assert activity.activity_type == "feature"  # Based on classification
        assert activity.context["agent_name"] == "Success-Advisor-8"
        assert activity.context["title"] == "Test Title"
        assert activity.context["category"] == "Added"
        assert activity.context["source"] == "unified_changelog_parser"

    def test_success_advisor_pattern_matching(self, temp_changelog):
        """Test Success-Advisor-8 pattern matching."""
        parser = UnifiedChangelogParser(temp_changelog)

        # Test various patterns
        assert parser.success_advisor_pattern.search("Success-Advisor-8")
        assert parser.success_advisor_pattern.search("SUCCESS-ADVISOR-8")
        assert parser.success_advisor_pattern.search("success-advisor-8")
        assert parser.success_advisor_pattern.search("Success-Advisor-8 integration")
        assert not parser.success_advisor_pattern.search("Other agent activity")

    def test_error_handling_in_parsing(self, temp_changelog):
        """Test error handling in parsing operations."""
        with patch(
            "legacy_tracking.unified_parser.ChangelogParser"
        ) as mock_parser_class:
            mock_parser = MagicMock()
            mock_parser.parse_changelog.side_effect = Exception("Test error")
            mock_parser_class.return_value = mock_parser

            parser = UnifiedChangelogParser(temp_changelog)
            activities = parser.parse_success_advisor_8_activities()

            # Should fall back to basic parsing
            assert isinstance(activities, list)

    def test_parser_with_malformed_changelog(self):
        """Test parser with malformed CHANGELOG content."""
        malformed_content = """# Changelog

## [Unreleased]

### Added
- Success-Advisor-8 test activity
- Another activity without proper formatting

## [1.0.0] - Invalid Date Format

### Added
- Success-Advisor-8 feature
"""

        with tempfile.NamedTemporaryFile(mode="w", suffix=".md", delete=False) as f:
            f.write(malformed_content)
            temp_path = f.name

        try:
            # Force fallback parser by mocking ChangelogParser as None
            with patch("legacy_tracking.unified_parser.ChangelogParser", None):
                parser = UnifiedChangelogParser(temp_path)
                activities = parser.parse_success_advisor_8_activities()
                validation = parser.validate_changelog_format()

                # Should still parse activities
                assert len(activities) > 0

                # Should detect validation issues
                assert len(validation["warnings"]) > 0

        finally:
            Path(temp_path).unlink(missing_ok=True)


class TestParserIntegration:
    """Integration tests for the unified parser."""

    def test_full_workflow_integration(self):
        """Test complete workflow integration."""
        # This would be an integration test with real CHANGELOG
        # For now, we'll skip it as it requires real file setup
        pytest.skip("Integration test requires real CHANGELOG setup")

    def test_performance_with_large_changelog(self):
        """Test performance with large CHANGELOG files."""
        # This would test performance characteristics
        # For now, we'll skip it as it requires large file generation
        pytest.skip("Performance test requires large CHANGELOG generation")


if __name__ == "__main__":
    pytest.main([__file__])
