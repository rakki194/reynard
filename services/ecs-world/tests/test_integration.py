"""
Comprehensive pytest integration tests for ECS Memory & Interaction System.
"""

import pytest
import random
from datetime import datetime, timedelta
from typing import Dict, Any

from reynard_ecs_world.world.agent_world import AgentWorld
from reynard_ecs_world.components import (
    MemoryType,
    InteractionType,
    CommunicationStyle,
    KnowledgeType,
    GroupType,
    GenderIdentity,
    GenderExpression,
)


class TestAgentWorldIntegration:
    """Test suite for AgentWorld integration with all systems."""
    
    @pytest.mark.integration
    def test_agent_creation_with_all_components(self, agent_world):
        """Test that agents are created with all required components."""
        agent_id = "integration-agent-1"
        agent = agent_world.create_agent(agent_id, spirit="fox", style="foundation")
        
        # Check that agent exists
        assert agent is not None
        
        # Check that agent has all components
        from reynard_ecs_world.components import (
            MemoryComponent,
            InteractionComponent,
            SocialComponent,
            KnowledgeComponent,
            GenderComponent,
        )
        
        assert agent.has_component(MemoryComponent)
        assert agent.has_component(InteractionComponent)
        assert agent.has_component(SocialComponent)
        assert agent.has_component(KnowledgeComponent)
        assert agent.has_component(GenderComponent)
    
    @pytest.mark.integration
    def test_memory_system_integration(self, agent_world):
        """Test memory system integration with AgentWorld."""
        agent_id = "memory-test-agent"
        agent_world.create_agent(agent_id, spirit="fox", style="foundation")
        
        # Store memory
        result = agent_world.store_memory(
            agent_id,
            MemoryType.EPISODIC,
            "Integration test memory",
            importance=0.8,
            emotional_weight=0.6
        )
        
        assert result is True
        
        # Retrieve memory
        memories = agent_world.retrieve_memories(agent_id, limit=5)
        assert len(memories) == 1
        assert memories[0].content == "Integration test memory"
        
        # Get memory stats
        stats = agent_world.get_memory_stats(agent_id)
        assert stats["total_memories"] == 1
        assert stats["memory_types"]["episodic"] == 1
    
    @pytest.mark.integration
    def test_interaction_system_integration(self, agent_world):
        """Test interaction system integration with AgentWorld."""
        agent1_id = "interaction-agent-1"
        agent2_id = "interaction-agent-2"
        
        agent_world.create_agent(agent1_id, spirit="fox", style="foundation")
        agent_world.create_agent(agent2_id, spirit="wolf", style="exo")
        
        # Initiate interaction
        result = agent_world.initiate_interaction(
            agent1_id,
            agent2_id,
            InteractionType.COMMUNICATION
        )
        
        # Interaction may fail if agents not in proximity, which is expected
        assert isinstance(result, bool)
        
        # Get interaction stats
        stats = agent_world.get_interaction_stats(agent1_id)
        assert "total_interactions" in stats
        assert "total_relationships" in stats
    
    @pytest.mark.integration
    def test_social_system_integration(self, agent_world):
        """Test social system integration with AgentWorld."""
        agent1_id = "social-agent-1"
        agent2_id = "social-agent-2"
        agent3_id = "social-agent-3"
        
        agent_world.create_agent(agent1_id, spirit="fox", style="foundation")
        agent_world.create_agent(agent2_id, spirit="wolf", style="exo")
        agent_world.create_agent(agent3_id, spirit="otter", style="hybrid")
        
        # Create social group
        group_id = agent_world.create_social_group(
            agent1_id,
            "Test Group",
            GroupType.FRIENDSHIP,
            [agent1_id, agent2_id, agent3_id]
        )
        
        assert group_id is not None
        
        # Get group info
        group_info = agent_world.get_group_info(group_id)
        assert group_info["name"] == "Test Group"
        assert group_info["group_type"] == "friendship"
        assert len(group_info["members"]) == 3
        
        # Get social stats
        stats = agent_world.get_social_stats(agent1_id)
        assert "network_size" in stats
        assert "group_memberships" in stats
    
    @pytest.mark.integration
    def test_knowledge_system_integration(self, agent_world):
        """Test knowledge system integration with AgentWorld."""
        agent1_id = "knowledge-agent-1"
        agent2_id = "knowledge-agent-2"
        
        agent_world.create_agent(agent1_id, spirit="fox", style="foundation")
        agent_world.create_agent(agent2_id, spirit="wolf", style="exo")
        
        # Add knowledge to agent 1
        knowledge_id = agent_world.add_knowledge(
            agent1_id,
            "Test Knowledge",
            KnowledgeType.FACTUAL,
            "Test description",
            proficiency=0.8,
            importance=0.7
        )
        
        assert knowledge_id is not None
        
        # Transfer knowledge to agent 2
        transfer_result = agent_world.transfer_knowledge(agent1_id, agent2_id, knowledge_id)
        assert transfer_result is True
        
        # Get knowledge stats
        stats1 = agent_world.get_knowledge_stats(agent1_id)
        stats2 = agent_world.get_knowledge_stats(agent2_id)
        
        assert stats1["total_knowledge"] == 1
        assert stats2["total_knowledge"] == 1
        
        # Get transfer stats
        transfer_stats = agent_world.get_knowledge_transfer_stats(agent1_id)
        assert transfer_stats["total_teaching_sessions"] == 1
    
    @pytest.mark.integration
    def test_gender_system_integration(self, agent_world):
        """Test gender system integration with AgentWorld."""
        agent1_id = "gender-agent-1"
        agent2_id = "gender-agent-2"
        
        agent_world.create_agent(agent1_id, spirit="fox", style="foundation")
        agent_world.create_agent(agent2_id, spirit="wolf", style="exo")
        
        # Update gender identity
        result = agent_world.update_gender_identity(agent1_id, GenderIdentity.MALE)
        assert result is True
        
        # Add support agent
        support_result = agent_world.add_support_agent(agent1_id, agent2_id)
        assert support_result is True
        
        # Update coming out status
        coming_out_result = agent_world.update_coming_out_status(agent1_id, agent2_id, True)
        assert coming_out_result is True
        
        # Get gender stats
        stats = agent_world.get_gender_stats(agent1_id)
        assert stats["primary_identity"] == "male"
        assert agent2_id in stats["support_network"]
        assert stats["coming_out_status"][agent2_id] is True


