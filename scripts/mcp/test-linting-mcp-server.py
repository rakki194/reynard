#!/usr/bin/env python3
"""
Test script for the MCP Linting Server.
Tests all available tools including the new linting capabilities.
"""

import asyncio
import json
import subprocess
import sys
from pathlib import Path


async def test_mcp_server():
    """Test the MCP server with various tool calls."""

    # Start the server process
    server_path = Path(__file__).parent / "main.py"
    process = await asyncio.create_subprocess_exec(
        sys.executable,
        str(server_path),
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    async def send_request(request):
        """Send a request and get response."""
        request_json = (json.dumps(request) + "\n").encode()
        process.stdin.write(request_json)
        await process.stdin.drain()

        response_line = await process.stdout.readline()
        return json.loads(response_line.decode().strip())

    try:
        print("🦊 Testing MCP Reynard Linting Server...")

        # Test 1: Initialize
        print("\n1. Testing initialization...")
        response = await send_request(
            {"jsonrpc": "2.0", "id": 1, "method": "initialize"}
        )
        print(f"✅ Server name: {response['result']['serverInfo']['name']}")
        print(f"✅ Version: {response['result']['serverInfo']['version']}")

        # Test 2: List tools
        print("\n2. Testing tools list...")
        response = await send_request(
            {"jsonrpc": "2.0", "id": 2, "method": "tools/list"}
        )
        tools = response["result"]["tools"]
        print(f"✅ Available tools: {len(tools)}")

        # Print tool categories
        agent_tools = [
            t for t in tools if "agent" in t["name"] or "spirit" in t["name"]
        ]
        linting_tools = [
            t
            for t in tools
            if any(w in t["name"] for w in ["lint", "format", "scan", "validate"])
        ]
        utility_tools = [
            t for t in tools if any(w in t["name"] for w in ["time", "location"])
        ]

        print(f"  🦊 Agent tools: {len(agent_tools)}")
        print(f"  🔍 Linting tools: {len(linting_tools)}")
        print(f"  ⏰ Utility tools: {len(utility_tools)}")

        # Test 3: Agent startup sequence
        print("\n3. Testing agent startup sequence...")
        response = await send_request(
            {
                "jsonrpc": "2.0",
                "id": 3,
                "method": "tools/call",
                "params": {
                    "name": "agent_startup_sequence",
                    "arguments": {"preferred_style": "foundation"},
                },
            }
        )
        print(
            "✅ Agent startup:", response["result"]["content"][0]["text"].split("\n")[0]
        )

        # Test 4: Frontend linting (check mode)
        print("\n4. Testing frontend linting...")
        response = await send_request(
            {
                "jsonrpc": "2.0",
                "id": 4,
                "method": "tools/call",
                "params": {"name": "lint_frontend", "arguments": {"fix": False}},
            }
        )
        status = (
            "✅ PASSED"
            if "✅" in response["result"]["content"][0]["text"]
            else "⚠️ NEEDS ATTENTION"
        )
        print(f"{status} Frontend linting completed")

        # Test 5: Python formatting check
        print("\n5. Testing Python formatting check...")
        response = await send_request(
            {
                "jsonrpc": "2.0",
                "id": 5,
                "method": "tools/call",
                "params": {"name": "format_python", "arguments": {"check_only": True}},
            }
        )
        status = (
            "✅ PASSED"
            if "✅" in response["result"]["content"][0]["text"]
            else "⚠️ NEEDS ATTENTION"
        )
        print(f"{status} Python formatting check completed")

        # Test 6: List all available linting tools
        print("\n6. Available linting tools:")
        for tool in linting_tools:
            print(f"  🔧 {tool['name']}: {tool['description']}")

        print("\n🎉 All tests completed successfully!")
        print("\n📋 Summary:")
        print(f"   🦊 Agent tools: {len(agent_tools)} (naming, spirits, startup)")
        print(
            f"   🔍 Linting tools: {len(linting_tools)} (frontend, python, markdown, security)"
        )
        print(f"   ⏰ Utility tools: {len(utility_tools)} (time, location)")
        print(f"   📊 Total tools: {len(tools)}")

    finally:
        # Clean shutdown
        process.terminate()
        await process.wait()


if __name__ == "__main__":
    asyncio.run(test_mcp_server())
