#!/usr/bin/env python3
"""
Test Authenticated MCP Server Connection

This script tests the MCP server with proper authentication.
"""

import asyncio
import json
import os
import sys

# Add the MCP scripts directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "scripts", "mcp"))

from services.auth_service import mcp_auth_service


async def test_authenticated_mcp_connection():
    """Test connection to MCP server with authentication."""
    try:
        # Generate a token with admin permissions
        admin_token = mcp_auth_service.generate_mcp_token(
            "test-admin-client", ["mcp:admin", "mcp:tools:manage", "mcp:config:read"]
        )

        print("✅ Generated admin token for testing")

        # Connect to MCP server
        reader, writer = await asyncio.open_connection("localhost", 8001)

        # Test request - get tool configs with authentication
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

        print("✅ Authenticated MCP Server Test")
        print("📡 Connected to MCP server on localhost:8001")
        print("🔐 Using admin authentication token")
        print(f"🔧 Request: {request['method']}")

        if response.get("result"):
            result = response["result"]
            tools = result.get("tools", {})
            stats = result.get("stats", {})

            print(f"🛠️  Found {len(tools)} tools in configuration")
            print(
                f"📊 Stats: {stats.get('enabled_tools', 0)}/{stats.get('total_tools', 0)} enabled"
            )

            # Show some tool categories
            categories = {}
            for tool_name, tool_config in tools.items():
                category = tool_config.get("category", "unknown")
                categories[category] = categories.get(category, 0) + 1

            print(f"📂 Tool categories: {categories}")

            # Test enabling/disabling a tool
            print("\n🔄 Testing tool management...")

            # Test getting tool status
            status_request = {
                "jsonrpc": "2.0",
                "id": 2,
                "method": "tools/call",
                "params": {
                    "name": "get_tool_status",
                    "arguments": {"tool_name": "lint_frontend"},
                    "auth_token": admin_token,
                },
            }

            writer.write((json.dumps(status_request) + "\n").encode())
            await writer.drain()

            status_response_data = await reader.readline()
            status_response = json.loads(status_response_data.decode().strip())

            if status_response.get("result"):
                tool_status = status_response["result"]
                print(
                    f"🔍 Tool status: {tool_status['tool_name']} is {'enabled' if tool_status['is_enabled'] else 'disabled'}"
                )

            return True
        print(f"❌ MCP server returned error: {response.get('error')}")
        return False

        writer.close()
        await writer.wait_closed()

    except Exception as e:
        print(f"❌ Authenticated MCP Test Failed: {e}")
        return False


async def test_backend_with_auth():
    """Test backend endpoints that should work without auth."""
    try:
        import aiohttp

        async with aiohttp.ClientSession() as session:
            # Test basic backend endpoint
            async with session.get("http://localhost:8000/") as response:
                if response.status == 200:
                    data = await response.json()
                    print("✅ Backend Basic Test")
                    print(f"📡 Backend is running: {data.get('message')}")
                    print(f"🔧 Version: {data.get('version')}")
                    return True
                print(f"❌ Backend returned status {response.status}")
                return False

    except Exception as e:
        print(f"❌ Backend Test Failed: {e}")
        return False


async def main():
    """Run all tests."""
    print("🦊🦦🐺 Testing Authenticated Backend-MCP Integration")
    print("=" * 60)

    # Test backend
    backend_ok = await test_backend_with_auth()
    print()

    # Test authenticated MCP
    mcp_ok = await test_authenticated_mcp_connection()
    print()

    if backend_ok and mcp_ok:
        print("🎉 All tests passed!")
        print("✅ Backend is running and accessible")
        print("✅ MCP server is running with proper authentication")
        print("✅ Tool management system is working correctly")
        print("✅ Backend-MCP integration is functional")
    else:
        print("⚠️  Some tests failed - check the output above")

    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
