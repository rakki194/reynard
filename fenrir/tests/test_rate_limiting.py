"""
🦦 RATE LIMITING TEST SUITE

*splashes with enthusiasm* Testing our rate limiting bypass exploits to ensure they can
properly identify rate limiting vulnerabilities and security issues!
"""

import pytest
import asyncio
import time
from unittest.mock import Mock, patch
from .test_base import FenrirTestBase, SecurityTestResult

from ..rate_limiting.rate_limit_bypass import RateLimitBypassExploit

class TestRateLimiting(FenrirTestBase):
    """
    *otter curiosity* Test suite for rate limiting security exploits
    """
    
    async def test_rate_limit_bypass_detection(self):
        """Test that rate limit bypass detection works correctly"""
        print("\n🦦 Testing Rate Limit Bypass Detection...")
        
        start_time = time.time()
        
        try:
            # Test the rate limit bypass exploit
            exploit = RateLimitBypassExploit(self.base_url)
            results = exploit.run_exploit()
            
            response_time = time.time() - start_time
            
            # Analyze results
            vulnerability_found = any(result.success for result in results)
            test_result = SecurityTestResult(
                test_name="Rate Limit Bypass",
                success=True,
                vulnerability_found=vulnerability_found,
                expected_vulnerability=False,  # Our backend should be secure
                details=f"Found {len([r for r in results if r.success])} rate limiting vulnerabilities",
                response_time=response_time
            )
            
            self.log_test_result(test_result)
            
            # Verify that we didn't find unexpected vulnerabilities
            if vulnerability_found:
                print(f"    ⚠️ Found unexpected rate limiting bypass vulnerabilities")
                for result in results:
                    if result.success:
                        print(f"        - {result.vulnerability_type}: {result.description}")
            else:
                print(f"    ✅ No rate limiting bypass vulnerabilities found (secure)")
            
        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Rate Limit Bypass",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e)
            )
            self.log_test_result(test_result)
            raise
    
    async def test_rate_limiting_functionality(self):
        """Test that rate limiting is actually working"""
        print("\n🦦 Testing Rate Limiting Functionality...")
        
        start_time = time.time()
        
        try:
            # Make multiple rapid requests to trigger rate limiting
            responses = []
            for i in range(10):
                response = await self.make_request(
                    "POST",
                    "/api/auth/login",
                    data={"username": f"testuser{i}", "password": "wrongpassword"}
                )
                responses.append(response)
                await asyncio.sleep(0.1)  # Small delay between requests
            
            response_time = time.time() - start_time
            
            # Check if any requests were rate limited (429 status code)
            rate_limited_requests = [r for r in responses if r.status_code == 429]
            
            test_result = SecurityTestResult(
                test_name="Rate Limiting Functionality",
                success=True,
                vulnerability_found=len(rate_limited_requests) == 0,
                expected_vulnerability=False,  # Rate limiting should be working
                details=f"Made {len(responses)} requests, {len(rate_limited_requests)} were rate limited",
                response_time=response_time
            )
            
            self.log_test_result(test_result)
            
            if len(rate_limited_requests) > 0:
                print(f"    ✅ Rate limiting working: {len(rate_limited_requests)} requests were rate limited")
            else:
                print(f"    ⚠️ Rate limiting may not be working: no requests were rate limited")
            
        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Rate Limiting Functionality",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e)
            )
            self.log_test_result(test_result)
            raise
    
    async def test_header_manipulation_bypass(self):
        """Test that header manipulation doesn't bypass rate limiting"""
        print("\n🦦 Testing Header Manipulation Bypass...")
        
        start_time = time.time()
        
        try:
            # Test various header manipulation techniques
            bypass_attempts = [
                {"X-Forwarded-For": "192.168.1.1"},
                {"X-Real-IP": "10.0.0.1"},
                {"X-Client-IP": "172.16.0.1"},
                {"X-Remote-IP": "203.0.113.1"},
                {"X-Originating-IP": "198.51.100.1"},
                {"User-Agent": "Mozilla/5.0 (Different Browser)"},
                {"X-Forwarded-For": "192.168.1.1, 10.0.0.1, 172.16.0.1"}
            ]
            
            bypass_successes = 0
            
            for headers in bypass_attempts:
                # Make a request with manipulated headers
                response = await self.make_request(
                    "POST",
                    "/api/auth/login",
                    data={"username": "testuser", "password": "wrongpassword"},
                    headers=headers
                )
                
                # If we get a 200 response, the bypass might have worked
                if response.status_code == 200:
                    bypass_successes += 1
                    print(f"        - Header bypass successful: {headers}")
            
            response_time = time.time() - start_time
            
            test_result = SecurityTestResult(
                test_name="Header Manipulation Bypass",
                success=True,
                vulnerability_found=bypass_successes > 0,
                expected_vulnerability=False,  # Our backend should be secure
                details=f"Tested {len(bypass_attempts)} header manipulation attempts, {bypass_successes} successful",
                response_time=response_time
            )
            
            self.log_test_result(test_result)
            
            if bypass_successes > 0:
                print(f"    ⚠️ {bypass_successes} header manipulation bypasses were successful")
            else:
                print(f"    ✅ All header manipulation bypasses were blocked")
            
        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Header Manipulation Bypass",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e)
            )
            self.log_test_result(test_result)
            raise
    
    async def test_timing_attack_bypass(self):
        """Test that timing attacks don't bypass rate limiting"""
        print("\n🦦 Testing Timing Attack Bypass...")
        
        start_time = time.time()
        
        try:
            # Test timing-based bypass attempts
            timing_attempts = [
                {"delay": 0.5, "description": "Half second delay"},
                {"delay": 1.0, "description": "One second delay"},
                {"delay": 2.0, "description": "Two second delay"},
                {"delay": 5.0, "description": "Five second delay"}
            ]
            
            bypass_successes = 0
            
            for attempt in timing_attempts:
                # Make requests with different timing patterns
                for i in range(3):
                    response = await self.make_request(
                        "POST",
                        "/api/auth/login",
                        data={"username": f"testuser{i}", "password": "wrongpassword"}
                    )
                    
                    if response.status_code == 200:
                        bypass_successes += 1
                        print(f"        - Timing bypass successful: {attempt['description']}")
                    
                    await asyncio.sleep(attempt["delay"])
            
            response_time = time.time() - start_time
            
            test_result = SecurityTestResult(
                test_name="Timing Attack Bypass",
                success=True,
                vulnerability_found=bypass_successes > 0,
                expected_vulnerability=False,  # Our backend should be secure
                details=f"Tested {len(timing_attempts)} timing patterns, {bypass_successes} successful bypasses",
                response_time=response_time
            )
            
            self.log_test_result(test_result)
            
            if bypass_successes > 0:
                print(f"    ⚠️ {bypass_successes} timing attack bypasses were successful")
            else:
                print(f"    ✅ All timing attack bypasses were blocked")
            
        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Timing Attack Bypass",
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
async def test_rate_limit_bypass():
    """Test rate limit bypass detection"""
    async with TestRateLimiting() as tester:
        await tester.test_rate_limit_bypass_detection()

