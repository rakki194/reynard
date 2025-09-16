"""
Tests for the AgentCategorizer class.
"""

from ..core.categorizer import AgentCategorizer
from ..core.contribution import AgentContribution


class TestAgentCategorizer:
    """Test cases for AgentCategorizer class."""

    def test_init(self):
        """Test categorizer initialization."""
        categorizer = AgentCategorizer()
        assert len(categorizer.category_keywords) > 0
        assert "Security & Analysis" in categorizer.category_keywords

    def test_categorize_security_contribution(self):
        """Test categorizing a security-related contribution."""
        contribution = AgentContribution(
            agent_name="Security-Agent-123",
            title="Security Analysis",
            description="Performed security audit and vulnerability scanning",
        )

        categorizer = AgentCategorizer()
        category = categorizer.categorize_agent(contribution)

        assert category == "Security & Analysis"

    def test_categorize_infrastructure_contribution(self):
        """Test categorizing an infrastructure-related contribution."""
        contribution = AgentContribution(
            agent_name="Infra-Agent-123",
            title="Backend Refactoring",
            description="Refactored backend infrastructure and package configuration",
        )

        categorizer = AgentCategorizer()
        category = categorizer.categorize_agent(contribution)

        assert category == "Infrastructure & Architecture"

    def test_categorize_testing_contribution(self):
        """Test categorizing a testing-related contribution."""
        contribution = AgentContribution(
            agent_name="Test-Agent-123",
            title="E2E Testing",
            description="Added comprehensive e2e tests and performance benchmarks",
        )

        categorizer = AgentCategorizer()
        category = categorizer.categorize_agent(contribution)

        assert category == "Testing & Quality"

    def test_categorize_documentation_contribution(self):
        """Test categorizing a documentation-related contribution."""
        contribution = AgentContribution(
            agent_name="Doc-Agent-123",
            title="Research Paper",
            description="Wrote comprehensive documentation and research papers",
        )

        categorizer = AgentCategorizer()
        category = categorizer.categorize_agent(contribution)

        assert category == "Documentation & Research"

    def test_categorize_frontend_contribution(self):
        """Test categorizing a frontend-related contribution."""
        contribution = AgentContribution(
            agent_name="UI-Agent-123",
            title="Component Development",
            description="Created modern UI components with animations and styling",
        )

        categorizer = AgentCategorizer()
        category = categorizer.categorize_agent(contribution)

        assert category == "Frontend & UI"

    def test_categorize_backend_contribution(self):
        """Test categorizing a backend-related contribution."""
        contribution = AgentContribution(
            agent_name="Backend-Agent-123",
            title="Python Server",
            description="Improved Python backend server and type safety",
        )

        categorizer = AgentCategorizer()
        category = categorizer.categorize_agent(contribution)

        assert category == "Backend & Python"

    def test_categorize_specialized_contribution(self):
        """Test categorizing a specialized contribution."""
        contribution = AgentContribution(
            agent_name="Special-Agent-123",
            title="I18n Enhancement",
            description="Added internationalization support and startup sequence",
        )

        categorizer = AgentCategorizer()
        category = categorizer.categorize_agent(contribution)

        assert category == "Specialized"

    def test_categorize_unknown_contribution(self):
        """Test categorizing a contribution with no matching keywords."""
        contribution = AgentContribution(
            agent_name="Unknown-Agent-123",
            title="Mystery Feature",
            description="Added some mysterious functionality that doesn't match any keywords",
        )

        categorizer = AgentCategorizer()
        category = categorizer.categorize_agent(contribution)

        assert category == "Specialized"  # Default category

    def test_categorize_multiple_keywords(self):
        """Test categorizing a contribution with multiple keyword matches."""
        contribution = AgentContribution(
            agent_name="Multi-Agent-123",
            title="Security Testing",
            description="Performed security analysis and quality testing with performance benchmarks",
        )

        categorizer = AgentCategorizer()
        category = categorizer.categorize_agent(contribution)

        # Should pick the category with the highest score
        # Security & Analysis has "security" and "analysis" = 2 points
        # Testing & Quality has "testing" and "quality" = 2 points
        # This should pick one of them (implementation dependent)
        assert category in ["Security & Analysis", "Testing & Quality"]

    def test_get_category_keywords(self):
        """Test getting keywords for a specific category."""
        categorizer = AgentCategorizer()
        keywords = categorizer.get_category_keywords("Security & Analysis")

        assert isinstance(keywords, list)
        assert "security" in keywords
        assert "analysis" in keywords

    def test_get_category_keywords_unknown(self):
        """Test getting keywords for unknown category."""
        categorizer = AgentCategorizer()
        keywords = categorizer.get_category_keywords("Unknown Category")

        assert keywords == []

    def test_get_all_categories(self):
        """Test getting all available categories."""
        categorizer = AgentCategorizer()
        categories = categorizer.get_all_categories()

        assert isinstance(categories, list)
        assert len(categories) == 7
        assert "Security & Analysis" in categories
        assert "Infrastructure & Architecture" in categories
        assert "Testing & Quality" in categories
        assert "Documentation & Research" in categories
        assert "Frontend & UI" in categories
        assert "Backend & Python" in categories
        assert "Specialized" in categories
