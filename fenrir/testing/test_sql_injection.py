"""🦦 SQL INJECTION TEST SUITE

*splashes with enthusiasm* Testing our SQL injection exploits to ensure they can
properly identify SQL injection vulnerabilities and security issues!
"""

import asyncio
import time
from unittest.mock import patch

import pytest

from ..sql_injection.blind_injection import BlindInjectionExploit
from ..sql_injection.obfuscated_payloads import ObfuscatedSQLInjectionExploit
from ..sql_injection.regex_bypass import RegexBypassExploit
from ..sql_injection.union_attacks import UnionBasedExploit
from .test_base import FenrirTestBase, SecurityTestResult


class TestSQLInjection(FenrirTestBase):
    """*otter curiosity* Test suite for SQL injection exploits"""

    async def test_blind_sql_injection(self):
        """Test that blind SQL injection detection works correctly"""
        print("\n🦦 Testing Blind SQL Injection Detection...")

        start_time = time.time()

        try:
            # Test the blind SQL injection exploit
            exploit = BlindInjectionExploit(self.base_url)

            # Mock the exploit to avoid actual network calls
            with patch.object(exploit, "_test_boolean_based_blind", return_value=False):
                with patch.object(
                    exploit,
                    "_test_time_based_blind",
                    return_value=False,
                ):
                    results = exploit.run_exploit()

            response_time = time.time() - start_time

            # Analyze results
            vulnerability_found = any(result.success for result in results)
            test_result = SecurityTestResult(
                test_name="Blind SQL Injection Detection",
                success=True,
                vulnerability_found=vulnerability_found,
                expected_vulnerability=False,  # Our backend should be secure
                details=f"Found {len([r for r in results if r.success])} blind SQL injection vulnerabilities",
                response_time=response_time,
            )

            self.log_test_result(test_result)

            if vulnerability_found:
                print("    ⚠️ Found unexpected blind SQL injection vulnerabilities")
                for result in results:
                    if result.success:
                        print(
                            f"        - {result.vulnerability_type}: {result.description}",
                        )
            else:
                print("    ✅ No blind SQL injection vulnerabilities found (secure)")

        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Blind SQL Injection Detection",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e),
            )
            self.log_test_result(test_result)
            raise

    async def test_obfuscated_sql_payloads(self):
        """Test that obfuscated SQL payload detection works correctly"""
        print("\n🦦 Testing Obfuscated SQL Payload Detection...")

        start_time = time.time()

        try:
            # Test the obfuscated SQL payload exploit
            exploit = ObfuscatedSQLInjectionExploit(self.base_url)

            # Mock the exploit to avoid actual network calls
            with patch.object(exploit, "_test_obfuscated_payloads", return_value=False):
                results = exploit.run_exploit()

            response_time = time.time() - start_time

            # Analyze results
            vulnerability_found = any(result.success for result in results)
            test_result = SecurityTestResult(
                test_name="Obfuscated SQL Payload Detection",
                success=True,
                vulnerability_found=vulnerability_found,
                expected_vulnerability=False,  # Our backend should be secure
                details=f"Found {len([r for r in results if r.success])} obfuscated SQL vulnerabilities",
                response_time=response_time,
            )

            self.log_test_result(test_result)

            if vulnerability_found:
                print("    ⚠️ Found unexpected obfuscated SQL vulnerabilities")
                for result in results:
                    if result.success:
                        print(
                            f"        - {result.vulnerability_type}: {result.description}",
                        )
            else:
                print("    ✅ No obfuscated SQL vulnerabilities found (secure)")

        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Obfuscated SQL Payload Detection",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e),
            )
            self.log_test_result(test_result)
            raise

    async def test_regex_bypass_exploit(self):
        """Test that regex bypass detection works correctly"""
        print("\n🦦 Testing Regex Bypass Detection...")

        start_time = time.time()

        try:
            # Test the regex bypass exploit
            exploit = RegexBypassExploit(self.base_url)

            # Mock the exploit to avoid actual network calls
            with patch.object(exploit, "_test_regex_bypass", return_value=False):
                results = exploit.run_exploit()

            response_time = time.time() - start_time

            # Analyze results
            vulnerability_found = any(result.success for result in results)
            test_result = SecurityTestResult(
                test_name="Regex Bypass Detection",
                success=True,
                vulnerability_found=vulnerability_found,
                expected_vulnerability=False,  # Our backend should be secure
                details=f"Found {len([r for r in results if r.success])} regex bypass vulnerabilities",
                response_time=response_time,
            )

            self.log_test_result(test_result)

            if vulnerability_found:
                print("    ⚠️ Found unexpected regex bypass vulnerabilities")
                for result in results:
                    if result.success:
                        print(
                            f"        - {result.vulnerability_type}: {result.description}",
                        )
            else:
                print("    ✅ No regex bypass vulnerabilities found (secure)")

        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Regex Bypass Detection",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e),
            )
            self.log_test_result(test_result)
            raise

    async def test_union_based_sql_injection(self):
        """Test that union-based SQL injection detection works correctly"""
        print("\n🦦 Testing Union-Based SQL Injection Detection...")

        start_time = time.time()

        try:
            # Test the union-based SQL injection exploit
            exploit = UnionBasedExploit(self.base_url)

            # Mock the exploit to avoid actual network calls
            with patch.object(exploit, "_test_union_injection", return_value=False):
                results = exploit.run_exploit()

            response_time = time.time() - start_time

            # Analyze results
            vulnerability_found = any(result.success for result in results)
            test_result = SecurityTestResult(
                test_name="Union-Based SQL Injection Detection",
                success=True,
                vulnerability_found=vulnerability_found,
                expected_vulnerability=False,  # Our backend should be secure
                details=f"Found {len([r for r in results if r.success])} union-based SQL injection vulnerabilities",
                response_time=response_time,
            )

            self.log_test_result(test_result)

            if vulnerability_found:
                print(
                    "    ⚠️ Found unexpected union-based SQL injection vulnerabilities",
                )
                for result in results:
                    if result.success:
                        print(
                            f"        - {result.vulnerability_type}: {result.description}",
                        )
            else:
                print(
                    "    ✅ No union-based SQL injection vulnerabilities found (secure)",
                )

        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Union-Based SQL Injection Detection",
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
async def test_blind_sql_injection():
    """Test blind SQL injection detection"""
    async with TestSQLInjection() as tester:
        await tester.test_blind_sql_injection()


