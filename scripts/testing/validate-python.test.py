#!/usr/bin/env python3
"""Test suite for validate-python.py

Tests the Python validation functionality including
file discovery, line counting, and validation logic.
"""

import os
import subprocess

# Import the validation functions
import sys
import tempfile
from unittest.mock import patch

import pytest

sys.path.insert(0, os.path.dirname(__file__))
from validate_python import (
    Colors,
    _check_file_lengths,
    _check_formatting,
    _check_import_sorting,
    _check_linting,
    _check_security,
    _check_type_hints,
    _get_typed_files,
    check_python_files,
    main,
    print_colored,
    run_command,
    validate_python_files,
)


class TestColors:
    """Test the Colors class."""

    def test_colors_are_defined(self):
        """Test that all color constants are defined."""
        assert hasattr(Colors, "RED")
        assert hasattr(Colors, "GREEN")
        assert hasattr(Colors, "YELLOW")
        assert hasattr(Colors, "BLUE")
        assert hasattr(Colors, "PURPLE")
        assert hasattr(Colors, "CYAN")
        assert hasattr(Colors, "WHITE")
        assert hasattr(Colors, "NC")

    def test_colors_are_strings(self):
        """Test that all colors are strings."""
        assert isinstance(Colors.RED, str)
        assert isinstance(Colors.GREEN, str)
        assert isinstance(Colors.YELLOW, str)
        assert isinstance(Colors.BLUE, str)
        assert isinstance(Colors.PURPLE, str)
        assert isinstance(Colors.CYAN, str)
        assert isinstance(Colors.WHITE, str)
        assert isinstance(Colors.NC, str)


class TestPrintColored:
    """Test the print_colored function."""

    def test_print_colored_default(self, capsys):
        """Test print_colored with default color."""
        print_colored("Test message")
        captured = capsys.readouterr()
        assert "Test message" in captured.out

    def test_print_colored_with_color(self, capsys):
        """Test print_colored with specific color."""
        print_colored("Test message", Colors.RED)
        captured = capsys.readouterr()
        assert "Test message" in captured.out
        assert Colors.RED in captured.out


class TestRunCommand:
    """Test the run_command function."""

    @patch("subprocess.run")
    def test_run_command_success(self, mock_run):
        """Test successful command execution."""
        mock_run.return_value.returncode = 0
        mock_run.return_value.stdout = "Success output"
        mock_run.return_value.stderr = ""

        success, output = run_command(["echo", "test"], "test command")

        assert success is True
        assert output == "Success output"
        mock_run.assert_called_once()

    @patch("subprocess.run")
    def test_run_command_failure(self, mock_run):
        """Test failed command execution."""
        mock_run.return_value.returncode = 1
        mock_run.return_value.stdout = ""
        mock_run.return_value.stderr = "Error output"

        success, output = run_command(["false"], "test command")

        assert success is False
        assert output == "Error output"

    @patch("subprocess.run")
    def test_run_command_file_not_found(self, mock_run):
        """Test command not found error."""
        mock_run.side_effect = FileNotFoundError("Command not found")

        success, output = run_command(["nonexistent"], "test command")

        assert success is False
        assert "Command not found" in output


class TestCheckPythonFiles:
    """Test the check_python_files function."""

    @patch("subprocess.run")
    def test_check_python_files_success(self, mock_run):
        """Test successful git command execution."""
        mock_run.return_value.returncode = 0
        mock_run.return_value.stdout = "file1.py\nfile2.py\nfile3.txt\n"

        files = check_python_files()

        assert files == ["file1.py", "file2.py"]
        mock_run.assert_called_once_with(
            ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
            capture_output=True,
            text=True,
            check=True,
        )

    @patch("subprocess.run")
    def test_check_python_files_git_error(self, mock_run):
        """Test git command failure."""
        mock_run.side_effect = subprocess.CalledProcessError(1, "git")

        files = check_python_files()

        assert files == []

    @patch("subprocess.run")
    def test_check_python_files_no_files(self, mock_run):
        """Test when no files are staged."""
        mock_run.return_value.returncode = 0
        mock_run.return_value.stdout = ""

        files = check_python_files()

        assert files == []


