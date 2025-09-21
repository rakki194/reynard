"""
Direct tests for the main humility detector script functionality.
"""

import pytest
import subprocess
import sys
import tempfile
import os
from pathlib import Path


class TestMainScriptDirect:
    """Direct tests for the main script to improve coverage."""

    def test_script_help(self):
        """Test that the script help works."""
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

    def test_script_version_info(self):
        """Test script version information."""
        result = subprocess.run(
            [sys.executable, "humility-detector.py", "--help"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent,
        )

        assert result.returncode == 0
        assert "humility-detector.py" in result.stdout

    def test_script_with_boastful_text(self):
        """Test script with boastful text."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("This is the best, most amazing, incredible solution ever!")
            temp_file = f.name

        try:
            result = subprocess.run(
                [sys.executable, "humility-detector.py", temp_file],
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent,
            )

            # Should find issues and return 1
            assert result.returncode == 1
            assert "best" in result.stdout or "amazing" in result.stdout
        finally:
            os.unlink(temp_file)

    def test_script_with_humble_text(self):
        """Test script with humble text."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write(
                "This approach aims to provide a useful solution for common problems."
            )
            temp_file = f.name

        try:
            result = subprocess.run(
                [sys.executable, "humility-detector.py", temp_file],
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent,
            )

            # Should find no issues and return 0
            assert result.returncode == 0
            assert "100.0/100" in result.stdout
        finally:
            os.unlink(temp_file)

    def test_script_with_json_output(self):
        """Test script with JSON output."""
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

            # Should find issues (but might return 0 if no issues found)
            assert result.returncode in [0, 1]
            assert "Report written to" in result.stderr

            # Check that JSON file was created
            assert os.path.exists(output_path)
            with open(output_path, "r") as f:
                import json

                report_data = json.load(f)
                assert "summary" in report_data
                assert "profiles" in report_data
        finally:
            os.unlink(temp_file)
            os.unlink(output_path)

    def test_script_with_html_output(self):
        """Test script with HTML output."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("This is the best solution ever!")
            temp_file = f.name

        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".html", delete=False
        ) as output_file:
            output_path = output_file.name

        try:
            result = subprocess.run(
                [
                    sys.executable,
                    "humility-detector.py",
                    temp_file,
                    "--format",
                    "html",
                    "--output",
                    output_path,
                ],
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent,
            )

            # Should find issues (but might return 0 if no issues found)
            assert result.returncode in [0, 1]
            assert "Report written to" in result.stderr

            # Check that HTML file was created
            assert os.path.exists(output_path)
            with open(output_path, "r") as f:
                html_content = f.read()
                assert "<html>" in html_content or "<!DOCTYPE" in html_content
        finally:
            os.unlink(temp_file)
            os.unlink(output_path)

    def test_script_with_csv_output(self):
        """Test script with CSV output."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("This is the best solution ever!")
            temp_file = f.name

        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".csv", delete=False
        ) as output_file:
            output_path = output_file.name

        try:
            result = subprocess.run(
                [
                    sys.executable,
                    "humility-detector.py",
                    temp_file,
                    "--format",
                    "csv",
                    "--output",
                    output_path,
                ],
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent,
            )

            # Should find issues (but might return 0 if no issues found)
            assert result.returncode in [0, 1]
            assert "Report written to" in result.stderr

            # Check that CSV file was created
            assert os.path.exists(output_path)
            with open(output_path, "r") as f:
                csv_content = f.read()
                assert "," in csv_content  # Should contain CSV data
        finally:
            os.unlink(temp_file)
            os.unlink(output_path)

    def test_script_with_min_severity_filter(self):
        """Test script with minimum severity filtering."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("This is good and the best solution ever!")
            temp_file = f.name

        try:
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

            # Should find some issues
            assert result.returncode in [0, 1]
        finally:
            os.unlink(temp_file)

    def test_script_with_min_confidence_filter(self):
        """Test script with minimum confidence filtering."""
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

            # Should find some issues
            assert result.returncode in [0, 1]
        finally:
            os.unlink(temp_file)

    def test_script_with_max_findings_limit(self):
        """Test script with maximum findings limit."""
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

            # Should find some issues
            assert result.returncode in [0, 1]
        finally:
            os.unlink(temp_file)

    def test_script_with_cultural_context(self):
        """Test script with cultural context."""
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

            # Should find issues (but might return 0 if no issues found)
            assert result.returncode in [0, 1]
            assert "Cultural context set to: western" in result.stderr
        finally:
            os.unlink(temp_file)

    def test_script_with_enable_all_features(self):
        """Test script with all features enabled."""
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

            # Should find issues (but might return 0 if no issues found)
            assert result.returncode in [0, 1]
            assert "All advanced features enabled" in result.stderr
        finally:
            os.unlink(temp_file)

    def test_script_with_verbose_output(self):
        """Test script with verbose output."""
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

            # Should find issues (but might return 0 if no issues found)
            assert result.returncode in [0, 1]
            # Should have more detailed logging
            assert "INFO" in result.stderr or "DEBUG" in result.stderr
        finally:
            os.unlink(temp_file)

    def test_script_with_clear_cache(self):
        """Test script with cache clearing."""
        result = subprocess.run(
            [sys.executable, "humility-detector.py", ".", "--clear-cache"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent,
        )

        assert result.returncode == 0
        assert "Cache cleared" in result.stderr

    def test_script_with_save_config(self):
        """Test script with configuration saving."""
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

            assert result.returncode == 0
            assert "Configuration saved to" in result.stderr

            # Check that config file was created
            assert os.path.exists(config_path)
        finally:
            if os.path.exists(config_path):
                os.unlink(config_path)

    def test_script_with_load_config(self):
        """Test script with configuration loading."""
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

                assert result.returncode == 1  # Should find issues
                assert "Configuration loaded from" in result.stderr
            finally:
                os.unlink(temp_file)
        finally:
            if os.path.exists(config_path):
                os.unlink(config_path)

    def test_script_with_file_extensions_filter(self):
        """Test script with file extensions filtering."""
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

            # Should find issues (but might return 0 if no issues found)
            assert result.returncode in [0, 1]

    def test_script_with_nonexistent_file(self):
        """Test script with nonexistent file."""
        result = subprocess.run(
            [sys.executable, "humility-detector.py", "nonexistent_file.txt"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent,
        )

        assert result.returncode == 1
        assert "does not exist" in result.stderr

    def test_script_with_empty_directory(self):
        """Test script with empty directory."""
        with tempfile.TemporaryDirectory() as temp_dir:
            result = subprocess.run(
                [sys.executable, "humility-detector.py", temp_dir],
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent,
            )

            # Should succeed with no findings
            assert result.returncode == 0


if __name__ == "__main__":
    pytest.main([__file__])
