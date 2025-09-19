"""
Test ECS Integration

Integration tests for the complete ECS system.
"""

import pytest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../..'))

from backend.app.ecs.world import AgentWorld
from backend.app.ecs.components import (
    AgentComponent, PositionComponent, LifecycleComponent,
    SocialComponent, GenderComponent, TraitComponent
)


class TestECSIntegration:
    """Test complete ECS system integration."""
    
    def test_complete_agent_lifecycle(self):
        """Test complete agent lifecycle from creation to breeding."""
        world = AgentWorld()
        
        # Create initial agents
        agent1 = world.create_agent("agent1", "fox", "foundation", "FoxAgent")
        agent2 = world.create_agent("agent2", "wolf", "foundation", "WolfAgent")
        
        # Verify agents have all required components
        assert agent1.get_component(AgentComponent) is not None
        assert agent1.get_component(PositionComponent) is not None
        assert agent1.get_component(LifecycleComponent) is not None
        assert agent1.get_component(SocialComponent) is not None
        assert agent1.get_component(GenderComponent) is not None
        assert agent1.get_component(TraitComponent) is not None
        
        # Age the agents to maturity
        lifecycle1 = agent1.get_component(LifecycleComponent)
        lifecycle2 = agent2.get_component(LifecycleComponent)
        
        lifecycle1.age = 20.0  # Make mature
        lifecycle2.age = 20.0  # Make mature
        
        # Update world to process maturity
        world.update(1.0)
        
        # Check compatibility
        compatibility = world.analyze_genetic_compatibility("agent1", "agent2")
        assert compatibility["compatibility_score"] > 0.0
        
        # Create offspring
        offspring = world.create_offspring("agent1", "agent2", "offspring1")
        assert offspring is not None
        
        # Verify offspring has inherited traits
        offspring_traits = offspring.get_component(TraitComponent)
        agent1_traits = agent1.get_component(TraitComponent)
        agent2_traits = agent2.get_component(TraitComponent)
        
        assert offspring_traits is not None
        assert agent1_traits is not None
        assert agent2_traits is not None
        
        # Check that offspring traits are influenced by parents
        # (exact values will vary due to mutation)
        offspring_personality = offspring_traits.personality_traits
        parent1_personality = agent1_traits.personality_traits
        parent2_personality = agent2_traits.personality_traits
        
        # At least some traits should be similar to parents
        similarities_found = 0
        for trait_name in offspring_personality:
            offspring_value = offspring_personality[trait_name]
            parent1_value = parent1_personality[trait_name]
            parent2_value = parent2_personality[trait_name]
            
            # Check if offspring value is closer to one of the parents
            diff1 = abs(offspring_value - parent1_value)
            diff2 = abs(offspring_value - parent2_value)
            
            if diff1 < 0.3 or diff2 < 0.3:
                similarities_found += 1
        
        assert similarities_found > 0  # At least some traits should be similar
    
    def test_social_interactions(self):
        """Test social interactions between agents."""
        world = AgentWorld()
        
        # Create multiple agents
        agents = []
        for i in range(5):
            agent = world.create_agent(
                f"agent{i}", 
                "fox" if i % 2 == 0 else "wolf", 
                "foundation", 
                f"Agent{i}"
            )
            agents.append(agent)
        
        # Run simulation for multiple updates
        for _ in range(10):
            world.update(1.0)
        
        # Check that social interactions have occurred
        for agent in agents:
            social = agent.get_component(SocialComponent)
            assert social is not None
            
            # Agents should have some social activity
            # (exact values will depend on system implementation)
            assert social.social_level >= 0.0
            assert social.social_level <= 1.0
    
    def test_position_and_movement(self):
        """Test agent positioning and movement."""
        world = AgentWorld()
        
        # Create agent
        agent = world.create_agent("agent1", "fox", "foundation", "Agent1")
        position = agent.get_component(PositionComponent)
        
        initial_x = position.x
        initial_y = position.y
        
        # Set target position
        position.target_x = 100.0
        position.target_y = 100.0
        
        # Run simulation
        for _ in range(50):  # Run for 50 time steps
            world.update(1.0)
        
        # Check that agent has moved towards target
        final_x = position.x
        final_y = position.y
        
        # Agent should have moved closer to target
        initial_distance = ((initial_x - 100.0) ** 2 + (initial_y - 100.0) ** 2) ** 0.5
        final_distance = ((final_x - 100.0) ** 2 + (final_y - 100.0) ** 2) ** 0.5
        
        assert final_distance < initial_distance
    
    def test_memory_and_learning(self):
        """Test agent memory and learning systems."""
        world = AgentWorld()
        
        # Create agent
        agent = world.create_agent("agent1", "fox", "foundation", "Agent1")
        
        # Run simulation
        for _ in range(20):
            world.update(1.0)
        
        # Check memory component
        from backend.app.ecs.components import MemoryComponent
        memory = agent.get_component(MemoryComponent)
        assert memory is not None
        
        # Check knowledge component
        from backend.app.ecs.components import KnowledgeComponent
        knowledge = agent.get_component(KnowledgeComponent)
        assert knowledge is not None
        
        # Agents should have some memory and knowledge after simulation
        assert memory.memory_capacity > 0
        assert knowledge.learning_rate > 0.0
    
    def test_gender_and_identity(self):
        """Test gender and identity systems."""
        world = AgentWorld()
        
        # Create agents with different spirits
        fox_agent = world.create_agent("fox1", "fox", "foundation", "FoxAgent")
        wolf_agent = world.create_agent("wolf1", "wolf", "foundation", "WolfAgent")
        otter_agent = world.create_agent("otter1", "otter", "foundation", "OtterAgent")
        
        # Check gender components
        fox_gender = fox_agent.get_component(GenderComponent)
        wolf_gender = wolf_agent.get_component(GenderComponent)
        otter_gender = otter_agent.get_component(GenderComponent)
        
        assert fox_gender is not None
        assert wolf_gender is not None
        assert otter_gender is not None
        
        # All agents should have valid gender identities
        assert fox_gender.identity is not None
        assert wolf_gender.identity is not None
        assert otter_gender.identity is not None
        
        # Run simulation to test gender system
        for _ in range(10):
            world.update(1.0)
        
        # Gender components should still be valid after simulation
        assert fox_gender.identity is not None
        assert wolf_gender.identity is not None
        assert otter_gender.identity is not None
    
    def test_world_statistics(self):
        """Test world statistics and monitoring."""
        world = AgentWorld()
        
        # Create initial population
        for i in range(10):
            world.create_agent(f"agent{i}", "fox", "foundation", f"Agent{i}")
        
        # Get initial stats
        initial_stats = world.get_world_stats()
        assert initial_stats["total_agents"] == 10
        
        # Age some agents to maturity
        for i in range(5):
            agent = world.get_entity(f"agent{i}")
            if agent:
                lifecycle = agent.get_component(LifecycleComponent)
                if lifecycle:
                    lifecycle.age = 20.0  # Make mature
        
        # Update world
        world.update(1.0)
        
        # Get updated stats
        updated_stats = world.get_world_stats()
        assert updated_stats["total_agents"] == 10
        assert updated_stats["mature_agents"] >= 5
