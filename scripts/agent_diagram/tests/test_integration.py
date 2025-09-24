"""Integration tests for the agent diagram library.
"""

import os
import tempfile

from ..core.generator import MermaidDiagramGenerator
from ..core.parser import ChangelogParser


class TestIntegration:
    """Integration tests for the complete workflow."""

    def test_full_workflow(self):
        """Test the complete workflow from parsing to diagram generation."""
        # Create a test changelog
        changelog_content = """
# Changelog

## Latest Changes

- **Security Enhancement**: Added comprehensive security analysis and vulnerability scanning (Security-Agent-123)
- **E2E Testing**: Implemented end-to-end testing framework with performance benchmarks (Test-Agent-456)
- **Documentation**: Wrote comprehensive documentation and research papers (Doc-Agent-789)
- **Frontend Components**: Created modern UI components with animations and styling (UI-Agent-101)
- **Backend Refactoring**: Refactored Python backend infrastructure and package configuration (Backend-Agent-202)
- **I18n Support**: Added internationalization support and startup sequence (Special-Agent-303)
"""

        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".md") as f:
            f.write(changelog_content)
            temp_path = f.name

        try:
            # Parse the changelog
            parser = ChangelogParser(temp_path)
            contributions = parser.parse_changelog()

            assert len(contributions) == 6

            # Generate diagram
            generator = MermaidDiagramGenerator(contributions)
            diagram = generator.generate_diagram()
            summary = generator.generate_summary()
            patterns = generator.generate_key_patterns()

            # Verify diagram contains all agents
            assert "Security-Agent-123" in diagram
            assert "Test-Agent-456" in diagram
            assert "Doc-Agent-789" in diagram
            assert "UI-Agent-101" in diagram
            assert "Backend-Agent-202" in diagram
            assert "Special-Agent-303" in diagram

            # Verify categories are assigned
            categories = {c.category for c in contributions}
            assert len(categories) > 1  # Should have multiple categories

            # Verify summary contains all agents
            assert "Security-Agent-123" in summary
            assert "Test-Agent-456" in summary
            assert "Doc-Agent-789" in summary

            # Verify patterns analysis
            assert "Modular Refactoring" in patterns
            assert "Security Focus" in patterns
            assert "Testing Infrastructure" in patterns

        finally:
            os.unlink(temp_path)

    def test_workflow_with_empty_changelog(self):
        """Test workflow with empty changelog."""
        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".md") as f:
            f.write("# Empty Changelog\n\nNo changes yet.")
            temp_path = f.name

        try:
            parser = ChangelogParser(temp_path)
            contributions = parser.parse_changelog()

            assert len(contributions) == 0

            generator = MermaidDiagramGenerator(contributions)
            diagram = generator.generate_diagram()
            summary = generator.generate_summary()
            patterns = generator.generate_key_patterns()

            # Should still generate valid output
            assert "```mermaid" in diagram
            assert "## Summary by Category" in summary
            assert "## Key Patterns" in patterns

        finally:
            os.unlink(temp_path)

    def test_workflow_with_malformed_entries(self):
        """Test workflow with malformed changelog entries."""
        changelog_content = """
# Changelog

## Latest Changes

- **Valid Entry**: This is a valid entry (Valid-Agent-123)
- **Invalid Entry**: This entry has no agent credit
- **Another Valid**: Another valid entry (Another-Agent-456)
- **Malformed**: (Malformed-Agent-789) This entry has agent credit at the beginning
"""

        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".md") as f:
            f.write(changelog_content)
            temp_path = f.name

        try:
            parser = ChangelogParser(temp_path)
            contributions = parser.parse_changelog()

            # Should only parse valid entries (those with proper format)
            assert len(contributions) >= 2  # At least the valid ones
            agent_names = {c.agent_name for c in contributions}
            assert "Valid-Agent-123" in agent_names
            assert "Another-Agent-456" in agent_names
            # Malformed entry should not be parsed because it doesn't have proper format

        finally:
            os.unlink(temp_path)

    def test_workflow_with_duplicate_entries(self):
        """Test workflow with duplicate entries."""
        changelog_content = """
# Changelog

## Latest Changes

- **Duplicate Feature**: Added duplicate feature (Duplicate-Agent-123)
- **Duplicate Feature**: Added duplicate feature (Duplicate-Agent-123)
- **Unique Feature**: Added unique feature (Unique-Agent-456)
"""

        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".md") as f:
            f.write(changelog_content)
            temp_path = f.name

        try:
            parser = ChangelogParser(temp_path)
            contributions = parser.parse_changelog()

            # Should deduplicate entries (same agent + title combination)
            assert len(contributions) == 2
            agent_names = {c.agent_name for c in contributions}
            assert "Duplicate-Agent-123" in agent_names
            assert "Unique-Agent-456" in agent_names

        finally:
            os.unlink(temp_path)

    def test_workflow_with_special_characters(self):
        """Test workflow with special characters in descriptions."""
        changelog_content = """
# Changelog

## Latest Changes

- **Special Chars**: Added feature with "quotes", <br/>HTML, and special@#$%chars (Special-Agent-123)
- **Unicode**: Added feature with unicode: 🦊🦦🐺 (Unicode-Agent-456)
"""

        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".md") as f:
            f.write(changelog_content)
            temp_path = f.name

        try:
            parser = ChangelogParser(temp_path)
            contributions = parser.parse_changelog()

            assert len(contributions) == 2

            generator = MermaidDiagramGenerator(contributions)
            diagram = generator.generate_diagram()

            # Should handle special characters gracefully
            assert "Special-Agent-123" in diagram
            assert "Unicode-Agent-456" in diagram

        finally:
            os.unlink(temp_path)