class TestCheckFormatting:
    """Test the _check_formatting function."""

    @patch("validate_python.run_command")
    def test_check_formatting_success(self, mock_run_command):
        """Test successful formatting check."""
        mock_run_command.return_value = (True, "Formatting is correct")

        result = _check_formatting(["test.py"])

        assert result is True
        mock_run_command.assert_called_once()

    @patch("validate_python.run_command")
    def test_check_formatting_failure(self, mock_run_command):
        """Test failed formatting check."""
        mock_run_command.return_value = (False, "Formatting issues found")

        result = _check_formatting(["test.py"])

        assert result is False


class TestCheckImportSorting:
    """Test the _check_import_sorting function."""

    @patch("validate_python.run_command")
    def test_check_import_sorting_success(self, mock_run_command):
        """Test successful import sorting check."""
        mock_run_command.return_value = (True, "Imports are sorted")

        result = _check_import_sorting(["test.py"])

        assert result is True
        mock_run_command.assert_called_once()

    @patch("validate_python.run_command")
    def test_check_import_sorting_failure(self, mock_run_command):
        """Test failed import sorting check."""
        mock_run_command.return_value = (False, "Import sorting issues")

        result = _check_import_sorting(["test.py"])

        assert result is False


class TestCheckLinting:
    """Test the _check_linting function."""

    @patch("validate_python.run_command")
    def test_check_linting_success(self, mock_run_command):
        """Test successful linting check."""
        mock_run_command.return_value = (True, "No linting issues")

        result = _check_linting(["test.py"])

        assert result is True
        mock_run_command.assert_called_once()

    @patch("validate_python.run_command")
    def test_check_linting_failure(self, mock_run_command):
        """Test failed linting check."""
        mock_run_command.return_value = (False, "Linting issues found")

        result = _check_linting(["test.py"])

        assert result is False


class TestGetTypedFiles:
    """Test the _get_typed_files function."""

    def test_get_typed_files_with_definitions(self):
        """Test getting files with function/class definitions."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write("def test_function():\n    pass\n\nclass TestClass:\n    pass\n")
            temp_file = f.name

        try:
            files = _get_typed_files([temp_file])
            assert temp_file in files
        finally:
            os.unlink(temp_file)

    def test_get_typed_files_without_definitions(self):
        """Test getting files without function/class definitions."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write("# Just a comment\nprint('hello')\n")
            temp_file = f.name

        try:
            files = _get_typed_files([temp_file])
            assert temp_file in files  # Should still be included
        finally:
            os.unlink(temp_file)

    def test_get_typed_files_nonexistent(self):
        """Test handling nonexistent files."""
        files = _get_typed_files(["nonexistent.py"])
        assert files == []


class TestCheckTypeHints:
    """Test the _check_type_hints function."""

    @patch("validate_python.run_command")
    def test_check_type_hints_success(self, mock_run_command):
        """Test successful type checking."""
        mock_run_command.return_value = (True, "Type checking passed")

        _check_type_hints(["test.py"])

        mock_run_command.assert_called_once()

    @patch("validate_python.run_command")
    def test_check_type_hints_failure(self, mock_run_command):
        """Test failed type checking."""
        mock_run_command.return_value = (False, "Type checking issues")

        _check_type_hints(["test.py"])

        mock_run_command.assert_called_once()

    def test_check_type_hints_empty_list(self):
        """Test type checking with empty file list."""
        _check_type_hints([])
        # Should not raise any errors


class TestCheckSecurity:
    """Test the _check_security function."""

    @patch("validate_python.run_command")
    def test_check_security_success(self, mock_run_command):
        """Test successful security check."""
        mock_run_command.return_value = (True, "No security issues")

        _check_security(["test.py"])

        mock_run_command.assert_called_once()

    @patch("validate_python.run_command")
    def test_check_security_failure(self, mock_run_command):
        """Test failed security check."""
        mock_run_command.return_value = (False, "Security issues found")

        _check_security(["test.py"])

        mock_run_command.assert_called_once()


