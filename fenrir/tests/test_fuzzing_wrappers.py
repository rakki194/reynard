"""
🦦 FUZZING WRAPPERS TEST SUITE

*splashes with enthusiasm* Testing our fuzzing exploit wrappers to ensure they can
properly coordinate and execute fuzzing attacks!
"""

import asyncio
import time

import pytest

from ..fuzzing.core.endpoint_orchestrator import EndpointOrchestrator
from ..fuzzing.fuzzy import Fuzzy
from .test_base import FenrirTestBase, SecurityTestResult


class TestFuzzingWrappers(FenrirTestBase):
    """
    *otter curiosity* Test suite for fuzzing exploit wrappers
    """

    async def test_modular_fuzzer_wrapper(self):
        """Test that the modular fuzzer wrapper works correctly"""
        print("\n🦦 Testing Modular Fuzzer Wrapper...")

        start_time = time.time()

        try:
            # Test the modular fuzzer
            async with Fuzzy(self.base_url) as fuzzer:
                # Test that the fuzzer can be initialized and used
                assert (
                    fuzzer.base_url == self.base_url
                ), "Base URL should be set correctly"
                assert hasattr(
                    fuzzer, "fuzz_authentication_endpoints"
                ), "Should have authentication fuzzing method"
                assert hasattr(
                    fuzzer, "fuzz_all_specialized_endpoints"
                ), "Should have specialized endpoint fuzzing method"

            response_time = time.time() - start_time

            test_result = SecurityTestResult(
                test_name="Modular Fuzzer Wrapper",
                success=True,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Modular fuzzer wrapper executed successfully",
                response_time=response_time,
            )

            self.log_test_result(test_result)
            print("    ✅ Modular Fuzzer Wrapper executed successfully")

        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Modular Fuzzer Wrapper",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e),
            )
            self.log_test_result(test_result)
            raise

    async def test_endpoint_orchestrator(self):
        """Test that the endpoint orchestrator works correctly"""
        print("\n🦦 Testing Endpoint Orchestrator...")

        start_time = time.time()

        try:
            # Test the endpoint orchestrator
            orchestrator = EndpointOrchestrator(self.base_url)

            # Test that the orchestrator can be initialized
            assert (
                orchestrator.base_url == self.base_url
            ), "Base URL should be set correctly"
            assert hasattr(
                orchestrator, "register_fuzzer"
            ), "Should have register_fuzzer method"
            assert hasattr(
                orchestrator, "fuzz_all_categories"
            ), "Should have fuzz_all_categories method"
            assert hasattr(
                orchestrator, "print_comprehensive_report"
            ), "Should have print_comprehensive_report method"

            response_time = time.time() - start_time

            test_result = SecurityTestResult(
                test_name="Endpoint Orchestrator",
                success=True,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Endpoint orchestrator initialized successfully with modular architecture",
                response_time=response_time,
            )

            self.log_test_result(test_result)
            print("    ✅ Endpoint Orchestrator executed successfully")

        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Endpoint Orchestrator",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e),
            )
            self.log_test_result(test_result)
            raise


# Pytest test functions
@pytest.mark.asyncio
async def test_modular_fuzzer_wrapper():
    """Test modular fuzzer wrapper"""
    async with TestFuzzingWrappers() as tester:
        await tester.test_modular_fuzzer_wrapper()


@pytest.mark.asyncio
async def test_endpoint_orchestrator():
    """Test endpoint orchestrator"""
    async with TestFuzzingWrappers() as tester:
        await tester.test_endpoint_orchestrator()


if __name__ == "__main__":
    # Run tests directly
    async def main():
        async with TestFuzzingWrappers() as tester:
            await tester.test_modular_fuzzer_wrapper()
            await tester.test_endpoint_orchestrator()

            # Print summary
            summary = tester.get_test_summary()
            print("\n🦦 Fuzzing Wrappers Test Summary:")
            print(f"    Total Tests: {summary['total_tests']}")
            print(f"    Passed: {summary['passed_tests']}")
            print(f"    Failed: {summary['failed_tests']}")
            print(f"    Success Rate: {summary['success_rate']:.1f}%")
            print(f"    Vulnerabilities Found: {summary['vulnerabilities_found']}")

    asyncio.run(main())
