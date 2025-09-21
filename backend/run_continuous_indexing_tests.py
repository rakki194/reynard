#!/usr/bin/env python3
"""
🐼 Panda Spirit Test Runner for Continuous Indexing

This script runs the continuous indexing tests with panda spirit and thoroughness.
It provides various test execution options and beautiful output.

Author: Ailuropoda-Sage-59 (Panda Spirit)
"""

import argparse
import importlib
import logging
import subprocess
import sys
from pathlib import Path

# Check if pytest-cov is available
HAS_PYTEST_COV = importlib.util.find_spec("pytest_cov") is not None

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def run_tests(test_type: str = "all", verbose: bool = True):
    """🐼 Run continuous indexing tests with panda spirit."""
    logger.info("🐼 *munches bamboo thoughtfully*")
    logger.info("Starting Continuous Indexing Tests with Panda Spirit...")
    logger.info("=" * 60)

    # Base pytest command
    cmd = ["python", "-m", "pytest"]

    # Add test path based on type
    if test_type == "all":
        cmd.append("tests/services/continuous_indexing/")
    elif test_type == "service":
        cmd.append(
            "tests/services/continuous_indexing/test_continuous_indexing_service.py"
        )
    elif test_type == "config":
        cmd.append(
            "tests/services/continuous_indexing/test_continuous_indexing_config.py"
        )
    else:
        logger.error("❌ Unknown test type: %s", test_type)
        return False

    # Add verbosity
    if verbose:
        cmd.extend(["-v", "--tb=short"])

    # Add panda spirit markers
    cmd.extend(["-m", "panda_spirit"])

    # Add coverage if available
    if HAS_PYTEST_COV:
        cmd.extend(
            ["--cov=app.services.continuous_indexing", "--cov-report=term-missing"]
        )
    else:
        logger.warning("📊 Coverage not available (pytest-cov not installed)")

    logger.info("🚀 Running command: %s", ' '.join(cmd))
    logger.info("=" * 60)

    # Run the tests
    try:
        result = subprocess.run(cmd, cwd=Path(__file__).parent, check=False)
    except (subprocess.SubprocessError, OSError):
        logger.exception("❌ Error running tests")
        return False
    else:
        return result.returncode == 0


def main():
    """🐼 Main test runner function."""
    parser = argparse.ArgumentParser(description="🐼 Run Continuous Indexing Tests")
    parser.add_argument(
        "--type",
        choices=["all", "service", "config"],
        default="all",
        help="Type of tests to run",
    )
    parser.add_argument("--quiet", action="store_true", help="Run tests quietly")

    args = parser.parse_args()

    success = run_tests(args.type, not args.quiet)

    if success:
        logger.info("\n🎉 *rolls around with satisfaction*")
        logger.info("All tests passed! Panda spirit is strong! 🐼")
    else:
        logger.error("\n😿 *munches bamboo sadly*")
        logger.error("Some tests failed. Time to investigate! 🐼")
        sys.exit(1)


if __name__ == "__main__":
    main()