class TestCheckFileLengths:
    """Test the _check_file_lengths function."""

    def test_check_file_lengths_source_file_under_limit(self):
        """Test source file under 250 line limit."""
        content = "def test():\n    pass\n" * 100  # ~200 lines

        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write(content)
            temp_file = f.name

        try:
            result = _check_file_lengths([temp_file])
            assert result is True
        finally:
            os.unlink(temp_file)

    def test_check_file_lengths_source_file_over_limit(self):
        """Test source file over 250 line limit."""
        content = "def test():\n    pass\n" * 200  # ~400 lines

        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write(content)
            temp_file = f.name

        try:
            result = _check_file_lengths([temp_file])
            assert result is False
        finally:
            os.unlink(temp_file)

    def test_check_file_lengths_test_file_under_limit(self):
        """Test test file under 300 line limit."""
        content = "def test():\n    pass\n" * 150  # ~300 lines

        with tempfile.NamedTemporaryFile(
            mode="w", suffix="test_.py", delete=False,
        ) as f:
            f.write(content)
            temp_file = f.name

        try:
            result = _check_file_lengths([temp_file])
            assert result is True
        finally:
            os.unlink(temp_file)

    def test_check_file_lengths_test_file_over_limit(self):
        """Test test file over 300 line limit."""
        content = "def test():\n    pass\n" * 200  # ~400 lines

        with tempfile.NamedTemporaryFile(
            mode="w", suffix="test_.py", delete=False,
        ) as f:
            f.write(content)
            temp_file = f.name

        try:
            result = _check_file_lengths([temp_file])
            assert result is False
        finally:
            os.unlink(temp_file)

    def test_check_file_lengths_with_comments_and_docstrings(self):
        """Test line counting with comments and docstrings."""
        content = (
            '''"""
This is a docstring
that spans multiple lines
"""

def test_function():
    """
    Another docstring
    """
    # This is a comment
    pass

# Another comment
def another_function():
    pass
'''
            * 50
        )  # Multiply to get more lines

        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write(content)
            temp_file = f.name

        try:
            result = _check_file_lengths([temp_file])
            # Should pass because comments and docstrings are not counted
            assert result is True
        finally:
            os.unlink(temp_file)

    def test_check_file_lengths_nonexistent_file(self):
        """Test handling nonexistent files."""
        result = _check_file_lengths(["nonexistent.py"])
        assert result is True  # Should not fail for nonexistent files


class TestValidatePythonFiles:
    """Test the validate_python_files function."""

    def test_validate_python_files_empty_list(self):
        """Test validation with empty file list."""
        result = validate_python_files([])
        assert result is True

    @patch("validate_python._check_formatting")
    @patch("validate_python._check_import_sorting")
    @patch("validate_python._check_linting")
    @patch("validate_python._check_file_lengths")
    def test_validate_python_files_all_passes(
        self, mock_lengths, mock_linting, mock_imports, mock_formatting,
    ):
        """Test validation when all checks pass."""
        mock_formatting.return_value = True
        mock_imports.return_value = True
        mock_linting.return_value = True
        mock_lengths.return_value = True

        result = validate_python_files(["test.py"])
        assert result is True

    @patch("validate_python._check_formatting")
    @patch("validate_python._check_import_sorting")
    @patch("validate_python._check_linting")
    @patch("validate_python._check_file_lengths")
    def test_validate_python_files_formatting_fails(
        self, mock_lengths, mock_linting, mock_imports, mock_formatting,
    ):
        """Test validation when formatting check fails."""
        mock_formatting.return_value = False
        mock_imports.return_value = True
        mock_linting.return_value = True
        mock_lengths.return_value = True

        result = validate_python_files(["test.py"])
        assert result is False

    @patch("validate_python._check_formatting")
    @patch("validate_python._check_import_sorting")
    @patch("validate_python._check_linting")
    @patch("validate_python._check_file_lengths")
    def test_validate_python_files_imports_fail(
        self, mock_lengths, mock_linting, mock_imports, mock_formatting,
    ):
        """Test validation when import sorting check fails."""
        mock_formatting.return_value = True
        mock_imports.return_value = False
        mock_linting.return_value = True
        mock_lengths.return_value = True

        result = validate_python_files(["test.py"])
        assert result is False

    @patch("validate_python._check_formatting")
    @patch("validate_python._check_import_sorting")
    @patch("validate_python._check_linting")
    @patch("validate_python._check_file_lengths")
    def test_validate_python_files_linting_fails(
        self, mock_lengths, mock_linting, mock_imports, mock_formatting,
    ):
        """Test validation when linting check fails."""
        mock_formatting.return_value = True
        mock_imports.return_value = True
        mock_linting.return_value = False
        mock_lengths.return_value = True

        result = validate_python_files(["test.py"])
        assert result is False

    @patch("validate_python._check_formatting")
    @patch("validate_python._check_import_sorting")
    @patch("validate_python._check_linting")
    @patch("validate_python._check_file_lengths")
    def test_validate_python_files_lengths_fail(
        self, mock_lengths, mock_linting, mock_imports, mock_formatting,
    ):
        """Test validation when file length check fails."""
        mock_formatting.return_value = True
        mock_imports.return_value = True
        mock_linting.return_value = True
        mock_lengths.return_value = False

        result = validate_python_files(["test.py"])
        assert result is False


