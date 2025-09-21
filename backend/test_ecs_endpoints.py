#!/usr/bin/env python3
"""
Test script for ECS endpoints to verify all functionality works correctly.
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.ecs.postgres_service import PostgresECSWorldService


async def test_ecs_functionality():
    """Test all ECS functionality."""
    print("🐅 Testing ECS PostgreSQL functionality...")

    # Initialize the service
    service = PostgresECSWorldService()
    await service.startup()

    try:
        # Test 1: Create agents
        print("\n1. Creating test agents...")
        agent1_data = await service.create_agent(
            agent_id="test-agent-1",
            name="Test Agent 1",
            spirit="fox",
            style="foundation",
            personality_traits={"cunning": 0.8, "intelligence": 0.9},
            physical_traits={"agility": 0.7, "speed": 0.6},
            ability_traits={"hunting": 0.8, "stealth": 0.9},
        )
        print(f"✅ Created agent 1: {agent1_data['name']}")

        agent2_data = await service.create_agent(
            agent_id="test-agent-2",
            name="Test Agent 2",
            spirit="wolf",
            style="foundation",
            personality_traits={"loyalty": 0.9, "courage": 0.8},
            physical_traits={"strength": 0.8, "endurance": 0.7},
            ability_traits={"hunting": 0.7, "leadership": 0.8},
        )
        print(f"✅ Created agent 2: {agent2_data['name']}")

        # Test 2: Get world status
        print("\n2. Getting world status...")
        status = await service.get_world_status()
        print(f"✅ World status: {status['status']}, Agents: {status['agent_count']}")

        # Test 3: Analyze compatibility
        print("\n3. Analyzing genetic compatibility...")
        compatibility = await service.analyze_compatibility(
            "test-agent-1", "test-agent-2"
        )
        print(f"✅ Compatibility score: {compatibility['compatibility_score']:.2f}")
        print(f"   Recommendation: {compatibility['recommendation']}")

        # Test 4: Find compatible mates
        print("\n4. Finding compatible mates...")
        mates = await service.find_compatible_mates("test-agent-1", max_results=5)
        print(f"✅ Found {len(mates)} compatible mates")
        for mate in mates:
            print(
                f"   - {mate['name']} (compatibility: {mate['compatibility_score']:.2f})"
            )

        # Test 5: Create offspring
        print("\n5. Creating offspring...")
        offspring_data = await service.create_offspring(
            parent1_id="test-agent-1",
            parent2_id="test-agent-2",
            offspring_id="test-offspring-1",
            offspring_name="Test Offspring",
        )
        print(f"✅ Created offspring: {offspring_data['name']}")
        print(f"   Compatibility score: {offspring_data['compatibility_score']:.2f}")

        # Test 6: Get agent lineage
        print("\n6. Getting agent lineage...")
        lineage = await service.get_agent_lineage("test-offspring-1", depth=2)
        print(
            f"✅ Lineage for {lineage['agent_id']}: Generation {lineage['generation']}"
        )
        if lineage["parents"]:
            print(f"   Parents: {[p['name'] for p in lineage['parents'] if p['name']]}")

        # Test 7: Position and movement
        print("\n7. Testing position and movement...")
        # Move agent 1
        position1 = await service.move_agent("test-agent-1", 100.0, 200.0)
        print(f"✅ Moved agent 1 to ({position1['x']}, {position1['y']})")

        # Move agent 2
        position2 = await service.move_agent("test-agent-2", 300.0, 400.0)
        print(f"✅ Moved agent 2 to ({position2['x']}, {position2['y']})")

        # Get distance between agents
        distance = await service.get_agent_distance("test-agent-1", "test-agent-2")
        print(f"✅ Distance between agents: {distance['distance']:.2f}")

        # Get nearby agents
        nearby = await service.get_nearby_agents("test-agent-1", radius=500.0)
        print(f"✅ Found {len(nearby)} nearby agents within radius 500")

        # Test 8: Interactions and relationships
        print("\n8. Testing interactions and relationships...")
        interaction = await service.initiate_interaction(
            "test-agent-1", "test-agent-2", "communication"
        )
        print(f"✅ Initiated interaction: {interaction['interaction_type']}")

        # Send chat message
        chat_result = await service.send_message(
            "test-agent-1", "test-agent-2", "Hello from agent 1!"
        )
        print(f"✅ Sent chat message: {chat_result['message']}")

        # Get interaction history
        history = await service.get_agent_interactions("test-agent-1", limit=5)
        print(f"✅ Agent 1 has {len(history)} interactions")

        # Get relationships
        relationships = await service.get_agent_relationships("test-agent-1")
        print(f"✅ Agent 1 has {relationships['total_relationships']} relationships")

        # Test 9: Breeding control
        print("\n9. Testing breeding control...")
        # Enable breeding
        breeding_status = await service.enable_breeding(True)
        print(f"✅ Breeding status: {breeding_status['status']}")

        # Get breeding stats
        breeding_stats = await service.get_breeding_stats()
        print(f"✅ Breeding stats: {breeding_stats['total_breedings']} total breedings")
        print(f"   Success rate: {breeding_stats['success_rate']:.2%}")

        # Test 10: Get all agents
        print("\n10. Getting all agents...")
        all_agents = await service.get_all_agents()
        print(f"✅ Total agents in world: {len(all_agents)}")
        for agent in all_agents:
            print(f"   - {agent['name']} ({agent['spirit']})")

        print("\n🎉 All ECS functionality tests passed!")

    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback

        traceback.print_exc()

    finally:
        # Cleanup
        await service.shutdown()


if __name__ == "__main__":
    asyncio.run(test_ecs_functionality())
