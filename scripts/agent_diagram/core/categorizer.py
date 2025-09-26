"""Agent categorizer for classifying contributions by type."""

from .contribution import AgentContribution


class AgentCategorizer:
    """Categorizes agents based on their contributions.

    This class analyzes contribution text to automatically assign categories
    based on keyword matching and content analysis.
    """

    def __init__(self):
        """Initialize the categorizer with predefined category keywords."""
        self.category_keywords: dict[str, list[str]] = {
            "Security & Analysis": [
                "security",
                "analysis",
                "quality",
                "bandit",
                "fenrir",
                "vulnerability",
                "exploit",
                "penetration",
                "audit",
                "scan",
                "threat",
            ],
            "Infrastructure & Architecture": [
                "infrastructure",
                "architecture",
                "backend",
                "foundation",
                "validation",
                "package",
                "configuration",
                "cleanup",
                "refactor",
                "modular",
                "mcp",
            ],
            "Testing & Quality": [
                "test",
                "testing",
                "e2e",
                "performance",
                "trace",
                "linting",
                "quality",
                "coverage",
                "validation",
                "benchmark",
            ],
            "Documentation & Research": [
                "documentation",
                "research",
                "paper",
                "guide",
                "readme",
                "git",
                "delta",
                "integration",
                "academic",
                "latex",
            ],
            "Frontend & UI": [
                "frontend",
                "ui",
                "component",
                "animation",
                "todo",
                "checkbox",
                "strikeout",
                "modern",
                "styling",
                "theme",
                "react",
                "solid",
            ],
            "Backend & Python": [
                "python",
                "backend",
                "server",
                "agent",
                "namer",
                "robot",
                "type",
                "error",
                "import",
                "package",
                "structure",
            ],
            "Specialized": [
                "i18n",
                "internationalization",
                "performance",
                "benchmark",
                "reporter",
                "helper",
                "startup",
                "sequence",
                "spirit",
                "enhancement",
            ],
        }

    def categorize_agent(self, contribution: AgentContribution) -> str:
        """Categorize an agent based on their contribution.

        Args:
            contribution: The agent contribution to categorize

        Returns:
            The category name that best matches the contribution

        """
        text = f"{contribution.title} {contribution.description}".lower()

        # Count keyword matches for each category
        category_scores: dict[str, int] = {}
        for category, keywords in self.category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text)
            if score > 0:
                category_scores[category] = score

        # Return the category with the highest score, or "Specialized" as default
        if category_scores:
            return max(category_scores.items(), key=lambda x: x[1])[0]
        return "Specialized"

    def get_category_keywords(self, category: str) -> list[str]:
        """Get the keywords for a specific category.

        Args:
            category: The category name

        Returns:
            List of keywords for the category

        """
        return self.category_keywords.get(category, [])

    def get_all_categories(self) -> list[str]:
        """Get all available categories.

        Returns:
            List of all category names

        """
        return list(self.category_keywords.keys())
