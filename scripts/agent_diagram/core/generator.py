"""
Mermaid diagram generator for agent contributions.
"""

import re
from collections import defaultdict

from .categorizer import AgentCategorizer
from .contribution import AgentContribution


class MermaidDiagramGenerator:
    """
    Generates a mermaid diagram from agent contributions.

    This class creates visual representations of agent contributions organized
    by category using mermaid diagram syntax.
    """

    def __init__(self, contributions: list[AgentContribution]):
        """
        Initialize the generator with agent contributions.

        Args:
            contributions: List of agent contributions to visualize
        """
        self.contributions = contributions
        self.categorizer = AgentCategorizer()

        # Categorize all contributions
        for contribution in self.contributions:
            contribution.category = self.categorizer.categorize_agent(contribution)

    def generate_diagram(self) -> str:
        """
        Generate the mermaid diagram content.

        Returns:
            Mermaid diagram syntax as a string
        """
        # Group contributions by category
        categories = defaultdict(list)
        for contribution in self.contributions:
            categories[contribution.category].append(contribution)

        # Generate the diagram with neutral theme for black text on white boxes
        lines = [
            "```mermaid",
            "%%{init: {'theme': 'neutral'}}%%",
            "graph TD",
            "    A[Agent Contributions] --> B[Security & Analysis Agents]",
            "    A --> C[Infrastructure & Architecture Agents]",
            "    A --> D[Testing & Quality Agents]",
            "    A --> E[Documentation & Research Agents]",
            "    A --> F[Frontend & UI Agents]",
            "    A --> G[Backend & Python Agents]",
            "    A --> H[Specialized Agents]",
            "",
        ]

        # Add agent contributions
        for category, contributions in categories.items():
            if not contributions:
                continue

            category_letter = self._get_category_letter(category)

            for i, contribution in enumerate(
                contributions[:5]
            ):  # Limit to 5 per category
                node_id = f"{category_letter}{i + 1}"

                # Clean and escape text for mermaid
                title = self._clean_text_for_mermaid(contribution.title)

                # Create a simple, clean node label without HTML tags
                node_label = f"{contribution.agent_name}: {title}"
                lines.append(f'    {category_letter} --> {node_id}["{node_label}"]')

        lines.append("```")

        return "\n".join(lines)

    def _get_category_letter(self, category: str) -> str:
        """
        Get the letter identifier for a category.

        Args:
            category: The category name

        Returns:
            Single letter identifier for the category
        """
        category_map = {
            "Security & Analysis": "B",
            "Infrastructure & Architecture": "C",
            "Testing & Quality": "D",
            "Documentation & Research": "E",
            "Frontend & UI": "F",
            "Backend & Python": "G",
            "Specialized": "H",
        }
        return category_map.get(category, "H")

    def _clean_text_for_mermaid(self, text: str) -> str:
        """
        Clean text for use in mermaid diagrams.

        Args:
            text: The text to clean

        Returns:
            Cleaned text safe for mermaid syntax
        """
        if not text:
            return ""

        # Remove or replace problematic characters
        text = text.replace('"', "'")  # Replace double quotes with single quotes
        text = text.replace("\n", " ")  # Replace newlines with spaces
        text = text.replace("\r", " ")  # Replace carriage returns with spaces
        text = text.replace("<br/>", " ")  # Remove HTML line breaks
        text = text.replace("<br>", " ")  # Remove HTML line breaks
        text = re.sub(r"\s+", " ", text)  # Collapse multiple whitespace
        text = text.strip()

        # Remove any remaining problematic characters that could break mermaid
        # Keep only alphanumeric, spaces, and basic punctuation
        text = re.sub(r"[^\w\s\-.,:;!?()']", "", text)

        # Ensure text doesn't start or end with special characters
        text = text.strip(".,:;!?()")

        # Limit length to prevent overly long labels
        if len(text) > 50:
            text = text[:47] + "..."

        return text

    def generate_summary(self) -> str:
        """
        Generate a summary of agent contributions by category.

        Returns:
            Markdown formatted summary
        """
        categories = defaultdict(list)
        for contribution in self.contributions:
            categories[contribution.category].append(contribution)

        lines = ["## Summary by Category", ""]

        for category, contributions in categories.items():
            if not contributions:
                continue

            lines.append(f"### {category} ({len(contributions)} agents)")
            lines.append("")

            for contribution in contributions:
                lines.append(f"- **{contribution.agent_name}**: {contribution.title}")

            lines.append("")

        return "\n".join(lines)

    def generate_key_patterns(self) -> str:
        """
        Generate key patterns section.

        Returns:
            Markdown formatted patterns analysis
        """
        # Analyze patterns
        refactor_count = sum(
            1 for c in self.contributions if "refactor" in c.description.lower()
        )
        security_count = sum(
            1 for c in self.contributions if "security" in c.description.lower()
        )
        test_count = sum(
            1 for c in self.contributions if "test" in c.description.lower()
        )
        doc_count = sum(
            1
            for c in self.contributions
            if "documentation" in c.description.lower()
            or "paper" in c.description.lower()
        )

        lines = [
            "## Key Patterns",
            "",
            f"1. **Modular Refactoring**: {refactor_count} agents focused on breaking down "
            "large monolithic files into smaller, maintainable modules",
            "2. **140-line Axiom**: Consistent adherence to the 140-line file limit principle",
            f"3. **Security Focus**: {security_count} agents emphasized security analysis, "
            "testing, and framework improvements",
            f"4. **Testing Infrastructure**: {test_count} agents improved testing frameworks "
            "and quality assurance",
            f"5. **Documentation**: {doc_count} agents contributed extensive documentation "
            "and research papers",
            "6. **Python Backend**: Significant improvements to Python backend "
            "infrastructure and tooling",
        ]

        return "\n".join(lines)