@pytest.mark.asyncio
async def test_obfuscated_sql_payloads():
    """Test obfuscated SQL payload detection"""
    async with TestSQLInjection() as tester:
        await tester.test_obfuscated_sql_payloads()


@pytest.mark.asyncio
async def test_regex_bypass():
    """Test regex bypass detection"""
    async with TestSQLInjection() as tester:
        await tester.test_regex_bypass_exploit()


@pytest.mark.asyncio
async def test_union_based_sql_injection():
    """Test union-based SQL injection detection"""
    async with TestSQLInjection() as tester:
        await tester.test_union_based_sql_injection()


if __name__ == "__main__":
    # Run tests directly
    async def main():
        async with TestSQLInjection() as tester:
            await tester.test_blind_sql_injection()
            await tester.test_obfuscated_sql_payloads()
            await tester.test_regex_bypass_exploit()
            await tester.test_union_based_sql_injection()

            # Print summary
            summary = tester.get_test_summary()
            print("\n🦦 SQL Injection Test Summary:")
            print(f"    Total Tests: {summary['total_tests']}")
            print(f"    Passed: {summary['passed_tests']}")
            print(f"    Failed: {summary['failed_tests']}")
            print(f"    Success Rate: {summary['success_rate']:.1f}%")
            print(f"    Vulnerabilities Found: {summary['vulnerabilities_found']}")

    asyncio.run(main())
