#!/usr/bin/env python3
"""Test suite for AgentStatePersistence class.

Tests the agent state persistence system including save, load,
backup, and recovery operations.

Author: Champion-Designer-32 (Wolf Specialist)
Version: 1.0.0
"""

import shutil
import sys
import tempfile
from pathlib import Path

import pytest

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from phoenix_control.src.core.agent_state import AgentState
from phoenix_control.src.core.persistence import AgentStatePersistence
from phoenix_control.src.utils.data_structures import NamingStyle, SpiritType


class TestAgentStatePersistence:
    """Test cases for AgentStatePersistence class."""

    @pytest.fixture
    def temp_dir(self):
        """Create a temporary directory for testing."""
        temp_dir = tempfile.mkdtemp()
        yield temp_dir
        shutil.rmtree(temp_dir)

    @pytest.fixture
    def persistence(self, temp_dir):
        """Create a persistence instance with temporary directory."""
        return AgentStatePersistence(state_dir=temp_dir)

    @pytest.fixture
    def sample_agent_state(self):
        """Create a sample agent state for testing."""
        return AgentState(
            agent_id="test-agent-001",
            name="Test-Agent-42",
            spirit=SpiritType.FOX,
            style=NamingStyle.FOUNDATION,
            generation=42,
            specialization="Testing and Quality Assurance",
            traits={"dominance": 0.7, "independence": 0.8, "patience": 0.9},
            abilities={"strategist": 0.9, "hunter": 0.7, "teacher": 0.8},
            performance_history=[],
            knowledge_base={"testing": 0.9, "quality": 0.8},
        )

    def test_persistence_initialization(self, temp_dir):
        """Test persistence system initialization."""
        persistence = AgentStatePersistence(state_dir=temp_dir)

        # Test directory creation
        assert persistence.state_dir == Path(temp_dir)
        assert persistence.state_dir.exists()
        assert persistence.state_dir.is_dir()

        # Test backup directory creation
        assert persistence.backup_dir == Path(temp_dir) / "backups"
        assert persistence.backup_dir.exists()
        assert persistence.backup_dir.is_dir()

    def test_save_agent_state(self, persistence, sample_agent_state):
        """Test saving agent state."""
        # Save agent state
        result = persistence.save_agent(sample_agent_state)

        # Verify save operation
        assert result is True

        # Verify file creation
        state_file = persistence.state_dir / f"{sample_agent_state.agent_id}.json"
        assert state_file.exists()
        assert state_file.is_file()

    def test_load_agent_state(self, persistence, sample_agent_state):
        """Test loading agent state."""
        # Save agent state first
        persistence.save_agent(sample_agent_state)

        # Load agent state
        loaded_agent = persistence.load_agent(sample_agent_state.agent_id)

        # Verify load operation
        assert loaded_agent is not None
        assert loaded_agent.agent_id == sample_agent_state.agent_id
        assert loaded_agent.name == sample_agent_state.name
        assert loaded_agent.spirit == sample_agent_state.spirit
        assert loaded_agent.style == sample_agent_state.style
        assert loaded_agent.generation == sample_agent_state.generation
        assert loaded_agent.specialization == sample_agent_state.specialization
        assert loaded_agent.traits == sample_agent_state.traits
        assert loaded_agent.abilities == sample_agent_state.abilities
        assert (
            loaded_agent.performance_history == sample_agent_state.performance_history
        )
        assert loaded_agent.knowledge_base == sample_agent_state.knowledge_base

    def test_load_nonexistent_agent(self, persistence):
        """Test loading non-existent agent state."""
        # Try to load non-existent agent
        loaded_agent = persistence.load_agent("non-existent-agent")

        # Verify load operation fails
        assert loaded_agent is None

    def test_list_agents(self, persistence, sample_agent_state):
        """Test listing all agents."""
        # Save multiple agent states
        agent1 = sample_agent_state
        agent2 = AgentState(
            agent_id="test-agent-002",
            name="Test-Agent-43",
            spirit=SpiritType.WOLF,
            style=NamingStyle.EXO,
            generation=43,
            specialization="Different Testing",
            traits={"dominance": 0.8},
            abilities={"strategist": 0.8},
            performance_history=[],
            knowledge_base={"testing": 0.8},
        )

        persistence.save_agent(agent1)
        persistence.save_agent(agent2)

        # List all agents
        agents = persistence.list_agents()

        # Verify list operation
        assert len(agents) == 2
        agent_ids = [agent.agent_id for agent in agents]
        assert "test-agent-001" in agent_ids
        assert "test-agent-002" in agent_ids

    def test_delete_agent(self, persistence, sample_agent_state):
        """Test deleting agent state."""
        # Save agent state first
        persistence.save_agent(sample_agent_state)

        # Verify file exists
        state_file = persistence.state_dir / f"{sample_agent_state.agent_id}.json"
        assert state_file.exists()

        # Delete agent state
        result = persistence.delete_agent(sample_agent_state.agent_id)

        # Verify delete operation
        assert result is True
        assert not state_file.exists()

    def test_delete_nonexistent_agent(self, persistence):
        """Test deleting non-existent agent state."""
        # Try to delete non-existent agent
        result = persistence.delete_agent("non-existent-agent")

        # Verify delete operation fails
        assert result is False

    def test_backup_agent_states(self, persistence, sample_agent_state):
        """Test backing up agent states."""
        # Save agent state first
        persistence.save_agent(sample_agent_state)

        # Create backup
        result = persistence.backup_agent_states()

        # Verify backup operation
        assert result is True

        # Verify backup file creation
        backup_files = list(persistence.backup_dir.glob("*.json"))
        assert len(backup_files) > 0

    def test_list_backups(self, persistence, sample_agent_state):
        """Test listing available backups."""
        # Save agent state and create backup
        persistence.save_agent(sample_agent_state)
        persistence.backup_agent_states()

        # List backups
        backups = persistence.list_backups()

        # Verify list operation
        assert len(backups) > 0
        for backup in backups:
            assert "name" in backup
            assert "timestamp" in backup
            assert "size" in backup
            assert "agent_count" in backup

    def test_validate_agent_state(self, persistence, sample_agent_state):
        """Test agent state validation."""
        # Test valid agent state
        validation_result = persistence.validate_agent_state(sample_agent_state)

        # Verify validation
        assert validation_result["valid"] is True
        assert len(validation_result["errors"]) == 0

        # Test invalid agent state
        invalid_agent = AgentState(
            agent_id="",  # Invalid: empty agent_id
            name="Test-Agent-42",
            spirit=SpiritType.FOX,
            style=NamingStyle.FOUNDATION,
            generation=42,
            specialization="Testing",
            traits={},
            abilities={},
            performance_history=[],
            knowledge_base={},
        )

        validation_result = persistence.validate_agent_state(invalid_agent)

        # Verify validation failure
        assert validation_result["valid"] is False
        assert len(validation_result["errors"]) > 0

    def test_compare_agents(self, persistence, sample_agent_state):
        """Test agent comparison."""
        # Create second agent state
        agent2 = AgentState(
            agent_id="test-agent-002",
            name="Test-Agent-43",
            spirit=SpiritType.WOLF,
            style=NamingStyle.EXO,
            generation=43,
            specialization="Different Testing",
            traits={"dominance": 0.8},
            abilities={"strategist": 0.8},
            performance_history=[],
            knowledge_base={"testing": 0.8},
        )

        # Compare agents
        comparison = persistence.compare_agents(sample_agent_state, agent2)

        # Verify comparison
        assert "similarity_score" in comparison
        assert "common_traits" in comparison
        assert "common_abilities" in comparison
        assert "common_knowledge" in comparison

        # Test similarity score is in valid range
        assert 0.0 <= comparison["similarity_score"] <= 1.0

    def test_get_agent_statistics(self, persistence, sample_agent_state):
        """Test getting agent statistics."""
        # Save agent state
        persistence.save_agent(sample_agent_state)

        # Get statistics
        stats = persistence.get_agent_statistics()

        # Verify statistics
        assert "total_agents" in stats
        assert "active_agents" in stats
        assert "average_generation" in stats
        assert "most_common_spirit" in stats
        assert "most_common_style" in stats

        # Test statistics values
        assert stats["total_agents"] >= 1
        assert stats["active_agents"] >= 1
        assert stats["average_generation"] >= 0

    def test_cleanup_old_backups(self, persistence, sample_agent_state):
        """Test cleaning up old backups."""
        # Save agent state and create backup
        persistence.save_agent(sample_agent_state)
        persistence.backup_agent_states()

        # Get initial backup count
        initial_backups = len(persistence.list_backups())

        # Clean up old backups (simulated)
        result = persistence.cleanup_old_backups()

        # Verify cleanup operation
        assert result is True

        # Note: In a real implementation, this would actually remove old backups
        # For testing, we just verify the method runs without error


if __name__ == "__main__":
    pytest.main([__file__])
