#!/usr/bin/env python3
"""Debug script for MCP server."""

import sys
from pathlib import Path

# Add the MCP scripts directory to Python path for imports
mcp_dir = Path(__file__).parent
if str(mcp_dir) not in sys.path:
    sys.path.insert(0, str(mcp_dir))

try:
    print("Testing imports...")
    from agent_naming import AgentNameManager

    print("✓ AgentNameManager imported")

    from tools.agent_tools import AgentTools

    print("✓ AgentTools imported")

    from protocol.tool_router import ToolRouter

    print("✓ ToolRouter imported")

    from protocol.tool_config import AGENT_TOOLS

    print(f"✓ AGENT_TOOLS: {AGENT_TOOLS}")

    print("\nTesting agent manager...")
    manager = AgentNameManager()
    print("✓ AgentNameManager created")

    print("\nTesting agent tools...")
    tools = AgentTools(manager)
    print("✓ AgentTools created")

    print("\nTesting tool router...")
    # Create a simple tool registry for testing
    from protocol.tool_registry import ToolRegistry

    registry = ToolRegistry()
    router = ToolRouter(registry)
    print("✓ ToolRouter created")

    print("\nTesting tool registration...")
    all_tools = router.tool_registry.list_all_tools()
    print(f"Registered tools: {list(all_tools.keys())}")

    if router.tool_registry.is_tool_registered("generate_agent_name"):
        print("✓ generate_agent_name is registered")
    else:
        print("✗ generate_agent_name is NOT registered")

except Exception as e:
    print(f"Error: {e}")
    import traceback

    traceback.print_exc()
