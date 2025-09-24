#!/usr/bin/env python3
"""Test runner for semantic search functionality.

This script runs comprehensive tests for the semantic search implementation
including unit tests, integration tests, and performance tests.
"""

import subprocess
import sys
from pathlib import Path


def run_command(cmd: list[str], cwd: Path | None = None) -> int:
    """Run a command and return the exit code."""
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd, check=False)
    return result.returncode


def install_test_dependencies() -> int:
    """Install test dependencies."""
    print("🦊 Installing test dependencies...")
    return run_command(
        [sys.executable, "-m", "pip", "install", "-r", "requirements-test.txt"],
    )


def run_unit_tests() -> int:
    """Run unit tests."""
    print("🦦 Running unit tests...")
    return run_command(
        [
            sys.executable,
            "-m",
            "pytest",
            "tests/test_semantic_search.py::TestNaturalLanguageProcessor",
            "tests/test_semantic_search.py::TestEmbeddingService",
            "tests/test_semantic_search.py::TestEnhancedSearchService",
            "-v",
            "--tb=short",
        ],
    )


def run_integration_tests() -> int:
    """Run integration tests."""
    print("🐺 Running integration tests...")
    return run_command(
        [
            sys.executable,
            "-m",
            "pytest",
            "tests/test_semantic_search.py::TestSearchIntegration",
            "tests/test_api_endpoints.py",
            "tests/test_mcp_tools.py",
            "-v",
            "--tb=short",
        ],
    )


def run_all_tests() -> int:
    """Run all tests."""
    print("🦊 Running all tests...")
    return run_command(
        [sys.executable, "-m", "pytest", "tests/", "-v", "--tb=short", "--durations=10"],
    )


def run_coverage_tests() -> int:
    """Run tests with coverage."""
    print("🦦 Running tests with coverage...")
    return run_command(
        [
            sys.executable,
            "-m",
            "pytest",
            "tests/",
            "--cov=app",
            "--cov-report=html",
            "--cov-report=term-missing",
            "-v",
        ],
    )


def run_performance_tests() -> int:
    """Run performance tests."""
    print("🐺 Running performance tests...")
    return run_command(
        [
            sys.executable,
            "-m",
            "pytest",
            "tests/",
            "--benchmark-only",
            "--benchmark-sort=mean",
            "-v",
        ],
    )


def main():
    """Main test runner."""
    print("🦊🦦🐺 Reynard Semantic Search Test Suite")
    print("=" * 50)

    # Change to backend directory
    backend_dir = Path(__file__).parent
    import os

    os.chdir(backend_dir)

    # Parse command line arguments
    if len(sys.argv) > 1:
        test_type = sys.argv[1].lower()
    else:
        test_type = "all"

    exit_code = 0

    try:
        if test_type == "install":
            exit_code = install_test_dependencies()
        elif test_type == "unit":
            exit_code = run_unit_tests()
        elif test_type == "integration":
            exit_code = run_integration_tests()
        elif test_type == "coverage":
            exit_code = run_coverage_tests()
        elif test_type == "performance":
            exit_code = run_performance_tests()
        elif test_type == "all":
            # Install dependencies first
            install_exit = install_test_dependencies()
            if install_exit != 0:
                print("❌ Failed to install test dependencies")
                return install_exit

            # Run all tests
            exit_code = run_all_tests()
        else:
            print(f"❌ Unknown test type: {test_type}")
            print(
                "Available options: install, unit, integration, coverage, performance, all",
            )
            return 1

    except KeyboardInterrupt:
        print("\n🦊 Test run interrupted by user")
        return 130
    except Exception as e:
        print(f"❌ Test runner error: {e}")
        return 1

    if exit_code == 0:
        print("\n✅ All tests passed!")
    else:
        print(f"\n❌ Tests failed with exit code: {exit_code}")

    return exit_code


if __name__ == "__main__":
    sys.exit(main())
