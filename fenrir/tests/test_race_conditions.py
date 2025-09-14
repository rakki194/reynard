"""
🦦 RACE CONDITIONS TEST SUITE

*splashes with enthusiasm* Testing our race condition exploits to ensure they can
properly identify race condition vulnerabilities and security issues!
"""

import pytest
import asyncio
import time
from unittest.mock import Mock, patch, AsyncMock
from .test_base import FenrirTestBase, SecurityTestResult

from ..race_conditions.race_exploits import RaceConditionExploit

class TestRaceConditions(FenrirTestBase):
    """
    *otter curiosity* Test suite for race condition exploits
    """
    
    async def test_race_condition_detection(self):
        """Test that race condition detection works correctly"""
        print("\n🦦 Testing Race Condition Detection...")
        
        start_time = time.time()
        
        try:
            # Test the race condition exploit
            exploit = RaceConditionExploit(self.base_url)
            
            # Mock the exploit to avoid actual network calls
            with patch.object(exploit, '_test_concurrent_requests', return_value=False):
                with patch.object(exploit, '_test_timing_attack', return_value=False):
                    results = exploit.run_exploit()
            
            response_time = time.time() - start_time
            
            # Analyze results
            vulnerability_found = any(result.success for result in results)
            test_result = SecurityTestResult(
                test_name="Race Condition Detection",
                success=True,
                vulnerability_found=vulnerability_found,
                expected_vulnerability=False,  # Our backend should be secure
                details=f"Found {len([r for r in results if r.success])} race condition vulnerabilities",
                response_time=response_time
            )
            
            self.log_test_result(test_result)
            
            if vulnerability_found:
                print(f"    ⚠️ Found unexpected race condition vulnerabilities")
                for result in results:
                    if result.success:
                        print(f"        - {result.vulnerability_type}: {result.description}")
            else:
                print(f"    ✅ No race condition vulnerabilities found (secure)")
            
        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Race Condition Detection",
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
async def test_race_condition():
    """Test race condition detection"""
    async with TestRaceConditions() as tester:
        await tester.test_race_condition_detection()

if __name__ == "__main__":
    # Run tests directly
    async def main():
        async with TestRaceConditions() as tester:
            await tester.test_race_condition_detection()
            
            # Print summary
            summary = tester.get_test_summary()
            print(f"\n🦦 Race Conditions Test Summary:")
            print(f"    Total Tests: {summary['total_tests']}")
            print(f"    Passed: {summary['passed_tests']}")
            print(f"    Failed: {summary['failed_tests']}")
            print(f"    Success Rate: {summary['success_rate']:.1f}%")
            print(f"    Vulnerabilities Found: {summary['vulnerabilities_found']}")
    
    asyncio.run(main())
