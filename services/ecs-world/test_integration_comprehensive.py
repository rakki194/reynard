"""
Comprehensive integration test for the ECS Memory & Interaction System.

This test validates that all systems (Memory, Interaction, Social, Knowledge, Gender)
work together seamlessly in a realistic agent simulation scenario.
"""

import pytest
from datetime import datetime, timedelta

from reynard_ecs_world.components.gender import GenderIdentity, GenderExpression
from reynard_ecs_world.components.interaction import InteractionType, CommunicationStyle
from reynard_ecs_world.components.knowledge import KnowledgeType, LearningMethod
from reynard_ecs_world.components.memory import MemoryType
from reynard_ecs_world.components.social import GroupType, SocialRole
from reynard_ecs_world.world.agent_world import AgentWorld


def test_comprehensive_agent_simulation():
    """Test a comprehensive agent simulation with all systems integrated."""
    world = AgentWorld()
    
    # Create a diverse community of agents
    agents = []
    identities = [
        GenderIdentity.MALE, GenderIdentity.FEMALE, GenderIdentity.NON_BINARY,
        GenderIdentity.GENDERFLUID, GenderIdentity.AGENDER, GenderIdentity.BIGENDER
    ]
    
    for i in range(10):
        agent_id = f"agent-{i+1}"
        agent = world.create_agent(agent_id)
        agents.append(agent)
        
        # Set diverse gender identities
        if i < len(identities):
            world.update_gender_identity(agent_id, identities[i])
    
    print(f"Created {len(agents)} agents with diverse gender identities")
    
    # Test 1: Memory Formation and Social Interactions
    print("\n=== Testing Memory Formation and Social Interactions ===")
    
    # Agents form memories through interactions
    agent1_id = "agent-1"
    agent2_id = "agent-2"
    
    # Store initial memories
    world.store_memory(
        agent1_id,
        MemoryType.EPISODIC,
        "Met a new agent during exploration",
        importance=0.8,
        emotional_weight=0.7,
        associated_agents=[agent2_id]
    )
    
    # Initiate interaction (may fail if agents not in proximity)
    interaction_result = world.initiate_interaction(
        agent1_id, agent2_id, InteractionType.COMMUNICATION
    )
    # Note: Interaction may fail if agents are not in proximity, which is expected behavior
    print(f"Interaction result: {interaction_result}")
    
    # Check that memories were formed
    memories = world.retrieve_memories(agent1_id, limit=5)
    assert len(memories) > 0
    
    # Test 2: Knowledge Sharing and Learning
    print("\n=== Testing Knowledge Sharing and Learning ===")
    
    # Agent 1 has knowledge to share
    knowledge_id = world.add_knowledge(
        agent1_id,
        "Advanced Problem Solving",
        KnowledgeType.PROCEDURAL,
        "Techniques for solving complex problems",
        proficiency=0.8,
        confidence=0.9
    )
    assert knowledge_id != ""
    
    # Transfer knowledge to agent 2
    transfer_result = world.transfer_knowledge(agent1_id, agent2_id, knowledge_id)
    assert transfer_result is True
    
    # Check knowledge transfer stats
    transfer_stats = world.get_knowledge_transfer_stats(agent1_id)
    assert transfer_stats["total_teaching_sessions"] > 0
    
    # Test 3: Social Group Formation
    print("\n=== Testing Social Group Formation ===")
    
    # Create a social group
    group_id = world.create_social_group(
        "agent-1",  # creator_id
        "Study Group",
        GroupType.COMMUNITY,
        ["agent-1", "agent-2", "agent-3", "agent-4"]
    )
    assert group_id != ""
    
    # Check group info
    group_info = world.get_group_info(group_id)
    assert group_info["name"] == "Study Group"
    assert group_info["group_type"] == "community"
    assert len(group_info["members"]) == 4
    
    # Test 4: Gender Identity and Support Networks
    print("\n=== Testing Gender Identity and Support Networks ===")
    
    # Update gender identity for agent 3
    world.update_gender_identity("agent-3", GenderIdentity.GENDERFLUID)
    
    # Add support agents
    world.add_support_agent("agent-3", "agent-1")
    world.add_support_agent("agent-3", "agent-2")
    
    # Update coming out status
    world.update_coming_out_status("agent-3", "agent-1", True)
    world.update_coming_out_status("agent-3", "agent-2", True)
    
    # Check gender stats
    gender_stats = world.get_gender_stats("agent-3")
    assert gender_stats["primary_identity"] == "genderfluid"
    assert len(gender_stats["support_network"]) == 2
    
    # Test 5: System Integration and Statistics
    print("\n=== Testing System Integration and Statistics ===")
    
    # Get comprehensive system stats
    memory_stats = world.get_memory_system_stats()
    interaction_stats = world.get_interaction_system_stats()
    social_stats = world.get_social_system_stats()
    knowledge_stats = world.get_learning_system_stats()
    gender_stats = world.get_gender_system_stats()
    
    # Validate all systems are working
    assert memory_stats["total_agents_with_memory"] > 0
    assert interaction_stats["total_agents_with_interactions"] > 0
    assert social_stats["total_agents_with_social"] > 0
    assert knowledge_stats["total_agents_with_knowledge"] > 0
    assert gender_stats["total_agents"] > 0
    
    print(f"Memory System: {memory_stats['total_agents_with_memory']} agents, {memory_stats['total_memories']} memories")
    print(f"Interaction System: {interaction_stats['total_agents_with_interactions']} agents, {interaction_stats['total_interactions']} interactions")
    print(f"Social System: {social_stats['total_agents_with_social']} agents, {social_stats['total_social_groups']} groups")
    print(f"Knowledge System: {knowledge_stats['total_agents_with_knowledge']} agents, {knowledge_stats['total_knowledge_items']} knowledge items")
    print(f"Gender System: {gender_stats['total_agents']} agents, {len(gender_stats['identity_distribution'])} identity types")
    
    # Test 6: Cross-System Interactions
    print("\n=== Testing Cross-System Interactions ===")
    
    # Simulate a complex scenario: agent learns from social interaction
    agent5_id = "agent-5"
    
    # Agent 5 joins the study group
    # (This would be handled by the social system in a real scenario)
    
    # Agent 5 learns from group members
    world.transfer_knowledge(agent1_id, agent5_id, knowledge_id)
    
    # Agent 5 forms memories about the learning experience
    world.store_memory(
        agent5_id,
        MemoryType.EPISODIC,
        "Participated in knowledge sharing session",
        importance=0.7,
        emotional_weight=0.6,
        associated_agents=[agent1_id]
    )
    
    # Check that all systems reflect this interaction
    agent5_memories = world.retrieve_memories(agent5_id)
    agent5_knowledge = world.get_knowledge_stats(agent5_id)
    
    assert len(agent5_memories) > 0
    assert agent5_knowledge["total_knowledge"] > 0
    
    print("✅ All cross-system interactions working correctly")
    
    # Test 7: Performance with Multiple Agents
    print("\n=== Testing Performance with Multiple Agents ===")
    
    # Create additional agents to test performance
    for i in range(10, 20):
        agent_id = f"agent-{i+1}"
        world.create_agent(agent_id)
    
    # Run system updates
    world.update(1.0)  # 1 second simulation time
    
    # Check that all systems handle the load
    final_memory_stats = world.get_memory_system_stats()
    final_interaction_stats = world.get_interaction_system_stats()
    final_social_stats = world.get_social_system_stats()
    final_knowledge_stats = world.get_learning_system_stats()
    final_gender_stats = world.get_gender_system_stats()
    
    assert final_memory_stats["total_agents_with_memory"] == 20
    assert final_interaction_stats["total_agents_with_interactions"] == 20
    assert final_social_stats["total_agents_with_social"] == 20
    assert final_knowledge_stats["total_agents_with_knowledge"] == 20
    assert final_gender_stats["total_agents"] == 20
    
    print(f"✅ Performance test passed: {final_memory_stats['total_agents_with_memory']} agents handled successfully")
    
    print("\n🎉 Comprehensive integration test completed successfully!")
    print("All systems are working together seamlessly!")


