#!/usr/bin/env python3
"""
Character Tools Demo
===================

Demonstration script showing how agents can use the character creation tools
through the MCP server.
"""

import asyncio
import sys
from pathlib import Path

# Add paths for imports
sys.path.append(str(Path(__file__).parent))
sys.path.append(str(Path(__file__).parent.parent / "agent-naming"))

from reynard_mcp_server.main import MCPServer


async def demo_character_creation():
    """Demonstrate character creation tools for agents."""
    print("🦊 Character Creation Tools Demo for Agents")
    print("=" * 50)

    # Initialize MCP server
    server = MCPServer()

    print(f"✅ MCP Server initialized with {len(server.tool_registry._handlers)} tools")

    # Show available character tools
    character_tools = [
        name for name in server.tool_registry._handlers.keys() if "character" in name
    ]
    print(f"\n🎭 Available Character Tools ({len(character_tools)}):")
    for tool in character_tools:
        print(f"  • {tool}")

    # Demo 1: Get character types
    print("\n📋 Demo 1: Getting Available Character Types")
    tool_handler = server.tool_registry._handlers["get_character_types"]
    result = await tool_handler.handler_method({})
    print("Available character types:")
    print(result["content"][0]["text"][:300] + "...")

    # Demo 2: Create a mentor character
    print("\n🎭 Demo 2: Creating a Mentor Character")
    tool_handler = server.tool_registry._handlers["create_character"]
    mentor_request = {
        "character_name": "Sage-Vulpine-13",
        "character_type": "mentor",
        "spirit": "fox",
        "naming_scheme": "animal_spirit",
        "naming_style": "foundation",
        "description": "A wise and experienced fox mentor who guides young agents",
        "tags": ["mentor", "fox", "wise", "experienced"],
        "creator_agent_id": "demo-agent-001",
    }

    result = await tool_handler.handler_method(mentor_request)
    print("Mentor character created:")
    print(result["content"][0]["text"][:500] + "...")

    # Demo 3: Create a warrior character
    print("\n⚔️ Demo 3: Creating a Warrior Character")
    warrior_request = {
        "character_name": "Alpha-Lupus-8",
        "character_type": "warrior",
        "spirit": "wolf",
        "naming_scheme": "animal_spirit",
        "naming_style": "exo",
        "description": "A fierce and loyal wolf warrior, protector of the pack",
        "tags": ["warrior", "wolf", "loyal", "protector"],
        "creator_agent_id": "demo-agent-002",
    }

    result = await tool_handler.handler_method(warrior_request)
    print("Warrior character created:")
    print(result["content"][0]["text"][:500] + "...")

    # Demo 4: List all characters
    print("\n📝 Demo 4: Listing All Characters")
    tool_handler = server.tool_registry._handlers["list_characters"]
    result = await tool_handler.handler_method({})
    print("All characters:")
    print(result["content"][0]["text"][:400] + "...")

    # Demo 5: Search for fox characters
    print("\n🔍 Demo 5: Searching for Fox Characters")
    tool_handler = server.tool_registry._handlers["search_characters"]
    result = await tool_handler.handler_method({"query": "fox"})
    print("Fox characters found:")
    print(result["content"][0]["text"][:300] + "...")

    print("\n✅ Character Creation Tools Demo Complete!")
    print("\n🎯 Agents can now use these tools to:")
    print("  • Create detailed characters with traits, appearance, and background")
    print("  • Search and discover existing characters")
    print("  • Update and manage character information")
    print("  • Get information about available character types and traits")
    print("  • Persist characters across sessions")


if __name__ == "__main__":
    asyncio.run(demo_character_creation())
