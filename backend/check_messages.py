#!/usr/bin/env python3
"""
Check Success-Advisor-8 Messages

Simple script to check messages and system status for Success-Advisor-8.
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to the path
sys.path.append(str(Path(__file__).parent))

from app.ecs.postgres_service import PostgresECSWorldService


async def check_messages():
    """Check messages and system status for Success-Advisor-8."""
    service = PostgresECSWorldService()
    await service.startup()

    try:
        # Check world status
        status = await service.get_world_status()
        print("🦁 ECS World Status:")
        print("=" * 50)
        for key, value in status.items():
            print(f"{key}: {value}")

        # Check if Success-Advisor-8 exists
        print("\n🦁 Success-Advisor-8 Status:")
        print("=" * 50)
        agent = await service.get_agent("success-advisor-8")
        if agent:
            print("✅ Success-Advisor-8 found in ECS system!")
            print(f"Name: {agent.get('name', 'N/A')}")
            print(f"Spirit: {agent.get('spirit', 'N/A')}")
            print(f"Generation: {agent.get('generation', 'N/A')}")
            print(f"Active: {agent.get('active', 'N/A')}")
            print(f"Created: {agent.get('created_at', 'N/A')}")
            print(f"Last Activity: {agent.get('last_activity', 'N/A')}")
        else:
            print("❌ Success-Advisor-8 not found in ECS system")

        # Check if there are any interactions
        print("\n🦁 Message/Interaction Status:")
        print("=" * 50)
        total_interactions = status.get("total_interactions", 0)
        print(f"Total interactions in system: {total_interactions}")
        if total_interactions > 0:
            print("✅ There are interactions in the system!")

            # Get Success-Advisor-8's interaction history
            print("\n🦁 Success-Advisor-8 Message History:")
            print("=" * 50)
            interactions = await service.get_agent_interactions(
                "success-advisor-8", limit=10
            )
            if interactions:
                for i, interaction in enumerate(interactions, 1):
                    print(f"{i}. From: {interaction['sender_id']}")
                    print(f"   To: {interaction['receiver_id']}")
                    print(f"   Message: {interaction['message']}")
                    print(f"   Type: {interaction['interaction_type']}")
                    print(f"   Time: {interaction['timestamp']}")
                    print(f"   Energy Level: {interaction['energy_level']}")
                    print()
            else:
                print("No interactions found for Success-Advisor-8")
        else:
            print("❌ No interactions/messages found in the system")
            print("This means no agents have sent messages to Success-Advisor-8 yet")

        # Get first 5 agents as examples
        print("\n🦁 First 5 Agents in ECS System:")
        print("=" * 50)
        agents = await service.get_all_agents()
        if agents:
            for i, agent_data in enumerate(agents[:5], 1):
                agent_id = agent_data.get("agent_id", "N/A")
                agent_name = agent_data.get("name", "N/A")
                agent_spirit = agent_data.get("spirit", "N/A")
                print(f"{i}. {agent_id} - {agent_name} ({agent_spirit})")
            if len(agents) > 5:
                print(f"... and {len(agents) - 5} more agents")
        else:
            print("No agents found in ECS system")

    except Exception as e:
        print(f"❌ Error checking system: {e}")
        import traceback

        traceback.print_exc()
    finally:
        await service.shutdown()


if __name__ == "__main__":
    asyncio.run(check_messages())
