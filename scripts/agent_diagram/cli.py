"""Command-line interface for the agent diagram generator.
"""

import argparse
import os
import subprocess
import sys
from collections import defaultdict

from .core.contribution import AgentContribution
from .core.generator import MermaidDiagramGenerator
from .core.parser import ChangelogParser


def main() -> int:
    """Main function to generate the agent contributions diagram.

    Returns:
        Exit code (0 for success, 1 for error)

    """
    parser = argparse.ArgumentParser(
        description="Generate agent contributions diagram from changelog",
    )
    parser.add_argument(
        "--changelog", default="CHANGELOG.md", help="Path to changelog file",
    )
    parser.add_argument(
        "--output", default="agent_contributions_diagram.md", help="Output file path",
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
        unique_agents = len(set(c.agent_name for c in contributions))
        print(
            f"📊 Processed {len(contributions)} contributions from {unique_agents} unique agents",
        )

        # Validate the generated diagram
        print("\n🔍 Validating mermaid diagram...")
        try:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            validator_path = os.path.join(script_dir, "..", "validate_mermaid.py")
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
        _print_statistics(contributions)

    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

    return 0


def _print_statistics(contributions: list[AgentContribution]) -> None:
    """Print contribution statistics."""
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

    top_contributors = sorted(agent_counts.items(), key=lambda x: x[1], reverse=True)[
        :5
    ]
    print("\n🏆 Top contributors:")
    for agent, count in top_contributors:
        print(f"  - {agent}: {count} contributions")