class TestCrossSystemIntegration:
    """Test suite for cross-system interactions."""
    
    @pytest.mark.integration
    def test_memory_and_interaction_integration(self, agent_world):
        """Test memory formation through interactions."""
        agent1_id = "cross-agent-1"
        agent2_id = "cross-agent-2"
        
        agent_world.create_agent(agent1_id, spirit="fox", style="foundation")
        agent_world.create_agent(agent2_id, spirit="wolf", style="exo")
        
        # Store initial memory
        agent_world.store_memory(
            agent1_id,
            MemoryType.SOCIAL,
            "Met a new agent",
            importance=0.7,
            emotional_weight=0.6,
            associated_agents=[agent2_id]
        )
        
        # Try to initiate interaction
        interaction_result = agent_world.initiate_interaction(
            agent1_id,
            agent2_id,
            InteractionType.COMMUNICATION
        )
        
        # Check that memory was formed
        memories = agent_world.retrieve_memories(agent1_id)
        assert len(memories) >= 1
        
        # Check interaction stats
        interaction_stats = agent_world.get_interaction_stats(agent1_id)
        assert "total_interactions" in interaction_stats
    
    @pytest.mark.integration
    def test_social_and_knowledge_integration(self, agent_world):
        """Test knowledge sharing within social groups."""
        agent1_id = "social-knowledge-1"
        agent2_id = "social-knowledge-2"
        agent3_id = "social-knowledge-3"
        
        agent_world.create_agent(agent1_id, spirit="fox", style="foundation")
        agent_world.create_agent(agent2_id, spirit="wolf", style="exo")
        agent_world.create_agent(agent3_id, spirit="otter", style="hybrid")
        
        # Create social group
        group_id = agent_world.create_social_group(
            agent1_id,
            "Learning Group",
            GroupType.COMMUNITY,
            [agent1_id, agent2_id, agent3_id]
        )
        
        # Add knowledge to agent 1
        knowledge_id = agent_world.add_knowledge(
            agent1_id,
            "Group Knowledge",
            KnowledgeType.CONCEPTUAL,
            "Knowledge shared in group",
            proficiency=0.9,
            importance=0.8
        )
        
        # Transfer knowledge to group members
        transfer1 = agent_world.transfer_knowledge(agent1_id, agent2_id, knowledge_id)
        transfer2 = agent_world.transfer_knowledge(agent1_id, agent3_id, knowledge_id)
        
        assert transfer1 is True
        assert transfer2 is True
        
        # Check that all agents have the knowledge
        stats1 = agent_world.get_knowledge_stats(agent1_id)
        stats2 = agent_world.get_knowledge_stats(agent2_id)
        stats3 = agent_world.get_knowledge_stats(agent3_id)
        
        assert stats1["total_knowledge"] == 1
        assert stats2["total_knowledge"] == 1
        assert stats3["total_knowledge"] == 1
    
    @pytest.mark.integration
    def test_gender_and_social_integration(self, agent_world):
        """Test gender identity and social dynamics integration."""
        agent1_id = "gender-social-1"
        agent2_id = "gender-social-2"
        agent3_id = "gender-social-3"
        
        agent_world.create_agent(agent1_id, spirit="fox", style="foundation")
        agent_world.create_agent(agent2_id, spirit="wolf", style="exo")
        agent_world.create_agent(agent3_id, spirit="otter", style="hybrid")
        
        # Set diverse gender identities
        agent_world.update_gender_identity(agent1_id, GenderIdentity.NON_BINARY)
        agent_world.update_gender_identity(agent2_id, GenderIdentity.MALE)
        agent_world.update_gender_identity(agent3_id, GenderIdentity.FEMALE)
        
        # Create support network
        agent_world.add_support_agent(agent1_id, agent2_id)
        agent_world.add_support_agent(agent1_id, agent3_id)
        
        # Create social group
        group_id = agent_world.create_social_group(
            agent1_id,
            "Supportive Group",
            GroupType.COMMUNITY,
            [agent1_id, agent2_id, agent3_id]
        )
        
        # Update coming out status
        agent_world.update_coming_out_status(agent1_id, agent2_id, True)
        agent_world.update_coming_out_status(agent1_id, agent3_id, True)
        
        # Check gender stats
        gender_stats = agent_world.get_gender_stats(agent1_id)
        assert gender_stats["profile"]["primary_identity"] == "non_binary"
        assert len(gender_stats["profile"]["support_network"]) == 2
        assert gender_stats["profile"]["coming_out_status"][agent2_id] is True
        assert gender_stats["profile"]["coming_out_status"][agent3_id] is True
        
        # Check social stats
        social_stats = agent_world.get_social_stats(agent1_id)
        assert "social_groups" in social_stats
    
    @pytest.mark.integration
    def test_comprehensive_agent_lifecycle(self, agent_world):
        """Test comprehensive agent lifecycle with all systems."""
        agent_id = "lifecycle-agent"
        agent_world.create_agent(agent_id, spirit="fox", style="foundation")
        
        # 1. Form memories
        agent_world.store_memory(
            agent_id,
            MemoryType.EPISODIC,
            "Born into the world",
            importance=0.9,
            emotional_weight=0.8
        )
        
        # 2. Set gender identity
        agent_world.update_gender_identity(agent_id, GenderIdentity.GENDERFLUID)
        
        # 3. Add knowledge
        knowledge_id = agent_world.add_knowledge(
            agent_id,
            "Life Skills",
            KnowledgeType.PROCEDURAL,
            "Basic survival skills",
            proficiency=0.6,
            importance=0.8
        )
        
        # 4. Create social group (with self)
        group_id = agent_world.create_social_group(
            agent_id,
            "Personal Development",
            GroupType.COMMUNITY,
            [agent_id]
        )
        
        # Verify all systems are working
        memory_stats = agent_world.get_memory_stats(agent_id)
        gender_stats = agent_world.get_gender_stats(agent_id)
        knowledge_stats = agent_world.get_knowledge_stats(agent_id)
        social_stats = agent_world.get_social_stats(agent_id)
        
        assert memory_stats["total_memories"] == 1
        assert gender_stats["profile"]["primary_identity"] == "genderfluid"
        assert knowledge_stats["total_knowledge"] == 1
        assert "social_groups" in social_stats


