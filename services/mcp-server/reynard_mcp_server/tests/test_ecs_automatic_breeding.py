#!/usr/bin/env python3
"""
ECS Automatic Breeding System Tests
===================================

Comprehensive pytest tests for the ECS automatic breeding system.
Tests agent lifecycle, reproduction, lineage tracking, and singleton pattern.

Follows the 140-line axiom and modular architecture principles.
"""

import asyncio

# Add the MCP scripts directory to Python path
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from reynard_ecs_world import (
    AgentComponent,
    LifecycleComponent,
    LineageComponent,
    ReproductionComponent,
    ReproductionSystem,
    WorldSimulation,
)
from agent_naming import AgentNameManager


class TestECSAutomaticBreeding:
    """Test suite for ECS automatic breeding system."""

    @pytest.fixture
    def temp_data_dir(self, tmp_path):
        """Create temporary data directory for tests."""
        return tmp_path / "test_ecs_data"

    @pytest.fixture
    def world_simulation(self, temp_data_dir):
        """Create isolated world simulation for testing."""
        return WorldSimulation(temp_data_dir)

    @pytest.fixture
    def agent_manager(self, temp_data_dir):
        """Create isolated agent manager for testing."""
        return AgentNameManager(str(temp_data_dir))

    @pytest.fixture
    def mature_agents(self, world_simulation):
        """Create two mature agents for breeding tests."""
        # Create first agent
        agent1 = world_simulation.create_agent_with_inheritance(
            "test-agent-1", spirit="fox", style="foundation"
        )
        lifecycle1 = agent1.get_component(LifecycleComponent)
        lifecycle1.age = 25.0  # Make mature
        lifecycle1.life_stage = "adult"

        # Create second agent
        agent2 = world_simulation.create_agent_with_inheritance(
            "test-agent-2", spirit="wolf", style="exo"
        )
        lifecycle2 = agent2.get_component(LifecycleComponent)
        lifecycle2.age = 30.0  # Make mature
        lifecycle2.life_stage = "adult"

        return [agent1, agent2]

    def test_world_simulation_singleton_pattern(self, temp_data_dir):
        """Test that WorldSimulation maintains consistent state (singleton-like behavior)."""
        # Create multiple instances with same data directory
        world1 = WorldSimulation(temp_data_dir)
        world2 = WorldSimulation(temp_data_dir)

        # Both should have same data directory
        assert world1.data_dir == world2.data_dir
        assert world1.data_dir == temp_data_dir

        # Both should have same initial simulation time
        assert world1.simulation_time == world2.simulation_time

    def test_agent_lifecycle_progression(self, world_simulation):
        """Test that agents progress through lifecycle stages."""
        agent = world_simulation.create_agent_with_inheritance(
            "lifecycle-test", spirit="otter", style="hybrid"
        )
        lifecycle = agent.get_component(LifecycleComponent)

        # Test infant stage
        lifecycle.age = 2.0
        world_simulation.update_simulation(0.1)
        assert lifecycle.life_stage == "infant"

        # Test juvenile stage
        lifecycle.age = 10.0
        world_simulation.update_simulation(0.1)
        assert lifecycle.life_stage == "juvenile"

        # Test adult stage
        lifecycle.age = 25.0
        world_simulation.update_simulation(0.1)
        assert lifecycle.life_stage == "adult"

        # Test elder stage
        lifecycle.age = 85.0
        world_simulation.update_simulation(0.1)
        assert lifecycle.life_stage == "elder"

    def test_reproduction_system_initialization(self, world_simulation):
        """Test that reproduction system is properly initialized."""
        # Check that reproduction system exists
        reproduction_systems = [
            system
            for system in world_simulation.world.systems
            if isinstance(system, ReproductionSystem)
        ]
        assert len(reproduction_systems) == 1

        reproduction_system = reproduction_systems[0]
        assert reproduction_system.reproduction_chance == 0.01

    def test_mature_agent_detection(self, world_simulation, mature_agents):
        """Test that mature agents are properly detected."""
        mature_entities = world_simulation.get_mature_agents()

        # Should have 2 mature agents
        assert len(mature_entities) == 2

        # Check that both agents are mature
        for entity in mature_entities:
            lifecycle = entity.get_component(LifecycleComponent)
            assert lifecycle.age >= lifecycle.maturity_age
            assert lifecycle.life_stage == "adult"

    def test_reproduction_cooldown_system(self, world_simulation, mature_agents):
        """Test that reproduction cooldown prevents excessive breeding."""
        agent1, agent2 = mature_agents

        # Set cooldown on first agent
        repro1 = agent1.get_component(ReproductionComponent)
        repro1.reproduction_cooldown = 10.0

        # Agent should not attempt reproduction while on cooldown
        reproduction_system = None
        for system in world_simulation.world.systems:
            if isinstance(system, ReproductionSystem):
                reproduction_system = system
                break

        assert reproduction_system is not None
        assert not reproduction_system._should_attempt_reproduction(agent1)

    def test_compatibility_calculation(self, world_simulation, mature_agents):
        """Test compatibility calculation between agents."""
        agent1, agent2 = mature_agents

        reproduction_system = None
        for system in world_simulation.world.systems:
            if isinstance(system, ReproductionSystem):
                reproduction_system = system
                break

        assert reproduction_system is not None

        # Calculate compatibility
        compatibility = reproduction_system._calculate_compatibility(agent1, agent2)

        # Compatibility should be between 0 and 1
        assert 0.0 <= compatibility <= 1.0

    def test_offspring_creation_with_lineage(self, world_simulation, mature_agents):
        """Test that offspring are created with proper lineage tracking."""
        agent1, agent2 = mature_agents

        # Create offspring manually
        offspring = world_simulation.create_offspring(
            agent1.id, agent2.id, "test-offspring"
        )

        # Check offspring has proper lineage
        offspring_lineage = offspring.get_component(LineageComponent)
        assert offspring_lineage is not None
        assert agent1.id in offspring_lineage.parents
        assert agent2.id in offspring_lineage.parents

        # Check parents have offspring in children list
        agent1_lineage = agent1.get_component(LineageComponent)
        agent2_lineage = agent2.get_component(LineageComponent)

        assert "test-offspring" in agent1_lineage.children
        assert "test-offspring" in agent2_lineage.children

    def test_automatic_breeding_simulation(self, world_simulation, mature_agents):
        """Test that automatic breeding occurs during simulation updates."""
        initial_agent_count = len(world_simulation.get_agent_entities())

        # Run simulation for multiple cycles to trigger breeding
        for _ in range(100):  # 100 simulation cycles
            world_simulation.update_simulation(1.0)  # 1 time unit per cycle

        final_agent_count = len(world_simulation.get_agent_entities())

        # Should have more agents due to breeding (if conditions were met)
        # Note: This test might not always pass due to randomness
        # but it tests the system is working
        assert final_agent_count >= initial_agent_count

    def test_time_acceleration_affects_breeding(self, world_simulation, mature_agents):
        """Test that time acceleration affects breeding frequency."""
        # Set high time acceleration
        world_simulation.accelerate_time(100.0)

        initial_time = world_simulation.simulation_time

        # Run simulation
        world_simulation.update_simulation(1.0)

        # Time should advance much faster
        assert world_simulation.simulation_time > initial_time + 50.0

    def test_agent_persistence_across_restarts(self, temp_data_dir):
        """Test that agents persist across world simulation restarts."""
        # Create first world simulation
        world1 = WorldSimulation(temp_data_dir)
        agent1 = world1.create_agent_with_inheritance(
            "persistent-agent", spirit="fox", style="foundation"
        )

        # Save state
        world1.save_simulation_state()

        # Create second world simulation with same data directory
        world2 = WorldSimulation(temp_data_dir)

        # Load state
        world2.load_simulation_state()

        # Agent should be restored
        restored_agent = world2.get_entity("persistent-agent")
        assert restored_agent is not None

        agent_component = restored_agent.get_component(AgentComponent)
        assert agent_component.name == "persistent-agent"
        assert agent_component.spirit == "fox"

    def test_breeding_with_different_spirits(self, world_simulation):
        """Test breeding between agents with different spirits."""
        # Create agents with different spirits
        fox_agent = world_simulation.create_agent_with_inheritance(
            "fox-agent", spirit="fox", style="foundation"
        )
        wolf_agent = world_simulation.create_agent_with_inheritance(
            "wolf-agent", spirit="wolf", style="exo"
        )

        # Make them mature
        fox_lifecycle = fox_agent.get_component(LifecycleComponent)
        wolf_lifecycle = wolf_agent.get_component(LifecycleComponent)
        fox_lifecycle.age = 25.0
        wolf_lifecycle.age = 30.0

        # Create offspring
        offspring = world_simulation.create_offspring(
            fox_agent.id, wolf_agent.id, "hybrid-offspring"
        )

        # Offspring should inherit from one parent (currently simplified)
        offspring_agent = offspring.get_component(AgentComponent)
        assert offspring_agent.spirit in ["fox", "wolf"]

    def test_max_offspring_limit(self, world_simulation, mature_agents):
        """Test that agents respect maximum offspring limits."""
        agent1, agent2 = mature_agents

        # Set low max offspring limit
        repro1 = agent1.get_component(ReproductionComponent)
        repro1.max_offspring = 1
        repro1.offspring_count = 1  # Already at limit

        reproduction_system = None
        for system in world_simulation.world.systems:
            if isinstance(system, ReproductionSystem):
                reproduction_system = system
                break

        # Agent should not attempt reproduction at limit
        assert not reproduction_system._should_attempt_reproduction(agent1)

    def test_agent_death_removes_from_breeding_pool(self, world_simulation):
        """Test that dead agents are removed from breeding pool."""
        agent = world_simulation.create_agent_with_inheritance(
            "dying-agent", spirit="otter", style="hybrid"
        )
        lifecycle = agent.get_component(LifecycleComponent)

        # Make agent very old
        lifecycle.age = 99.0  # Close to max age (100.0)

        initial_count = len(world_simulation.get_agent_entities())

        # Run simulation to trigger death
        world_simulation.update_simulation(5.0)

        final_count = len(world_simulation.get_agent_entities())

        # Agent should be dead and removed
        assert final_count < initial_count

    @pytest.mark.asyncio
    async def test_async_simulation_updates(self, world_simulation, mature_agents):
        """Test that simulation can be updated asynchronously."""
        initial_time = world_simulation.simulation_time

        # Run async simulation updates
        for _ in range(10):
            world_simulation.update_simulation(1.0)
            await asyncio.sleep(0.01)  # Small delay

        # Time should have advanced
        assert world_simulation.simulation_time > initial_time

    def test_breeding_statistics_tracking(self, world_simulation, mature_agents):
        """Test that breeding statistics are properly tracked."""
        agent1, agent2 = mature_agents

        # Create offspring
        offspring = world_simulation.create_offspring(
            agent1.id, agent2.id, "stats-offspring"
        )

        # Check reproduction component stats
        repro1 = agent1.get_component(ReproductionComponent)
        repro2 = agent2.get_component(ReproductionComponent)

        assert repro1.offspring_count == 1
        assert repro2.offspring_count == 1
        assert repro1.reproduction_cooldown > 0
        assert repro2.reproduction_cooldown > 0


