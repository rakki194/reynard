"""
Tests for the ChangelogParser class.
"""

import os
import tempfile

import pytest

from ..core.parser import ChangelogParser


class TestChangelogParser:
    """Test cases for ChangelogParser class."""

    def test_init(self):
        """Test parser initialization."""
        parser = ChangelogParser("test_changelog.md")
        assert parser.changelog_path == "test_changelog.md"
        assert parser.contributions == []

    def test_init_default_path(self):
        """Test parser initialization with default path."""
        parser = ChangelogParser()
        assert parser.changelog_path == "CHANGELOG.md"

    def test_parse_nonexistent_file(self):
        """Test parsing a non-existent file raises FileNotFoundError."""
        parser = ChangelogParser("nonexistent.md")

        with pytest.raises(FileNotFoundError, match="Changelog file not found"):
            parser.parse_changelog()

    def test_parse_simple_agent_entry(self):
        """Test parsing a simple agent entry."""
        changelog_content = """
# Changelog

## Latest Changes

- **Test Feature**: Added new functionality (Test-Agent-123)
"""

        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".md") as f:
            f.write(changelog_content)
            temp_path = f.name

        try:
            parser = ChangelogParser(temp_path)
            contributions = parser.parse_changelog()

            assert len(contributions) == 1
            assert contributions[0].agent_name == "Test-Agent-123"
            assert contributions[0].title == "Test Feature"
            assert contributions[0].description == "Added new functionality"
        finally:
            os.unlink(temp_path)

    def test_parse_multiple_entries(self):
        """Test parsing multiple agent entries."""
        changelog_content = """
# Changelog

## Latest Changes

- **Feature A**: Added feature A (Agent-A-123)
- **Feature B**: Added feature B (Agent-B-456)
- **Feature C**: Added feature C (Agent-C-789)
"""

        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".md") as f:
            f.write(changelog_content)
            temp_path = f.name

        try:
            parser = ChangelogParser(temp_path)
            contributions = parser.parse_changelog()

            assert len(contributions) == 3
            assert contributions[0].agent_name == "Agent-A-123"
            assert contributions[1].agent_name == "Agent-B-456"
            assert contributions[2].agent_name == "Agent-C-789"
        finally:
            os.unlink(temp_path)

    def test_parse_entry_with_trailing_agent_credit(self):
        """Test parsing entry with trailing agent credit in description."""
        changelog_content = """
# Changelog

## Latest Changes

- **Test Feature**: Added new functionality (Other-Agent-456) (Test-Agent-123)
"""

        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".md") as f:
            f.write(changelog_content)
            temp_path = f.name

        try:
            parser = ChangelogParser(temp_path)
            contributions = parser.parse_changelog()

            # Should create separate contributions for each agent credit
            assert len(contributions) == 2
            agent_names = {c.agent_name for c in contributions}
            assert "Other-Agent-456" in agent_names
            assert "Test-Agent-123" in agent_names
            # Both should have the same description (with agent credits removed)
            for contrib in contributions:
                assert contrib.description == "Added new functionality"
        finally:
            os.unlink(temp_path)

    def test_parse_multiline_entry(self):
        """Test parsing multiline entries."""
        changelog_content = """
# Changelog

## Latest Changes

- **Complex Feature**: This is a complex feature
  that spans multiple lines
  with detailed description (Test-Agent-123)
"""

        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".md") as f:
            f.write(changelog_content)
            temp_path = f.name

        try:
            parser = ChangelogParser(temp_path)
            contributions = parser.parse_changelog()

            assert len(contributions) == 1
            assert contributions[0].agent_name == "Test-Agent-123"
            assert contributions[0].title == "Complex Feature"
            assert "complex feature" in contributions[0].description.lower()
        finally:
            os.unlink(temp_path)

    def test_parse_no_agent_entries(self):
        """Test parsing changelog with no agent entries."""
        changelog_content = """
# Changelog

## Latest Changes

- **Regular Feature**: Added new functionality
- **Another Feature**: Added another feature
"""

        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".md") as f:
            f.write(changelog_content)
            temp_path = f.name

        try:
            parser = ChangelogParser(temp_path)
            contributions = parser.parse_changelog()

            assert len(contributions) == 0
        finally:
            os.unlink(temp_path)

    def test_parse_duplicate_entries(self):
        """Test that duplicate entries are not added."""
        changelog_content = """
# Changelog

## Latest Changes

- **Test Feature**: Added new functionality (Test-Agent-123)
- **Test Feature**: Added new functionality (Test-Agent-123)
"""

        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".md") as f:
            f.write(changelog_content)
            temp_path = f.name

        try:
            parser = ChangelogParser(temp_path)
            contributions = parser.parse_changelog()

            # Should only have one entry despite duplicate
            assert len(contributions) == 1
        finally:
            os.unlink(temp_path)
