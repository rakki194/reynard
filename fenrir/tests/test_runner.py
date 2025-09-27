"""
Test runner for Fenrir profiling and debugging features.

This script runs all the tests for the Fenrir profiling system and provides
a comprehensive test report.
"""

import pytest
import sys
import os
from pathlib import Path

# Add the project root to the path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

def run_all_tests():
    """Run all Fenrir tests and return the results."""
    test_dir = Path(__file__).parent

    # List of test files to run
    test_files = [
        "test_profiler.py",
        "test_fuzzy_profiling.py",
        "test_tools.py",
        "test_profile_cli.py",
        "test_main_module.py"
    ]

    # Run each test file
    results = {}
    for test_file in test_files:
        test_path = test_dir / test_file
        if test_path.exists():
            print(f"\n{'='*60}")
            print(f"Running tests in {test_file}")
            print(f"{'='*60}")

            try:
                # Run pytest on the specific test file
                result = pytest.main([str(test_path), "-v", "--tb=short"])
                results[test_file] = result

                if result == 0:
                    print(f"✅ {test_file} - All tests passed")
                else:
                    print(f"❌ {test_file} - Some tests failed")

            except Exception as e:
                print(f"❌ {test_file} - Error running tests: {e}")
                results[test_file] = -1
        else:
            print(f"⚠️  {test_file} - Test file not found")
            results[test_file] = -1

    return results

def run_specific_test_category(category):
    """Run tests for a specific category."""
    test_dir = Path(__file__).parent

    category_tests = {
        "profiler": ["test_profiler.py"],
        "fuzzy": ["test_fuzzy_profiling.py"],
        "tools": ["test_tools.py"],
        "cli": ["test_profile_cli.py"],
        "main": ["test_main_module.py"],
        "all": ["test_profiler.py", "test_fuzzy_profiling.py", "test_tools.py",
                "test_profile_cli.py", "test_main_module.py"]
    }

    if category not in category_tests:
        print(f"Unknown test category: {category}")
        print(f"Available categories: {', '.join(category_tests.keys())}")
        return

    test_files = category_tests[category]
    results = {}

    for test_file in test_files:
        test_path = test_dir / test_file
        if test_path.exists():
            print(f"\n{'='*60}")
            print(f"Running {category} tests in {test_file}")
            print(f"{'='*60}")

            try:
                result = pytest.main([str(test_path), "-v", "--tb=short"])
                results[test_file] = result

                if result == 0:
                    print(f"✅ {test_file} - All tests passed")
                else:
                    print(f"❌ {test_file} - Some tests failed")

            except Exception as e:
                print(f"❌ {test_file} - Error running tests: {e}")
                results[test_file] = -1
        else:
            print(f"⚠️  {test_file} - Test file not found")
            results[test_file] = -1

    return results

def print_test_summary(results):
    """Print a summary of test results."""
    print(f"\n{'='*60}")
    print("TEST SUMMARY")
    print(f"{'='*60}")

    total_tests = len(results)
    passed_tests = sum(1 for result in results.values() if result == 0)
    failed_tests = total_tests - passed_tests

    print(f"Total test files: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {failed_tests}")

    if failed_tests > 0:
        print(f"\nFailed test files:")
        for test_file, result in results.items():
            if result != 0:
                print(f"  - {test_file} (exit code: {result})")

    print(f"\nOverall result: {'✅ ALL TESTS PASSED' if failed_tests == 0 else '❌ SOME TESTS FAILED'}")

def main():
    """Main test runner function."""
    import argparse

    parser = argparse.ArgumentParser(description="Fenrir Test Runner")
    parser.add_argument("--category", default="all",
                       choices=["profiler", "fuzzy", "tools", "cli", "main", "all"],
                       help="Test category to run")
    parser.add_argument("--verbose", "-v", action="store_true",
                       help="Verbose output")

    args = parser.parse_args()

    print("🦊 FENRIR TEST RUNNER")
    print("=" * 60)
    print(f"Running tests for category: {args.category}")
    print(f"Project root: {project_root}")
    print(f"Test directory: {Path(__file__).parent}")

    if args.category == "all":
        results = run_all_tests()
    else:
        results = run_specific_test_category(args.category)

    print_test_summary(results)

    # Exit with appropriate code
    failed_tests = sum(1 for result in results.values() if result != 0)
    sys.exit(failed_tests)

if __name__ == "__main__":
    main()
