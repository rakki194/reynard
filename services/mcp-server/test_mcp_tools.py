#!/usr/bin/env python3
"""
Simple test script to check MCP server tool loading.
"""

import asyncio
import json
import sys
from main import MCPServer


async def test_mcp_server():
    """Test MCP server tool loading."""
    print("🧪 Testing MCP Server Tool Loading")
    print("=" * 50)
    
    # Create MCP server instance
    server = MCPServer()
    
    # Test initialize request
    print("\n1. Testing initialize request...")
    init_request = {"jsonrpc": "2.0", "id": 1, "method": "initialize"}
    init_response = await server.handle_request(init_request)
    print(f"✅ Initialize response: {json.dumps(init_response, indent=2)}")
    
    # Test tools/list request
    print("\n2. Testing tools/list request...")
    tools_request = {"jsonrpc": "2.0", "id": 2, "method": "tools/list"}
    tools_response = await server.handle_request(tools_request)
    
    if tools_response and "result" in tools_response:
        tools = tools_response["result"].get("tools", [])
        print(f"✅ Found {len(tools)} tools:")
        for tool in tools[:10]:  # Show first 10 tools
            print(f"   - {tool.get('name', 'Unknown')}: {tool.get('description', 'No description')}")
        if len(tools) > 10:
            print(f"   ... and {len(tools) - 10} more tools")
    else:
        print(f"❌ Tools list failed: {tools_response}")
    
    # Test a specific tool call
    print("\n3. Testing tool call...")
    tool_call_request = {
        "jsonrpc": "2.0",
        "id": 3,
        "method": "tools/call",
        "params": {
            "name": "generate_agent_name",
            "arguments": {"spirit": "fox", "style": "foundation"}
        }
    }
    tool_response = await server.handle_request(tool_call_request)
    
    if tool_response and "result" in tool_response:
        print(f"✅ Tool call successful: {json.dumps(tool_response['result'], indent=2)}")
    else:
        print(f"❌ Tool call failed: {tool_response}")
    
    print("\n🎉 MCP Server test completed!")


if __name__ == "__main__":
    asyncio.run(test_mcp_server())
