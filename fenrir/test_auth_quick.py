#!/usr/bin/env python3
"""🦊 Quick Authentication Test
=============================

Quick test script to verify MCP authentication system is working.
This script performs basic connectivity and authentication tests.

Usage:
    python test_auth_quick.py

Author: Odonata-Oracle-6 (Dragonfly Specialist)
Version: 1.0.0
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from fenrir.tests.test_mcp_authentication import MCPAuthenticationTestSuite


async def quick_auth_test():
    """Run a quick authentication test."""
    print("🦊 Quick MCP Authentication Test")
    print("=" * 40)

    # Initialize test suite
    test_suite = MCPAuthenticationTestSuite()

    try:
        # Set up test environment
        print("Setting up test environment...")
        await test_suite.setup_test_environment()

        # Test 1: Check if MCP server is accessible
        print("\n1. Testing MCP server accessibility...")
        try:
            import requests
            response = requests.get(f"{test_suite.mcp_server_url}/health", timeout=5)
            if response.status_code == 200:
                print("✅ MCP server is accessible")
            else:
                print(f"⚠️  MCP server responded with status {response.status_code}")
        except Exception as e:
            print(f"❌ MCP server is not accessible: {e}")
            return False

        # Test 2: Check if FastAPI backend is accessible
        print("\n2. Testing FastAPI backend accessibility...")
        try:
            response = requests.get(f"{test_suite.fastapi_backend_url}/health", timeout=5)
            if response.status_code == 200:
                print("✅ FastAPI backend is accessible")
            else:
                print(f"⚠️  FastAPI backend responded with status {response.status_code}")
        except Exception as e:
            print(f"❌ FastAPI backend is not accessible: {e}")
            return False

        # Test 3: Test unauthenticated access rejection
        print("\n3. Testing unauthenticated access rejection...")
        try:
            response = requests.get(f"{test_suite.mcp_server_url}/tools/list", timeout=5)
            if response.status_code == 401:
                print("✅ MCP server correctly rejects unauthenticated requests")
            else:
                print(f"❌ MCP server allows unauthenticated access: {response.status_code}")
                return False
        except Exception as e:
            print(f"⚠️  Could not test unauthenticated access: {e}")

        # Test 4: Test token generation
        print("\n4. Testing token generation...")
        try:
            token = test_suite.auth_service.generate_mcp_token(
                test_suite.test_client_id, ["mcp:read"]
            )
            if token:
                print("✅ Token generation successful")
            else:
                print("❌ Token generation failed")
                return False
        except Exception as e:
            print(f"❌ Token generation failed: {e}")
            return False

        # Test 5: Test token validation
        print("\n5. Testing token validation...")
        try:
            token_data = test_suite.auth_service.validate_mcp_token(token)
            if token_data and token_data.client_id == test_suite.test_client_id:
                print("✅ Token validation successful")
            else:
                print("❌ Token validation failed")
                return False
        except Exception as e:
            print(f"❌ Token validation failed: {e}")
            return False

        print("\n🎉 All quick tests passed! Authentication system is working.")
        return True

    except Exception as e:
        print(f"\n❌ Quick test failed: {e}")
        return False

    finally:
        # Clean up test environment
        try:
            await test_suite.cleanup_test_environment()
        except Exception as e:
            print(f"⚠️  Cleanup failed: {e}")


if __name__ == "__main__":
    """Run the quick authentication test."""
    success = asyncio.run(quick_auth_test())
    sys.exit(0 if success else 1)
