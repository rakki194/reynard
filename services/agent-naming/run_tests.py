#!/usr/bin/env python3
"""
Test Runner for Agent Naming Library
===================================

Comprehensive test runner for the Reynard Agent Naming library.
Provides different test execution modes and reporting options.
"""

import argparse
import sys

import pytest


def main():
    """Main test runner function."""
    parser = argparse.ArgumentParser(
        description="Run tests for the Reynard Agent Naming library",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run_tests.py                    # Run all tests
  python run_tests.py --unit             # Run only unit tests
  python run_tests.py --integration      # Run only integration tests
  python run_tests.py --fast             # Run fast tests only
  python run_tests.py --coverage         # Run with coverage report
  python run_tests.py --verbose          # Run with verbose output
  python run_tests.py --parallel         # Run tests in parallel
  python run_tests.py --specific test_types.py  # Run specific test file
        """,
    )

    # Test selection options
    parser.add_argument("--unit", action="store_true", help="Run only unit tests")
    parser.add_argument(
        "--integration", action="store_true", help="Run only integration tests"
    )
    parser.add_argument(
        "--fast", action="store_true", help="Run only fast tests (exclude slow tests)"
    )
    parser.add_argument(
        "--specific", type=str, help="Run specific test file (e.g., test_types.py)"
    )

    # Output options
    parser.add_argument(
        "--verbose", "-v", action="store_true", help="Run with verbose output"
    )
    parser.add_argument(
        "--quiet", "-q", action="store_true", help="Run with minimal output"
    )
    parser.add_argument(
        "--coverage", action="store_true", help="Run with coverage report"
    )
    parser.add_argument(
        "--html-report", action="store_true", help="Generate HTML test report"
    )

    # Execution options
    parser.add_argument(
        "--parallel",
        "-n",
        type=int,
        metavar="NUM",
        help="Run tests in parallel with NUM workers",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=300,
        help="Test timeout in seconds (default: 300)",
    )
    parser.add_argument(
        "--maxfail", type=int, metavar="NUM", help="Stop after NUM failures"
    )

    # Debug options
    parser.add_argument("--debug", action="store_true", help="Run with debug output")
    parser.add_argument(
        "--pdb", action="store_true", help="Drop into debugger on failures"
    )
    parser.add_argument(
        "--tb",
        choices=["short", "long", "auto", "line", "native"],
        default="short",
        help="Traceback format (default: short)",
    )

    args = parser.parse_args()

    # Build pytest arguments
    pytest_args = []

    # Test selection
    if args.unit:
        pytest_args.extend(["-m", "unit"])
    elif args.integration:
        pytest_args.extend(["-m", "integration"])

    if args.fast:
        pytest_args.extend(["-m", "not slow"])

    if args.specific:
        pytest_args.append(f"tests/{args.specific}")
    else:
        pytest_args.append("tests/")

    # Output options
    if args.verbose:
        pytest_args.append("-v")
    elif args.quiet:
        pytest_args.append("-q")

    if args.coverage:
        pytest_args.extend(
            [
                "--cov=reynard_agent_naming",
                "--cov-report=term-missing",
                "--cov-report=html:htmlcov",
            ]
        )

    if args.html_report:
        pytest_args.extend(["--html=test_report.html", "--self-contained-html"])

    # Execution options
    if args.parallel:
        pytest_args.extend(["-n", str(args.parallel)])

    # Note: timeout is handled by pytest.ini configuration

    if args.maxfail:
        pytest_args.extend(["--maxfail", str(args.maxfail)])

    # Debug options
    if args.debug:
        pytest_args.extend(["-s", "--log-cli-level=DEBUG"])

    if args.pdb:
        pytest_args.append("--pdb")

    pytest_args.extend(["--tb", args.tb])

    # Add default options
    pytest_args.extend(
        ["--strict-markers", "--disable-warnings", "--color=yes", "--durations=10"]
    )

    print("🦊 Running Reynard Agent Naming Tests")
    print("=" * 50)
    print(f"Command: pytest {' '.join(pytest_args)}")
    print("=" * 50)

    # Run tests
    exit_code = pytest.main(pytest_args)

    if exit_code == 0:
        print("\n✅ All tests passed!")
    else:
        print(f"\n❌ Tests failed with exit code {exit_code}")

    return exit_code


if __name__ == "__main__":
    sys.exit(main())
