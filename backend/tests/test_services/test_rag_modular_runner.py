"""Test runner for Modular RAG Services.

This module provides a comprehensive test runner for all modular RAG services,
including core services, specialized services, and the main orchestrator.
"""

import sys
from pathlib import Path
from typing import Any, Dict, List

import pytest

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_dir))


class RAGModularTestRunner:
    """Test runner for modular RAG services."""

    def __init__(self):
        self.test_modules = [
            "test_rag_modular_core",
            "test_rag_modular_specialized",
            "test_rag_modular_main",
        ]
        self.test_results: Dict[str, Any] = {}

    def run_all_tests(self, verbose: bool = True) -> Dict[str, Any]:
        """Run all modular RAG tests."""
        print("🦊 Running Modular RAG Service Tests")
        print("=" * 50)

        results = {}

        for module in self.test_modules:
            print(f"\n📋 Running {module}...")
            try:
                # Run the specific test module
                result = pytest.main(
                    [
                        f"tests/test_services/{module}.py",
                        "-v" if verbose else "",
                        "--tb=short",
                        "--disable-warnings",
                    ]
                )

                results[module] = {
                    "exit_code": result,
                    "status": "PASSED" if result == 0 else "FAILED",
                }

                status_emoji = "✅" if result == 0 else "❌"
                print(f"{status_emoji} {module}: {results[module]['status']}")

            except Exception as e:
                results[module] = {
                    "exit_code": -1,
                    "status": "ERROR",
                    "error": str(e),
                }
                print(f"❌ {module}: ERROR - {e}")

        self.test_results = results
        return results

    def run_core_tests(self, verbose: bool = True) -> Dict[str, Any]:
        """Run only core service tests."""
        print("🦊 Running RAG Core Service Tests")
        print("=" * 40)

        result = pytest.main(
            [
                "tests/test_services/test_rag_modular_core.py",
                "-v" if verbose else "",
                "--tb=short",
                "--disable-warnings",
            ]
        )

        return {
            "test_rag_modular_core": {
                "exit_code": result,
                "status": "PASSED" if result == 0 else "FAILED",
            }
        }

    def run_specialized_tests(self, verbose: bool = True) -> Dict[str, Any]:
        """Run only specialized service tests."""
        print("🦊 Running RAG Specialized Service Tests")
        print("=" * 45)

        result = pytest.main(
            [
                "tests/test_services/test_rag_modular_specialized.py",
                "-v" if verbose else "",
                "--tb=short",
                "--disable-warnings",
            ]
        )

        return {
            "test_rag_modular_specialized": {
                "exit_code": result,
                "status": "PASSED" if result == 0 else "FAILED",
            }
        }

    def run_main_tests(self, verbose: bool = True) -> Dict[str, Any]:
        """Run only main service tests."""
        print("🦊 Running RAG Main Service Tests")
        print("=" * 40)

        result = pytest.main(
            [
                "tests/test_services/test_rag_modular_main.py",
                "-v" if verbose else "",
                "--tb=short",
                "--disable-warnings",
            ]
        )

        return {
            "test_rag_modular_main": {
                "exit_code": result,
                "status": "PASSED" if result == 0 else "FAILED",
            }
        }

    def run_specific_test_class(
        self, module: str, test_class: str, verbose: bool = True
    ) -> Dict[str, Any]:
        """Run a specific test class."""
        print(f"🦊 Running {test_class} from {module}")
        print("=" * 50)

        result = pytest.main(
            [
                f"tests/test_services/{module}.py::{test_class}",
                "-v" if verbose else "",
                "--tb=short",
                "--disable-warnings",
            ]
        )

        return {
            f"{module}::{test_class}": {
                "exit_code": result,
                "status": "PASSED" if result == 0 else "FAILED",
            }
        }

    def run_specific_test_method(
        self, module: str, test_class: str, test_method: str, verbose: bool = True
    ) -> Dict[str, Any]:
        """Run a specific test method."""
        print(f"🦊 Running {test_class}.{test_method} from {module}")
        print("=" * 60)

        result = pytest.main(
            [
                f"tests/test_services/{module}.py::{test_class}::{test_method}",
                "-v" if verbose else "",
                "--tb=short",
                "--disable-warnings",
            ]
        )

        return {
            f"{module}::{test_class}::{test_method}": {
                "exit_code": result,
                "status": "PASSED" if result == 0 else "FAILED",
            }
        }

    def print_summary(self):
        """Print test summary."""
        if not self.test_results:
            print("No test results available. Run tests first.")
            return

        print("\n" + "=" * 50)
        print("🦊 RAG Modular Test Summary")
        print("=" * 50)

        total_tests = len(self.test_results)
        passed_tests = sum(
            1 for result in self.test_results.values() if result["status"] == "PASSED"
        )
        failed_tests = total_tests - passed_tests

        print(f"Total Test Modules: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")

        print("\nDetailed Results:")
        for module, result in self.test_results.items():
            status_emoji = "✅" if result["status"] == "PASSED" else "❌"
            print(f"  {status_emoji} {module}: {result['status']}")
            if "error" in result:
                print(f"    Error: {result['error']}")

    def get_available_test_classes(self) -> Dict[str, List[str]]:
        """Get available test classes for each module."""
        return {
            "test_rag_modular_core": [
                "TestModularEmbeddingService",
                "TestModularVectorStoreService",
                "TestModularDocumentIndexer",
                "TestModularSearchEngine",
                "TestModularRAGCoreIntegration",
            ],
            "test_rag_modular_specialized": [
                "TestPrometheusMonitoringService",
                "TestAccessControlSecurityService",
                "TestModelEvaluationService",
                "TestContinuousImprovementService",
                "TestAutoDocumentationService",
                "TestModularRAGSpecializedIntegration",
            ],
            "test_rag_modular_main": [
                "TestRAGServiceOrchestrator",
            ],
        }

    def print_available_tests(self):
        """Print available test classes and methods."""
        print("🦊 Available RAG Modular Tests")
        print("=" * 40)

        test_classes = self.get_available_test_classes()

        for module, classes in test_classes.items():
            print(f"\n📋 {module}:")
            for test_class in classes:
                print(f"  - {test_class}")


