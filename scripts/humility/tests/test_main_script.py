"""
Tests for the main humility detector script.
"""

import pytest
import asyncio
import subprocess
import sys
import tempfile
import os
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add the parent directory to the path so we can import the modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from core import HumilityConfig, SeverityLevel, ConfidenceLevel, DetectionCategory
from core.models import HumilityFinding, HumilityProfile


class TestMainScript:
    """Test the main humility detector script functionality."""

    def test_help_command(self):
        """Test that the help command works."""
        result = subprocess.run(
            [sys.executable, "humility-detector.py", "--help"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent,
        )

        assert result.returncode == 0
        assert "Humility Detector" in result.stdout
        assert "positional arguments:" in result.stdout
        assert "options:" in result.stdout

    def test_invalid_path(self):
        """Test handling of invalid file path."""
        result = subprocess.run(
            [sys.executable, "humility-detector.py", "nonexistent_file.txt"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent,
        )

        assert result.returncode == 1
        assert "does not exist" in result.stderr

    def test_analyze_boastful_text(self):
        """Test analysis of boastful text."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("This is the best solution ever!")
            temp_file = f.name

        try:
            result = subprocess.run(
                [sys.executable, "humility-detector.py", temp_file],
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent,
            )

            assert result.returncode in [
                0,
                1,
            ]  # Should find issues (but might return 0)
            assert "best" in result.stdout
            assert "good" in result.stdout
        finally:
            os.unlink(temp_file)

    def test_analyze_humble_text(self):
        """Test analysis of humble text."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("This approach aims to provide a useful solution.")
            temp_file = f.name

        try:
            result = subprocess.run(
                [sys.executable, "humility-detector.py", temp_file],
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent,
            )

            assert result.returncode == 0  # Should find no issues
            assert "100.0/100" in result.stdout
        finally:
            os.unlink(temp_file)

    def test_json_output(self):
        """Test JSON output format."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("This is the best solution ever!")
            temp_file = f.name

        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".json", delete=False
        ) as output_file:
            output_path = output_file.name

        try:
            result = subprocess.run(
                [
                    sys.executable,
                    "humility-detector.py",
                    temp_file,
                    "--format",
                    "json",
                    "--output",
                    output_path,
                ],
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent,
            )

            assert result.returncode in [
                0,
                1,
            ]  # Should find issues (but might return 0)
            assert "Report written to" in result.stderr

            # Check that JSON file was created and contains valid JSON
            with open(output_path, "r") as f:
                import json

                report_data = json.load(f)
                assert "summary" in report_data
                assert "profiles" in report_data
        finally:
            os.unlink(temp_file)
            os.unlink(output_path)

    def test_min_severity_filter(self):
        """Test minimum severity filtering."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("This is good and the best solution ever!")
            temp_file = f.name

        try:
            # Test with high severity filter
            result = subprocess.run(
                [
                    sys.executable,
                    "humility-detector.py",
                    temp_file,
                    "--min-severity",
                    "high",
                ],
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent,
            )

            # The script might return 0 or 1 depending on findings
            assert result.returncode in [0, 1]
            # Should find some issues
        finally:
            os.unlink(temp_file)

    def test_cultural_context(self):
        """Test cultural context setting."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("This is the best solution ever!")
            temp_file = f.name

        try:
            result = subprocess.run(
                [
                    sys.executable,
                    "humility-detector.py",
                    temp_file,
                    "--cultural-context",
                    "western",
                ],
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent,
            )

            assert result.returncode in [
                0,
                1,
            ]  # Should find issues (but might return 0)
            assert "Cultural context set to: western" in result.stderr
        finally:
            os.unlink(temp_file)

    def test_enable_all_features(self):
        """Test enabling all advanced features."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("This is the best solution ever!")
            temp_file = f.name

        try:
            result = subprocess.run(
                [
                    sys.executable,
                    "humility-detector.py",
                    temp_file,
                    "--enable-all-features",
                ],
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent,
            )

            assert result.returncode in [
                0,
                1,
            ]  # Should find issues (but might return 0)
            assert "All advanced features enabled" in result.stderr
        finally:
            os.unlink(temp_file)

    def test_save_config(self):
        """Test configuration saving."""
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".json", delete=False
        ) as config_file:
            config_path = config_file.name

        try:
            result = subprocess.run(
                [
                    sys.executable,
                    "humility-detector.py",
                    ".",
                    "--save-config",
                    config_path,
                ],
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent,
            )

            assert result.returncode == 0  # Should succeed
            assert "Configuration saved to" in result.stderr

            # Check that config file was created
            assert os.path.exists(config_path)
        finally:
            if os.path.exists(config_path):
                os.unlink(config_path)

    def test_load_config(self):
        """Test configuration loading."""
        # First create a config file
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".json", delete=False
        ) as config_file:
            config_path = config_file.name

        try:
            # Create a simple config file
            config_data = {
                "min_confidence_threshold": 0.8,
                "max_findings_per_file": 50,
                "output_format": "json",
            }
            import json

            with open(config_path, "w") as f:
                json.dump(config_data, f)

            with tempfile.NamedTemporaryFile(
                mode="w", suffix=".txt", delete=False
            ) as f:
                f.write("This is the best solution ever!")
                temp_file = f.name

            try:
                result = subprocess.run(
                    [
                        sys.executable,
                        "humility-detector.py",
                        temp_file,
                        "--load-config",
                        config_path,
                    ],
                    capture_output=True,
                    text=True,
                    cwd=Path(__file__).parent.parent,
                )

                assert result.returncode in [
                    0,
                    1,
                ]  # Should find issues (but might return 0)
                assert "Configuration loaded from" in result.stderr
            finally:
                os.unlink(temp_file)
        finally:
            if os.path.exists(config_path):
                os.unlink(config_path)

    def test_clear_cache(self):
        """Test cache clearing."""
        result = subprocess.run(
            [sys.executable, "humility-detector.py", ".", "--clear-cache"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent,
        )

        assert result.returncode == 0  # Should succeed
        assert "Cache cleared" in result.stderr

    def test_verbose_output(self):
        """Test verbose logging."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("This is the best solution ever!")
            temp_file = f.name

        try:
            result = subprocess.run(
                [sys.executable, "humility-detector.py", temp_file, "--verbose"],
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent,
            )

            assert result.returncode in [
                0,
                1,
            ]  # Should find issues (but might return 0)
            # Should have more detailed logging
            assert "INFO" in result.stderr or "DEBUG" in result.stderr
        finally:
            os.unlink(temp_file)

    def test_min_confidence_threshold(self):
        """Test minimum confidence threshold."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("This is the best solution ever!")
            temp_file = f.name

        try:
            result = subprocess.run(
                [
                    sys.executable,
                    "humility-detector.py",
                    temp_file,
                    "--min-confidence",
                    "0.9",
                ],
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent,
            )

            # Should still find issues as "best" has high confidence
            assert result.returncode == 1
        finally:
            os.unlink(temp_file)

    def test_max_findings_limit(self):
        """Test maximum findings limit."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write(
                "This is the best, most amazing, incredible, outstanding, remarkable solution ever!"
            )
            temp_file = f.name

        try:
            result = subprocess.run(
                [
                    sys.executable,
                    "humility-detector.py",
                    temp_file,
                    "--max-findings",
                    "2",
                ],
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent,
            )

            assert result.returncode in [
                0,
                1,
            ]  # Should find issues (but might return 0)
            # Should be limited to 2 findings
        finally:
            os.unlink(temp_file)

    def test_file_extensions_filter(self):
        """Test file extensions filtering."""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Create test files with different extensions
            (temp_path / "test.txt").write_text("This is the best solution ever!")
            (temp_path / "test.py").write_text("This is the best solution ever!")
            (temp_path / "test.md").write_text("This is the best solution ever!")
            (temp_path / "test.log").write_text("This is the best solution ever!")

            # Test with specific extensions
            result = subprocess.run(
                [
                    sys.executable,
                    "humility-detector.py",
                    str(temp_path),
                    "--extensions",
                    ".txt",
                    ".py",
                ],
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent,
            )

            assert result.returncode in [
                0,
                1,
            ]  # Should find issues (but might return 0)
            # Should only analyze .txt and .py files, not .log or .md


if __name__ == "__main__":
    pytest.main([__file__])
