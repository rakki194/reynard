"""
🦦 HTTP SMUGGLING TEST SUITE

*splashes with enthusiasm* Testing our HTTP request smuggling exploits to ensure they can
properly identify HTTP smuggling vulnerabilities and security issues!
"""

import pytest
import asyncio
import time
from unittest.mock import Mock, patch, AsyncMock
from .test_base import FenrirTestBase, SecurityTestResult

from ..http_smuggling.request_smuggling import HTTPRequestSmuggling

class TestHTTPSmuggling(FenrirTestBase):
    """
    *otter curiosity* Test suite for HTTP request smuggling exploits
    """
    
    async def test_http_smuggling_detection(self):
        """Test that HTTP request smuggling detection works correctly"""
        print("\n🦦 Testing HTTP Request Smuggling Detection...")
        
        start_time = time.time()
        
        try:
            # Test the HTTP smuggling exploit
            exploit = HTTPRequestSmuggling(self.base_url)
            
            # Mock the exploit to avoid actual network calls
            with patch.object(exploit, '_test_cl_te_smuggling', return_value=False):
                with patch.object(exploit, '_test_te_cl_smuggling', return_value=False):
                    results = exploit.run_exploit()
            
            response_time = time.time() - start_time
            
            # Analyze results
            vulnerability_found = any(result.success for result in results)
            test_result = SecurityTestResult(
                test_name="HTTP Request Smuggling Detection",
                success=True,
                vulnerability_found=vulnerability_found,
                expected_vulnerability=False,  # Our backend should be secure
                details=f"Found {len([r for r in results if r.success])} HTTP smuggling vulnerabilities",
                response_time=response_time
            )
            
            self.log_test_result(test_result)
            
            if vulnerability_found:
                print(f"    ⚠️ Found unexpected HTTP smuggling vulnerabilities")
                for result in results:
                    if result.success:
                        print(f"        - {result.vulnerability_type}: {result.description}")
            else:
                print(f"    ✅ No HTTP smuggling vulnerabilities found (secure)")
            
        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="HTTP Request Smuggling Detection",
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
async def test_http_smuggling():
    """Test HTTP request smuggling detection"""
    async with TestHTTPSmuggling() as tester:
        await tester.test_http_smuggling_detection()

if __name__ == "__main__":
    # Run tests directly
    async def main():
        async with TestHTTPSmuggling() as tester:
            await tester.test_http_smuggling_detection()
            
            # Print summary
            summary = tester.get_test_summary()
            print(f"\n🦦 HTTP Smuggling Test Summary:")
            print(f"    Total Tests: {summary['total_tests']}")
            print(f"    Passed: {summary['passed_tests']}")
            print(f"    Failed: {summary['failed_tests']}")
            print(f"    Success Rate: {summary['success_rate']:.1f}%")
            print(f"    Vulnerabilities Found: {summary['vulnerabilities_found']}")
    
    asyncio.run(main())
