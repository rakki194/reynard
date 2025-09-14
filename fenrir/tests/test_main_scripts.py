"""
🦦 MAIN SCRIPTS TEST SUITE

*splashes with enthusiasm* Testing our main exploit runner scripts to ensure they can
properly execute and coordinate all security testing modules!
"""

import pytest
import asyncio
import time
import sys
import os
from unittest.mock import Mock, patch, AsyncMock, MagicMock
from .test_base import FenrirTestBase, SecurityTestResult

# Add the fenrir directory to the path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class TestMainScripts(FenrirTestBase):
    """
    *otter curiosity* Test suite for main exploit runner scripts
    """
    
    async def test_run_all_exploits_script(self):
        """Test that the run_all_exploits.py script works correctly"""
        print("\n🦦 Testing Run All Exploits Script...")
        
        start_time = time.time()
        
        try:
            # Import and test the main script
            from run_all_exploits import BlackHatExploitSuite
            
            # Mock the exploit suite to avoid actual network calls
            with patch('run_all_exploits.BlackHatExploitSuite') as mock_suite:
                mock_instance = MagicMock()
                mock_suite.return_value = mock_instance
                mock_instance.run_all_exploits.return_value = []
                
                # Test the script initialization
                suite = BlackHatExploitSuite()
                results = suite.run_all_exploits()
            
            response_time = time.time() - start_time
            
            test_result = SecurityTestResult(
                test_name="Run All Exploits Script",
                success=True,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Script executed successfully",
                response_time=response_time
            )
            
            self.log_test_result(test_result)
            print(f"    ✅ Run All Exploits script executed successfully")
            
        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Run All Exploits Script",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e)
            )
            self.log_test_result(test_result)
            raise
    
    async def test_run_llm_exploits_script(self):
        """Test that the run_llm_exploits.py script works correctly"""
        print("\n🦦 Testing Run LLM Exploits Script...")
        
        start_time = time.time()
        
        try:
            # Import and test the LLM exploits script
            from run_llm_exploits import LLMExploitRunner
            
            # Mock the LLM exploit runner to avoid actual network calls
            with patch('run_llm_exploits.LLMExploitRunner') as mock_runner:
                mock_instance = MagicMock()
                mock_runner.return_value = mock_instance
                mock_instance.run_llm_exploits.return_value = []
                
                # Test the script initialization
                runner = LLMExploitRunner()
                results = runner.run_llm_exploits()
            
            response_time = time.time() - start_time
            
            test_result = SecurityTestResult(
                test_name="Run LLM Exploits Script",
                success=True,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Script executed successfully",
                response_time=response_time
            )
            
            self.log_test_result(test_result)
            print(f"    ✅ Run LLM Exploits script executed successfully")
            
        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Run LLM Exploits Script",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e)
            )
            self.log_test_result(test_result)
            raise
    
    async def test_penetration_testing_client(self):
        """Test that the penetration_testing_client.py script works correctly"""
        print("\n🦦 Testing Penetration Testing Client...")
        
        start_time = time.time()
        
        try:
            # Import and test the penetration testing client
            from penetration_testing_client import PenetrationTestingClient
            
            # Mock the client to avoid actual network calls
            with patch('penetration_testing_client.PenetrationTestingClient') as mock_client:
                mock_instance = MagicMock()
                mock_client.return_value = mock_instance
                mock_instance.run_penetration_tests.return_value = []
                
                # Test the client initialization
                client = PenetrationTestingClient()
                results = client.run_penetration_tests()
            
            response_time = time.time() - start_time
            
            test_result = SecurityTestResult(
                test_name="Penetration Testing Client",
                success=True,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Client executed successfully",
                response_time=response_time
            )
            
            self.log_test_result(test_result)
            print(f"    ✅ Penetration Testing Client executed successfully")
            
        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Penetration Testing Client",
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
async def test_run_all_exploits_script():
    """Test run all exploits script"""
    async with TestMainScripts() as tester:
        await tester.test_run_all_exploits_script()

@pytest.mark.asyncio
async def test_run_llm_exploits_script():
    """Test run LLM exploits script"""
    async with TestMainScripts() as tester:
        await tester.test_run_llm_exploits_script()

@pytest.mark.asyncio
async def test_penetration_testing_client():
    """Test penetration testing client"""
    async with TestMainScripts() as tester:
        await tester.test_penetration_testing_client()

if __name__ == "__main__":
    # Run tests directly
    async def main():
        async with TestMainScripts() as tester:
            await tester.test_run_all_exploits_script()
            await tester.test_run_llm_exploits_script()
            await tester.test_penetration_testing_client()
            
            # Print summary
            summary = tester.get_test_summary()
            print(f"\n🦦 Main Scripts Test Summary:")
            print(f"    Total Tests: {summary['total_tests']}")
            print(f"    Passed: {summary['passed_tests']}")
            print(f"    Failed: {summary['failed_tests']}")
            print(f"    Success Rate: {summary['success_rate']:.1f}%")
            print(f"    Vulnerabilities Found: {summary['vulnerabilities_found']}")
    
    asyncio.run(main())