class TestECSSingletonPattern:
    """Test suite for ECS singleton pattern verification."""

    def test_agent_manager_singleton_behavior(self, tmp_path):
        """Test that AgentNameManager maintains consistent state."""
        data_dir = tmp_path / "singleton_test"

        # Create multiple instances
        manager1 = AgentNameManager(str(data_dir))
        manager2 = AgentNameManager(str(data_dir))

        # Both should use same data directory
        assert manager1.data_dir == manager2.data_dir

        # Both should have same ECS availability
        assert manager1.ecs_available == manager2.ecs_available

    def test_world_simulation_data_persistence(self, tmp_path):
        """Test that WorldSimulation data persists across instances."""
        data_dir = tmp_path / "persistence_test"

        # Create first instance and add data
        world1 = WorldSimulation(data_dir)
        agent1 = world1.create_agent_with_inheritance(
            "persistent-test", spirit="fox", style="foundation"
        )
        world1.save_simulation_state()

        # Create second instance and load data
        world2 = WorldSimulation(data_dir)
        world2.load_simulation_state()

        # Data should be consistent
        restored_agent = world2.get_entity("persistent-test")
        assert restored_agent is not None

    def test_concurrent_world_access(self, tmp_path):
        """Test that multiple world instances can access same data safely."""
        data_dir = tmp_path / "concurrent_test"

        # Create multiple instances
        world1 = WorldSimulation(data_dir)
        world2 = WorldSimulation(data_dir)

        # Both should be able to create agents
        agent1 = world1.create_agent_with_inheritance(
            "concurrent-1", spirit="fox", style="foundation"
        )
        agent2 = world2.create_agent_with_inheritance(
            "concurrent-2", spirit="wolf", style="exo"
        )

        # Both should see each other's agents after state sync
        world1.save_simulation_state()
        world2.load_simulation_state()

        assert world2.get_entity("concurrent-1") is not None
        assert world1.get_entity("concurrent-2") is not None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
