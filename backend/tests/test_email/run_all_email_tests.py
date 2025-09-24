#!/usr/bin/env python3
"""Comprehensive Test Runner for Advanced Email Features.

This script runs all email-related tests and provides detailed reporting.
"""

import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

import pytest


def run_email_tests():
    """Run all email-related tests with comprehensive reporting."""
    print("🦊 Reynard Advanced Email Features Test Suite")
    print("=" * 60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # Test files to run
    test_files = [
        "test_email_analytics_service.py",
        "test_email_encryption_service.py",
        "test_calendar_integration_service.py",
        "test_ai_email_response_service.py",
        "test_multi_account_service.py",
        "test_advanced_email_routes.py",
    ]

    # Get the test directory
    test_dir = Path(__file__).parent

    # Run tests with detailed output
    pytest_args = [
        "-v",  # Verbose output
        "--tb=short",  # Short traceback format
        "--strict-markers",  # Strict marker checking
        "--disable-warnings",  # Disable warnings for cleaner output
        "--color=yes",  # Colored output
        "--durations=10",  # Show 10 slowest tests
        "--junitxml=test_results.xml",  # JUnit XML output
        "--html=test_report.html",  # HTML report
        "--self-contained-html",  # Self-contained HTML
    ]

    # Add test files
    for test_file in test_files:
        test_path = test_dir / test_file
        if test_path.exists():
            pytest_args.append(str(test_path))
        else:
            print(f"⚠️  Warning: Test file {test_file} not found")

    print("Running tests with the following configuration:")
    print(f"  - Test directory: {test_dir}")
    print(f"  - Test files: {len(test_files)}")
    print(f"  - Pytest args: {' '.join(pytest_args)}")
    print()

    # Run the tests
    start_time = time.time()
    exit_code = pytest.main(pytest_args)
    end_time = time.time()

    # Calculate duration
    duration = end_time - start_time

    print()
    print("=" * 60)
    print("TEST EXECUTION SUMMARY")
    print("=" * 60)
    print(f"Total execution time: {duration:.2f} seconds")
    print(f"Exit code: {exit_code}")

    if exit_code == 0:
        print("✅ All tests passed successfully!")
    else:
        print("❌ Some tests failed. Check the output above for details.")

    # Generate summary report
    generate_summary_report(test_dir, duration, exit_code)

    return exit_code


def generate_summary_report(test_dir, duration, exit_code):
    """Generate a summary report of test execution."""
    report_data = {
        "test_suite": "Reynard Advanced Email Features",
        "execution_time": datetime.now().isoformat(),
        "duration_seconds": duration,
        "exit_code": exit_code,
        "status": "PASSED" if exit_code == 0 else "FAILED",
        "test_files": [
            "test_email_analytics_service.py",
            "test_email_encryption_service.py",
            "test_calendar_integration_service.py",
            "test_ai_email_response_service.py",
            "test_multi_account_service.py",
            "test_advanced_email_routes.py",
        ],
        "features_tested": [
            "Email Analytics - Comprehensive metrics and insights",
            "Email Encryption - PGP/SMIME support with key management",
            "Calendar Integration - Meeting extraction and scheduling",
            "AI-Powered Responses - LLM integration for automated replies",
            "Multi-Account Support - Account management and isolation",
            "API Routes - RESTful endpoints for all features",
        ],
        "test_categories": {
            "unit_tests": "Service layer functionality",
            "integration_tests": "API endpoint integration",
            "error_handling_tests": "Exception and error scenarios",
            "data_persistence_tests": "Storage and retrieval",
            "authentication_tests": "User authentication and authorization",
            "performance_tests": "Response times and caching",
        },
    }

    # Save JSON report
    report_file = test_dir / "test_summary.json"
    with open(report_file, "w") as f:
        json.dump(report_data, f, indent=2)

    print(f"📊 Summary report saved to: {report_file}")
    print(f"📈 HTML report available at: {test_dir / 'test_report.html'}")
    print(f"📋 JUnit XML report at: {test_dir / 'test_results.xml'}")


def main():
    """Main entry point for the test runner."""
    # Change to the test directory
    test_dir = Path(__file__).parent
    os.chdir(test_dir)

    # Add the backend directory to Python path
    backend_dir = test_dir.parent.parent
    sys.path.insert(0, str(backend_dir))

    # Run the tests
    exit_code = run_email_tests()

    # Exit with the same code as pytest
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
