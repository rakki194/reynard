#!/usr/bin/env python3
"""Python validation script for Reynard framework pre-commit hooks.
This script runs comprehensive Python code quality checks.
"""

import subprocess
import sys

from validation.python.python_validation import (
    CYAN,
    GREEN,
    RED,
    WHITE,
    YELLOW,
    print_colored,
    validate_python_files,
)


def check_python_files() -> list[str]:
    """Get list of staged Python files."""
    try:
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
            capture_output=True,
            text=True,
            check=True,
        )

        return [f for f in result.stdout.strip().split("\n") if f and f.endswith(".py")]
    except subprocess.CalledProcessError:
        return []


def main() -> int:
    """Main entry point for the Python validation script."""
    print_colored("🦊 Reynard Python Validation", WHITE)
    print_colored("=" * 50, CYAN)

    # Check if we're in a git repository
    try:
        subprocess.run(
            ["git", "rev-parse", "--git-dir"], capture_output=True, check=True,
        )
    except subprocess.CalledProcessError:
        print_colored("❌ Not in a git repository", RED)
        return 1

    # Get staged Python files
    python_files = check_python_files()

    # Validate Python files
    if validate_python_files(python_files):
        print_colored("\n✅ All Python validations passed!", GREEN)
        return 0

    print_colored("\n❌ Python validation failed!", RED)
    print_colored("\n💡 Tips:", YELLOW)
    print_colored("  - Run 'black .' to fix formatting", YELLOW)
    print_colored("  - Run 'isort .' to fix import sorting", YELLOW)
    print_colored("  - Run 'flake8 .' to see all linting issues", YELLOW)
    print_colored(
        "  - Use 'git commit --no-verify' to skip checks (not recommended)",
        YELLOW,
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
