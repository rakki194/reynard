#!/usr/bin/env python3
"""
Python validation script for Reynard framework pre-commit hooks.
This script runs comprehensive Python code quality checks.
"""

import os
import subprocess
import sys
from typing import List, Tuple


class Colors:
    """ANSI color codes for terminal output."""

    RED = "\033[0;31m"
    GREEN = "\033[0;32m"
    YELLOW = "\033[1;33m"
    BLUE = "\033[0;34m"
    PURPLE = "\033[0;35m"
    CYAN = "\033[0;36m"
    WHITE = "\033[1;37m"
    NC = "\033[0m"  # No Color


def print_colored(message: str, color: str = Colors.NC) -> None:
    """Print a colored message to stdout."""
    print(f"{color}{message}{Colors.NC}")


def run_command(cmd: List[str], description: str) -> Tuple[bool, str]:
    """
    Run a command and return success status and output.

    Args:
        cmd: Command to run as list of strings
        description: Human-readable description of the command

    Returns:
        Tuple of (success: bool, output: str)
    """
    try:
        print_colored(f"🦊 Running {description}...", Colors.BLUE)

        # Use bash to source the virtual environment
        bash_cmd = ["bash", "-c", f"source ~/venv/bin/activate && {' '.join(cmd)}"]

        result = subprocess.run(bash_cmd, capture_output=True, text=True, check=False)

        if result.returncode == 0:
            print_colored(f"✅ {description} passed", Colors.GREEN)
            return True, result.stdout
        else:
            print_colored(f"❌ {description} failed", Colors.RED)
            return False, result.stderr
    except FileNotFoundError as e:
        print_colored(f"❌ Command not found: {e}", Colors.RED)
        return False, str(e)
    except Exception as e:
        print_colored(f"❌ Error running {description}: {e}", Colors.RED)
        return False, str(e)


def check_python_files() -> List[str]:
    """Get list of staged Python files."""
    try:
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
            capture_output=True,
            text=True,
            check=True,
        )

        python_files = [
            f for f in result.stdout.strip().split("\n") if f and f.endswith(".py")
        ]

        return python_files
    except subprocess.CalledProcessError:
        return []


def _check_formatting(python_files: List[str]) -> bool:
    """Check code formatting with Black."""
    success, output = run_command(
        ["black", "--check", "--diff"] + python_files, "Black formatting check"
    )
    if not success:
        print_colored("💡 Run 'black .' to fix formatting issues", Colors.YELLOW)
        print(output)
        return False
    return True


def _check_import_sorting(python_files: List[str]) -> bool:
    """Check import sorting with isort."""
    success, output = run_command(
        ["isort", "--check-only", "--diff"] + python_files,
        "isort import sorting check",
    )
    if not success:
        print_colored("💡 Run 'isort .' to fix import sorting", Colors.YELLOW)
        print(output)
        return False
    return True


def _check_linting(python_files: List[str]) -> bool:
    """Check code linting with Flake8."""
    success, output = run_command(["flake8"] + python_files, "Flake8 linting")
    if not success:
        print(output)
        return False
    return True


def _get_typed_files(python_files: List[str]) -> List[str]:
    """Get list of files that likely contain type hints."""
    typed_files = []
    for file in python_files:
        try:
            with open(file, "r", encoding="utf-8") as f:
                content = f.read()
                if any(
                    keyword in content for keyword in ["def ", "class ", "->", ": "]
                ):
                    typed_files.append(file)
        except (IOError, UnicodeDecodeError):
            continue
    return typed_files


def _check_type_hints(typed_files: List[str]) -> None:
    """Check type hints with MyPy (non-blocking)."""
    if not typed_files:
        return

    success, output = run_command(
        ["mypy", "--no-error-summary"] + typed_files, "MyPy type checking"
    )
    if not success:
        print(output)
        print_colored("⚠️  Type checking issues found (non-blocking)", Colors.YELLOW)


def _check_security(python_files: List[str]) -> None:
    """Check security issues with Bandit (non-blocking)."""
    success, output = run_command(
        ["bandit", "-r", "-f", "txt"] + python_files, "Bandit security check"
    )
    if not success:
        print(output)
        print_colored("⚠️  Security issues found (non-blocking)", Colors.YELLOW)