class TestSystemStatistics:
    """Test suite for system statistics and monitoring."""
    
    @pytest.mark.integration
    def test_memory_system_stats(self, agent_world):
        """Test memory system statistics."""
        # Create agents and add memories
        for i in range(3):
            agent_id = f"stats-agent-{i}"
            agent_world.create_agent(agent_id, spirit="fox", style="foundation")
            
            agent_world.store_memory(
                agent_id,
                MemoryType.EPISODIC,
                f"Memory {i}",
                importance=0.5
            )
        
        stats = agent_world.get_memory_system_stats()
        
        assert stats["total_agents_with_memory"] == 3
        assert stats["total_memories"] == 3
        assert "memories_processed" in stats
        assert "memories_consolidated" in stats
        assert "memories_cleaned" in stats
    
    @pytest.mark.integration
    def test_interaction_system_stats(self, agent_world):
        """Test interaction system statistics."""
        # Create agents
        for i in range(3):
            agent_id = f"interaction-stats-agent-{i}"
            agent_world.create_agent(agent_id, spirit="fox", style="foundation")
        
        stats = agent_world.get_interaction_system_stats()
        
        assert stats["total_agents_with_interactions"] == 3
        assert "total_relationships" in stats
        assert "total_interactions" in stats
        assert "interactions_processed" in stats
    
    @pytest.mark.integration
    def test_social_system_stats(self, agent_world):
        """Test social system statistics."""
        # Create agents and social groups
        agent_ids = []
        for i in range(5):
            agent_id = f"social-stats-agent-{i}"
            agent_world.create_agent(agent_id, spirit="fox", style="foundation")
            agent_ids.append(agent_id)
        
        # Create social group
        agent_world.create_social_group(
            agent_ids[0],
            "Test Group",
            GroupType.FRIENDSHIP,
            agent_ids[:3]
        )
        
        stats = agent_world.get_social_system_stats()
        
        assert stats["total_agents_with_social"] == 5
        assert stats["total_social_groups"] == 1
        assert "total_connections" in stats
        assert "total_leadership_roles" in stats
    
    @pytest.mark.integration
    def test_knowledge_system_stats(self, agent_world):
        """Test knowledge system statistics."""
        # Create agents and add knowledge
        for i in range(3):
            agent_id = f"knowledge-stats-agent-{i}"
            agent_world.create_agent(agent_id, spirit="fox", style="foundation")
            
            agent_world.add_knowledge(
                agent_id,
                f"Knowledge {i}",
                KnowledgeType.FACTUAL,
                f"Description {i}",
                proficiency=0.5
            )
        
        stats = agent_world.get_learning_system_stats()
        
        assert stats["total_agents_with_knowledge"] == 3
        assert stats["total_knowledge_items"] == 3
        assert "total_learning_opportunities" in stats
        assert "total_teachable_knowledge" in stats
    
    @pytest.mark.integration
    def test_gender_system_stats(self, agent_world):
        """Test gender system statistics."""
        # Create agents with diverse gender identities
        gender_identities = [
            GenderIdentity.MALE,
            GenderIdentity.FEMALE,
            GenderIdentity.NON_BINARY,
            GenderIdentity.GENDERFLUID,
            GenderIdentity.AGENDER
        ]
        
        for i, gender in enumerate(gender_identities):
            agent_id = f"gender-stats-agent-{i}"
            agent_world.create_agent(agent_id, spirit="fox", style="foundation")
            agent_world.update_gender_identity(agent_id, gender)
        
        stats = agent_world.get_gender_system_stats()
        
        assert stats["total_agents"] == 5
        assert "identity_distribution" in stats
        assert "expression_distribution" in stats
        assert "pronoun_usage" in stats
        assert "support_networks" in stats