class TestMain:
    """Test the main function."""

    @patch("validate_python.subprocess.run")
    @patch("validate_python.check_python_files")
    @patch("validate_python.validate_python_files")
    def test_main_success(self, mock_validate, mock_check_files, mock_run):
        """Test successful main execution."""
        mock_run.return_value.returncode = 0
        mock_check_files.return_value = ["test.py"]
        mock_validate.return_value = True

        result = main()
        assert result == 0

    @patch("validate_python.subprocess.run")
    @patch("validate_python.check_python_files")
    @patch("validate_python.validate_python_files")
    def test_main_validation_fails(self, mock_validate, mock_check_files, mock_run):
        """Test main execution when validation fails."""
        mock_run.return_value.returncode = 0
        mock_check_files.return_value = ["test.py"]
        mock_validate.return_value = False

        result = main()
        assert result == 1

    @patch("validate_python.subprocess.run")
    def test_main_not_git_repo(self, mock_run):
        """Test main execution when not in a git repository."""
        mock_run.side_effect = subprocess.CalledProcessError(1, "git")

        result = main()
        assert result == 1


class TestIntegration:
    """Integration tests for the validation system."""

    def test_complete_validation_workflow(self):
        """Test a complete validation workflow with real files."""
        # Create a test Python file
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write(
                '''"""
Test module for validation.
"""

def hello_world():
    """Print hello world."""
    print("Hello, World!")


class TestClass:
    """A test class."""
    
    def __init__(self):
        """Initialize the test class."""
        self.value = 42
    
    def get_value(self):
        """Get the value."""
        return self.value
''',
            )
            temp_file = f.name

        try:
            # Test file length validation
            result = _check_file_lengths([temp_file])
            assert result is True

            # Test typed files detection
            typed_files = _get_typed_files([temp_file])
            assert temp_file in typed_files

        finally:
            os.unlink(temp_file)

    def test_file_length_counting_accuracy(self):
        """Test that file length counting is accurate."""
        # Create a file with exactly 250 lines of code
        lines = []
        for i in range(250):
            lines.append(f"def function_{i}():\n    pass")

        content = "\n\n".join(lines)  # Add blank lines between functions

        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write(content)
            temp_file = f.name

        try:
            result = _check_file_lengths([temp_file])
            # Should pass because we have exactly 250 lines of code
            assert result is True

            # Now add one more function to exceed the limit
            with open(temp_file, "a") as f:
                f.write("\n\ndef function_250():\n    pass")

            result = _check_file_lengths([temp_file])
            # Should fail because we now have 251 lines of code
            assert result is False

        finally:
            os.unlink(temp_file)


if __name__ == "__main__":
    pytest.main([__file__])