def _check_file_lengths(python_files: List[str]) -> bool:
    """
    Check Python file line counts against modularity standards.
    
    Similar to TypeScript setup:
    - Source files: max 250 lines
    - Test files: max 300 lines (more lenient for test files)
    """
    violations_found = False
    
    for file_path in python_files:
        if not os.path.exists(file_path):
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            # Count non-empty, non-comment lines (similar to TypeScript logic)
            code_lines = []
            in_multiline_comment = False
            
            for line in lines:
                stripped = line.strip()
                
                # Skip empty lines
                if not stripped:
                    continue
                    
                # Handle single-line comments
                if stripped.startswith('#'):
                    continue
                    
                # Handle multi-line comments (docstrings)
                if '"""' in stripped or "'''" in stripped:
                    # Simple heuristic: if line starts with quotes, it's likely a docstring
                    if stripped.startswith('"""') or stripped.startswith("'''"):
                        if stripped.count('"""') == 1 or stripped.count("'''") == 1:
                            in_multiline_comment = not in_multiline_comment
                        continue
                    elif in_multiline_comment:
                        continue
                
                # Skip lines that are just closing docstring quotes
                if in_multiline_comment and ('"""' in stripped or "'''" in stripped):
                    in_multiline_comment = False
                    continue
                    
                if in_multiline_comment:
                    continue
                    
                code_lines.append(line)
            
            line_count = len(code_lines)
            
            # Determine file type and max lines
            is_test_file = (
                'test_' in file_path or 
                '_test.py' in file_path or 
                '/test/' in file_path or 
                '/tests/' in file_path
            )
            
            if is_test_file:
                max_lines = 300
                file_type = "test"
            else:
                max_lines = 250
                file_type = "source"
            
            if line_count > max_lines:
                if not violations_found:
                    print_colored("❌ Python modularity violations detected:", Colors.RED)
                    violations_found = True
                
                print_colored(
                    f"   {file_path}: {line_count} lines (max: {max_lines} for {file_type} files)",
                    Colors.RED
                )
                
        except (IOError, UnicodeDecodeError) as e:
            print_colored(f"⚠️  Could not read {file_path}: {e}", Colors.YELLOW)
            continue
    
    if violations_found:
        print_colored("\n💡 Tips:", Colors.YELLOW)
        print_colored("   - Split large files into smaller, focused modules", Colors.YELLOW)
        print_colored("   - Use the 250-line limit for source files", Colors.YELLOW)
        print_colored("   - Test files can be up to 300 lines", Colors.YELLOW)
        print_colored("   - Extract classes and functions into separate modules", Colors.YELLOW)
        return False
    
    return True


def validate_python_files(python_files: List[str]) -> bool:
    """
    Validate Python files with comprehensive checks.

    Args:
        python_files: List of Python file paths to validate

    Returns:
        True if all validations pass, False otherwise
    """
    if not python_files:
        print_colored("✅ No Python files staged for commit", Colors.GREEN)
        return True

    print_colored(
        f"🐺 Found {len(python_files)} Python file(s) to validate:", Colors.PURPLE
    )
    for file in python_files:
        print_colored(f"  - {file}", Colors.CYAN)
    print()

    # Run blocking checks
    checks = [
        _check_formatting,
        _check_import_sorting,
        _check_linting,
        _check_file_lengths,
    ]

    all_passed = True
    for check in checks:
        if not check(python_files):
            all_passed = False

    # Run non-blocking checks
    typed_files = _get_typed_files(python_files)
    _check_type_hints(typed_files)
    _check_security(python_files)

    return all_passed


def main() -> int:
    """Main entry point for the Python validation script."""
    print_colored("🦊 Reynard Python Validation", Colors.WHITE)
    print_colored("=" * 50, Colors.CYAN)

    # Check if we're in a git repository
    try:
        subprocess.run(
            ["git", "rev-parse", "--git-dir"], capture_output=True, check=True
        )
    except subprocess.CalledProcessError:
        print_colored("❌ Not in a git repository", Colors.RED)
        return 1

    # Get staged Python files
    python_files = check_python_files()

    # Validate Python files
    if validate_python_files(python_files):
        print_colored("\n✅ All Python validations passed!", Colors.GREEN)
        return 0
    else:
        print_colored("\n❌ Python validation failed!", Colors.RED)
        print_colored("\n💡 Tips:", Colors.YELLOW)
        print_colored("  - Run 'black .' to fix formatting", Colors.YELLOW)
        print_colored("  - Run 'isort .' to fix import sorting", Colors.YELLOW)
        print_colored("  - Run 'flake8 .' to see all linting issues", Colors.YELLOW)
        print_colored(
            "  - Use 'git commit --no-verify' to skip checks (not recommended)",
            Colors.YELLOW,
        )
        return 1


if __name__ == "__main__":
    sys.exit(main())
