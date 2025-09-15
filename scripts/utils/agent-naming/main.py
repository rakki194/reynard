#!/usr/bin/env python3
"""
Reynard Robot Name Generator - Main Entry Point
===============================================

Main entry point for the Reynard robot name generator system.
This replaces the old monolithic robot-name-generator.py with a clean,
modular architecture.

Usage:
    python main.py                                    # Generate one random name
    python main.py --count 5                          # Generate 5 random names
    python main.py --spirit fox                       # Generate fox-themed name
    python main.py --style foundation                 # Generate Foundation-style name
    python main.py --analyze "Vulpine-Sage-13"        # Analyze a specific name
    python main.py --list-spirits                     # List all available spirits
    python main.py --list-styles                      # List all available styles
"""

import sys

from cli import main as cli_main


def main() -> int:
    """Main entry point for the Reynard name generator."""
    return cli_main()


if __name__ == "__main__":
    sys.exit(main())
