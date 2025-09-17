#!/usr/bin/env python3
"""
Test MCP Server Connection

This script tests the connection between the FastAPI backend and MCP server.
"""

import asyncio
import json


async def test_mcp_connection():
    """Test connection to MCP server."""
    try:
        # Connect to MCP server
        reader, writer = await asyncio.open_connection("localhost", 8001)

        # Test request - get tool configs
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {"name": "get_tool_configs", "arguments": {}},
        }

        # Send request
        request_data = json.dumps(request) + "\n"
        writer.write(request_data.encode())
        await writer.drain()

        # Read response
        response_data = await reader.readline()
        response = json.loads(response_data.decode().strip())

        print("✅ MCP Server Connection Test")
        print("📡 Connected to MCP server on localhost:8001")
        print(f"🔧 Request: {request['method']}")
        print(f"📊 Response: {response}")

        if response.get("result"):
            tools = response["result"].get("tools", {})
            print(f"🛠️  Found {len(tools)} tools in configuration")

            # Show some tool categories
            categories = {}
            for tool_name, tool_config in tools.items():
                category = tool_config.get("category", "unknown")
                categories[category] = categories.get(category, 0) + 1

            print(f"📂 Tool categories: {categories}")

        writer.close()
        await writer.wait_closed()
        return True

    except Exception as e:
        print(f"❌ MCP Server Connection Failed: {e}")
        return False


async def test_backend_connection():
    """Test connection to FastAPI backend."""
    try:
        import aiohttp

        async with aiohttp.ClientSession() as session:
            # Test basic connectivity
            async with session.get("http://localhost:8000/docs") as response:
                if response.status == 200:
                    print("✅ Backend Connection Test")
                    print("📡 Connected to FastAPI backend on localhost:8000")
                    print("📚 API docs available at /docs")
                    return True
                print(f"❌ Backend returned status {response.status}")
                return False

    except Exception as e:
        print(f"❌ Backend Connection Failed: {e}")
        return False


async def test_backend_mcp_integration():
    """Test backend to MCP integration."""
    try:
        import aiohttp

        async with aiohttp.ClientSession() as session:
            # Test MCP tool config endpoint
            async with session.get(
                "http://localhost:8000/mcp/tool-config/"
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    print("✅ Backend-MCP Integration Test")
                    print("📡 Backend successfully communicated with MCP server")
                    print(
                        f"🛠️  Retrieved {data.get('total_tools', 0)} tool configurations"
                    )
                    return True
                print(
                    f"❌ Backend-MCP integration failed with status {response.status}"
                )
                response_text = await response.text()
                print(f"📄 Response: {response_text}")
                return False

    except Exception as e:
        print(f"❌ Backend-MCP Integration Failed: {e}")
        return False


async def main():
    """Run all tests."""
    print("🦊🦦🐺 Testing Backend-MCP Integration")
    print("=" * 50)

    # Test MCP server connection
    mcp_ok = await test_mcp_connection()
    print()

    # Test backend connection
    backend_ok = await test_backend_connection()
    print()

    # Test integration
    if mcp_ok and backend_ok:
        integration_ok = await test_backend_mcp_integration()
        print()

        if integration_ok:
            print("🎉 All tests passed! Backend and MCP are working together!")
        else:
            print("⚠️  Integration test failed - check backend logs")
    else:
        print("⚠️  Cannot test integration - one or both servers are not responding")

    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
