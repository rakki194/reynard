#!/usr/bin/env python3
"""
Color utilities for Reynard validation scripts.
"""

# ANSI color codes for terminal output
RED = "\033[0;31m"
GREEN = "\033[0;32m"
YELLOW = "\033[1;33m"
BLUE = "\033[0;34m"
PURPLE = "\033[0;35m"
CYAN = "\033[0;36m"
WHITE = "\033[1;37m"
NC = "\033[0m"  # No Color


def print_colored(message: str, color: str = NC) -> None:
    """Print a colored message to stdout."""
    print(f"{color}{message}{NC}")  # noqa: T201
