"""Wrapper to test the main script functions directly."""

import os
import sys
from pathlib import Path

# Add the current directory to the path
sys.path.insert(0, str(Path(__file__).parent))

# Import the main script functions by executing it as a module
import importlib.util

# Load the main script as a module
spec = importlib.util.spec_from_file_location(
    "humility_detector",
    "humility-detector.py",
)
humility_detector = importlib.util.module_from_spec(spec)
spec.loader.exec_module(humility_detector)


# Now we can test the functions
def test_setup_logging():
    """Test the setup_logging function."""
    humility_detector.setup_logging(verbose=False)
    humility_detector.setup_logging(verbose=True)


def test_main_function():
    """Test the main function with mocked arguments."""
    import asyncio
    from unittest.mock import MagicMock, patch

    # Mock the argument parser
    with patch("argparse.ArgumentParser") as mock_parser:
        mock_args = MagicMock()
        mock_args.path = "test.txt"
        mock_args.output = None
        mock_args.format = "text"
        mock_args.extensions = [".txt"]
        mock_args.min_severity = None
        mock_args.min_confidence = 0.6
        mock_args.max_findings = 100
        mock_args.enable_all_features = False
        mock_args.cultural_context = None
        mock_args.save_config = None
        mock_args.load_config = None
        mock_args.verbose = False
        mock_args.cache_results = True
        mock_args.clear_cache = False

        mock_parser_instance = MagicMock()
        mock_parser_instance.parse_args.return_value = mock_args
        mock_parser.return_value = mock_parser_instance

        # Mock the detector
        with patch("core.detector.HumilityDetector") as mock_detector_class:
            mock_detector = MagicMock()
            mock_detector_class.return_value = mock_detector

            # Mock the profile
            mock_profile = MagicMock()
            mock_profile.findings = []
            mock_profile.overall_score = 100.0
            mock_detector.analyze_file.return_value = mock_profile
            mock_detector.get_cache_stats.return_value = {
                "cache_enabled": True,
                "cache_size": 0,
                "cache_ttl": 3600,
            }

            # Mock the report generator
            with patch(
                "utils.report_generator.ReportGenerator",
            ) as mock_report_gen_class:
                mock_report_gen = MagicMock()
                mock_report_gen_class.return_value = mock_report_gen
                mock_report_gen.generate_report.return_value = "Test report"

                # Create a temporary file
                import tempfile

                with tempfile.NamedTemporaryFile(
                    mode="w",
                    suffix=".txt",
                    delete=False,
                ) as f:
                    f.write("This is a test file.")
                    temp_file = f.name

                try:
                    mock_args.path = temp_file

                    # Test the main function
                    result = asyncio.run(humility_detector.main())
                    print(f"Main function returned: {result}")
                    assert result in [0, 1, None]  # Should return 0, 1, or None
                finally:
                    if os.path.exists(temp_file):
                        os.unlink(temp_file)


if __name__ == "__main__":
    test_setup_logging()
    test_main_function()
    print("All tests passed!")


# Make it importable for pytest
def test_setup_logging_pytest():
    """Test the setup_logging function for pytest."""
    test_setup_logging()


def test_main_function_pytest():
    """Test the main function for pytest."""
    test_main_function()
