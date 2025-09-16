#!/usr/bin/env python3
"""Test script for agent tools."""

import asyncio

from services.agent_manager import AgentNameManager
from tools.agent_tools import AgentTools


async def test_agent_tools():
    """Test agent tools functionality."""
    print("Creating agent manager...")
    manager = AgentNameManager()

    print("Creating agent tools...")
    tools = AgentTools(manager)

    print("Testing generate_agent_name...")
    try:
        result = tools.generate_agent_name({"spirit": "fox", "style": "foundation"})
        print(f"Result: {result}")
    except Exception as e:
        print(f"Error: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_agent_tools())
