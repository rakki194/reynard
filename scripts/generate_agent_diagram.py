#!/usr/bin/env python3
"""
Agent Contributions Diagram Generator

This script parses the CHANGELOG.md file to extract agent contributions
and automatically generates a mermaid diagram showing the breakdown
of what each agent accomplished.

Usage:
    python scripts/generate_agent_diagram.py
"""

import argparse
import os
import re
import subprocess
import sys
from collections import defaultdict
from dataclasses import dataclass


@dataclass
class AgentContribution:
    """Represents a single contribution by an agent."""

    agent_name: str
    title: str
    description: str
    category: str = ""


class ChangelogParser:
    """Parses the CHANGELOG.md file to extract agent contributions."""

    def __init__(self, changelog_path: str = "CHANGELOG.md"):
        self.changelog_path = changelog_path
        self.agent_pattern = re.compile(r"\(([A-Za-z]+-[A-Za-z]+-\d+)\)")
        self.contributions: list[AgentContribution] = []

    def parse_changelog(self) -> list[AgentContribution]:
        """Parse the changelog and extract all agent contributions."""
        if not os.path.exists(self.changelog_path):
            raise FileNotFoundError(f"Changelog file not found: {self.changelog_path}")

        with open(self.changelog_path, encoding="utf-8") as f:
            content = f.read()

        # Find all agent contributions using regex
        # Look for patterns like "- **Title**: Description (Agent-Name-123)"
        agent_entries = re.findall(
            r"- \*\*(.*?)\*\*:\s*(.*?)\s*\(([A-Za-z]+-[A-Za-z]+-\d+)\)",
            content,
            re.DOTALL,
        )

        for title, description, agent_name in agent_entries:
            # Clean up the description
            description = description.strip()
            # Remove any trailing agent credits
            description = re.sub(r"\s*\([A-Za-z]+-[A-Za-z]+-\d+\)\s*$", "", description)

            contribution = AgentContribution(
                agent_name=agent_name, title=title, description=description
            )
            self.contributions.append(contribution)

        # Also look for multi-line entries that might have been missed
        lines = content.split("\n")
        current_entry = None

        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue

            # Check for agent credit at end of line
            agent_match = self.agent_pattern.search(line)
            if agent_match:
                agent_name = agent_match.group(1)

                # Look backwards for the title
                title = None
                description = ""

                # Check if this line has a title
                if line.startswith("- **"):
                    title_match = re.search(r"- \*\*(.*?)\*\*:", line)
                    if title_match:
                        title = title_match.group(1)
                        description = line[line.find(":") + 1 :].strip()
                        description = self.agent_pattern.sub("", description).strip()
                else:
                    # Look for title in previous lines
                    for j in range(max(0, i - 3), i):
                        prev_line = lines[j].strip()
                        if prev_line.startswith("- **"):
                            title_match = re.search(r"- \*\*(.*?)\*\*:", prev_line)
                            if title_match:
                                title = title_match.group(1)
                                description = prev_line[
                                    prev_line.find(":") + 1 :
                                ].strip()
                                description = self.agent_pattern.sub(
                                    "", description
                                ).strip()
                                break

                if title and agent_name:
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

        return self.contributions

    def _parse_section(self, section: str):
        """Parse a single changelog section."""
        lines = section.split("\n")
        current_entry = None

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Check if this line has an agent credit
            agent_match = self.agent_pattern.search(line)
            if agent_match:
                agent_name = agent_match.group(1)

                # Extract the title and description
                if line.startswith("- **"):
                    # Main entry
                    title_match = re.search(r"- \*\*(.*?)\*\*:", line)
                    if title_match:
                        title = title_match.group(1)
                        description = line[line.find(":") + 1 :].strip()
                        # Remove the agent credit from description
                        description = self.agent_pattern.sub("", description).strip()

                        current_entry = AgentContribution(
                            agent_name=agent_name, title=title, description=description
                        )
                        self.contributions.append(current_entry)
                elif line.startswith("  -") and current_entry:
                    # Sub-entry, append to current entry
                    sub_desc = line[2:].strip()
                    sub_desc = self.agent_pattern.sub("", sub_desc).strip()
                    if sub_desc:
                        current_entry.description += f" {sub_desc}"
                elif current_entry and not line.startswith("#"):
                    # Continuation line
                    cont_desc = line.strip()
                    cont_desc = self.agent_pattern.sub("", cont_desc).strip()
                    if cont_desc:
                        current_entry.description += f" {cont_desc}"


class AgentCategorizer:
    """Categorizes agents based on their contributions."""

    def __init__(self):
        self.category_keywords = {
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
        """Categorize an agent based on their contribution."""
        text = f"{contribution.title} {contribution.description}".lower()

        # Count keyword matches for each category
        category_scores = {}
        for category, keywords in self.category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text)
            if score > 0:
                category_scores[category] = score

        # Return the category with the highest score, or "Specialized" as default
        if category_scores:
            return max(category_scores.items(), key=lambda x: x[1])[0]
        return "Specialized"


