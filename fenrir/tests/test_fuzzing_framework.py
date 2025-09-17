"""
🦦 FUZZING FRAMEWORK TEST SUITE

*splashes with enthusiasm* Testing our comprehensive fuzzing framework to ensure it can
properly identify vulnerabilities and avoid false positives!
"""

import asyncio
import time

import pytest

from ..fuzzing.core.base_fuzzer import BaseFuzzer
from ..fuzzing.core.payload_composables import PayloadComposables
from ..fuzzing.fuzzy import Fuzzy
from .test_base import FenrirTestBase, SecurityTestResult


class TestFuzzingFramework(FenrirTestBase):
    """
    *otter curiosity* Test suite for the fuzzing framework
    """

    async def test_payload_composables(self):
        """Test that the payload composables create appropriate payloads"""
        print("\n🦦 Testing Payload Composables...")

        start_time = time.time()

        try:
            composables = PayloadComposables()

            # Test SQL injection payloads
            sql_payloads = composables.get_sql_injection_payloads()
            assert (
                len(sql_payloads.payloads) > 0
            ), "Should generate SQL injection payloads"

            # Test XSS payloads
            xss_payloads = composables.get_xss_payloads()
            assert len(xss_payloads.payloads) > 0, "Should generate XSS payloads"

            # Test path traversal payloads
            path_payloads = composables.get_path_traversal_payloads()
            assert (
                len(path_payloads.payloads) > 0
            ), "Should generate path traversal payloads"

            # Test command injection payloads
            cmd_payloads = composables.get_command_injection_payloads()
            assert (
                len(cmd_payloads.payloads) > 0
            ), "Should generate command injection payloads"

            response_time = time.time() - start_time

            test_result = SecurityTestResult(
                test_name="Payload Composables",
                success=True,
                vulnerability_found=False,
                expected_vulnerability=False,
                details=f"Generated {len(sql_payloads.payloads)} SQL, {len(xss_payloads.payloads)} XSS, {len(path_payloads.payloads)} path traversal, {len(cmd_payloads.payloads)} command injection payloads",
                response_time=response_time,
            )

            self.log_test_result(test_result)
            print("    ✅ Payload composables working correctly")

        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Payload Composables",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e),
            )
            self.log_test_result(test_result)
            raise

    async def test_modular_fuzzer_vulnerability_detection(self):
        """Test that the modular fuzzer can detect vulnerabilities"""
        print("\n🦦 Testing Modular Fuzzer Vulnerability Detection...")

        start_time = time.time()

        try:
            async with Fuzzy(self.base_url) as fuzzer:
                # Test a small number of endpoints to avoid overwhelming the server
                results = await fuzzer.fuzz_authentication_endpoints()

                response_time = time.time() - start_time

                # Count vulnerabilities found
                vulnerabilities = [r for r in results if r.vulnerability_detected]

                test_result = SecurityTestResult(
                    test_name="Modular Fuzzer",
                    success=True,
                    vulnerability_found=len(vulnerabilities) > 0,
                    expected_vulnerability=False,  # Our backend should be secure
                    details=f"Tested {len(results)} requests, found {len(vulnerabilities)} vulnerabilities",
                    response_time=response_time,
                )

                self.log_test_result(test_result)

                if len(vulnerabilities) > 0:
                    print(
                        f"    ⚠️ Found {len(vulnerabilities)} potential vulnerabilities:"
                    )
                    for vuln in vulnerabilities[:5]:  # Show first 5
                        print(f"        - {vuln.vulnerability_type} on {vuln.url}")
                else:
                    print("    ✅ No vulnerabilities found (secure backend)")

        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Modular Fuzzer",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e),
            )
            self.log_test_result(test_result)
            raise

    async def test_base_fuzzer(self):
        """Test that the base fuzzer works correctly"""
        print("\n🦦 Testing Base Fuzzer...")

        start_time = time.time()

        try:
            # Test the base fuzzer functionality
            fuzzer = BaseFuzzer(self.base_url)

            # Test that the fuzzer can be initialized
            assert fuzzer.base_url == self.base_url, "Base URL should be set correctly"
            assert fuzzer.max_concurrent > 0, "Max concurrent should be positive"

            response_time = time.time() - start_time

            test_result = SecurityTestResult(
                test_name="Base Fuzzer",
                success=True,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Base fuzzer initialized correctly with modular architecture",
                response_time=response_time,
            )

            self.log_test_result(test_result)
            print("    ✅ Base fuzzer working correctly")

        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Base Fuzzer",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e),
            )
            self.log_test_result(test_result)
            raise

    async def test_fuzzing_false_positive_prevention(self):
        """Test that fuzzing doesn't produce false positives"""
        print("\n🦦 Testing Fuzzing False Positive Prevention...")

        start_time = time.time()

        try:
            async with Fuzzy(self.base_url) as fuzzer:
                # Test with a known secure endpoint
                results = await fuzzer.fuzz_endpoint("/api/docs", "GET")

                response_time = time.time() - start_time

                # Count false positives (vulnerabilities found on secure endpoint)
                false_positives = [r for r in results if r.vulnerability_detected]

                test_result = SecurityTestResult(
                    test_name="False Positive Prevention",
                    success=len(false_positives) == 0,
                    vulnerability_found=len(false_positives) > 0,
                    expected_vulnerability=False,  # Should not find vulnerabilities on secure endpoint
                    details=f"Tested {len(results)} requests on /api/docs, found {len(false_positives)} false positives",
                    response_time=response_time,
                )

                self.log_test_result(test_result)

                if len(false_positives) > 0:
                    print(
                        f"    ❌ Found {len(false_positives)} false positives on secure endpoint"
                    )
                else:
                    print("    ✅ No false positives found (good detection accuracy)")

        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="False Positive Prevention",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e),
            )
            self.log_test_result(test_result)
            raise

    async def test_fuzzing_performance(self):
        """Test that fuzzing performs within acceptable time limits"""
        print("\n🦦 Testing Fuzzing Performance...")

        start_time = time.time()

        try:
            async with Fuzzy(self.base_url) as fuzzer:
                # Test with a small number of requests to measure performance
                results = await fuzzer.fuzz_endpoint("/api/auth/login", "POST")

                response_time = time.time() - start_time

                # Calculate requests per second
                requests_per_second = (
                    len(results) / response_time if response_time > 0 else 0
                )

                test_result = SecurityTestResult(
                    test_name="Fuzzing Performance",
                    success=requests_per_second >= 1.0,  # At least 1 request per second
                    vulnerability_found=False,
                    expected_vulnerability=False,
                    details=f"Processed {len(results)} requests in {response_time:.2f}s ({requests_per_second:.1f} req/s)",
                    response_time=response_time,
                )

                self.log_test_result(test_result)

                if requests_per_second >= 1.0:
                    print(
                        f"    ✅ Good performance: {requests_per_second:.1f} requests/second"
                    )
                else:
                    print(
                        f"    ⚠️ Slow performance: {requests_per_second:.1f} requests/second"
                    )

        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Fuzzing Performance",
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
async def test_payload_composables():
    """Test payload composables"""
    async with TestFuzzingFramework() as tester:
        await tester.test_payload_composables()


