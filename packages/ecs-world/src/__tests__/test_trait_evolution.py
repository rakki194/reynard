"""
Test Suite for ECS World Trait Evolution

Comprehensive tests to verify that agent traits evolve over time in the ECS world simulation.
Tests trait inheritance, mutation, time-based progression, and genetic compatibility.

Author: Wit-Prime-13 (Fox Specialist)
"""

import pytest
import random
import time
from pathlib import Path
from typing import Any, Dict

from reynard_ecs_world.world.agent_world import AgentWorld
from reynard_ecs_world.world.simulation import WorldSimulation
from reynard_ecs_world.components.traits import TraitComponent
from reynard_ecs_world.components.lifecycle import LifecycleComponent
from reynard_ecs_world.components.reproduction import ReproductionComponent


class TestTraitEvolution:
    """Test suite for trait evolution in the ECS world."""

    @pytest.fixture
    def temp_data_dir(self, tmp_path):
        """Create a temporary data directory for testing."""
        return tmp_path / "ecs_test_data"

    @pytest.fixture
    def agent_world(self, temp_data_dir):
        """Create an agent world for testing."""
        return AgentWorld(temp_data_dir)

    @pytest.fixture
    def world_simulation(self, temp_data_dir):
        """Create a world simulation for testing."""
        return WorldSimulation(temp_data_dir, time_acceleration=100.0)

    def test_trait_inheritance_during_breeding(self, agent_world):
        """Test that traits are properly inherited during breeding with mutation."""
        # Create two parent agents with known traits
        parent1 = agent_world.create_agent("parent1", "fox", "foundation")
        parent2 = agent_world.create_agent("parent2", "wolf", "exo")
        
        # Set specific traits for testing
        traits1 = parent1.get_component(TraitComponent)
        traits2 = parent2.get_component(TraitComponent)
        
        # Set known trait values
        traits1.personality = {
            "dominance": 0.8,
            "loyalty": 0.6,
            "cunning": 0.9,
            "aggression": 0.4,
            "intelligence": 0.7,
            "creativity": 0.5
        }
        traits1.physical = {
            "size": 0.6,
            "strength": 0.7,
            "agility": 0.8,
            "endurance": 0.5
        }
        traits1.abilities = {
            "hunter": 0.9,
            "healer": 0.3,
            "scout": 0.8,
            "guardian": 0.6
        }
        
        traits2.personality = {
            "dominance": 0.4,
            "loyalty": 0.9,
            "cunning": 0.5,
            "aggression": 0.8,
            "intelligence": 0.6,
            "creativity": 0.8
        }
        traits2.physical = {
            "size": 0.8,
            "strength": 0.9,
            "agility": 0.5,
            "endurance": 0.8
        }
        traits2.abilities = {
            "hunter": 0.6,
            "healer": 0.8,
            "scout": 0.4,
            "guardian": 0.9
        }
        
        # Create offspring through breeding
        offspring = agent_world.create_offspring("parent1", "parent2", "offspring1")
        assert offspring is not None
        
        offspring_traits = offspring.get_component(TraitComponent)
        assert offspring_traits is not None
        
        # Test that offspring traits are inherited (averaged with mutation)
        # Dominance: (0.8 + 0.4) / 2 = 0.6, plus mutation
        assert 0.5 <= offspring_traits.personality["dominance"] <= 0.7
        
        # Loyalty: (0.6 + 0.9) / 2 = 0.75, plus mutation
        assert 0.65 <= offspring_traits.personality["loyalty"] <= 0.85
        
        # Test that mutation count increased
        assert offspring_traits.mutation_count > 0
        
        # Test that all traits are within valid range [0.0, 1.0]
        for trait_value in offspring_traits.personality.values():
            assert 0.0 <= trait_value <= 1.0
        for trait_value in offspring_traits.physical.values():
            assert 0.0 <= trait_value <= 1.0
        for trait_value in offspring_traits.abilities.values():
            assert 0.0 <= trait_value <= 1.0

    def test_trait_compatibility_analysis(self, agent_world):
        """Test genetic compatibility analysis between agents."""
        # Create agents with different trait profiles
        agent1 = agent_world.create_agent("agent1", "fox", "foundation")
        agent2 = agent_world.create_agent("agent2", "fox", "foundation")
        agent3 = agent_world.create_agent("agent3", "wolf", "exo")
        
        # Set traits for compatibility testing
        traits1 = agent1.get_component(TraitComponent)
        traits2 = agent2.get_component(TraitComponent)
        traits3 = agent3.get_component(TraitComponent)
        
        # Similar traits (high compatibility)
        traits1.personality = {"dominance": 0.7, "loyalty": 0.8, "cunning": 0.6}
        traits2.personality = {"dominance": 0.8, "loyalty": 0.7, "cunning": 0.5}
        
        # Different traits (low compatibility)
        traits3.personality = {"dominance": 0.2, "loyalty": 0.3, "cunning": 0.9}
        
        # Test compatibility analysis
        compatibility_high = agent_world.analyze_genetic_compatibility("agent1", "agent2")
        compatibility_low = agent_world.analyze_genetic_compatibility("agent1", "agent3")
        
        assert compatibility_high["compatibility"] > compatibility_low["compatibility"]
        assert compatibility_high["compatibility"] >= 0.6  # Should be high compatibility
        assert compatibility_low["compatibility"] < 0.6   # Should be low compatibility
        
        # Test mate finding
        compatible_mates = agent_world.find_compatible_mates("agent1", max_results=2)
        assert "agent2" in compatible_mates
        assert "agent3" not in compatible_mates or compatible_mates.index("agent2") < compatible_mates.index("agent3")

    def test_time_based_trait_progression(self, world_simulation):
        """Test that traits can evolve over time in the simulation."""
        # Create an agent
        agent = world_simulation.create_agent("test_agent", "fox", "foundation")
        traits = agent.get_component(TraitComponent)
        lifecycle = agent.get_component(LifecycleComponent)
        
        # Record initial traits
        initial_traits = {
            "personality": traits.personality.copy(),
            "physical": traits.physical.copy(),
            "abilities": traits.abilities.copy()
        }
        
        # Simulate time progression
        initial_time = world_simulation.simulation_time
        world_simulation.update(1.0)  # 1 second real time = 100 seconds simulation time
        
        # Verify time has progressed
        assert world_simulation.simulation_time > initial_time
        
        # For now, traits don't automatically evolve over time in the current implementation
        # This test documents the expected behavior for future implementation
        # TODO: Implement trait evolution over time
        current_traits = {
            "personality": traits.personality,
            "physical": traits.physical,
            "abilities": traits.abilities
        }
        
        # Currently traits don't change over time, but this test structure is ready
        # for when trait evolution is implemented
        assert current_traits == initial_traits  # No change yet

    def test_simulation_time_acceleration(self, world_simulation):
        """Test that time acceleration affects simulation progression."""
        initial_time = world_simulation.simulation_time
        
        # Test different acceleration factors
        world_simulation.set_time_acceleration(50.0)
        world_simulation.update(1.0)  # 1 second real time
        time_50x = world_simulation.simulation_time
        
        world_simulation.set_time_acceleration(100.0)
        world_simulation.update(1.0)  # 1 second real time
        time_100x = world_simulation.simulation_time
        
        # Higher acceleration should result in more time progression
        assert time_100x > time_50x > initial_time
        
        # Verify acceleration factor is applied correctly
        expected_50x = initial_time + 50.0
        expected_100x = time_50x + 100.0
        
        # Allow for small floating point differences
        assert abs(time_50x - expected_50x) < 0.1
        assert abs(time_100x - expected_100x) < 0.1

    def test_trait_mutation_variability(self, agent_world):
        """Test that trait mutations introduce variability in offspring."""
        # Create identical parent agents
        parent1 = agent_world.create_agent("parent1", "fox", "foundation")
        parent2 = agent_world.create_agent("parent2", "fox", "foundation")
        
        # Set identical traits
        traits1 = parent1.get_component(TraitComponent)
        traits2 = parent2.get_component(TraitComponent)
        
        identical_traits = {
            "dominance": 0.5,
            "loyalty": 0.5,
            "cunning": 0.5,
            "aggression": 0.5,
            "intelligence": 0.5,
            "creativity": 0.5
        }
        
        traits1.personality = identical_traits.copy()
        traits2.personality = identical_traits.copy()
        
        # Create multiple offspring to test mutation variability
        offspring_traits = []
        for i in range(10):
            offspring = agent_world.create_offspring("parent1", "parent2", f"offspring_{i}")
            offspring_traits.append(offspring.get_component(TraitComponent).personality)
        
        # Test that mutations introduce variability
        # At least some offspring should have different trait values
        trait_variations = set()
        for traits in offspring_traits:
            for trait_name, trait_value in traits.items():
                trait_variations.add((trait_name, round(trait_value, 2)))
        
        # Should have multiple variations due to mutations
        assert len(trait_variations) > len(identical_traits)
        
        # All traits should still be within valid range
        for traits in offspring_traits:
            for trait_value in traits.values():
                assert 0.0 <= trait_value <= 1.0

    def test_lineage_tracking_evolution(self, agent_world):
        """Test that lineage tracking works correctly through multiple generations."""
        # Create first generation
        grandparent1 = agent_world.create_agent("grandparent1", "fox", "foundation")
        grandparent2 = agent_world.create_agent("grandparent2", "wolf", "exo")
        
        # Create second generation
        parent1 = agent_world.create_offspring("grandparent1", "grandparent2", "parent1")
        parent2 = agent_world.create_offspring("grandparent1", "grandparent2", "parent2")
        
        # Create third generation
        child = agent_world.create_offspring("parent1", "parent2", "child")
        
        # Test lineage tracking
        child_lineage = agent_world.get_agent_lineage("child")
        assert "parent1" in child_lineage["parents"]
        assert "parent2" in child_lineage["parents"]
        
        # Test that mutation count increases through generations
        grandparent_traits = grandparent1.get_component(TraitComponent)
        parent_traits = parent1.get_component(TraitComponent)
        child_traits = child.get_component(TraitComponent)
        
        assert child_traits.mutation_count > parent_traits.mutation_count
        assert parent_traits.mutation_count > grandparent_traits.mutation_count

    def test_trait_boundary_conditions(self, agent_world):
        """Test trait evolution with boundary conditions."""
        # Create agents with extreme trait values
        parent1 = agent_world.create_agent("parent1", "fox", "foundation")
        parent2 = agent_world.create_agent("parent2", "wolf", "exo")
        
        traits1 = parent1.get_component(TraitComponent)
        traits2 = parent2.get_component(TraitComponent)
        
        # Set extreme values
        traits1.personality = {"dominance": 0.0, "loyalty": 1.0, "cunning": 0.0}
        traits2.personality = {"dominance": 1.0, "loyalty": 0.0, "cunning": 1.0}
        
        # Create offspring
        offspring = agent_world.create_offspring("parent1", "parent2", "offspring")
        offspring_traits = offspring.get_component(TraitComponent)
        
        # Test that offspring traits stay within bounds even with extreme parents
        for trait_value in offspring_traits.personality.values():
            assert 0.0 <= trait_value <= 1.0
        
        # Test that averaging works correctly
        # Dominance: (0.0 + 1.0) / 2 = 0.5, plus mutation
        assert 0.4 <= offspring_traits.personality["dominance"] <= 0.6
        
        # Loyalty: (1.0 + 0.0) / 2 = 0.5, plus mutation
        assert 0.4 <= offspring_traits.personality["loyalty"] <= 0.6

    def test_automatic_reproduction_evolution(self, agent_world):
        """Test that manual reproduction leads to trait evolution over time."""
        # Enable automatic reproduction (currently just logs)
        agent_world.enable_automatic_reproduction(True)
        
        # Create initial population
        for i in range(5):
            agent_world.create_agent(f"agent_{i}", "fox", "foundation")
        
        # Age agents to maturity
        for entity in agent_world.get_agent_entities():
            lifecycle = entity.get_component(LifecycleComponent)
            if lifecycle:
                lifecycle.age = 3.0  # Make them mature
        
        # Simulate multiple breeding cycles manually
        initial_population = len(agent_world.get_agent_entities())
        
        # Create offspring manually to simulate breeding
        agent_entities = list(agent_world.get_agent_entities())
        for i in range(3):
            if len(agent_entities) >= 2:
                parent1 = agent_entities[i % len(agent_entities)]
                parent2 = agent_entities[(i + 1) % len(agent_entities)]
                offspring = agent_world.create_offspring(parent1.id, parent2.id, f"offspring_{i}")
                if offspring:
                    agent_entities.append(offspring)
        
        # Population should have grown
        final_population = len(agent_world.get_agent_entities())
        assert final_population > initial_population
        
        # New agents should have evolved traits
        new_agents = final_population - initial_population
        assert new_agents > 0
        
        # Test that new agents have different traits than originals
        original_agents = [e for e in agent_world.get_agent_entities() if e.id.startswith("agent_")]
        new_agents_list = [e for e in agent_world.get_agent_entities() if e.id.startswith("offspring_")]
        
        assert len(new_agents_list) > 0
        
        # New agents should have mutation counts > 0
        for new_agent in new_agents_list:
            traits = new_agent.get_component(TraitComponent)
            assert traits.mutation_count > 0


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v"])