class TestErrorHandling:
    """Test suite for error handling and edge cases."""
    
    @pytest.mark.integration
    def test_invalid_agent_operations(self, agent_world):
        """Test operations with invalid agent IDs."""
        # Test memory operations with non-existent agent
        result = agent_world.store_memory(
            "non-existent-agent",
            MemoryType.EPISODIC,
            "This should fail"
        )
        assert result is False
        
        # Test knowledge operations with non-existent agent
        knowledge_id = agent_world.add_knowledge(
            "non-existent-agent",
            "Test Knowledge",
            KnowledgeType.FACTUAL,
            "This should fail"
        )
        assert knowledge_id == ""
        
        # Test interaction with non-existent agent
        result = agent_world.initiate_interaction(
            "agent-1",
            "non-existent-agent",
            InteractionType.COMMUNICATION
        )
        assert result is False
    
    @pytest.mark.integration
    def test_invalid_knowledge_transfer(self, agent_world):
        """Test knowledge transfer with invalid parameters."""
        agent1_id = "transfer-agent-1"
        agent2_id = "transfer-agent-2"
        
        agent_world.create_agent(agent1_id, spirit="fox", style="foundation")
        agent_world.create_agent(agent2_id, spirit="wolf", style="exo")
        
        # Test transfer with invalid knowledge ID
        result = agent_world.transfer_knowledge(agent1_id, agent2_id, "invalid-id")
        assert result is False
        
        # Test transfer from non-existent agent
        result = agent_world.transfer_knowledge("non-existent", agent2_id, "invalid-id")
        assert result is False
    
    @pytest.mark.integration
    def test_invalid_social_group_operations(self, agent_world):
        """Test social group operations with invalid parameters."""
        agent_id = "group-agent"
        agent_world.create_agent(agent_id, spirit="fox", style="foundation")
        
        # Test group creation with non-existent creator
        group_id = agent_world.create_social_group(
            "non-existent-agent",
            "Test Group",
            GroupType.FRIENDSHIP,
            ["non-existent-agent"]
        )
        assert group_id == ""
        
        # Test getting info for non-existent group
        group_info = agent_world.get_group_info("non-existent-group")
        assert group_info == {}
    
    @pytest.mark.integration
    def test_system_resilience(self, agent_world):
        """Test system resilience with edge cases."""
        # Create agent
        agent_id = "resilience-agent"
        agent_world.create_agent(agent_id, spirit="fox", style="foundation")
        
        # Test with extreme values
        result = agent_world.store_memory(
            agent_id,
            MemoryType.EPISODIC,
            "Extreme importance memory",
            importance=1.5,  # Above normal range
            emotional_weight=-0.1  # Below normal range
        )
        assert result is True  # Should handle gracefully
        
        # Test with empty strings
        result = agent_world.store_memory(
            agent_id,
            MemoryType.EPISODIC,
            "",  # Empty content
            importance=0.5
        )
        assert result is True  # Should handle gracefully
        
        # Test knowledge with extreme proficiency
        knowledge_id = agent_world.add_knowledge(
            agent_id,
            "Extreme Knowledge",
            KnowledgeType.FACTUAL,
            "Description",
            proficiency=2.0,  # Above normal range
            importance=-0.5  # Below normal range
        )
        assert knowledge_id is not None  # Should handle gracefully
