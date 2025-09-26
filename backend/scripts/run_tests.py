#!/usr/bin/env python3
"""Comprehensive Test Runner for Reynard Backend

This script runs all tests with proper configuration and reporting.

Author: Reynard Development Team
Version: 1.0.0
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path


def run_command(cmd, description):
    """Run a command and handle errors."""
    print(f"\n🔍 {description}...")
    print(f"Running: {' '.join(cmd)}")

    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed")
        print(f"Exit code: {e.returncode}")
        if e.stdout:
            print("STDOUT:", e.stdout)
        if e.stderr:
            print("STDERR:", e.stderr)
        return False


def check_services():
    """Check if required services are running."""
    print("🔍 Checking required services...")

    services = {
        'Redis': ['redis-cli', 'ping'],
        'PostgreSQL': [
            'psql',
            '-h',
            'localhost',
            '-U',
            'reynard',
            '-d',
            'reynard_keys',
            '-c',
            'SELECT 1',
        ],
    }

    all_services_ok = True

    for service_name, cmd in services.items():
        try:
            result = subprocess.run(cmd, check=True, capture_output=True, text=True)
            print(f"✅ {service_name}: Running")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print(f"❌ {service_name}: Not available")
            all_services_ok = False

    return all_services_ok


def run_redis_tests():
    """Run Redis-specific tests."""
    cmd = [
        sys.executable,
        '-m',
        'pytest',
        'tests/redis/',
        '-v',
        '--tb=short',
        '-m',
        'redis',
    ]
    return run_command(cmd, "Redis Tests")


def run_postgres_tests():
    """Run PostgreSQL-specific tests."""
    cmd = [
        sys.executable,
        '-m',
        'pytest',
        'tests/postgres/',
        '-v',
        '--tb=short',
        '-m',
        'postgres',
    ]
    return run_command(cmd, "PostgreSQL Tests")


def run_auto_fix_tests():
    """Run auto-fix mechanism tests."""
    cmd = [
        sys.executable,
        '-m',
        'pytest',
        'tests/auto_fix/',
        '-v',
        '--tb=short',
        '-m',
        'integration',
    ]
    return run_command(cmd, "Auto-Fix Tests")


def run_security_tests():
    """Run security hardening tests."""
    cmd = [
        sys.executable,
        '-m',
        'pytest',
        'tests/security/',
        '-v',
        '--tb=short',
        '-m',
        'security',
    ]
    return run_command(cmd, "Security Tests")


def run_unit_tests():
    """Run unit tests."""
    cmd = [sys.executable, '-m', 'pytest', 'tests/', '-v', '--tb=short', '-m', 'unit']
    return run_command(cmd, "Unit Tests")


def run_all_tests():
    """Run all tests."""
    cmd = [
        sys.executable,
        '-m',
        'pytest',
        'tests/',
        '-v',
        '--tb=short',
        '--durations=10',
    ]
    return run_command(cmd, "All Tests")


def run_performance_tests():
    """Run performance tests."""
    cmd = [
        sys.executable,
        '-m',
        'pytest',
        'tests/',
        '-v',
        '--tb=short',
        '-m',
        'performance',
        '--durations=0',
    ]
    return run_command(cmd, "Performance Tests")


def run_coverage_tests():
    """Run tests with coverage reporting."""
    cmd = [
        sys.executable,
        '-m',
        'pytest',
        'tests/',
        '--cov=app',
        '--cov-report=html',
        '--cov-report=term-missing',
        '--cov-report=xml',
        '-v',
    ]
    return run_command(cmd, "Coverage Tests")


def main():
    """Main test runner function."""
    parser = argparse.ArgumentParser(description='Run Reynard Backend Tests')
    parser.add_argument(
        '--type',
        choices=[
            'all',
            'redis',
            'postgres',
            'auto-fix',
            'security',
            'unit',
            'performance',
            'coverage',
        ],
        default='all',
        help='Type of tests to run',
    )
    parser.add_argument(
        '--check-services',
        action='store_true',
        help='Check if required services are running',
    )
    parser.add_argument(
        '--no-service-check',
        action='store_true',
        help='Skip service availability check',
    )

    args = parser.parse_args()

    # Change to backend directory
    backend_dir = Path(__file__).parent.parent
    os.chdir(backend_dir)

    print("🦊 Reynard Backend Test Runner")
    print("=" * 50)

    # Check services unless explicitly skipped
    if not args.no_service_check:
        if not check_services():
            print("\n⚠️ Some services are not available. Tests may fail.")
            response = input("Continue anyway? (y/N): ")
            if response.lower() != 'y':
                print("Exiting...")
                sys.exit(1)

    if args.check_services:
        sys.exit(0)

    # Run tests based on type
    success = True

    if args.type == 'all':
        success = run_all_tests()
    elif args.type == 'redis':
        success = run_redis_tests()
    elif args.type == 'postgres':
        success = run_postgres_tests()
    elif args.type == 'auto-fix':
        success = run_auto_fix_tests()
    elif args.type == 'security':
        success = run_security_tests()
    elif args.type == 'unit':
        success = run_unit_tests()
    elif args.type == 'performance':
        success = run_performance_tests()
    elif args.type == 'coverage':
        success = run_coverage_tests()

    # Summary
    print("\n" + "=" * 50)
    if success:
        print("🎉 All tests completed successfully!")
        sys.exit(0)
    else:
        print("❌ Some tests failed!")
        sys.exit(1)


if __name__ == '__main__':
    main()
