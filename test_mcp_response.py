#!/usr/bin/env python3
"""
Test MCP Server Response Format

This script tests the MCP server response format to debug the backend integration.
"""

import asyncio
import json
import os
import sys

# Add the MCP scripts directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "scripts", "mcp"))

from services.auth_service import mcp_auth_service


async def test_mcp_response_format():
    """Test MCP server response format."""
    try:
        # Generate a token with admin permissions
        admin_token = mcp_auth_service.generate_mcp_token(
            "test-admin-client", ["mcp:admin", "mcp:tools:manage", "mcp:config:read"]
        )

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

        print("🔍 MCP Server Response Analysis")
        print("=" * 50)
        print(f"📊 Full Response: {json.dumps(response, indent=2)}")
        print()

        if response.get("result"):
            result = response["result"]
            print(f"✅ Result keys: {list(result.keys())}")

            if "tools" in result:
                tools = result["tools"]
                print(f"🛠️  Tools count: {len(tools)}")
                print(f"📂 First few tools: {list(tools.keys())[:5]}")
            else:
                print("❌ No 'tools' key in result")
                print(f"🔍 Available keys: {list(result.keys())}")

            if "stats" in result:
                stats = result["stats"]
                print(f"📈 Stats: {stats}")
        else:
            print(f"❌ Error response: {response.get('error')}")

        writer.close()
        await writer.wait_closed()

    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_mcp_response_format())
