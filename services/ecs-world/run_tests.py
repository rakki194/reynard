#!/usr/bin/env python3
"""
Comprehensive test runner for ECS Memory & Interaction System.
"""

import sys
import subprocess
import argparse
from pathlib import Path


def run_command(cmd: str, description: str) -> bool:
    """Run a command and return success status."""
    print(f"\n🦊 {description}")
    print(f"Running: {cmd}")
    print("-" * 60)
    
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=False)
        print(f"✅ {description} - PASSED")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - FAILED (exit code: {e.returncode})")
        return False


def main():
    """Main test runner function."""
    parser = argparse.ArgumentParser(description="ECS Memory & Interaction System Test Runner")
    parser.add_argument("--unit", action="store_true", help="Run unit tests only")
    parser.add_argument("--integration", action="store_true", help="Run integration tests only")
    parser.add_argument("--performance", action="store_true", help="Run performance tests only")
    parser.add_argument("--mcp", action="store_true", help="Run MCP integration tests only")
    parser.add_argument("--all", action="store_true", help="Run all tests (default)")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--coverage", action="store_true", help="Run with coverage")
    parser.add_argument("--fast", action="store_true", help="Skip slow tests")
    
    args = parser.parse_args()
    
    # Default to all tests if no specific test type is specified
    if not any([args.unit, args.integration, args.performance, args.mcp]):
        args.all = True
    
    # Build pytest command
    pytest_cmd = "python -m pytest"
    
    if args.verbose:
        pytest_cmd += " -v"
    
    if args.coverage:
        pytest_cmd += " --cov=reynard_ecs_world --cov-report=html --cov-report=term"
    
    if args.fast:
        pytest_cmd += " -m 'not slow'"
    
    # Test results tracking
    results = []
    
    print("🦊 ECS Memory & Interaction System - Comprehensive Test Suite")
    print("=" * 70)
    
    # Unit tests
    if args.unit or args.all:
        cmd = f"{pytest_cmd} tests/test_components.py tests/test_systems.py -m unit"
        success = run_command(cmd, "Unit Tests - Components and Systems")
        results.append(("Unit Tests", success))
    
    # Integration tests
    if args.integration or args.all:
        cmd = f"{pytest_cmd} tests/test_integration.py -m integration"
        success = run_command(cmd, "Integration Tests - Cross-System Interactions")
        results.append(("Integration Tests", success))
    
    # Performance tests
    if args.performance or args.all:
        if not args.fast:  # Only run performance tests if not in fast mode
            cmd = f"{pytest_cmd} tests/test_performance.py -m performance"
            success = run_command(cmd, "Performance Tests - Large Scale Operations")
            results.append(("Performance Tests", success))
        else:
            print("\n🦦 Skipping performance tests (--fast mode)")
            results.append(("Performance Tests", True))  # Skip in fast mode
    
    # MCP integration tests
    if args.mcp or args.all:
        cmd = f"{pytest_cmd} tests/test_mcp_integration.py -m mcp"
        success = run_command(cmd, "MCP Integration Tests - Tool Integration")
        results.append(("MCP Integration Tests", success))
    
    # Summary
    print("\n" + "=" * 70)
    print("🦊 TEST SUMMARY")
    print("=" * 70)
    
    passed = 0
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{test_name:<25} {status}")
        if success:
            passed += 1
    
    print("-" * 70)
    print(f"Total: {passed}/{total} test suites passed")
    
    if passed == total:
        print("\n🎉 All tests passed! The ECS Memory & Interaction System is ready for production!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test suite(s) failed. Please review the output above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
