"""
Changelog parser for extracting agent contributions.
"""

import os
import re

from .contribution import AgentContribution


class ChangelogParser:
    """
    Parses the CHANGELOG.md file to extract agent contributions.

    This parser uses regex patterns to identify agent contributions in the
    changelog format and extracts structured data for further processing.
    """

    def __init__(self, changelog_path: str = "CHANGELOG.md"):
        """
        Initialize the parser with a changelog file path.

        Args:
            changelog_path: Path to the changelog file to parse
        """
        self.changelog_path = changelog_path
        self.agent_pattern = re.compile(r"\(([A-Za-z]+-[A-Za-z]+-\d+)\)")
        self.contributions: list[AgentContribution] = []

    def parse_changelog(self) -> list[AgentContribution]:
        """
        Parse the changelog and extract all agent contributions.

        Returns:
            List of AgentContribution objects found in the changelog

        Raises:
            FileNotFoundError: If the changelog file doesn't exist
        """
        if not os.path.exists(self.changelog_path):
            raise FileNotFoundError(f"Changelog file not found: {self.changelog_path}")

        with open(self.changelog_path, encoding="utf-8") as f:
            content = f.read()

        # Clear previous contributions
        self.contributions = []

        # Find all agent contributions using regex
        self._parse_agent_entries(content)
        self._parse_multiline_entries(content)

        return self.contributions

    def _parse_agent_entries(self, content: str) -> None:
        """Parse single-line agent entries."""
        lines = content.split("\n")

        for line in lines:
            line = line.strip()
            if not line.startswith("- **"):
                continue

            # Find all agent credits in this line
            agent_matches = list(self.agent_pattern.finditer(line))
            if not agent_matches:
                continue

            # Extract title
            title_match = re.search(r"- \*\*(.*?)\*\*:", line)
            if not title_match:
                continue

            title = title_match.group(1)

            # For each agent credit, create a contribution
            for match in agent_matches:
                agent_name = match.group(1)

                # Extract description by removing the title and all agent credits
                description = line[line.find(":") + 1 :].strip()
                # Remove all agent credits from description
                description = self.agent_pattern.sub("", description).strip()

                if description:  # Only add if we have a description
                    # Check if we already have this contribution
                    existing = any(
                        c.agent_name == agent_name and c.title == title
                        for c in self.contributions
                    )
                    if not existing:
                        contribution = AgentContribution(
                            agent_name=agent_name, title=title, description=description
                        )
                        self.contributions.append(contribution)

    def _parse_multiline_entries(self, content: str) -> None:
        """Parse multi-line entries that might have been missed."""
        lines = content.split("\n")

        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue

            # Check for agent credit at end of line
            agent_match = self.agent_pattern.search(line)
            if agent_match:
                agent_name = agent_match.group(1)
                title, description = self._extract_title_and_description(lines, i, line)

                if title and agent_name and description:
                    # Check if we already have this contribution
                    existing = any(
                        c.agent_name == agent_name and c.title == title
                        for c in self.contributions
                    )
                    if not existing:
                        contribution = AgentContribution(
                            agent_name=agent_name, title=title, description=description
                        )
                        self.contributions.append(contribution)

    def _extract_title_and_description(
        self, lines: list[str], current_index: int, current_line: str
    ) -> tuple[str | None, str]:
        """Extract title and description from a line with agent credit."""
        title = None
        description = ""

        # Check if this line has a title
        if current_line.startswith("- **"):
            title_match = re.search(r"- \*\*(.*?)\*\*:", current_line)
            if title_match:
                title = title_match.group(1)
                description = current_line[current_line.find(":") + 1 :].strip()
                description = self.agent_pattern.sub("", description).strip()
        else:
            # Look for title in previous lines
            for j in range(max(0, current_index - 3), current_index):
                prev_line = lines[j].strip()
                if prev_line.startswith("- **"):
                    title_match = re.search(r"- \*\*(.*?)\*\*:", prev_line)
                    if title_match:
                        title = title_match.group(1)
                        description = prev_line[prev_line.find(":") + 1 :].strip()
                        description = self.agent_pattern.sub("", description).strip()
                        break

        return title, description
