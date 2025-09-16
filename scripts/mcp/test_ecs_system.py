#!/usr/bin/env python3
"""
ECS System Test
===============

Test the ECS-based agent management system.
"""

import asyncio
import sys
from pathlib import Path

import pytest

# Add the MCP scripts directory to Python path
mcp_dir = Path(__file__).parent
if str(mcp_dir) not in sys.path:
    sys.path.insert(0, str(mcp_dir))

from ecs.world import AgentWorld
from tools.ecs_agent_tools import ECSAgentTools


@pytest.mark.asyncio
async def test_ecs_system():
    """Test the ECS agent system."""
    print("🦦 Testing ECS Agent System...")

    try:
        # Initialize ECS tools
        ecs_tools = ECSAgentTools()

        # Test 1: Create ECS agent
        print("\n1. Creating ECS agent...")
        result = ecs_tools.create_ecs_agent(
            {"agent_id": "test-agent-1", "spirit": "fox", "style": "foundation"}
        )
        print(f"Result: {result}")

        # Test 2: Create another agent
        print("\n2. Creating second ECS agent...")
        result = ecs_tools.create_ecs_agent(
            {"agent_id": "test-agent-2", "spirit": "wolf", "style": "exo"}
        )
        print(f"Result: {result}")

        # Test 3: Get agent status
        print("\n3. Getting ECS agent status...")
        result = ecs_tools.get_ecs_agent_status({})
        print(f"Result: {result}")

        # Test 4: Find compatible mates
        print("\n4. Finding compatible mates...")
        result = ecs_tools.find_ecs_compatible_mates(
            {"agent_id": "test-agent-1", "max_results": 3}
        )
        print(f"Result: {result}")

        # Test 5: Analyze compatibility
        print("\n5. Analyzing compatibility...")
        result = ecs_tools.analyze_ecs_compatibility(
            {"agent1_id": "test-agent-1", "agent2_id": "test-agent-2"}
        )
        print(f"Result: {result}")

        # Test 6: Create offspring
        print("\n6. Creating offspring...")
        result = ecs_tools.create_ecs_offspring(
            {
                "parent1_id": "test-agent-1",
                "parent2_id": "test-agent-2",
                "offspring_id": "test-offspring-1",
            }
        )
        print(f"Result: {result}")

        # Test 7: Enable automatic reproduction
        print("\n7. Enabling automatic reproduction...")
        result = ecs_tools.enable_automatic_reproduction({"enabled": True})
        print(f"Result: {result}")

        # Test 8: Update ECS world
        print("\n8. Updating ECS world...")
        result = ecs_tools.update_ecs_world({"delta_time": 1.0})
        print(f"Result: {result}")

        # Test 9: Get lineage
        print("\n9. Getting lineage...")
        result = ecs_tools.get_ecs_lineage({"agent_id": "test-offspring-1", "depth": 2})
        print(f"Result: {result}")

        print("\n🎉 All ECS system tests completed successfully!")
        return True

    except Exception as e:
        print(f"\n❌ ECS system test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


@pytest.mark.asyncio
async def test_ecs_world_directly():
    """Test the ECS world directly."""
    print("\n🦦 Testing ECS World directly...")

    try:
        # Create world
        world = AgentWorld()

        # Create agents
        agent1 = world.create_agent("direct-agent-1", "fox", "foundation")
        agent2 = world.create_agent("direct-agent-2", "wolf", "exo")

        print(f"Created agents: {agent1.id}, {agent2.id}")

        # Get agent entities
        agents = world.get_agent_entities()
        print(f"Total agents: {len(agents)}")

        # Get mature agents
        mature = world.get_mature_agents()
        print(f"Mature agents: {len(mature)}")

        # Update world
        world.update(1.0)
        print("World updated successfully")

        print("🎉 Direct ECS world test completed!")
        return True

    except Exception as e:
        print(f"❌ Direct ECS world test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":

    async def main():
        success1 = await test_ecs_system()
        success2 = await test_ecs_world_directly()

        if success1 and success2:
            print("\n🎉 All tests passed!")
            sys.exit(0)
        else:
            print("\n❌ Some tests failed!")
            sys.exit(1)

    asyncio.run(main())
