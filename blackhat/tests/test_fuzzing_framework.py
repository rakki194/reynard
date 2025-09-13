"""
🦦 FUZZING FRAMEWORK TEST SUITE

*splashes with enthusiasm* Testing our comprehensive fuzzing framework to ensure it can
properly identify vulnerabilities and avoid false positives!
"""

import pytest
import asyncio
import time
from unittest.mock import Mock, patch
from test_base import BlackhatTestBase, TestResult

from fuzzing.comprehensive_fuzzer import ComprehensiveFuzzer
from fuzzing.endpoint_fuzzer import EndpointFuzzer
from fuzzing.payload_generator import PayloadGenerator

class TestFuzzingFramework(BlackhatTestBase):
    """
    *otter curiosity* Test suite for the fuzzing framework
    """
    
    async def test_payload_generator(self):
        """Test that the payload generator creates appropriate payloads"""
        print("\n🦦 Testing Payload Generator...")
        
        start_time = time.time()
        
        try:
            generator = PayloadGenerator()
            
            # Test SQL injection payloads
            sql_payloads = generator.sql_injection_payloads
            assert len(sql_payloads) > 0, "Should generate SQL injection payloads"
            
            # Test XSS payloads
            xss_payloads = generator.xss_payloads
            assert len(xss_payloads) > 0, "Should generate XSS payloads"
            
            # Test path traversal payloads
            path_payloads = generator.path_traversal_payloads
            assert len(path_payloads) > 0, "Should generate path traversal payloads"
            
            # Test command injection payloads
            cmd_payloads = generator.command_injection_payloads
            assert len(cmd_payloads) > 0, "Should generate command injection payloads"
            
            response_time = time.time() - start_time
            
            test_result = TestResult(
                test_name="Payload Generator",
                success=True,
                vulnerability_found=False,
                expected_vulnerability=False,
                details=f"Generated {len(sql_payloads)} SQL, {len(xss_payloads)} XSS, {len(path_payloads)} path traversal, {len(cmd_payloads)} command injection payloads",
                response_time=response_time
            )
            
            self.log_test_result(test_result)
            print(f"    ✅ Payload generator working correctly")
            
        except Exception as e:
            response_time = time.time() - start_time
            test_result = TestResult(
                test_name="Payload Generator",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e)
            )
            self.log_test_result(test_result)
            raise
    
    async def test_comprehensive_fuzzer_vulnerability_detection(self):
        """Test that the comprehensive fuzzer can detect vulnerabilities"""
        print("\n🦦 Testing Comprehensive Fuzzer Vulnerability Detection...")
        
        start_time = time.time()
        
        try:
            async with ComprehensiveFuzzer(self.base_url) as fuzzer:
                # Test a small number of endpoints to avoid overwhelming the server
                results = await fuzzer.fuzz_authentication_endpoints()
                
                response_time = time.time() - start_time
                
                # Count vulnerabilities found
                vulnerabilities = [r for r in results if r.vulnerability_detected]
                
                test_result = TestResult(
                    test_name="Comprehensive Fuzzer",
                    success=True,
                    vulnerability_found=len(vulnerabilities) > 0,
                    expected_vulnerability=False,  # Our backend should be secure
                    details=f"Tested {len(results)} requests, found {len(vulnerabilities)} vulnerabilities",
                    response_time=response_time
                )
                
                self.log_test_result(test_result)
                
                if len(vulnerabilities) > 0:
                    print(f"    ⚠️ Found {len(vulnerabilities)} potential vulnerabilities:")
                    for vuln in vulnerabilities[:5]:  # Show first 5
                        print(f"        - {vuln.vulnerability_type} on {vuln.url}")
                else:
                    print(f"    ✅ No vulnerabilities found (secure backend)")
                
        except Exception as e:
            response_time = time.time() - start_time
            test_result = TestResult(
                test_name="Comprehensive Fuzzer",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e)
            )
            self.log_test_result(test_result)
            raise
    
    async def test_endpoint_fuzzer(self):
        """Test that the endpoint fuzzer works correctly"""
        print("\n🦦 Testing Endpoint Fuzzer...")
        
        start_time = time.time()
        
        try:
            fuzzer = EndpointFuzzer(self.base_url)
            
            # Test fuzzing a specific endpoint
            results = await fuzzer.fuzz_api_endpoint_comprehensive("/api/auth/register", "POST")
            
            response_time = time.time() - start_time
            
            # Count vulnerabilities found
            vulnerabilities = [r for r in results if r.vulnerability_detected]
            
            test_result = TestResult(
                test_name="Endpoint Fuzzer",
                success=True,
                vulnerability_found=len(vulnerabilities) > 0,
                expected_vulnerability=False,  # Our backend should be secure
                details=f"Tested {len(results)} requests on /api/auth/register, found {len(vulnerabilities)} vulnerabilities",
                response_time=response_time
            )
            
            self.log_test_result(test_result)
            
            if len(vulnerabilities) > 0:
                print(f"    ⚠️ Found {len(vulnerabilities)} potential vulnerabilities on /api/auth/register")
            else:
                print(f"    ✅ No vulnerabilities found on /api/auth/register (secure)")
            
        except Exception as e:
            response_time = time.time() - start_time
            test_result = TestResult(
                test_name="Endpoint Fuzzer",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e)
            )
            self.log_test_result(test_result)
            raise
    
    async def test_fuzzing_false_positive_prevention(self):
        """Test that fuzzing doesn't produce false positives"""
        print("\n🦦 Testing Fuzzing False Positive Prevention...")
        
        start_time = time.time()
        
        try:
            async with ComprehensiveFuzzer(self.base_url) as fuzzer:
                # Test with a known secure endpoint
                results = await fuzzer.fuzz_endpoint("/api/docs", "GET")
                
                response_time = time.time() - start_time
                
                # Count false positives (vulnerabilities found on secure endpoint)
                false_positives = [r for r in results if r.vulnerability_detected]
                
                test_result = TestResult(
                    test_name="False Positive Prevention",
                    success=len(false_positives) == 0,
                    vulnerability_found=len(false_positives) > 0,
                    expected_vulnerability=False,  # Should not find vulnerabilities on secure endpoint
                    details=f"Tested {len(results)} requests on /api/docs, found {len(false_positives)} false positives",
                    response_time=response_time
                )
                
                self.log_test_result(test_result)
                
                if len(false_positives) > 0:
                    print(f"    ❌ Found {len(false_positives)} false positives on secure endpoint")
                else:
                    print(f"    ✅ No false positives found (good detection accuracy)")
                
        except Exception as e:
            response_time = time.time() - start_time
            test_result = TestResult(
                test_name="False Positive Prevention",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e)
            )
            self.log_test_result(test_result)
            raise
    
    async def test_fuzzing_performance(self):
        """Test that fuzzing performs within acceptable time limits"""
        print("\n🦦 Testing Fuzzing Performance...")
        
        start_time = time.time()
        
        try:
            async with ComprehensiveFuzzer(self.base_url) as fuzzer:
                # Test with a small number of requests to measure performance
                results = await fuzzer.fuzz_endpoint("/api/auth/login", "POST")
                
                response_time = time.time() - start_time
                
                # Calculate requests per second
                requests_per_second = len(results) / response_time if response_time > 0 else 0
                
                test_result = TestResult(
                    test_name="Fuzzing Performance",
                    success=requests_per_second >= 1.0,  # At least 1 request per second
                    vulnerability_found=False,
                    expected_vulnerability=False,
                    details=f"Processed {len(results)} requests in {response_time:.2f}s ({requests_per_second:.1f} req/s)",
                    response_time=response_time
                )
                
                self.log_test_result(test_result)
                
                if requests_per_second >= 1.0:
                    print(f"    ✅ Good performance: {requests_per_second:.1f} requests/second")
                else:
                    print(f"    ⚠️ Slow performance: {requests_per_second:.1f} requests/second")
                
        except Exception as e:
            response_time = time.time() - start_time
            test_result = TestResult(
                test_name="Fuzzing Performance",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e)
            )
            self.log_test_result(test_result)
            raise