class MermaidDiagramGenerator:
    """Generates a mermaid diagram from agent contributions."""

    def __init__(self, contributions: list[AgentContribution]):
        self.contributions = contributions
        self.categorizer = AgentCategorizer()

        # Categorize all contributions
        for contribution in self.contributions:
            contribution.category = self.categorizer.categorize_agent(contribution)

    def generate_diagram(self) -> str:
        """Generate the mermaid diagram content."""
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
        node_counter = 1

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
                description = self._clean_text_for_mermaid(contribution.description)

                # Truncate description if too long
                if len(description) > 80:
                    description = description[:80] + "..."

                # Create a simple, clean node label without HTML tags
                node_label = f"{contribution.agent_name}: {title}"
                lines.append(f'    {category_letter} --> {node_id}["{node_label}"]')

                node_counter += 1

        lines.append("```")

        return "\n".join(lines)

    def _get_category_letter(self, category: str) -> str:
        """Get the letter identifier for a category."""
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
        """Clean text for use in mermaid diagrams."""
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
        """Generate a summary of agent contributions by category."""
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
        """Generate key patterns section."""
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
            f"1. **Modular Refactoring**: {refactor_count} agents focused on breaking down large monolithic files into smaller, maintainable modules",
            "2. **140-line Axiom**: Consistent adherence to the 140-line file limit principle",
            f"3. **Security Focus**: {security_count} agents emphasized security analysis, testing, and framework improvements",
            f"4. **Testing Infrastructure**: {test_count} agents improved testing frameworks and quality assurance",
            f"5. **Documentation**: {doc_count} agents contributed extensive documentation and research papers",
            "6. **Python Backend**: Significant improvements to Python backend infrastructure and tooling",
        ]

        return "\n".join(lines)


def main():
    """Main function to generate the agent contributions diagram."""
    parser = argparse.ArgumentParser(
        description="Generate agent contributions diagram from changelog"
    )
    parser.add_argument(
        "--changelog", default="CHANGELOG.md", help="Path to changelog file"
    )
    parser.add_argument(
        "--output", default="agent_contributions_diagram.md", help="Output file path"
    )
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")

    args = parser.parse_args()

    print("🦊 Parsing changelog and generating agent contributions diagram...")

    try:
        # Parse the changelog
        changelog_parser = ChangelogParser(args.changelog)
        contributions = changelog_parser.parse_changelog()

        print(f"Found {len(contributions)} agent contributions")

        if args.verbose:
            print("\n📋 All contributions:")
            for i, contrib in enumerate(contributions, 1):
                print(f"  {i:2d}. {contrib.agent_name}: {contrib.title}")

        # Generate the diagram
        generator = MermaidDiagramGenerator(contributions)
        diagram = generator.generate_diagram()
        summary = generator.generate_summary()
        patterns = generator.generate_key_patterns()

        # Create the complete markdown content
        content = [
            "# Agent Contributions Breakdown",
            "",
            f"*Automatically generated from {args.changelog}*",
            "",
            diagram,
            "",
            summary,
            "",
            patterns,
        ]

        # Write to the target file
        with open(args.output, "w", encoding="utf-8") as f:
            f.write("\n".join(content))

        print(f"✅ Successfully generated {args.output}")
        print(
            f"📊 Processed {len(contributions)} contributions from {len(set(c.agent_name for c in contributions))} unique agents"
        )

        # Validate the generated diagram
        print("\n🔍 Validating mermaid diagram...")
        try:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            validator_path = os.path.join(script_dir, "validate_mermaid.py")
            result = subprocess.run(
                [sys.executable, validator_path, args.output],
                capture_output=True,
                text=True,
                cwd=os.path.dirname(script_dir),
                check=False,
            )
            if result.returncode == 0:
                print("✅ Mermaid diagram validation passed")
            else:
                print("⚠️  Mermaid diagram validation warnings:")
                print(result.stdout)
        except Exception as e:
            print(f"⚠️  Could not validate diagram: {e}")

        # Print some statistics
        categories = defaultdict(int)
        for contribution in contributions:
            categories[contribution.category] += 1

        print("\n📈 Category breakdown:")
        for category, count in sorted(categories.items()):
            print(f"  - {category}: {count} contributions")

        # Show top contributors
        agent_counts = defaultdict(int)
        for contribution in contributions:
            agent_counts[contribution.agent_name] += 1

        top_contributors = sorted(
            agent_counts.items(), key=lambda x: x[1], reverse=True
        )[:5]
        print("\n🏆 Top contributors:")
        for agent, count in top_contributors:
            print(f"  - {agent}: {count} contributions")

    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())
