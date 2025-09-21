"""
Test AgentWorld

Tests for the AgentWorld class and simulation functionality.
"""

import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../.."))

from backend.app.ecs.world import AgentWorld


class TestAgentWorld:
    """Test AgentWorld class."""

    def test_agent_world_creation(self):
        """Test agent world creation."""
        world = AgentWorld()
        assert world is not None
        assert len(world.entities) == 0
        assert len(world.systems) > 0  # Should have systems initialized

    def test_agent_world_create_agent(self):
        """Test creating an agent in the world."""
        world = AgentWorld()

        agent_id = "test-agent-1"
        entity = world.create_agent(
            agent_id=agent_id, spirit="fox", style="foundation", name="TestAgent"
        )

        assert entity is not None
        assert entity.id == agent_id
        assert len(world.entities) == 1

        # Check that the agent has required components
        from backend.app.ecs.components import AgentComponent

        agent_component = entity.get_component(AgentComponent)
        assert agent_component is not None
        assert agent_component.name == "TestAgent"
        assert agent_component.spirit == "fox"
        assert agent_component.style == "foundation"

    def test_agent_world_create_offspring(self):
        """Test creating offspring from two parent agents."""
        world = AgentWorld()

        # Create parent agents
        parent1 = world.create_agent("parent1", "fox", "foundation", "Parent1")
        parent2 = world.create_agent("parent2", "wolf", "foundation", "Parent2")

        # Create offspring
        offspring = world.create_offspring("parent1", "parent2", "offspring1")

        assert offspring is not None
        assert len(world.entities) == 3

        # Check lineage
        from backend.app.ecs.components import LineageComponent

        lineage = offspring.get_component(LineageComponent)
        assert lineage is not None
        assert lineage.parent1_id == "parent1"
        assert lineage.parent2_id == "parent2"

    def test_agent_world_find_compatible_mates(self):
        """Test finding compatible mates for an agent."""
        world = AgentWorld()

        # Create agents
        agent1 = world.create_agent("agent1", "fox", "foundation", "Agent1")
        agent2 = world.create_agent("agent2", "wolf", "foundation", "Agent2")
        agent3 = world.create_agent("agent3", "otter", "foundation", "Agent3")

        # Find compatible mates for agent1
        mates = world.find_compatible_mates("agent1", max_results=2)

        assert len(mates) <= 2
        assert "agent1" not in mates  # Should not include self

    def test_agent_world_analyze_genetic_compatibility(self):
        """Test analyzing genetic compatibility between agents."""
        world = AgentWorld()

        # Create agents
        agent1 = world.create_agent("agent1", "fox", "foundation", "Agent1")
        agent2 = world.create_agent("agent2", "wolf", "foundation", "Agent2")

        # Analyze compatibility
        compatibility = world.analyze_genetic_compatibility("agent1", "agent2")

        assert compatibility is not None
        assert "compatibility_score" in compatibility
        assert "analysis" in compatibility
        assert "recommendation" in compatibility

        score = compatibility["compatibility_score"]
        assert 0.0 <= score <= 1.0

    def test_agent_world_get_agent_lineage(self):
        """Test getting agent lineage information."""
        world = AgentWorld()

        # Create parent agents
        parent1 = world.create_agent("parent1", "fox", "foundation", "Parent1")
        parent2 = world.create_agent("parent2", "wolf", "foundation", "Parent2")

        # Create offspring
        offspring = world.create_offspring("parent1", "parent2", "offspring1")

        # Get lineage
        lineage = world.get_agent_lineage("offspring1")

        assert lineage is not None
        assert "agent_id" in lineage
        assert "parents" in lineage
        assert "children" in lineage
        assert "generation" in lineage

        assert lineage["agent_id"] == "offspring1"
        assert len(lineage["parents"]) == 2
        assert "parent1" in lineage["parents"]
        assert "parent2" in lineage["parents"]

    def test_agent_world_simulation_update(self):
        """Test world simulation update."""
        world = AgentWorld()

        # Create an agent
        agent = world.create_agent("agent1", "fox", "foundation", "Agent1")

        # Update the simulation
        world.update(1.0)

        # Check that the agent still exists and systems have run
        assert len(world.entities) == 1
        assert agent in world.entities

    def test_agent_world_get_world_stats(self):
        """Test getting world statistics."""
        world = AgentWorld()

        # Create some agents
        world.create_agent("agent1", "fox", "foundation", "Agent1")
        world.create_agent("agent2", "wolf", "foundation", "Agent2")

        # Get stats
        stats = world.get_world_stats()

        assert stats is not None
        assert "total_agents" in stats
        assert "mature_agents" in stats
        assert "breeding_pairs" in stats
        assert "total_offspring" in stats

        assert stats["total_agents"] == 2
