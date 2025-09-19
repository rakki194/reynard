"""
Performance tests for ECS Memory & Interaction System.
"""

import pytest
import time
import random
from typing import Dict, Any

from reynard_ecs_world.world.agent_world import AgentWorld
from reynard_ecs_world.components import (
    MemoryType,
    InteractionType,
    KnowledgeType,
    GroupType,
    GenderIdentity,
)


class TestPerformance:
    """Performance test suite for ECS systems."""
    
    @pytest.mark.performance
    @pytest.mark.slow
    def test_large_agent_creation_performance(self, performance_test_agents):
        """Test performance of creating large numbers of agents."""
        world, agents = performance_test_agents
        
        # Measure time to create additional agents
        start_time = time.time()
        
        for i in range(100, 200):  # Create 100 more agents
            agent_id = f"perf-agent-{i}"
            world.create_agent(agent_id, spirit="fox", style="foundation")
        
        end_time = time.time()
        creation_time = end_time - start_time
        
        # Should create 100 agents in reasonable time (less than 10 seconds)
        assert creation_time < 10.0
        print(f"Created 100 agents in {creation_time:.2f} seconds")
    
    @pytest.mark.performance
    @pytest.mark.slow
    def test_memory_operations_performance(self, performance_test_agents):
        """Test performance of memory operations with many agents."""
        world, agents = performance_test_agents
        
        # Measure time to add memories to all agents
        start_time = time.time()
        
        for agent_id in list(agents.keys())[:50]:  # Test with 50 agents
            for i in range(10):  # 10 memories per agent
                world.store_memory(
                    agent_id,
                    MemoryType.EPISODIC,
                    f"Performance test memory {i}",
                    importance=random.random(),
                    emotional_weight=random.random()
                )
        
        end_time = time.time()
        memory_time = end_time - start_time
        
        # Should handle 500 memory operations in reasonable time
        assert memory_time < 5.0
        print(f"Stored 500 memories in {memory_time:.2f} seconds")
        
        # Test memory retrieval performance
        start_time = time.time()
        
        for agent_id in list(agents.keys())[:50]:
            memories = world.retrieve_memories(agent_id, limit=10)
            assert len(memories) == 10
        
        end_time = time.time()
        retrieval_time = end_time - start_time
        
        # Should retrieve memories quickly
        assert retrieval_time < 2.0
        print(f"Retrieved 500 memories in {retrieval_time:.2f} seconds")
    
    @pytest.mark.performance
    @pytest.mark.slow
    def test_knowledge_operations_performance(self, performance_test_agents):
        """Test performance of knowledge operations with many agents."""
        world, agents = performance_test_agents
        
        # Measure time to add knowledge to all agents
        start_time = time.time()
        
        knowledge_ids = []
        for agent_id in list(agents.keys())[:50]:  # Test with 50 agents
            for i in range(5):  # 5 knowledge items per agent
                knowledge_id = world.add_knowledge(
                    agent_id,
                    f"Performance Knowledge {i}",
                    KnowledgeType.FACTUAL,
                    f"Description {i}",
                    proficiency=random.random(),
                    importance=random.random()
                )
                knowledge_ids.append((agent_id, knowledge_id))
        
        end_time = time.time()
        knowledge_time = end_time - start_time
        
        # Should handle 250 knowledge operations in reasonable time
        assert knowledge_time < 3.0
        print(f"Added 250 knowledge items in {knowledge_time:.2f} seconds")
        
        # Test knowledge transfer performance
        start_time = time.time()
        
        transfer_count = 0
        for i in range(0, len(knowledge_ids), 2):
            if i + 1 < len(knowledge_ids):
                agent1_id, knowledge_id = knowledge_ids[i]
                agent2_id, _ = knowledge_ids[i + 1]
                
                result = world.transfer_knowledge(agent1_id, agent2_id, knowledge_id)
                if result:
                    transfer_count += 1
        
        end_time = time.time()
        transfer_time = end_time - start_time
        
        # Should handle knowledge transfers quickly
        assert transfer_time < 2.0
        print(f"Performed {transfer_count} knowledge transfers in {transfer_time:.2f} seconds")
    
    @pytest.mark.performance
    @pytest.mark.slow
    def test_social_operations_performance(self, performance_test_agents):
        """Test performance of social operations with many agents."""
        world, agents = performance_test_agents
        
        # Measure time to create social groups
        start_time = time.time()
        
        agent_list = list(agents.keys())
        group_count = 0
        
        for i in range(0, len(agent_list), 5):  # Groups of 5 agents
            if i + 4 < len(agent_list):
                group_members = agent_list[i:i+5]
                group_id = world.create_social_group(
                    group_members[0],
                    f"Performance Group {group_count}",
                    GroupType.COMMUNITY,
                    group_members
                )
                if group_id:
                    group_count += 1
        
        end_time = time.time()
        group_time = end_time - start_time
        
        # Should create groups quickly
        assert group_time < 3.0
        print(f"Created {group_count} social groups in {group_time:.2f} seconds")
    
    @pytest.mark.performance
    @pytest.mark.slow
    def test_gender_operations_performance(self, performance_test_agents):
        """Test performance of gender operations with many agents."""
        world, agents = performance_test_agents
        
        # Measure time to update gender identities
        start_time = time.time()
        
        gender_identities = list(GenderIdentity)
        for i, agent_id in enumerate(list(agents.keys())[:50]):  # Test with 50 agents
            gender = gender_identities[i % len(gender_identities)]
            world.update_gender_identity(agent_id, gender)
        
        end_time = time.time()
        gender_time = end_time - start_time
        
        # Should update gender identities quickly
        assert gender_time < 1.0
        print(f"Updated 50 gender identities in {gender_time:.2f} seconds")
        
        # Test support network operations
        start_time = time.time()
        
        agent_list = list(agents.keys())[:50]
        for i in range(0, len(agent_list), 2):
            if i + 1 < len(agent_list):
                agent1_id = agent_list[i]
                agent2_id = agent_list[i + 1]
                world.add_support_agent(agent1_id, agent2_id)
                world.update_coming_out_status(agent1_id, agent2_id, True)
        
        end_time = time.time()
        support_time = end_time - start_time
        
        # Should handle support network operations quickly
        assert support_time < 1.0
        print(f"Updated support networks in {support_time:.2f} seconds")
    
    @pytest.mark.performance
    @pytest.mark.slow
    def test_system_statistics_performance(self, performance_test_agents):
        """Test performance of system statistics retrieval."""
        world, agents = performance_test_agents
        
        # Add some data to make statistics meaningful
        agent_list = list(agents.keys())[:20]
        
        # Add memories
        for agent_id in agent_list:
            world.store_memory(
                agent_id,
                MemoryType.EPISODIC,
                "Performance test memory",
                importance=0.5
            )
        
        # Add knowledge
        for agent_id in agent_list:
            world.add_knowledge(
                agent_id,
                "Performance Knowledge",
                KnowledgeType.FACTUAL,
                "Description",
                proficiency=0.5
            )
        
        # Create social groups
        for i in range(0, len(agent_list), 3):
            if i + 2 < len(agent_list):
                group_members = agent_list[i:i+3]
                world.create_social_group(
                    group_members[0],
                    f"Stats Group {i//3}",
                    GroupType.COMMUNITY,
                    group_members
                )
        
        # Measure time to get all system statistics
        start_time = time.time()
        
        memory_stats = world.get_memory_system_stats()
        interaction_stats = world.get_interaction_system_stats()
        social_stats = world.get_social_system_stats()
        knowledge_stats = world.get_learning_system_stats()
        gender_stats = world.get_gender_system_stats()
        
        end_time = time.time()
        stats_time = end_time - start_time
        
        # Should retrieve all statistics quickly
        assert stats_time < 1.0
        print(f"Retrieved all system statistics in {stats_time:.2f} seconds")
        
        # Verify statistics are meaningful
        assert memory_stats["total_agents_with_memory"] > 0
        assert interaction_stats["total_agents_with_interactions"] > 0
        assert social_stats["total_agents_with_social"] > 0
        assert knowledge_stats["total_agents_with_knowledge"] > 0
        assert gender_stats["total_agents"] > 0
    
    @pytest.mark.performance
    @pytest.mark.slow
    def test_concurrent_operations_performance(self, performance_test_agents):
        """Test performance of concurrent operations."""
        world, agents = performance_test_agents
        
        # Simulate concurrent operations by interleaving different types
        start_time = time.time()
        
        agent_list = list(agents.keys())[:30]
        operations_count = 0
        
        for i in range(100):  # 100 operations
            agent_id = agent_list[i % len(agent_list)]
            
            if i % 4 == 0:
                # Memory operation
                world.store_memory(
                    agent_id,
                    MemoryType.EPISODIC,
                    f"Concurrent memory {i}",
                    importance=0.5
                )
            elif i % 4 == 1:
                # Knowledge operation
                world.add_knowledge(
                    agent_id,
                    f"Concurrent knowledge {i}",
                    KnowledgeType.FACTUAL,
                    "Description",
                    proficiency=0.5
                )
            elif i % 4 == 2:
                # Gender operation
                gender = random.choice(list(GenderIdentity))
                world.update_gender_identity(agent_id, gender)
            else:
                # Social operation (create group every 4th operation)
                if i % 12 == 3 and i + 2 < len(agent_list):
                    group_members = agent_list[i:i+3]
                    world.create_social_group(
                        group_members[0],
                        f"Concurrent Group {i//12}",
                        GroupType.COMMUNITY,
                        group_members
                    )
            
            operations_count += 1
        
        end_time = time.time()
        concurrent_time = end_time - start_time
        
        # Should handle concurrent operations efficiently
        assert concurrent_time < 5.0
        print(f"Performed {operations_count} concurrent operations in {concurrent_time:.2f} seconds")
    
    @pytest.mark.performance
    @pytest.mark.slow
    def test_memory_cleanup_performance(self, performance_test_agents):
        """Test performance of memory cleanup operations."""
        world, agents = performance_test_agents
        
        # Add many memories to trigger cleanup
        agent_list = list(agents.keys())[:10]
        
        start_time = time.time()
        
        for agent_id in agent_list:
            for i in range(100):  # 100 memories per agent
                world.store_memory(
                    agent_id,
                    MemoryType.EPISODIC,
                    f"Cleanup test memory {i}",
                    importance=0.1,  # Low importance to trigger cleanup
                    emotional_weight=0.1
                )
        
        end_time = time.time()
        memory_time = end_time - start_time
        
        # Should handle memory creation efficiently
        assert memory_time < 3.0
        print(f"Created 1000 memories in {memory_time:.2f} seconds")
        
        # Test memory retrieval after cleanup
        start_time = time.time()
        
        for agent_id in agent_list:
            memories = world.retrieve_memories(agent_id, limit=50)
            # Should have fewer memories due to cleanup
            assert len(memories) <= 50
        
        end_time = time.time()
        retrieval_time = end_time - start_time
        
        # Should retrieve memories quickly even after cleanup
        assert retrieval_time < 1.0
        print(f"Retrieved memories after cleanup in {retrieval_time:.2f} seconds")
    
    @pytest.mark.performance
    @pytest.mark.slow
    def test_large_group_operations_performance(self, performance_test_agents):
        """Test performance with large social groups."""
        world, agents = performance_test_agents
        
        # Create a large social group
        agent_list = list(agents.keys())[:50]  # 50 agents in one group
        
        start_time = time.time()
        
        group_id = world.create_social_group(
            agent_list[0],
            "Large Performance Group",
            GroupType.COMMUNITY,
            agent_list
        )
        
        end_time = time.time()
        group_creation_time = end_time - start_time
        
        # Should create large groups efficiently
        assert group_creation_time < 2.0
        print(f"Created large group with 50 agents in {group_creation_time:.2f} seconds")
        
        # Test group info retrieval
        start_time = time.time()
        
        group_info = world.get_group_info(group_id)
        
        end_time = time.time()
        info_time = end_time - start_time
        
        # Should retrieve group info quickly
        assert info_time < 0.5
        print(f"Retrieved large group info in {info_time:.2f} seconds")
        
        # Verify group info
        assert group_info["name"] == "Large Performance Group"
        assert len(group_info["members"]) == 50
    
    @pytest.mark.performance
    @pytest.mark.slow
    def test_system_scaling_characteristics(self, performance_test_agents):
        """Test how system performance scales with agent count."""
        world, agents = performance_test_agents
        
        # Test with different agent counts
        agent_counts = [10, 25, 50, 75, 100]
        times = []
        
        for count in agent_counts:
            agent_list = list(agents.keys())[:count]
            
            start_time = time.time()
            
            # Perform operations on subset of agents
            for agent_id in agent_list:
                world.store_memory(
                    agent_id,
                    MemoryType.EPISODIC,
                    f"Scaling test memory",
                    importance=0.5
                )
                
                world.add_knowledge(
                    agent_id,
                    "Scaling Knowledge",
                    KnowledgeType.FACTUAL,
                    "Description",
                    proficiency=0.5
                )
            
            end_time = time.time()
            operation_time = end_time - start_time
            times.append(operation_time)
            
            print(f"Operations on {count} agents took {operation_time:.2f} seconds")
        
        # Performance should scale reasonably (not exponentially)
        # Each doubling of agents should not more than double the time
        for i in range(1, len(times)):
            ratio = times[i] / times[i-1]
            agent_ratio = agent_counts[i] / agent_counts[i-1]
            
            # Time ratio should be less than agent ratio squared (good scaling)
            assert ratio < agent_ratio * agent_ratio, f"Poor scaling: {ratio:.2f} vs {agent_ratio:.2f}"