@pytest.mark.asyncio
async def test_rate_limiting_functionality():
    """Test rate limiting functionality"""
    async with TestRateLimiting() as tester:
        await tester.test_rate_limiting_functionality()

@pytest.mark.asyncio
async def test_header_manipulation():
    """Test header manipulation bypass"""
    async with TestRateLimiting() as tester:
        await tester.test_header_manipulation_bypass()

@pytest.mark.asyncio
async def test_timing_attack():
    """Test timing attack bypass"""
    async with TestRateLimiting() as tester:
        await tester.test_timing_attack_bypass()

if __name__ == "__main__":
    # Run tests directly
    async def main():
        async with TestRateLimiting() as tester:
            await tester.test_rate_limit_bypass_detection()
            await tester.test_rate_limiting_functionality()
            await tester.test_header_manipulation_bypass()
            await tester.test_timing_attack_bypass()
            
            # Print summary
            summary = tester.get_test_summary()
            print(f"\n🦦 Rate Limiting Test Summary:")
            print(f"    Total Tests: {summary['total_tests']}")
            print(f"    Passed: {summary['passed_tests']}")
            print(f"    Failed: {summary['failed_tests']}")
            print(f"    Success Rate: {summary['success_rate']:.1f}%")
            print(f"    Vulnerabilities Found: {summary['vulnerabilities_found']}")
    
    asyncio.run(main())
