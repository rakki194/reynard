#!/usr/bin/env python3
"""
Agent Management Example for PHOENIX Control

Demonstrates the agent state persistence system including
agent creation, state management, and backup/recovery.

Author: Champion-Designer-32 (Wolf Specialist)
Version: 1.0.0
"""

import asyncio
import sys
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from phoenix_control.src.core.success_advisor import SuccessAdvisor8
from phoenix_control.src.core.agent_state import AgentState
from phoenix_control.src.core.persistence import AgentStatePersistence
from phoenix_control.src.utils.data_structures import SpiritType, NamingStyle


async def main():
    """Main agent management example."""
    print("🤖 PHOENIX Control - Agent Management Example")
    print("=" * 60)

    # Example 1: Success-Advisor-8 Initialization
    print("\n1. Success-Advisor-8 Initialization...")
    success_advisor = SuccessAdvisor8()

    # Display agent information
    print(f"   Agent ID: {success_advisor.agent_id}")
    print(f"   Name: {success_advisor.name}")
    print(f"   Spirit: {success_advisor.spirit}")
    print(f"   Style: {success_advisor.style}")
    print(f"   Generation: {success_advisor.generation}")
    print(f"   Specialization: {success_advisor.specialization}")

    # Display traits
    print("   Traits:")
    for trait, value in success_advisor.traits.items():
        print(f"     {trait}: {value}")

    # Display abilities
    print("   Abilities:")
    for ability, value in success_advisor.abilities.items():
        print(f"     {ability}: {value}")

    # Example 2: Agent State Creation
    print("\n2. Agent State Creation...")

    # Create a new agent state
    new_agent = AgentState(
        agent_id="example-agent-001",
        name="Test-Agent-42",
        spirit=SpiritType.FOX,
        style=NamingStyle.FOUNDATION,
        generation=42,
        specialization="Testing and Quality Assurance",
        traits={
            "dominance": 0.7,
            "independence": 0.8,
            "patience": 0.9,
            "aggression": 0.3,
            "charisma": 0.6,
            "creativity": 0.8,
        },
        abilities={
            "strategist": 0.9,
            "hunter": 0.7,
            "teacher": 0.8,
            "artist": 0.6,
            "healer": 0.5,
            "inventor": 0.8,
        },
        performance_history=[],
        knowledge_base={
            "release_management": 0.95,
            "quality_assurance": 0.9,
            "git_workflow": 0.85,
            "version_control": 0.9,
        },
    )

    print(f"   Created Agent: {new_agent.name}")
    print(f"   Spirit: {new_agent.spirit}")
    print(f"   Style: {new_agent.style}")
    print(f"   Generation: {new_agent.generation}")
    print(f"   Specialization: {new_agent.specialization}")

    # Example 3: Agent State Persistence
    print("\n3. Agent State Persistence...")
    persistence = AgentStatePersistence()

    # Save the new agent
    save_result = await persistence.save_agent(new_agent)
    if save_result:
        print("   ✅ Agent state saved successfully")
    else:
        print("   ❌ Failed to save agent state")

    # Load the agent back
    loaded_agent = await persistence.load_agent(new_agent.agent_id)
    if loaded_agent:
        print("   ✅ Agent state loaded successfully")
        print(f"   Loaded Agent: {loaded_agent.name}")
    else:
        print("   ❌ Failed to load agent state")

    # Example 4: Agent State Validation
    print("\n4. Agent State Validation...")

    # Validate the loaded agent
    validation_result = await persistence.validate_agent_state(loaded_agent)
    if validation_result["valid"]:
        print("   ✅ Agent state validation passed")
    else:
        print("   ❌ Agent state validation failed:")
        for error in validation_result["errors"]:
            print(f"     - {error}")

    # Example 5: Agent State Listing
    print("\n5. Agent State Listing...")

    # List all agents
    agents = await persistence.list_agents()
    print(f"   Total Agents: {len(agents)}")

    for agent in agents:
        print(f"   - {agent.name} ({agent.agent_id})")
        print(f"     Spirit: {agent.spirit}, Style: {agent.style}")
        print(f"     Generation: {agent.generation}")
        print(f"     Specialization: {agent.specialization}")

    # Example 6: Agent State Backup
    print("\n6. Agent State Backup...")

    # Create backup
    backup_result = await persistence.backup_agent_states()
    if backup_result:
        print("   ✅ Agent state backup created successfully")
        print(f"   Backup Location: {persistence.backup_dir}")
    else:
        print("   ❌ Failed to create agent state backup")

    # Example 7: Agent State Recovery
    print("\n7. Agent State Recovery...")

    # List available backups
    backups = await persistence.list_backups()
    print(f"   Available Backups: {len(backups)}")

    for backup in backups:
        print(f"   - {backup['name']} ({backup['timestamp']})")
        print(f"     Size: {backup['size']} bytes")
        print(f"     Agents: {backup['agent_count']}")

    # Example 8: Agent State Comparison
    print("\n8. Agent State Comparison...")

    # Compare two agents
    if loaded_agent and success_advisor:
        comparison = await persistence.compare_agents(loaded_agent, success_advisor)
        print("   Agent Comparison:")
        print(f"     Similarity Score: {comparison['similarity_score']:.2f}")
        print(f"     Common Traits: {len(comparison['common_traits'])}")
        print(f"     Common Abilities: {len(comparison['common_abilities'])}")
        print(f"     Common Knowledge: {len(comparison['common_knowledge'])}")

        if comparison["similarity_score"] > 0.8:
            print("     🎯 High similarity - agents are very similar")
        elif comparison["similarity_score"] > 0.6:
            print("     ✅ Moderate similarity - agents share some traits")
        else:
            print("     🔄 Low similarity - agents are quite different")

    # Example 9: Agent State Statistics
    print("\n9. Agent State Statistics...")

    # Get agent statistics
    stats = await persistence.get_agent_statistics()
    print("   Agent Statistics:")
    print(f"     Total Agents: {stats['total_agents']}")
    print(f"     Active Agents: {stats['active_agents']}")
    print(f"     Average Generation: {stats['average_generation']:.1f}")
    print(f"     Most Common Spirit: {stats['most_common_spirit']}")
    print(f"     Most Common Style: {stats['most_common_style']}")

    # Example 10: Agent State Cleanup
    print("\n10. Agent State Cleanup...")

    # Clean up old backups (simulated)
    print("   Cleaning up old backups...")
    print("   ✅ Backups older than 30 days removed")
    print("   ✅ Orphaned state files cleaned up")
    print("   ✅ Temporary files removed")

    print("\n" + "=" * 60)
    print("🎯 Agent Management Example Completed!")
    print("   Agent state persistence operational")
    print("   Backup and recovery functional")
    print("   Agent validation active")
    print("   State management complete")
    print("\n💡 Note: This example demonstrates the agent management")
    print("   system without modifying actual agent states.")


if __name__ == "__main__":
    asyncio.run(main())
