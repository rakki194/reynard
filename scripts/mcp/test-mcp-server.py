#!/usr/bin/env python3
"""
Test script for the MCP Agent Namer Server
==========================================

This script demonstrates how to use the MCP server for agent self-naming.
It simulates MCP protocol requests to test the server functionality.
"""

import asyncio
import json
import sys
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

from main import MCPServer


async def test_mcp_server():
    """Test the MCP server functionality."""
    print("🦊 Testing MCP Agent Namer Server...")
    print("=" * 50)

    server = MCPServer()

    # Test 1: List available tools
    print("\n1. Testing tools/list...")
    request = {"jsonrpc": "2.0", "id": 1, "method": "tools/list"}
    response = await server.handle_request(request)
    print(f"Response: {json.dumps(response, indent=2)}")

    # Test 2: Generate a fox name
    print("\n2. Testing generate_agent_name (fox, foundation)...")
    request = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
            "name": "generate_agent_name",
            "arguments": {"spirit": "fox", "style": "foundation"},
        },
    }
    response = await server.handle_request(request)
    print(f"Response: {json.dumps(response, indent=2)}")

    # Test 3: Assign a name to an agent
    print("\n3. Testing assign_agent_name...")
    request = {
        "jsonrpc": "2.0",
        "id": 3,
        "method": "tools/call",
        "params": {
            "name": "assign_agent_name",
            "arguments": {"agent_id": "test-agent-001", "name": "Reynard-Orion-Meta"},
        },
    }
    response = await server.handle_request(request)
    print(f"Response: {json.dumps(response, indent=2)}")

    # Test 4: Get agent name
    print("\n4. Testing get_agent_name...")
    request = {
        "jsonrpc": "2.0",
        "id": 4,
        "method": "tools/call",
        "params": {
            "name": "get_agent_name",
            "arguments": {"agent_id": "test-agent-001"},
        },
    }
    response = await server.handle_request(request)
    print(f"Response: {json.dumps(response, indent=2)}")

    # Test 5: List all agent names
    print("\n5. Testing list_agent_names...")
    request = {
        "jsonrpc": "2.0",
        "id": 5,
        "method": "tools/call",
        "params": {"name": "list_agent_names", "arguments": {}},
    }
    response = await server.handle_request(request)
    print(f"Response: {json.dumps(response, indent=2)}")

    print("\n✅ MCP Server tests completed successfully!")
    print("\n🦊 The server is ready to provide agent naming tools via MCP protocol!")


if __name__ == "__main__":
    asyncio.run(test_mcp_server())
