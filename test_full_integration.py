#!/usr/bin/env python3
"""
Full Integration Test

This script tests the complete backend-MCP integration including:
1. Backend health
2. MCP server connectivity
3. Authentication flow
4. Tool management through backend API
"""

import asyncio
import json
import os
import sys

import aiohttp

# Add the MCP scripts directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "scripts", "mcp"))

from services.auth_service import mcp_auth_service


async def test_backend_health():
    """Test backend health."""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://localhost:8000/") as response:
                if response.status == 200:
                    data = await response.json()
                    print("✅ Backend Health Check")
                    print(f"📡 Backend is running: {data.get('message')}")
                    print(f"🔧 Version: {data.get('version')}")
                    return True
                print(f"❌ Backend health check failed: {response.status}")
                return False
    except Exception as e:
        print(f"❌ Backend health check failed: {e}")
        return False


async def test_mcp_direct():
    """Test MCP server directly."""
    try:
        # Generate admin token
        admin_token = mcp_auth_service.generate_mcp_token(
            "test-admin-client", ["mcp:admin", "mcp:tools:manage", "mcp:config:read"]
        )

        # Connect to MCP server
        reader, writer = await asyncio.open_connection("localhost", 8001)

        # Test request
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": "get_tool_configs",
                "arguments": {},
                "auth_token": admin_token,
            },
        }

        # Send request
        request_data = json.dumps(request) + "\n"
        writer.write(request_data.encode())
        await writer.drain()

        # Read response
        response_data = await reader.readline()
        response = json.loads(response_data.decode().strip())

        writer.close()
        await writer.wait_closed()

        if response.get("result", {}).get("success"):
            result = response["result"]
            tools = result.get("tools", {})
            stats = result.get("stats", {})

            print("✅ MCP Server Direct Test")
            print("📡 MCP server is responding correctly")
            print(f"🛠️  Found {len(tools)} tools")
            print(
                f"📊 Stats: {stats.get('enabled_tools', 0)}/{stats.get('total_tools', 0)} enabled"
            )
            return True
        print(f"❌ MCP server test failed: {response.get('error')}")
        return False

    except Exception as e:
        print(f"❌ MCP server test failed: {e}")
        return False


async def test_backend_mcp_api():
    """Test backend MCP API endpoints."""
    try:
        async with aiohttp.ClientSession() as session:
            # Test tool config endpoint
            async with session.get(
                "http://localhost:8000/api/mcp/tool-config/"
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    print("✅ Backend MCP API Test")
                    print("📡 Backend-MCP integration working")
                    print(
                        f"🛠️  Retrieved {data.get('total_tools', 0)} tool configurations"
                    )
                    print(
                        f"📊 Enabled: {data.get('enabled_tools', 0)}, Disabled: {data.get('disabled_tools', 0)}"
                    )
                    return True
                print(f"❌ Backend MCP API test failed: {response.status}")
                response_text = await response.text()
                print(f"📄 Response: {response_text}")
                return False

    except Exception as e:
        print(f"❌ Backend MCP API test failed: {e}")
        return False


async def test_tool_management():
    """Test tool management functionality."""
    try:
        async with aiohttp.ClientSession() as session:
            # Test getting a specific tool
            async with session.get(
                "http://localhost:8000/api/mcp/tool-config/lint_frontend"
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    print("✅ Tool Management Test")
                    print("📡 Tool management working")
                    print(
                        f"🔧 Tool: {data.get('name')} - {'enabled' if data.get('enabled') else 'disabled'}"
                    )
                    print(f"📂 Category: {data.get('category')}")
                    return True
                print(f"❌ Tool management test failed: {response.status}")
                response_text = await response.text()
                print(f"📄 Response: {response_text}")
                return False

    except Exception as e:
        print(f"❌ Tool management test failed: {e}")
        return False


async def main():
    """Run all integration tests."""
    print("🦊🦦🐺 Full Backend-MCP Integration Test")
    print("=" * 60)

    # Test 1: Backend health
    backend_ok = await test_backend_health()
    print()

    # Test 2: MCP server direct
    mcp_ok = await test_mcp_direct()
    print()

    # Test 3: Backend MCP API
    if backend_ok and mcp_ok:
        api_ok = await test_backend_mcp_api()
        print()

        # Test 4: Tool management
        if api_ok:
            tool_mgmt_ok = await test_tool_management()
            print()

            if tool_mgmt_ok:
                print("🎉 ALL TESTS PASSED!")
                print("✅ Backend is running and healthy")
                print("✅ MCP server is responding correctly")
                print("✅ Backend-MCP integration is working")
                print("✅ Tool management system is functional")
                print("✅ Authentication is working properly")
            else:
                print("⚠️  Tool management test failed")
        else:
            print("⚠️  Backend-MCP API test failed")
    else:
        print("⚠️  Cannot test integration - one or both servers are not responding")

    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
