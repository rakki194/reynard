#!/usr/bin/env python3
"""Test runner for RAG service tests.

This script runs all the RAG-related tests with proper configuration and reporting.
"""

import os
import subprocess
import sys
from pathlib import Path


def run_tests():
    """Run all RAG service tests."""
    # Get the backend directory
    backend_dir = Path(__file__).parent.parent

    # Change to backend directory
    os.chdir(backend_dir)

    # Test files to run
    test_files = [
        "tests/test_services/test_rag_core.py",
        "tests/test_services/test_rag_advanced.py",
        "tests/test_services/test_rag_integration.py",
        "tests/test_rag_phase2.py",
        "tests/test_rag_phase4.py",
    ]

    # Run pytest with verbose output
    cmd = [
        sys.executable,
        "-m",
        "pytest",
        "-v",  # Verbose output
        "--tb=short",  # Short traceback format
        "--color=yes",  # Colored output
        "--durations=10",  # Show 10 slowest tests
        "-x",  # Stop on first failure
    ]

    # Add test files
    cmd.extend(test_files)

    print("🦦 Running RAG service tests...")
    print(f"Command: {' '.join(cmd)}")
    print("-" * 60)

    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"\n❌ RAG tests failed with exit code {e.returncode}")
        return e.returncode
    except (OSError, ValueError) as e:
        print(f"\n💥 Error running tests: {e}")
        return 1
    else:
        print("\n✅ All RAG tests passed!")
        return 0


def run_specific_test(test_file: str):
    """Run a specific test file."""
    backend_dir = Path(__file__).parent.parent
    os.chdir(backend_dir)

    cmd = [
        sys.executable,
        "-m",
        "pytest",
        "-v",
        "--tb=short",
        "--color=yes",
        f"tests/{test_file}",
    ]

    print(f"🦦 Running specific test: {test_file}")
    print(f"Command: {' '.join(cmd)}")
    print("-" * 60)

    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Test {test_file} failed with exit code {e.returncode}")
        return e.returncode
    else:
        print(f"\n✅ Test {test_file} passed!")
        return 0


def main():
    """Main entry point."""
    if len(sys.argv) > 1:
        # Run specific test file
        test_file = sys.argv[1]
        return run_specific_test(test_file)
    # Run all tests
    return run_tests()


if __name__ == "__main__":
    sys.exit(main())
