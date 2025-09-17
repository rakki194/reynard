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
    router = ToolRouter(
        agent_tools=tools,
        bm25_search_tools=None,
        enhanced_bm25_search_tools=None,
        utility_tools=None,
        linting_tools=None,
        version_vscode_tools=None,
        file_search_tools=None,
        semantic_file_search_tools=None,
        image_viewer_tools=None,
        mermaid_tools=None,
        monolith_detection_tools=None,
        playwright_tools=None,
        vscode_tasks_tools=None,
    )
    print("✓ ToolRouter created")

    print("\nTesting tool registration...")
    print(f"Registered tools: {list(router.registry._handlers.keys())}")

    if "generate_agent_name" in router.registry._handlers:
        print("✓ generate_agent_name is registered")
    else:
        print("✗ generate_agent_name is NOT registered")

except Exception as e:
    print(f"Error: {e}")
    import traceback

    traceback.print_exc()
