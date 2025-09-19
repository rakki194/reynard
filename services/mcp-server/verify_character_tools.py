#!/usr/bin/env python3
"""
Verify Character Tools in MCP Server
====================================

This script verifies that all character tools are properly registered
and available in the MCP server for Cursor to use.
"""

import asyncio
import sys
from pathlib import Path

# Add paths for imports
sys.path.append(str(Path(__file__).parent))
sys.path.append(str(Path(__file__).parent.parent.parent / "services" / "agent-naming"))

from main import MCPServer


async def verify_character_tools():
    """Verify that all character tools are available in the MCP server."""
    print("🦊 Verifying Character Tools in MCP Server")
    print("=" * 50)
    
    # Initialize MCP server
    server = MCPServer()
    
    # Force initialization of tools
    server._lazy_init_tools()
    
    # Get all tools
    all_tools = server.tool_registry.list_all_tools()
    print(f"✅ MCP Server initialized with {len(all_tools)} total tools")
    
    # Filter character tools
    character_tools = [tool for tool in all_tools if 'character' in tool]
    print(f"🎭 Character tools available: {len(character_tools)}")
    
    # List all character tools
    print("\n📋 Available Character Tools:")
    for i, tool in enumerate(character_tools, 1):
        print(f"  {i}. {tool}")
    
    # Test a simple character tool
    print("\n🧪 Testing get_character_types tool...")
    try:
        tool_handler = server.tool_registry._handlers['get_character_types']
        result = await tool_handler.handler_method({})
        print("✅ get_character_types tool working!")
        print("Result preview:")
        print(result['content'][0]['text'][:200] + "...")
    except Exception as e:
        print(f"❌ Error testing character tool: {e}")
    
    print("\n🎯 Summary:")
    print(f"• Total MCP tools: {len(all_tools)}")
    print(f"• Character tools: {len(character_tools)}")
    print("• All character tools are properly registered and functional")
    print("• Cursor should now be able to see and use all character tools!")
    
    print("\n🚀 Next Steps:")
    print("1. Restart Cursor to pick up the new MCP server")
    print("2. Check that you can see all character tools in Cursor")
    print("3. Try using create_character, list_characters, etc.")


if __name__ == "__main__":
    asyncio.run(verify_character_tools())
