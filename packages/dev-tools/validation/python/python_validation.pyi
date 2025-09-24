"""Type stub for python_validation module.
"""

# Color constants
CYAN: str
GREEN: str
RED: str
WHITE: str
YELLOW: str
BLUE: str
PURPLE: str
NC: str

# Functions
def print_colored(message: str, color: str = NC) -> None:
    """Print a colored message to stdout."""

def validate_python_files(python_files: list[str]) -> bool:
    """Validate Python files with comprehensive checks."""

def run_command(cmd: list[str], description: str) -> tuple[bool, str]:
    """Run a command and return success status and output."""

def check_formatting(python_files: list[str]) -> bool:
    """Check code formatting with Black."""

def check_import_sorting(python_files: list[str]) -> bool:
    """Check import sorting with isort."""

def check_linting(python_files: list[str]) -> bool:
    """Check code linting with flake8."""

def check_security(python_files: list[str]) -> bool:
    """Check security issues with bandit."""

def check_type_hints(python_files: list[str]) -> bool:
    """Check type hints with mypy."""

def check_file_lengths(python_files: list[str]) -> bool:
    """Check file length limits."""

def get_typed_files(python_files: list[str]) -> list[str]:
    """Get list of files that should be type checked."""
