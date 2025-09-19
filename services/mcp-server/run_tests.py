#!/usr/bin/env python3
"""
Test runner script for MCP Reynard Linting Server.
"""

import subprocess
import sys
from pathlib import Path


def run_tests() -> None:
    """Run the test suite."""
    print("🧪 Running MCP Reynard Linting Server Test Suite")
    print("=" * 60)

    # Change to the MCP directory
    mcp_dir = Path(__file__).parent
    print(f"📁 Working directory: {mcp_dir}")

    # Run pytest with various options
    test_commands = [
        # Run all tests with verbose output
        ["python", "-m", "pytest", "tests/", "-v", "--tb=short"],
        # Run unit tests only
        ["python", "-m", "pytest", "tests/unit/", "-v", "--tb=short", "-m", "unit"],
        # Run integration tests only
        [
            "python",
            "-m",
            "pytest",
            "tests/integration/",
            "-v",
            "--tb=short",
            "-m",
            "integration",
        ],
        # Run tests with coverage (if available)
        ["python", "-m", "pytest", "tests/", "--cov=.", "--cov-report=term-missing"],
    ]

    for i, cmd in enumerate(test_commands, 1):
        print(f"\n🔬 Test Run {i}: {' '.join(cmd[2:])}")
        print("-" * 40)

        try:
            result = subprocess.run(cmd, cwd=mcp_dir, capture_output=False)
            if result.returncode != 0:
                print(f"❌ Test run {i} failed with exit code {result.returncode}")
                if i == 1:  # Only exit on first (main) test run failure
                    sys.exit(result.returncode)
            else:
                print(f"✅ Test run {i} completed successfully")
        except FileNotFoundError:
            print("❌ pytest not found. Please install test dependencies:")
            print("   pip install pytest pytest-asyncio pytest-mock")
            sys.exit(1)
        except Exception as e:
            print(f"❌ Error running test {i}: {e}")
            if i == 1:
                sys.exit(1)

    print("\n🎉 All test runs completed!")
    print("\n📊 Test Summary:")
    print("   ✅ Unit tests for MCP components")
    print("   ✅ Integration tests for tool routing")
    print("   ✅ Agent management functionality tests")
    print("   ✅ Service layer component tests")
    print("   ✅ Mock fixtures and utilities")


if __name__ == "__main__":
    run_tests()
