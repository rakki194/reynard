#!/usr/bin/env python3
"""
Python validation functions for Reynard framework pre-commit hooks.
"""

import os
from pathlib import Path

from .colors import CYAN, GREEN, PURPLE, RED, YELLOW, print_colored
from .command_runner import run_command


def check_formatting(python_files: list[str]) -> bool:
    """Check code formatting with Black."""
    success, output = run_command(
        ["black", "--check", "--diff", *python_files], "Black formatting check"
    )
    if not success:
        print_colored("💡 Run 'black .' to fix formatting issues", YELLOW)
        print(output)  # noqa: T201
        return False
    return True


def check_import_sorting(python_files: list[str]) -> bool:
    """Check import sorting with isort."""
    success, output = run_command(
        ["isort", "--check-only", "--diff", *python_files],
        "isort import sorting check",
    )
    if not success:
        print_colored("💡 Run 'isort .' to fix import sorting", YELLOW)
        print(output)  # noqa: T201
        return False
    return True


def check_linting(python_files: list[str]) -> bool:
    """Check code linting with Flake8."""
    success, output = run_command(["flake8", *python_files], "Flake8 linting")
    if not success:
        print(output)  # noqa: T201
        return False
    return True


def get_typed_files(python_files: list[str]) -> list[str]:
    """Get list of files that likely contain type hints."""
    typed_files = []
    for file in python_files:
        try:
            with Path(file).open(encoding="utf-8") as f:
                content = f.read()
                if any(
                    keyword in content for keyword in ["def ", "class ", "->", ": "]
                ):
                    typed_files.append(file)
        except (OSError, UnicodeDecodeError):
            continue
    return typed_files


def check_type_hints(typed_files: list[str]) -> None:
    """Check type hints with MyPy (non-blocking)."""
    if not typed_files:
        return

    success, output = run_command(
        ["mypy", "--no-error-summary", *typed_files], "MyPy type checking"
    )
    if not success:
        print(output)  # noqa: T201
        print_colored("⚠️  Type checking issues found (non-blocking)", YELLOW)


def check_security(python_files: list[str]) -> None:
    """Check security issues with Bandit (non-blocking)."""
    success, output = run_command(
        ["bandit", "-r", "-f", "txt", *python_files], "Bandit security check"
    )
    if not success:
        print(output)  # noqa: T201
        print_colored("⚠️  Security issues found (non-blocking)", YELLOW)


def _is_test_file(file_path: str) -> bool:
    """Check if a file is a test file."""
    return (
        "test_" in file_path
        or "_test.py" in file_path
        or "/test/" in file_path
        or "/tests/" in file_path
    )


def _is_empty_line(stripped: str) -> bool:
    """Check if a line is empty."""
    return not stripped


def _is_single_line_comment(stripped: str) -> bool:
    """Check if a line is a single-line comment."""
    return stripped.startswith("#")


def _handle_docstring_start(
    stripped: str, in_multiline_comment: bool
) -> tuple[bool, bool]:
    """Handle the start of a docstring and return (should_continue, new_multiline_state)."""
    if stripped.startswith('"""') or stripped.startswith("'''"):
        if stripped.count('"""') == 1 or stripped.count("'''") == 1:
            return True, not in_multiline_comment
        return True, in_multiline_comment
    return False, in_multiline_comment


def _handle_docstring_end(
    stripped: str, in_multiline_comment: bool
) -> tuple[bool, bool]:
    """Handle the end of a docstring and return (should_continue, new_multiline_state)."""
    if in_multiline_comment and ('"""' in stripped or "'''" in stripped):
        return True, False
    return False, in_multiline_comment


def _count_code_lines(lines: list[str]) -> int:
    """Count non-empty, non-comment lines in a file."""
    code_lines = []
    in_multiline_comment = False

    for line in lines:
        stripped = line.strip()

        # Skip empty lines
        if _is_empty_line(stripped):
            continue

        # Handle single-line comments
        if _is_single_line_comment(stripped):
            continue

        # Handle multi-line comments (docstrings)
        if '"""' in stripped or "'''" in stripped:
            should_continue, in_multiline_comment = _handle_docstring_start(
                stripped, in_multiline_comment
            )
            if should_continue:
                continue

            if in_multiline_comment:
                continue

            should_continue, in_multiline_comment = _handle_docstring_end(
                stripped, in_multiline_comment
            )
            if should_continue:
                continue

        if in_multiline_comment:
            continue

        code_lines.append(line)

    return len(code_lines)


def _check_single_file_length(file_path: str) -> tuple[bool, int, int, str]:
    """Check a single file's length and return violation info."""
    if not os.path.exists(file_path):
        return False, 0, 0, ""

    try:
        with Path(file_path).open(encoding="utf-8") as f:
            lines = f.readlines()

        line_count = _count_code_lines(lines)
        is_test = _is_test_file(file_path)

        if is_test:
            max_lines = 300
            file_type = "test"
        else:
            max_lines = 250
            file_type = "source"

        if line_count > max_lines:
            return True, line_count, max_lines, file_type
        return False, line_count, max_lines, file_type

    except (OSError, UnicodeDecodeError) as e:
        print_colored(f"⚠️  Could not read {file_path}: {e}", YELLOW)
        return False, 0, 0, ""


def check_file_lengths(python_files: list[str]) -> bool:
    """
    Check Python file line counts against modularity standards.

    Similar to TypeScript setup:
    - Source files: max 250 lines
    - Test files: max 300 lines (more lenient for test files)
    """
    violations_found = False

    for file_path in python_files:
        has_violation, line_count, max_lines, file_type = _check_single_file_length(
            file_path
        )

        if has_violation:
            if not violations_found:
                print_colored("❌ Python modularity violations detected:", RED)
                violations_found = True

            print_colored(
                f"   {file_path}: {line_count} lines (max: {max_lines} for {file_type} files)",
                RED,
            )

    if violations_found:
        print_colored("\n💡 Tips:", YELLOW)
        print_colored("   - Split large files into smaller, focused modules", YELLOW)
        print_colored("   - Use the 250-line limit for source files", YELLOW)
        print_colored("   - Test files can be up to 300 lines", YELLOW)
        print_colored(
            "   - Extract classes and functions into separate modules", YELLOW
        )
        return False

    return True


def validate_python_files(python_files: list[str]) -> bool:
    """
    Validate Python files with comprehensive checks.

    Args:
        python_files: list of Python file paths to validate

    Returns:
        True if all validations pass, False otherwise
    """
    if not python_files:
        print_colored("✅ No Python files staged for commit", GREEN)
        return True

    print_colored(f"🐺 Found {len(python_files)} Python file(s) to validate:", PURPLE)
    for file in python_files:
        print_colored(f"  - {file}", CYAN)
    print()  # noqa: T201

    # Run blocking checks
    checks = [
        check_formatting,
        check_import_sorting,
        check_linting,
        check_file_lengths,
    ]

    all_passed = True
    for check in checks:
        if not check(python_files):
            all_passed = False

    # Run non-blocking checks
    typed_files = get_typed_files(python_files)
    check_type_hints(typed_files)
    check_security(python_files)

    return all_passed