# Pytest test functions
@pytest.mark.asyncio
async def test_payload_generator():
    """Test payload generator"""
    async with TestFuzzingFramework() as tester:
        await tester.test_payload_generator()

@pytest.mark.asyncio
async def test_comprehensive_fuzzer():
    """Test comprehensive fuzzer"""
    async with TestFuzzingFramework() as tester:
        await tester.test_comprehensive_fuzzer_vulnerability_detection()

@pytest.mark.asyncio
async def test_endpoint_fuzzer():
    """Test endpoint fuzzer"""
    async with TestFuzzingFramework() as tester:
        await tester.test_endpoint_fuzzer()

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
            await tester.test_payload_generator()
            await tester.test_comprehensive_fuzzer_vulnerability_detection()
            await tester.test_endpoint_fuzzer()
            await tester.test_fuzzing_false_positive_prevention()
            await tester.test_fuzzing_performance()
            
            # Print summary
            summary = tester.get_test_summary()
            print(f"\n🦦 Fuzzing Framework Test Summary:")
            print(f"    Total Tests: {summary['total_tests']}")
            print(f"    Passed: {summary['passed_tests']}")
            print(f"    Failed: {summary['failed_tests']}")
            print(f"    Success Rate: {summary['success_rate']:.1f}%")
            print(f"    Vulnerabilities Found: {summary['vulnerabilities_found']}")
    
    asyncio.run(main())