def main():
    """Main function for running tests."""
    import argparse

    parser = argparse.ArgumentParser(description="Run RAG Modular Service Tests")
    parser.add_argument(
        "--module",
        choices=["core", "specialized", "main", "all"],
        default="all",
        help="Which test module to run",
    )
    parser.add_argument("--class", dest="test_class", help="Specific test class to run")
    parser.add_argument("--method", help="Specific test method to run")
    parser.add_argument("--quiet", action="store_true", help="Run tests quietly")
    parser.add_argument("--list", action="store_true", help="List available tests")

    args = parser.parse_args()

    runner = RAGModularTestRunner()

    if args.list:
        runner.print_available_tests()
        return

    verbose = not args.quiet

    if args.module == "all":
        results = runner.run_all_tests(verbose)
    elif args.module == "core":
        results = runner.run_core_tests(verbose)
    elif args.module == "specialized":
        results = runner.run_specialized_tests(verbose)
    elif args.module == "main":
        results = runner.run_main_tests(verbose)

    if args.test_class:
        module_map = {
            "core": "test_rag_modular_core",
            "specialized": "test_rag_modular_specialized",
            "main": "test_rag_modular_main",
        }
        module = module_map.get(args.module, "test_rag_modular_core")

        if args.method:
            results = runner.run_specific_test_method(
                module, args.test_class, args.method, verbose
            )
        else:
            results = runner.run_specific_test_class(module, args.test_class, verbose)

    runner.print_summary()

    # Exit with error code if any tests failed
    if any(result["status"] != "PASSED" for result in results.values()):
        sys.exit(1)


if __name__ == "__main__":
    main()
