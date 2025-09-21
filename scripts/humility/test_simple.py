#!/usr/bin/env python3
"""
Simple test script for the humility detector.
"""

import os
import sys
from pathlib import Path

# Add the current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))


def test_basic_functionality():
    """Test basic functionality of the humility detector."""
    print("🦊 Testing Humility Detector...")

    try:
        # Test importing core modules
        from core import (
            ConfidenceLevel,
            DetectionCategory,
            HumilityConfig,
            SeverityLevel,
        )

        print("✅ Core modules imported successfully")

        # Test configuration
        config = HumilityConfig()
        print(
            f"✅ Configuration created: min_confidence={config.min_confidence_threshold}"
        )

        # Test enum values
        assert SeverityLevel.HIGH.value == "high"
        assert ConfidenceLevel.HIGH.value == "high"
        assert DetectionCategory.SUPERLATIVES.value == "superlatives"
        print("✅ Enums working correctly")

        # Test pattern analyzer
        from analyzers import PatternAnalyzer

        analyzer = PatternAnalyzer(config)
        print("✅ Pattern analyzer created")

        # Test basic analysis
        text = "This is the best solution ever!"
        findings = analyzer.analyze(text, "test.txt")
        print(f"✅ Analysis completed: found {len(findings)} issues")

        if findings:
            finding = findings[0]
            print(
                f"   - Found: '{finding.original_text}' → '{finding.suggested_replacement}'"
            )
            print(f"   - Category: {finding.category.value}")
            print(f"   - Severity: {finding.severity.value}")

        # Test text processor
        from utils import TextProcessor

        processor = TextProcessor(config)
        processed = processor.preprocess("This is a test with   spaces.")
        print(f"✅ Text processing: '{processed}'")

        # Test report generator
        from core.models import HumilityFinding, HumilityProfile
        from utils import ReportGenerator

        if findings:
            profile = HumilityProfile(
                overall_score=75.0,
                hexaco_honesty_humility=80.0,
                epistemic_humility=70.0,
                linguistic_humility=65.0,
                behavioral_humility=85.0,
                cultural_adaptation=90.0,
                findings=findings,
                recommendations=["Be more modest"],
                improvement_areas=["Reduce superlatives"],
                strengths=["Good collaboration"],
            )

            generator = ReportGenerator(config)
            report = generator._generate_text_report({"test.txt": profile})
            print("✅ Report generation successful")
            print(f"   Report length: {len(report)} characters")

        print("\n🎉 All basic tests passed!")
        return True

    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_command_line_interface():
    """Test the command line interface."""
    print("\n🦊 Testing Command Line Interface...")

    try:
        # Test basic help
        import subprocess

        result = subprocess.run(
            [sys.executable, "humility-detector.py", "--help"],
            capture_output=True,
            text=True,
            cwd=current_dir,
        )

        if result.returncode == 0:
            print("✅ Help command works")
        else:
            print(f"❌ Help command failed: {result.stderr}")
            return False

        # Test basic analysis
        test_text = "This is the best solution ever!"
        test_file = current_dir / "test_input.txt"
        test_file.write_text(test_text)

        try:
            result = subprocess.run(
                [sys.executable, "humility-detector.py", str(test_file)],
                capture_output=True,
                text=True,
                cwd=current_dir,
            )

            if result.returncode == 1:  # Should find issues
                print("✅ Command line analysis found issues (as expected)")
                print(f"   Output: {result.stdout[:200]}...")
            else:
                print(f"❌ Command line analysis failed: {result.stderr}")
                return False

        finally:
            test_file.unlink()

        print("🎉 Command line interface tests passed!")
        return True

    except Exception as e:
        print(f"❌ CLI test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def main():
    """Run all tests."""
    print("🦊 Humility Detector Test Suite")
    print("=" * 50)

    success = True

    # Test basic functionality
    if not test_basic_functionality():
        success = False

    # Test command line interface
    if not test_command_line_interface():
        success = False

    print("\n" + "=" * 50)
    if success:
        print("🎉 All tests passed! The humility detector is working correctly.")
        return 0
    else:
        print("❌ Some tests failed. Please check the output above.")
        return 1


if __name__ == "__main__":
    exit(main())
