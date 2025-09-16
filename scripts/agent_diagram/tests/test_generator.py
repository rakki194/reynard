"""
Tests for the MermaidDiagramGenerator class.
"""

from ..core.contribution import AgentContribution
from ..core.generator import MermaidDiagramGenerator


class TestMermaidDiagramGenerator:
    """Test cases for MermaidDiagramGenerator class."""

    def test_init(self):
        """Test generator initialization."""
        contributions = [
            AgentContribution(
                agent_name="Test-Agent-123",
                title="Test Feature",
                description="Test description",
            )
        ]

        generator = MermaidDiagramGenerator(contributions)
        assert len(generator.contributions) == 1
        assert generator.contributions[0].category != ""  # Should be categorized

    def test_generate_diagram_basic(self):
        """Test generating a basic diagram."""
        contributions = [
            AgentContribution(
                agent_name="Test-Agent-123",
                title="Test Feature",
                description="Test description",
            )
        ]

        generator = MermaidDiagramGenerator(contributions)
        diagram = generator.generate_diagram()

        assert "```mermaid" in diagram
        assert "%%{init: {'theme': 'neutral'}}%%" in diagram
        assert "graph TD" in diagram
        assert "Agent Contributions" in diagram
        assert "Test-Agent-123" in diagram
        assert "```" in diagram

    def test_generate_diagram_multiple_categories(self):
        """Test generating diagram with multiple categories."""
        contributions = [
            AgentContribution(
                agent_name="Security-Agent-123",
                title="Security Analysis",
                description="Performed security audit",
            ),
            AgentContribution(
                agent_name="Test-Agent-456",
                title="E2E Testing",
                description="Added comprehensive tests",
            ),
            AgentContribution(
                agent_name="Doc-Agent-789",
                title="Documentation",
                description="Wrote comprehensive docs",
            ),
        ]

        generator = MermaidDiagramGenerator(contributions)
        diagram = generator.generate_diagram()

        assert "Security-Agent-123" in diagram
        assert "Test-Agent-456" in diagram
        assert "Doc-Agent-789" in diagram

    def test_generate_diagram_limits_per_category(self):
        """Test that diagram limits contributions per category."""
        # Create 10 contributions in the same category
        contributions = []
        for i in range(10):
            contributions.append(
                AgentContribution(
                    agent_name=f"Test-Agent-{i}",
                    title="Test Feature",
                    description="Test description",
                )
            )

        generator = MermaidDiagramGenerator(contributions)
        diagram = generator.generate_diagram()

        # Should only show 5 per category (limit in generate_diagram)
        # Count occurrences of "Test-Agent-" in the diagram
        count = diagram.count("Test-Agent-")
        assert count <= 5

    def test_clean_text_for_mermaid(self):
        """Test text cleaning for mermaid compatibility."""
        contributions = [
            AgentContribution(
                agent_name="Test-Agent-123",
                title="Test Feature",
                description="Test description",
            )
        ]

        generator = MermaidDiagramGenerator(contributions)

        # Test various problematic characters
        test_cases = [
            ('Text with "quotes"', "Text with 'quotes'"),
            ("Text with\nnewlines", "Text with newlines"),
            ("Text with\r\ncarriage returns", "Text with carriage returns"),
            ("Text with<br/>HTML", "Text with HTML"),
            ("Text with   multiple   spaces", "Text with multiple spaces"),
            ("Text with special@#$%chars", "Text with specialchars"),
            (
                "Very long text that exceeds the maximum length limit for mermaid labels",
                "Very long text that exceeds the maximum length ...",
            ),
        ]

        for input_text, expected in test_cases:
            result = generator._clean_text_for_mermaid(input_text)
            assert result == expected

    def test_clean_text_for_mermaid_empty(self):
        """Test cleaning empty text."""
        contributions = [
            AgentContribution(
                agent_name="Test-Agent-123",
                title="Test Feature",
                description="Test description",
            )
        ]

        generator = MermaidDiagramGenerator(contributions)
        result = generator._clean_text_for_mermaid("")
        assert result == ""

    def test_clean_text_for_mermaid_none(self):
        """Test cleaning None text."""
        contributions = [
            AgentContribution(
                agent_name="Test-Agent-123",
                title="Test Feature",
                description="Test description",
            )
        ]

        generator = MermaidDiagramGenerator(contributions)
        result = generator._clean_text_for_mermaid(None)
        assert result == ""

    def test_get_category_letter(self):
        """Test getting category letters."""
        contributions = [
            AgentContribution(
                agent_name="Test-Agent-123",
                title="Test Feature",
                description="Test description",
            )
        ]

        generator = MermaidDiagramGenerator(contributions)

        assert generator._get_category_letter("Security & Analysis") == "B"
        assert generator._get_category_letter("Infrastructure & Architecture") == "C"
        assert generator._get_category_letter("Testing & Quality") == "D"
        assert generator._get_category_letter("Documentation & Research") == "E"
        assert generator._get_category_letter("Frontend & UI") == "F"
        assert generator._get_category_letter("Backend & Python") == "G"
        assert generator._get_category_letter("Specialized") == "H"
        assert generator._get_category_letter("Unknown") == "H"  # Default

    def test_generate_summary(self):
        """Test generating summary."""
        contributions = [
            AgentContribution(
                agent_name="Test-Agent-123",
                title="Test Feature",
                description="Test description",
            ),
            AgentContribution(
                agent_name="Test-Agent-456",
                title="Another Feature",
                description="Another description",
            ),
        ]

        generator = MermaidDiagramGenerator(contributions)
        summary = generator.generate_summary()

        assert "## Summary by Category" in summary
        assert "Test-Agent-123" in summary
        assert "Test-Agent-456" in summary
        assert "Test Feature" in summary
        assert "Another Feature" in summary

    def test_generate_key_patterns(self):
        """Test generating key patterns."""
        contributions = [
            AgentContribution(
                agent_name="Refactor-Agent-123",
                title="Refactoring",
                description="Refactored code for better modularity",
            ),
            AgentContribution(
                agent_name="Security-Agent-456",
                title="Security",
                description="Improved security analysis",
            ),
            AgentContribution(
                agent_name="Test-Agent-789",
                title="Testing",
                description="Added comprehensive tests",
            ),
            AgentContribution(
                agent_name="Doc-Agent-101",
                title="Documentation",
                description="Wrote documentation and research papers",
            ),
        ]

        generator = MermaidDiagramGenerator(contributions)
        patterns = generator.generate_key_patterns()

        assert "## Key Patterns" in patterns
        assert "Modular Refactoring" in patterns
        assert "Security Focus" in patterns
        assert "Testing Infrastructure" in patterns
        assert "Documentation" in patterns
        assert "140-line Axiom" in patterns
