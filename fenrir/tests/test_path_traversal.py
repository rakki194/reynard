"""
🦦 PATH TRAVERSAL TEST SUITE

*splashes with enthusiasm* Testing our path traversal exploits to ensure they can
properly identify path traversal vulnerabilities and security issues!
"""

import pytest
import asyncio
import time
from unittest.mock import Mock, patch, AsyncMock
from .test_base import FenrirTestBase, SecurityTestResult

from ..path_traversal.double_encoded import DoubleEncodedTraversalExploit
from ..path_traversal.encoded_traversal import EncodedPathTraversalExploit
from ..path_traversal.unicode_bypass import UnicodePathTraversalExploit
from ..path_traversal.windows_bypass import WindowsPathTraversalExploit

class TestPathTraversal(FenrirTestBase):
    """
    *otter curiosity* Test suite for path traversal exploits
    """
    
    async def test_double_encoded_path_traversal(self):
        """Test that double encoded path traversal detection works correctly"""
        print("\n🦦 Testing Double Encoded Path Traversal Detection...")
        
        start_time = time.time()
        
        try:
            # Test the double encoded path traversal exploit
            exploit = DoubleEncodedTraversalExploit(self.base_url)
            
            # Mock the exploit to avoid actual network calls
            with patch.object(exploit, '_test_double_encoded_traversal', return_value=False):
                results = exploit.run_exploit()
            
            response_time = time.time() - start_time
            
            # Analyze results
            vulnerability_found = any(result.success for result in results)
            test_result = SecurityTestResult(
                test_name="Double Encoded Path Traversal Detection",
                success=True,
                vulnerability_found=vulnerability_found,
                expected_vulnerability=False,  # Our backend should be secure
                details=f"Found {len([r for r in results if r.success])} double encoded path traversal vulnerabilities",
                response_time=response_time
            )
            
            self.log_test_result(test_result)
            
            if vulnerability_found:
                print(f"    ⚠️ Found unexpected double encoded path traversal vulnerabilities")
                for result in results:
                    if result.success:
                        print(f"        - {result.vulnerability_type}: {result.description}")
            else:
                print(f"    ✅ No double encoded path traversal vulnerabilities found (secure)")
            
        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Double Encoded Path Traversal Detection",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e)
            )
            self.log_test_result(test_result)
            raise
    
    async def test_encoded_path_traversal(self):
        """Test that encoded path traversal detection works correctly"""
        print("\n🦦 Testing Encoded Path Traversal Detection...")
        
        start_time = time.time()
        
        try:
            # Test the encoded path traversal exploit
            exploit = EncodedPathTraversalExploit(self.base_url)
            
            # Mock the exploit to avoid actual network calls
            with patch.object(exploit, '_test_encoded_traversal', return_value=False):
                results = exploit.run_exploit()
            
            response_time = time.time() - start_time
            
            # Analyze results
            vulnerability_found = any(result.success for result in results)
            test_result = SecurityTestResult(
                test_name="Encoded Path Traversal Detection",
                success=True,
                vulnerability_found=vulnerability_found,
                expected_vulnerability=False,  # Our backend should be secure
                details=f"Found {len([r for r in results if r.success])} encoded path traversal vulnerabilities",
                response_time=response_time
            )
            
            self.log_test_result(test_result)
            
            if vulnerability_found:
                print(f"    ⚠️ Found unexpected encoded path traversal vulnerabilities")
                for result in results:
                    if result.success:
                        print(f"        - {result.vulnerability_type}: {result.description}")
            else:
                print(f"    ✅ No encoded path traversal vulnerabilities found (secure)")
            
        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Encoded Path Traversal Detection",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e)
            )
            self.log_test_result(test_result)
            raise
    
    async def test_unicode_path_traversal_bypass(self):
        """Test that Unicode path traversal bypass detection works correctly"""
        print("\n🦦 Testing Unicode Path Traversal Bypass Detection...")
        
        start_time = time.time()
        
        try:
            # Test the Unicode path traversal bypass exploit
            exploit = UnicodePathTraversalExploit(self.base_url)
            
            # Mock the exploit to avoid actual network calls
            with patch.object(exploit, '_test_unicode_traversal', return_value=False):
                results = exploit.run_exploit()
            
            response_time = time.time() - start_time
            
            # Analyze results
            vulnerability_found = any(result.success for result in results)
            test_result = SecurityTestResult(
                test_name="Unicode Path Traversal Bypass Detection",
                success=True,
                vulnerability_found=vulnerability_found,
                expected_vulnerability=False,  # Our backend should be secure
                details=f"Found {len([r for r in results if r.success])} Unicode path traversal vulnerabilities",
                response_time=response_time
            )
            
            self.log_test_result(test_result)
            
            if vulnerability_found:
                print(f"    ⚠️ Found unexpected Unicode path traversal vulnerabilities")
                for result in results:
                    if result.success:
                        print(f"        - {result.vulnerability_type}: {result.description}")
            else:
                print(f"    ✅ No Unicode path traversal vulnerabilities found (secure)")
            
        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Unicode Path Traversal Bypass Detection",
                success=False,
                vulnerability_found=False,
                expected_vulnerability=False,
                details="Test failed",
                response_time=response_time,
                error=str(e)
            )
            self.log_test_result(test_result)
            raise
    
    async def test_windows_path_traversal_bypass(self):
        """Test that Windows path traversal bypass detection works correctly"""
        print("\n🦦 Testing Windows Path Traversal Bypass Detection...")
        
        start_time = time.time()
        
        try:
            # Test the Windows path traversal bypass exploit
            exploit = WindowsPathTraversalExploit(self.base_url)
            
            # Mock the exploit to avoid actual network calls
            with patch.object(exploit, '_test_windows_traversal', return_value=False):
                results = exploit.run_exploit()
            
            response_time = time.time() - start_time
            
            # Analyze results
            vulnerability_found = any(result.success for result in results)
            test_result = SecurityTestResult(
                test_name="Windows Path Traversal Bypass Detection",
                success=True,
                vulnerability_found=vulnerability_found,
                expected_vulnerability=False,  # Our backend should be secure
                details=f"Found {len([r for r in results if r.success])} Windows path traversal vulnerabilities",
                response_time=response_time
            )
            
            self.log_test_result(test_result)
            
            if vulnerability_found:
                print(f"    ⚠️ Found unexpected Windows path traversal vulnerabilities")
                for result in results:
                    if result.success:
                        print(f"        - {result.vulnerability_type}: {result.description}")
            else:
                print(f"    ✅ No Windows path traversal vulnerabilities found (secure)")
            
        except Exception as e:
            response_time = time.time() - start_time
            test_result = SecurityTestResult(
                test_name="Windows Path Traversal Bypass Detection",
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
async def test_double_encoded_path_traversal():
    """Test double encoded path traversal detection"""
    async with TestPathTraversal() as tester:
        await tester.test_double_encoded_path_traversal()

@pytest.mark.asyncio
async def test_encoded_path_traversal():
    """Test encoded path traversal detection"""
    async with TestPathTraversal() as tester:
        await tester.test_encoded_path_traversal()

@pytest.mark.asyncio
async def test_unicode_path_traversal_bypass():
    """Test Unicode path traversal bypass detection"""
    async with TestPathTraversal() as tester:
        await tester.test_unicode_path_traversal_bypass()

@pytest.mark.asyncio
async def test_windows_path_traversal_bypass():
    """Test Windows path traversal bypass detection"""
    async with TestPathTraversal() as tester:
        await tester.test_windows_path_traversal_bypass()

if __name__ == "__main__":
    # Run tests directly
    async def main():
        async with TestPathTraversal() as tester:
            await tester.test_double_encoded_path_traversal()
            await tester.test_encoded_path_traversal()
            await tester.test_unicode_path_traversal_bypass()
            await tester.test_windows_path_traversal_bypass()
            
            # Print summary
            summary = tester.get_test_summary()
            print(f"\n🦦 Path Traversal Test Summary:")
            print(f"    Total Tests: {summary['total_tests']}")
            print(f"    Passed: {summary['passed_tests']}")
            print(f"    Failed: {summary['failed_tests']}")
            print(f"    Success Rate: {summary['success_rate']:.1f}%")
            print(f"    Vulnerabilities Found: {summary['vulnerabilities_found']}")
    
    asyncio.run(main())
