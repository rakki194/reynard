"""🔐 Key Storage Test Runner

Comprehensive test runner for PGP and SSH key storage tests.
Provides organized testing with detailed reporting and coverage analysis.

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

import asyncio
import os
import subprocess
import sys
from pathlib import Path
from typing import List, Optional

import pytest


class KeyStorageTestRunner:
    """Test runner for key storage systems."""

    def __init__(self):
        """Initialize the test runner."""
        self.backend_dir = Path(__file__).parent.parent.parent
        self.test_dir = self.backend_dir / "tests" / "test_security"
        self.coverage_dir = self.backend_dir / "htmlcov"
        self.results_dir = self.backend_dir / "test_results"

    def run_pgp_tests(
        self,
        verbose: bool = False,
        coverage: bool = False,
        parallel: bool = False,
    ) -> int:
        """Run PGP key storage tests."""
        print("🦊 Running PGP Key Storage Tests...")

        cmd = [
            "python",
            "-m",
            "pytest",
            str(self.test_dir / "test_pgp_key_storage.py"),
            "-v" if verbose else "",
            "--cov=app.security.pgp_key_service" if coverage else "",
            "--cov=app.security.pgp_key_models" if coverage else "",
            "--cov-report=html" if coverage else "",
            "--cov-report=term-missing" if coverage else "",
            "-n",
            "auto" if parallel else "1",
            "--tb=short",
        ]

        # Remove empty strings
        cmd = [arg for arg in cmd if arg]

        return subprocess.run(cmd, cwd=self.backend_dir).returncode

    def run_ssh_tests(
        self,
        verbose: bool = False,
        coverage: bool = False,
        parallel: bool = False,
    ) -> int:
        """Run SSH key storage tests."""
        print("🦊 Running SSH Key Storage Tests...")

        cmd = [
            "python",
            "-m",
            "pytest",
            str(self.test_dir / "test_ssh_key_storage.py"),
            "-v" if verbose else "",
            "--cov=app.security.ssh_key_service" if coverage else "",
            "--cov=app.security.ssh_key_models" if coverage else "",
            "--cov-report=html" if coverage else "",
            "--cov-report=term-missing" if coverage else "",
            "-n",
            "auto" if parallel else "1",
            "--tb=short",
        ]

        # Remove empty strings
        cmd = [arg for arg in cmd if arg]

        return subprocess.run(cmd, cwd=self.backend_dir).returncode

    def run_all_tests(
        self,
        verbose: bool = False,
        coverage: bool = False,
        parallel: bool = False,
    ) -> int:
        """Run all key storage tests."""
        print("🦊 Running All Key Storage Tests...")

        cmd = [
            "python",
            "-m",
            "pytest",
            str(self.test_dir / "test_pgp_key_storage.py"),
            str(self.test_dir / "test_ssh_key_storage.py"),
            "-v" if verbose else "",
            "--cov=app.security" if coverage else "",
            "--cov-report=html" if coverage else "",
            "--cov-report=term-missing" if coverage else "",
            "-n",
            "auto" if parallel else "1",
            "--tb=short",
            "--junitxml=test_results/key_storage_tests.xml",
        ]

        # Remove empty strings
        cmd = [arg for arg in cmd if arg]

        # Create results directory
        self.results_dir.mkdir(exist_ok=True)

        return subprocess.run(cmd, cwd=self.backend_dir).returncode

    def run_security_tests(
        self,
        verbose: bool = False,
        coverage: bool = False,
    ) -> int:
        """Run security-focused tests."""
        print("🦊 Running Security-Focused Key Tests...")

        cmd = [
            "python",
            "-m",
            "pytest",
            str(self.test_dir / "test_pgp_key_storage.py::TestPGPKeySecurity"),
            str(self.test_dir / "test_ssh_key_storage.py::TestSSHKeySecurity"),
            "-v" if verbose else "",
            "--cov=app.security" if coverage else "",
            "--cov-report=html" if coverage else "",
            "--cov-report=term-missing" if coverage else "",
            "--tb=short",
        ]

        # Remove empty strings
        cmd = [arg for arg in cmd if arg]

        return subprocess.run(cmd, cwd=self.backend_dir).returncode

    def run_integration_tests(
        self,
        verbose: bool = False,
        coverage: bool = False,
    ) -> int:
        """Run integration tests."""
        print("🦊 Running Key Storage Integration Tests...")

        cmd = [
            "python",
            "-m",
            "pytest",
            str(self.test_dir / "test_pgp_key_storage.py::TestPGPKeyIntegration"),
            str(self.test_dir / "test_ssh_key_storage.py::TestSSHKeyIntegration"),
            "-v" if verbose else "",
            "--cov=app.security" if coverage else "",
            "--cov-report=html" if coverage else "",
            "--cov-report=term-missing" if coverage else "",
            "--tb=short",
            "-m",
            "integration",
        ]

        # Remove empty strings
        cmd = [arg for arg in cmd if arg]

        return subprocess.run(cmd, cwd=self.backend_dir).returncode

    def run_model_tests(
        self,
        verbose: bool = False,
        coverage: bool = False,
    ) -> int:
        """Run database model tests."""
        print("🦊 Running Key Storage Model Tests...")

        cmd = [
            "python",
            "-m",
            "pytest",
            str(self.test_dir / "test_pgp_key_storage.py::TestPGPKeyModels"),
            str(self.test_dir / "test_ssh_key_storage.py::TestSSHKeyModels"),
            "-v" if verbose else "",
            "--cov=app.security.pgp_key_models" if coverage else "",
            "--cov=app.security.ssh_key_models" if coverage else "",
            "--cov-report=html" if coverage else "",
            "--cov-report=term-missing" if coverage else "",
            "--tb=short",
        ]

        # Remove empty strings
        cmd = [arg for arg in cmd if arg]

        return subprocess.run(cmd, cwd=self.backend_dir).returncode

    def run_service_tests(
        self,
        verbose: bool = False,
        coverage: bool = False,
    ) -> int:
        """Run service layer tests."""
        print("🦊 Running Key Storage Service Tests...")

        cmd = [
            "python",
            "-m",
            "pytest",
            str(self.test_dir / "test_pgp_key_storage.py::TestPGPKeyService"),
            str(self.test_dir / "test_ssh_key_storage.py::TestSSHKeyService"),
            "-v" if verbose else "",
            "--cov=app.security.pgp_key_service" if coverage else "",
            "--cov=app.security.ssh_key_service" if coverage else "",
            "--cov-report=html" if coverage else "",
            "--cov-report=term-missing" if coverage else "",
            "--tb=short",
        ]

        # Remove empty strings
        cmd = [arg for arg in cmd if arg]

        return subprocess.run(cmd, cwd=self.backend_dir).returncode

    def generate_coverage_report(self) -> None:
        """Generate comprehensive coverage report."""
        print("🦊 Generating Coverage Report...")

        if self.coverage_dir.exists():
            print(f"📊 Coverage report available at: {self.coverage_dir}/index.html")
        else:
            print("⚠️  No coverage report found. Run tests with --coverage flag.")

    def cleanup(self) -> None:
        """Clean up test artifacts."""
        print("🦊 Cleaning up test artifacts...")

        # Remove coverage files
        if self.coverage_dir.exists():
            import shutil

            shutil.rmtree(self.coverage_dir)

        # Remove test results
        if self.results_dir.exists():
            import shutil

            shutil.rmtree(self.results_dir)

        print("✅ Cleanup completed.")

    def print_summary(self, exit_codes: List[int]) -> None:
        """Print test summary."""
        total_tests = len(exit_codes)
        passed_tests = sum(1 for code in exit_codes if code == 0)
        failed_tests = total_tests - passed_tests

        print("\n" + "=" * 60)
        print("🦊 KEY STORAGE TEST SUMMARY")
        print("=" * 60)
        print(f"Total test suites: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success rate: {(passed_tests/total_tests)*100:.1f}%")

        if failed_tests > 0:
            print("\n❌ Some tests failed. Check the output above for details.")
        else:
            print("\n✅ All tests passed!")

        print("=" * 60)


def main():
    """Main entry point for the test runner."""
    import argparse

    parser = argparse.ArgumentParser(description="Key Storage Test Runner")
    parser.add_argument(
        "--type",
        choices=["all", "pgp", "ssh", "security", "integration", "models", "services"],
        default="all",
        help="Type of tests to run",
    )
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument(
        "--coverage", "-c", action="store_true", help="Generate coverage report"
    )
    parser.add_argument(
        "--parallel", "-p", action="store_true", help="Run tests in parallel"
    )
    parser.add_argument(
        "--cleanup", action="store_true", help="Clean up test artifacts"
    )

    args = parser.parse_args()

    runner = KeyStorageTestRunner()

    if args.cleanup:
        runner.cleanup()
        return 0

    exit_codes = []

    if args.type == "all":
        exit_codes.append(
            runner.run_all_tests(
                verbose=args.verbose,
                coverage=args.coverage,
                parallel=args.parallel,
            )
        )
    elif args.type == "pgp":
        exit_codes.append(
            runner.run_pgp_tests(
                verbose=args.verbose,
                coverage=args.coverage,
                parallel=args.parallel,
            )
        )
    elif args.type == "ssh":
        exit_codes.append(
            runner.run_ssh_tests(
                verbose=args.verbose,
                coverage=args.coverage,
                parallel=args.parallel,
            )
        )
    elif args.type == "security":
        exit_codes.append(
            runner.run_security_tests(
                verbose=args.verbose,
                coverage=args.coverage,
            )
        )
    elif args.type == "integration":
        exit_codes.append(
            runner.run_integration_tests(
                verbose=args.verbose,
                coverage=args.coverage,
            )
        )
    elif args.type == "models":
        exit_codes.append(
            runner.run_model_tests(
                verbose=args.verbose,
                coverage=args.coverage,
            )
        )
    elif args.type == "services":
        exit_codes.append(
            runner.run_service_tests(
                verbose=args.verbose,
                coverage=args.coverage,
            )
        )

    if args.coverage:
        runner.generate_coverage_report()

    runner.print_summary(exit_codes)

    return max(exit_codes) if exit_codes else 0


if __name__ == "__main__":
    sys.exit(main())
