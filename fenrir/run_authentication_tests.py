#!/usr/bin/env python3
"""🦊 Fenrir MCP Authentication Test Runner
==========================================

Comprehensive test runner for MCP authentication security tests.
This script runs both Python unit tests and Playwright e2e tests
to ensure complete coverage of the authentication system.

Usage:
    python run_authentication_tests.py [--unit] [--e2e] [--all] [--verbose]

Author: Odonata-Oracle-6 (Dragonfly Specialist)
Version: 1.0.0
"""

import argparse
import asyncio
import json
import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from fenrir.tests.test_mcp_authentication import run_fenrir_authentication_tests


class FenrirTestRunner:
    """Comprehensive test runner for Fenrir authentication tests."""

    def __init__(self, verbose: bool = False):
        """Initialize the test runner."""
        self.verbose = verbose
        self.project_root = Path(__file__).parent.parent
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "test_suite": "Fenrir MCP Authentication Security",
            "results": {},
        }

    def log(self, message: str, level: str = "INFO") -> None:
        """Log a message with timestamp."""
        timestamp = datetime.now().strftime("%H:%M:%S")
        if self.verbose or level in ["ERROR", "WARN"]:
            print(f"[{timestamp}] {level}: {message}")

    def check_environment(self) -> bool:
        """Check if the test environment is properly set up."""
        self.log("Checking test environment...")

        # Check if required services are running
        services = {
            "MCP Server": os.getenv("MCP_SERVER_URL", "http://localhost:8001"),
            "FastAPI Backend": os.getenv(
                "FASTAPI_BACKEND_URL", "http://localhost:8000"
            ),
        }

        for service_name, url in services.items():
            try:
                import requests

                response = requests.get(f"{url}/health", timeout=5)
                if response.status_code == 200:
                    self.log(f"✅ {service_name} is running at {url}")
                else:
                    self.log(
                        f"⚠️  {service_name} responded with status {response.status_code}",
                        "WARN",
                    )
            except Exception as e:
                self.log(f"❌ {service_name} is not accessible: {e}", "ERROR")
                return False

        # Check if required Python packages are installed
        required_packages = ["pytest", "requests", "jwt", "fastapi"]
        for package in required_packages:
            try:
                __import__(package)
                self.log(f"✅ Python package {package} is available")
            except ImportError:
                self.log(f"❌ Python package {package} is not installed", "ERROR")
                return False

        # Check if Node.js and Playwright are available for e2e tests
        try:
            result = subprocess.run(
                ["node", "--version"], capture_output=True, text=True
            )
            if result.returncode == 0:
                self.log(f"✅ Node.js is available: {result.stdout.strip()}")
            else:
                self.log("❌ Node.js is not available", "ERROR")
                return False
        except FileNotFoundError:
            self.log("❌ Node.js is not installed", "ERROR")
            return False

        try:
            result = subprocess.run(
                ["npx", "playwright", "--version"], capture_output=True, text=True
            )
            if result.returncode == 0:
                self.log(f"✅ Playwright is available: {result.stdout.strip()}")
            else:
                self.log("❌ Playwright is not installed", "ERROR")
                return False
        except FileNotFoundError:
            self.log("❌ Playwright is not available", "ERROR")
            return False

        return True

    async def run_python_tests(self) -> Dict[str, any]:
        """Run Python unit tests for MCP authentication."""
        self.log("Running Python unit tests...")

        try:
            start_time = time.time()
            results = await run_fenrir_authentication_tests()
            end_time = time.time()

            self.results["results"]["python_tests"] = {
                "status": "completed",
                "duration": end_time - start_time,
                "results": results,
            }

            self.log(
                f"✅ Python tests completed in {end_time - start_time:.2f} seconds"
            )
            return results

        except Exception as e:
            self.log(f"❌ Python tests failed: {e}", "ERROR")
            self.results["results"]["python_tests"] = {
                "status": "failed",
                "error": str(e),
            }
            return {"summary": {"overall_status": "FAIL"}}

    def run_playwright_tests(self) -> Dict[str, any]:
        """Run Playwright e2e tests for MCP authentication."""
        self.log("Running Playwright e2e tests...")

        try:
            # Change to e2e directory
            e2e_dir = self.project_root / "e2e"
            if not e2e_dir.exists():
                self.log("❌ E2E directory not found", "ERROR")
                return {"status": "failed", "error": "E2E directory not found"}

            # Run Playwright tests
            start_time = time.time()
            result = subprocess.run(
                [
                    "npx",
                    "playwright",
                    "test",
                    "suites/security/mcp-authentication.spec.ts",
                    "--reporter=json",
                ],
                cwd=e2e_dir,
                capture_output=True,
                text=True,
                timeout=300,  # 5 minutes timeout
            )
            end_time = time.time()

            if result.returncode == 0:
                self.log(
                    f"✅ Playwright tests completed in {end_time - start_time:.2f} seconds"
                )

                # Parse JSON output if available
                try:
                    test_results = json.loads(result.stdout)
                except json.JSONDecodeError:
                    test_results = {"status": "completed", "output": result.stdout}

                self.results["results"]["playwright_tests"] = {
                    "status": "completed",
                    "duration": end_time - start_time,
                    "results": test_results,
                }

                return test_results
            else:
                self.log(
                    f"❌ Playwright tests failed with return code {result.returncode}",
                    "ERROR",
                )
                self.log(f"Error output: {result.stderr}", "ERROR")

                self.results["results"]["playwright_tests"] = {
                    "status": "failed",
                    "return_code": result.returncode,
                    "error": result.stderr,
                }

                return {"status": "failed", "error": result.stderr}

        except subprocess.TimeoutExpired:
            self.log("❌ Playwright tests timed out", "ERROR")
            self.results["results"]["playwright_tests"] = {
                "status": "timeout",
                "error": "Tests timed out after 5 minutes",
            }
            return {"status": "timeout", "error": "Tests timed out"}

        except Exception as e:
            self.log(f"❌ Playwright tests failed: {e}", "ERROR")
            self.results["results"]["playwright_tests"] = {
                "status": "failed",
                "error": str(e),
            }
            return {"status": "failed", "error": str(e)}

    def run_security_scan(self) -> Dict[str, any]:
        """Run additional security scans."""
        self.log("Running security scans...")

        try:
            # Run bandit security scan on Python code
            start_time = time.time()
            result = subprocess.run(
                ["bandit", "-r", str(self.project_root / "backend"), "-f", "json"],
                capture_output=True,
                text=True,
                timeout=60,
            )
            end_time = time.time()

            if result.returncode == 0:
                self.log("✅ Bandit security scan completed")
                bandit_results = json.loads(result.stdout)
            else:
                self.log("⚠️  Bandit found security issues", "WARN")
                bandit_results = (
                    json.loads(result.stdout) if result.stdout else {"issues": []}
                )

            self.results["results"]["security_scan"] = {
                "status": "completed",
                "duration": end_time - start_time,
                "bandit_results": bandit_results,
            }

            return bandit_results

        except Exception as e:
            self.log(f"❌ Security scan failed: {e}", "ERROR")
            self.results["results"]["security_scan"] = {
                "status": "failed",
                "error": str(e),
            }
            return {"error": str(e)}

    def generate_report(self) -> str:
        """Generate a comprehensive test report."""
        report = []
        report.append("🦊 Fenrir MCP Authentication Security Test Report")
        report.append("=" * 60)
        report.append(f"Timestamp: {self.results['timestamp']}")
        report.append(f"Test Suite: {self.results['test_suite']}")
        report.append("")

        # Summary
        total_tests = 0
        passed_tests = 0
        failed_tests = 0

        for test_type, result in self.results["results"].items():
            if result["status"] == "completed":
                if "results" in result and "summary" in result["results"]:
                    summary = result["results"]["summary"]
                    total_tests += summary.get("total_tests", 0)
                    passed_tests += summary.get("passed_tests", 0)
                    failed_tests += summary.get("failed_tests", 0)

        report.append("📊 Test Summary")
        report.append("-" * 20)
        report.append(f"Total Tests: {total_tests}")
        report.append(f"Passed: {passed_tests}")
        report.append(f"Failed: {failed_tests}")
        report.append(
            f"Success Rate: {(passed_tests / total_tests * 100):.1f}%"
            if total_tests > 0
            else "N/A"
        )
        report.append("")

        # Detailed results
        for test_type, result in self.results["results"].items():
            report.append(f"🔍 {test_type.replace('_', ' ').title()}")
            report.append("-" * 30)
            report.append(f"Status: {result['status']}")

            if "duration" in result:
                report.append(f"Duration: {result['duration']:.2f} seconds")

            if result["status"] == "failed":
                report.append(f"Error: {result.get('error', 'Unknown error')}")
            elif result["status"] == "completed" and "results" in result:
                if "summary" in result["results"]:
                    summary = result["results"]["summary"]
                    report.append(
                        f"Overall Status: {summary.get('overall_status', 'UNKNOWN')}"
                    )

            report.append("")

        # Recommendations
        report.append("💡 Recommendations")
        report.append("-" * 20)

        if failed_tests > 0:
            report.append("⚠️  Some tests failed. Review the detailed results above.")
            report.append("🔧 Consider:")
            report.append("   - Checking service connectivity")
            report.append("   - Verifying authentication configuration")
            report.append("   - Reviewing security headers and CORS settings")
        else:
            report.append("🎉 All tests passed! Your authentication system is secure.")

        report.append("")
        report.append("📝 For detailed logs, run with --verbose flag")

        return "\n".join(report)

    def save_results(self, output_file: Optional[str] = None) -> str:
        """Save test results to a JSON file."""
        if output_file is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"fenrir_auth_test_results_{timestamp}.json"

        output_path = self.project_root / "fenrir" / "results" / output_file

        # Create results directory if it doesn't exist
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w') as f:
            json.dump(self.results, f, indent=2)

        self.log(f"Results saved to: {output_path}")
        return str(output_path)

    async def run_all_tests(self) -> bool:
        """Run all available tests."""
        self.log("🦊 Starting comprehensive Fenrir authentication security tests")
        self.log("=" * 60)

        # Check environment
        if not self.check_environment():
            self.log(
                "❌ Environment check failed. Please fix the issues above.", "ERROR"
            )
            return False

        # Run Python tests
        python_results = await self.run_python_tests()

        # Run Playwright tests
        playwright_results = self.run_playwright_tests()

        # Run security scan
        security_results = self.run_security_scan()

        # Generate and display report
        report = self.generate_report()
        print("\n" + report)

        # Save results
        results_file = self.save_results()

        # Determine overall success
        python_success = (
            python_results.get("summary", {}).get("overall_status") == "PASS"
        )
        playwright_success = playwright_results.get("status") == "completed"

        overall_success = python_success and playwright_success

        if overall_success:
            self.log("🎉 All authentication security tests passed!")
        else:
            self.log(
                "⚠️  Some authentication security tests failed. Review the report above.",
                "WARN",
            )

        return overall_success


async def main():
    """Main entry point for the test runner."""
    parser = argparse.ArgumentParser(
        description="Run Fenrir MCP authentication security tests",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run_authentication_tests.py --all --verbose
  python run_authentication_tests.py --unit
  python run_authentication_tests.py --e2e
        """,
    )

    parser.add_argument(
        "--unit", action="store_true", help="Run only Python unit tests"
    )
    parser.add_argument(
        "--e2e", action="store_true", help="Run only Playwright e2e tests"
    )
    parser.add_argument("--all", action="store_true", help="Run all tests (default)")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose logging")
    parser.add_argument("--output", type=str, help="Output file for test results")

    args = parser.parse_args()

    # Default to running all tests if no specific test type is specified
    if not any([args.unit, args.e2e]):
        args.all = True

    runner = FenrirTestRunner(verbose=args.verbose)

    try:
        if args.all:
            success = await runner.run_all_tests()
        elif args.unit:
            success = await runner.run_python_tests()
            success = success.get("summary", {}).get("overall_status") == "PASS"
        elif args.e2e:
            results = runner.run_playwright_tests()
            success = results.get("status") == "completed"

        if args.output:
            runner.save_results(args.output)

        sys.exit(0 if success else 1)

    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Test runner failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