@pytest.mark.asyncio
async def test_modular_fuzzer():
    """Test modular fuzzer"""
    async with TestFuzzingFramework() as tester:
        await tester.test_modular_fuzzer_vulnerability_detection()


@pytest.mark.asyncio
async def test_base_fuzzer():
    """Test base fuzzer"""
    async with TestFuzzingFramework() as tester:
        await tester.test_base_fuzzer()


@pytest.mark.asyncio
async def test_false_positive_prevention():
    """Test false positive prevention"""
    async with TestFuzzingFramework() as tester:
        await tester.test_fuzzing_false_positive_prevention()


@pytest.mark.asyncio
async def test_fuzzing_performance():
    """Test fuzzing performance"""
    async with TestFuzzingFramework() as tester:
        await tester.test_fuzzing_performance()


if __name__ == "__main__":
    # Run tests directly
    async def main():
        async with TestFuzzingFramework() as tester:
            await tester.test_payload_composables()
            await tester.test_modular_fuzzer_vulnerability_detection()
            await tester.test_base_fuzzer()
            await tester.test_fuzzing_false_positive_prevention()
            await tester.test_fuzzing_performance()

            # Print summary
            summary = tester.get_test_summary()
            print("\n🦦 Fuzzing Framework Test Summary:")
            print(f"    Total Tests: {summary['total_tests']}")
            print(f"    Passed: {summary['passed_tests']}")
            print(f"    Failed: {summary['failed_tests']}")
            print(f"    Success Rate: {summary['success_rate']:.1f}%")
            print(f"    Vulnerabilities Found: {summary['vulnerabilities_found']}")

    asyncio.run(main())
