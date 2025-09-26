"""
Tests for the Mermaid Rendering Service

Basic tests to verify the service functionality.
"""

import pytest
from reynard_mermaid_renderer import MermaidRenderingService


class TestMermaidRenderingService:
    """Test cases for the Mermaid rendering service."""

    def setup_method(self):
        """Set up test fixtures."""
        self.service = MermaidRenderingService()
        self.test_diagram = """
        graph TD
            A[Start] --> B{Decision}
            B -->|Yes| C[Action 1]
            B -->|No| D[Action 2]
            C --> E[End]
            D --> E
        """

    def test_service_initialization(self):
        """Test that the service initializes correctly."""
        assert self.service is not None
        # Service may not be available if Playwright is not installed
        # This is expected in test environments

    def test_validate_diagram(self):
        """Test diagram validation."""
        is_valid, errors, warnings = self.service.validate_diagram(self.test_diagram)

        # If service is available, diagram should be valid
        if self.service.available:
            assert is_valid is True
            assert len(errors) == 0
        else:
            # If service not available, should return error
            assert is_valid is False
            assert len(errors) > 0

    def test_get_diagram_stats(self):
        """Test diagram statistics generation."""
        stats = self.service.get_diagram_stats(self.test_diagram)

        assert "valid" in stats
        assert "diagram_length" in stats
        assert "lines" in stats
        assert stats["diagram_length"] > 0
        assert stats["lines"] > 0

    def test_get_available_themes(self):
        """Test getting available themes."""
        themes = self.service.get_available_themes()

        if self.service.available:
            assert len(themes) > 0
            assert "default" in themes
        else:
            # If service not available, should return empty list
            assert themes == []

    def test_get_service_info(self):
        """Test getting service information."""
        info = self.service.get_service_info()

        assert "available" in info
        assert "supported_formats" in info
        assert "svg" in info["supported_formats"]
        assert "png" in info["supported_formats"]
        assert "pdf" in info["supported_formats"]

    def test_health_check(self):
        """Test health check functionality."""
        health = self.service.health_check()

        assert "status" in health
        assert "available" in health
        assert "service_info" in health
        assert health["status"] in ["healthy", "unhealthy"]

    def test_invalid_diagram(self):
        """Test handling of invalid diagrams."""
        invalid_diagram = "invalid mermaid syntax"

        is_valid, errors, warnings = self.service.validate_diagram(invalid_diagram)

        if self.service.available:
            # Should detect invalid syntax
            assert is_valid is False
            assert len(errors) > 0
        else:
            # If service not available, should return error
            assert is_valid is False
            assert len(errors) > 0


if __name__ == "__main__":
    pytest.main([__file__])
