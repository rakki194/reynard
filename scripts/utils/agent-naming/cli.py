#!/usr/bin/env python3
"""
Reynard CLI Interface
=====================

Command-line interface for the Reynard robot name generator.

This module provides a clean CLI for generating and analyzing robot names
with various animal spirit themes and naming styles.
"""

import argparse
import sys

from name_analyzer import NameAnalyzer
from name_generators import BatchGenerator


class ReynardCLI:
    """Command-line interface for the Reynard name generator."""

    def __init__(self) -> None:
        self.batch_generator = BatchGenerator()
        self.name_analyzer = NameAnalyzer()

    def create_parser(self) -> argparse.ArgumentParser:
        """Create and configure the argument parser."""
        parser = argparse.ArgumentParser(
            description="Generate robot names with Reynard animal spirit themes",
            formatter_class=argparse.RawDescriptionHelpFormatter,
            epilog="""
Examples:
  python -m reynard_naming                                    # Generate one random name
  python -m reynard_naming --count 5                          # Generate 5 random names
  python -m reynard_naming --spirit fox                       # Generate fox-themed name
  python -m reynard_naming --spirit axolotl                   # Generate axolotl-themed name
  python -m reynard_naming --style foundation                 # Generate Foundation-style name
  python -m reynard_naming --style cyberpunk                  # Generate Cyberpunk-style name
  python -m reynard_naming --style mythological               # Generate Mythological-style name
  python -m reynard_naming --spirit dolphin --style exo --count 3  # Dolphin Exo names
  python -m reynard_naming --spirit eagle --style scientific  # Eagle Scientific name
  python -m reynard_naming --spirit narwhal --style cyberpunk # Narwhal Cyberpunk name
  python -m reynard_naming --analyze "Vulpine-Sage-13"        # Analyze a specific name
  python -m reynard_naming --list-spirits                     # List all available spirits
  python -m reynard_naming --list-styles                      # List all available styles
            """,
        )

        # Main generation options
        parser.add_argument(
            "--count",
            "-c",
            type=int,
            default=1,
            help="Number of names to generate (default: 1)",
        )
        parser.add_argument(
            "--spirit",
            "-s",
            choices=self.name_analyzer.get_available_spirits(),
            help="Animal spirit theme (fox, wolf, otter, dolphin, eagle, lion, etc.)",
        )
        parser.add_argument(
            "--style",
            choices=self.name_analyzer.get_available_styles(),
            help="Naming style (foundation, exo, hybrid, cyberpunk, mythological, scientific)",
        )

        # Analysis options
        parser.add_argument(
            "--analyze",
            "-a",
            type=str,
            help="Analyze a specific name for spirit information",
        )

        # Information options
        parser.add_argument(
            "--list-spirits",
            action="store_true",
            help="List all available animal spirits",
        )
        parser.add_argument(
            "--list-styles",
            action="store_true",
            help="List all available naming styles",
        )

        # Output options
        parser.add_argument(
            "--verbose",
            "-v",
            action="store_true",
            help="Show detailed information about generated names",
        )
        parser.add_argument(
            "--quiet",
            "-q",
            action="store_true",
            help="Suppress all output except generated names",
        )

        return parser

    def list_spirits(self) -> None:
        """List all available animal spirits."""
        spirits = self.name_analyzer.get_available_spirits()
        print("Available Animal Spirits:")
        print("=" * 30)
        for i, spirit in enumerate(spirits, 1):
            print(f"{i:2d}. {spirit}")

    def list_styles(self) -> None:
        """List all available naming styles."""
        styles = self.name_analyzer.get_available_styles()
        print("Available Naming Styles:")
        print("=" * 25)
        for i, style in enumerate(styles, 1):
            print(f"{i}. {style}")

    def analyze_name(self, name: str) -> None:
        """Analyze a specific name."""
        info = self.name_analyzer.get_spirit_info(name)
        breakdown = self.name_analyzer.analyze_name_breakdown(name)
        validation = self.name_analyzer.validate_name_format(name)

        print(f"Name Analysis: {name}")
        print("=" * (len(name) + 15))
        print(f"Spirit: {info['spirit']}")
        print(f"Style: {info['style']}")
        print(f"Components: {breakdown['component_count']}")
        print(f"Length: {breakdown['name_length']} characters")
        print(f"Words: {breakdown['word_count']}")

        if info["components"]:
            print("\nComponent Breakdown:")
            for component in info["components"]:
                print(f"  - {component}")

        if validation["errors"]:
            print("\nValidation Errors:")
            for error in validation["errors"]:
                print(f"  ❌ {error}")

        if validation["warnings"]:
            print("\nValidation Warnings:")
            for warning in validation["warnings"]:
                print(f"  ⚠️  {warning}")

        if validation["is_valid"] and not validation["warnings"]:
            print("\n✅ Name validation passed!")

    def generate_names(
        self, count: int, spirit: str | None, style: str | None, verbose: bool
    ) -> None:
        """Generate and display names."""
        names = self.batch_generator.generate_batch(count, spirit, style)

        if verbose:
            print("Generated Robot Names:")
            print("=" * 50)
            for i, name in enumerate(names, 1):
                info = self.name_analyzer.get_spirit_info(name)
                print(f"{i:2d}. {name}")
                print(f"    Spirit: {info['spirit']} | Style: {info['style']}")
                if info["components"]:
                    print(f"    Components: {', '.join(info['components'])}")
                print()
        else:
            for name in names:
                print(name)

    def run(self, args: list[str] | None = None) -> int:
        """Run the CLI with given arguments."""
        parser = self.create_parser()
        parsed_args = parser.parse_args(args)

        # Handle information requests
        if parsed_args.list_spirits:
            self.list_spirits()
            return 0

        if parsed_args.list_styles:
            self.list_styles()
            return 0

        # Handle analysis request
        if parsed_args.analyze:
            self.analyze_name(parsed_args.analyze)
            return 0

        # Generate names
        self.generate_names(
            parsed_args.count,
            parsed_args.spirit,
            parsed_args.style,
            parsed_args.verbose,
        )

        return 0


def main() -> int:
    """Main entry point for the CLI."""
    cli = ReynardCLI()
    return cli.run()


if __name__ == "__main__":
    sys.exit(main())
