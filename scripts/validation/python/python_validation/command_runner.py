#!/usr/bin/env python3
"""
Command execution utilities for Reynard validation scripts.
"""

import subprocess

from .colors import BLUE, GREEN, RED, print_colored


def run_command(cmd: list[str], description: str) -> tuple[bool, str]:
    """
    Run a command and return success status and output.

    Args:
        cmd: Command to run as list of strings
        description: Human-readable description of the command

    Returns:
        Tuple of (success: bool, output: str)
    """
    try:
        print_colored(f"🦊 Running {description}...", BLUE)

        # Use bash to source the virtual environment
        bash_cmd = ["bash", "-c", f"source ~/venv/bin/activate && {' '.join(cmd)}"]

        result = subprocess.run(bash_cmd, capture_output=True, text=True, check=False)

        if result.returncode == 0:
            print_colored(f"✅ {description} passed", GREEN)
            return True, result.stdout

        print_colored(f"❌ {description} failed", RED)
        return False, result.stderr
    except FileNotFoundError as e:
        print_colored(f"❌ Command not found: {e}", RED)
        return False, str(e)
    except (OSError, subprocess.SubprocessError) as e:
        print_colored(f"❌ Error running {description}: {e}", RED)
        return False, str(e)