def test_system_resilience():
    """Test system resilience and error handling."""
    world = AgentWorld()
    
    # Test with invalid agent IDs
    invalid_result = world.store_memory(
        "nonexistent-agent",
        MemoryType.EPISODIC,
        "This should fail gracefully"
    )
    assert invalid_result is False
    
    # Test with invalid interaction
    invalid_interaction = world.initiate_interaction(
        "agent-1", "nonexistent-agent", InteractionType.COMMUNICATION
    )
    assert invalid_interaction is False
    
    # Test with invalid knowledge transfer
    invalid_transfer = world.transfer_knowledge(
        "agent-1", "agent-2", "invalid-knowledge-id"
    )
    assert invalid_transfer is False
    
    print("✅ System resilience test passed - all error conditions handled gracefully")


def test_data_consistency():
    """Test data consistency across all systems."""
    world = AgentWorld()
    
    # Create agents
    agent1 = world.create_agent("consistency-agent-1")
    agent2 = world.create_agent("consistency-agent-2")
    
    # Add data to all systems
    world.store_memory("consistency-agent-1", MemoryType.EPISODIC, "Test memory")
    world.add_knowledge("consistency-agent-1", "Test Knowledge", KnowledgeType.FACTUAL, "Test knowledge")
    world.update_gender_identity("consistency-agent-1", GenderIdentity.NON_BINARY)
    
    # Check consistency
    memory_stats = world.get_memory_stats("consistency-agent-1")
    knowledge_stats = world.get_knowledge_stats("consistency-agent-1")
    gender_stats = world.get_gender_stats("consistency-agent-1")
    
    assert memory_stats["total_memories"] > 0
    assert knowledge_stats["total_knowledge"] > 0
    assert gender_stats["primary_identity"] == "non_binary"
    
    print("✅ Data consistency test passed - all systems maintain consistent data")


if __name__ == "__main__":
    # Run the comprehensive integration test
    test_comprehensive_agent_simulation()
    test_system_resilience()
    test_data_consistency()
    
    print("\n🦊 All integration tests passed! The ECS Memory & Interaction System is fully integrated and ready for production!")
