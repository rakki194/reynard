#!/usr/bin/env python3
"""
Version & VS Code MCP Server Test Suite
=======================================

Comprehensive test script for the MCP server with version detection,
VS Code integration, and optimized security scanning.
"""

import asyncio
import json
import subprocess
import sys
from pathlib import Path


async def test_version_vscode_mcp_server() -> None:
    """Test the MCP server with version detection and VS Code integration."""

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
        print("🚀 Testing Version & VS Code MCP Reynard Linting Server...")
        print("=" * 60)

        # Test 1: Initialize
        print("\n1. Testing initialization...")
        response = await send_request(
            {"jsonrpc": "2.0", "id": 1, "method": "initialize"}
        )
        print(
            f"✅ Server: {response['result']['serverInfo']['name']} v{response['result']['serverInfo']['version']}"
        )

        # Test 2: List all tools
        print("\n2. Testing tools list...")
        response = await send_request(
            {"jsonrpc": "2.0", "id": 2, "method": "tools/list"}
        )
        tools = response["result"]["tools"]
        print(f"✅ Available tools: {len(tools)}")

        # Categorize tools
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
        version_vscode_tools = [
            t
            for t in tools
            if any(
                w in t["name"]
                for w in ["version", "vscode", "security_fast", "security_full"]
            )
        ]

        print(f"  🦊 Agent tools: {len(agent_tools)}")
        print(f"  🔍 Linting tools: {len(linting_tools)}")
        print(f"  ⏰ Utility tools: {len(utility_tools)}")
        print(f"  🚀 Version & VS Code tools: {len(version_vscode_tools)}")

        # Test 3: Agent startup with version info
        print("\n3. Testing agent startup with version info...")
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
        startup_text = response["result"]["content"][0]["text"]
        print("✅ Agent startup with version info completed:")
        for line in startup_text.split("\n")[:8]:  # Show first 8 lines
            print(f"   {line}")

        # Test 4: Version detection
        print("\n4. Testing version detection...")
        response = await send_request(
            {
                "jsonrpc": "2.0",
                "id": 4,
                "method": "tools/call",
                "params": {"name": "get_versions", "arguments": {}},
            }
        )
        version_text = response["result"]["content"][0]["text"]
        print(f"✅ Version detection: {version_text[:100]}...")

        # Test 5: VS Code integration
        print("\n5. Testing VS Code integration...")
        response = await send_request(
            {
                "jsonrpc": "2.0",
                "id": 5,
                "method": "tools/call",
                "params": {"name": "get_vscode_workspace_info", "arguments": {}},
            }
        )
        vscode_text = response["result"]["content"][0]["text"]
        print(f"✅ VS Code workspace: {vscode_text[:100]}...")

        # Test 6: Fast security scan (no Bandit)
        print("\n6. Testing fast security scan...")
        response = await send_request(
            {
                "jsonrpc": "2.0",
                "id": 6,
                "method": "tools/call",
                "params": {"name": "scan_security_fast", "arguments": {}},
            }
        )
        security_text = response["result"]["content"][0]["text"]
        print(f"✅ Fast security scan: {security_text[:100]}...")

        # Test 7: Individual version tools
        print("\n7. Testing individual version tools...")
        version_tools = [
            "get_python_version",
            "get_node_version",
            "get_typescript_version",
        ]
        for tool in version_tools:
            response = await send_request(
                {
                    "jsonrpc": "2.0",
                    "id": 7,
                    "method": "tools/call",
                    "params": {"name": tool, "arguments": {}},
                }
            )
            result_text = response["result"]["content"][0]["text"]
            status = "✅" if "✅" in result_text else "⚠️"
            print(f"  {status} {tool}: {result_text[:50]}...")

        # Test 8: VS Code extensions
        print("\n8. Testing VS Code extensions...")
        response = await send_request(
            {
                "jsonrpc": "2.0",
                "id": 8,
                "method": "tools/call",
                "params": {"name": "get_vscode_extensions", "arguments": {}},
            }
        )
        extensions_text = response["result"]["content"][0]["text"]
        print(f"✅ VS Code extensions: {extensions_text[:100]}...")

        print("\n🎉 All version & VS Code tests completed successfully!")
        print("\n📋 Version & VS Code Features Summary:")
        print("   🎯 Agent startup with version info")
        print("   🔧 Dynamic version detection (Python, Node.js, TypeScript, etc.)")
        print("   💻 VS Code workspace integration")
        print("   🛡️ Optimized security scanning (fast mode without Bandit)")
        print("   📊 Comprehensive tool categorization")
        print(f"   🚀 Total version & VS Code tools: {len(version_vscode_tools)}")

    finally:
        # Clean shutdown
        process.terminate()
        await process.wait()


if __name__ == "__main__":
    asyncio.run(test_version_vscode_mcp_server())
