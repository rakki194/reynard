"""Test CHANGELOG parsing and deduplication for Success-Advisor-8 legacy tracking."""

# Add the parent directory to sys.path for imports
import sys
import tempfile
from pathlib import Path

import pytest

sys.path.append(str(Path(__file__).parent.parent))

from legacy_tracking.success_advisor_8_tracker import SuccessAdvisor8LegacyTracker
from legacy_tracking.unified_parser import UnifiedChangelogParser


class TestChangelogParsing:
    """Test CHANGELOG parsing and deduplication functionality."""

    def test_parse_real_changelog(self):
        """Test parsing the actual CHANGELOG.md file."""
        # Use the real CHANGELOG.md file
        changelog_path = (
            Path(__file__).parent.parent.parent.parent.parent / "CHANGELOG.md"
        )

        if not changelog_path.exists():
            pytest.skip("CHANGELOG.md not found")

        parser = UnifiedChangelogParser(str(changelog_path))
        activities = parser.parse_success_advisor_8_activities()

        # Should find some Success-Advisor-8 activities
        assert (
            len(activities) > 0
        ), "Should find Success-Advisor-8 activities in CHANGELOG"

        # Check that all activities contain Success-Advisor-8 references
        for activity in activities:
            assert (
                "Success-Advisor-8" in activity.description
                or "SUCCESS-ADVISOR-8" in activity.description
            )
            assert activity.activity_id is not None
            assert activity.activity_type is not None
            assert activity.timestamp is not None

    def test_deduplication_logic(self):
        """Test that duplicate entries are properly handled."""
        # Create a test CHANGELOG with potential duplicates
        test_changelog = """
# Changelog

## [Unreleased]

- **Success-Advisor-8 Integration**: Added comprehensive Success-Advisor-8 tracking system (Success-Advisor-8)
- **Success-Advisor-8 Legacy**: Implemented legacy tracking for Success-Advisor-8 activities (Success-Advisor-8)

## [1.0.0] - 2025-01-01

- **Success-Advisor-8 Migration**: Migrated Success-Advisor-8 to new ECS system (Success-Advisor-8)
- **Success-Advisor-8 Integration**: Added comprehensive Success-Advisor-8 tracking system (Success-Advisor-8)
"""

        with tempfile.NamedTemporaryFile(mode="w", suffix=".md", delete=False) as f:
            f.write(test_changelog)
            temp_path = f.name

        try:
            parser = UnifiedChangelogParser(temp_path)
            activities = parser.parse_success_advisor_8_activities()

            # Should find all activities (deduplication happens at a higher level)
            assert (
                len(activities) >= 3
            ), "Should find multiple Success-Advisor-8 activities"

            # Check that activities have unique IDs
            activity_ids = [activity.activity_id for activity in activities]
            assert len(activity_ids) == len(
                set(activity_ids),
            ), "All activity IDs should be unique"

        finally:
            Path(temp_path).unlink()

    def test_activity_classification(self):
        """Test that activities are properly classified by type."""
        parser = UnifiedChangelogParser()

        # Test different activity types
        test_cases = [
            ("Release version 1.0.0", "release"),
            ("Fixed Success-Advisor-8 bug", "fix"),
            ("Added Success-Advisor-8 feature", "feature"),
            ("Updated Success-Advisor-8 documentation", "documentation"),
            ("Refactored Success-Advisor-8 code", "refactor"),
        ]

        for description, expected_type in test_cases:
            actual_type = parser._classify_activity_type(description)
            assert (
                actual_type == expected_type
            ), f"Expected {expected_type} for '{description}', got {actual_type}"

    def test_legacy_tracker_integration(self):
        """Test that the legacy tracker properly integrates with CHANGELOG parsing."""
        # Use the real codebase path
        codebase_path = Path(__file__).parent.parent.parent.parent.parent
        changelog_path = codebase_path / "CHANGELOG.md"

        if not changelog_path.exists():
            pytest.skip("CHANGELOG.md not found")

        tracker = SuccessAdvisor8LegacyTracker(str(codebase_path), "CHANGELOG.md")

        # Test getting activities
        import asyncio

        activities = asyncio.run(tracker.parse_changelog_entries())
        assert isinstance(activities, list), "Should return a list of activities"

        # Test generating a legacy report
        report = asyncio.run(tracker.generate_legacy_report())
        assert report.total_activities >= 0, "Report should have activity count"
        assert report.last_updated is not None, "Report should have timestamp"

    def test_pattern_matching(self):
        """Test that Success-Advisor-8 patterns are correctly matched."""
        parser = UnifiedChangelogParser()

        test_cases = [
            ("Success-Advisor-8 integration", True),
            ("SUCCESS-ADVISOR-8 migration", True),
            ("success-advisor-8 tracking", True),
            ("SuccessAdvisor8 legacy", True),  # Now matches with enhanced pattern
            ("success_advisor_8 system", True),  # Now matches with enhanced pattern
            ("Success Advisor 8 system", True),  # Now matches with enhanced pattern
            ("Regular feature", False),
            ("Some other agent", False),
        ]

        for text, should_match in test_cases:
            matches = parser.success_advisor_pattern.search(text)
            assert (
                matches is not None
            ) == should_match, f"Pattern matching failed for '{text}'"

    def test_changelog_stats(self):
        """Test that changelog statistics are properly calculated."""
        # Use the real CHANGELOG.md file
        changelog_path = (
            Path(__file__).parent.parent.parent.parent.parent / "CHANGELOG.md"
        )

        if not changelog_path.exists():
            pytest.skip("CHANGELOG.md not found")

        parser = UnifiedChangelogParser(str(changelog_path))
        stats = parser.get_changelog_stats()

        assert "total_lines" in stats, "Stats should include total lines"
        assert (
            "success_advisor_references" in stats
        ), "Stats should include Success-Advisor-8 references"
        assert stats["total_lines"] > 0, "Should have content in CHANGELOG"

    def test_activity_trends_analysis(self):
        """Test that activity trends are properly analyzed."""
        # Use the real CHANGELOG.md file
        changelog_path = (
            Path(__file__).parent.parent.parent.parent.parent / "CHANGELOG.md"
        )

        if not changelog_path.exists():
            pytest.skip("CHANGELOG.md not found")

        parser = UnifiedChangelogParser(str(changelog_path))
        trends = parser.analyze_activity_trends()

        assert "activity_types" in trends, "Trends should include activity types"
        assert "total_activities" in trends, "Trends should include total activities"
        assert "versions" in trends, "Trends should include version data"
        assert trends["total_activities"] >= 0, "Should have activity count"

    def test_parser_info(self):
        """Test that parser information is correctly provided."""
        parser = UnifiedChangelogParser()
        info = parser.get_parser_info()

        assert "parser_type" in info, "Info should include parser type"
        assert (
            "existing_parser_available" in info
        ), "Info should include existing parser status"
        assert "changelog_path" in info, "Info should include changelog path"
        assert info["parser_type"] in [
            "existing",
            "fallback",
            "unified",
        ], "Parser type should be valid"
