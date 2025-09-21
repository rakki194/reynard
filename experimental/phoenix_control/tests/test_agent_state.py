#!/usr/bin/env python3
"""
Test suite for AgentState class.

Tests the AgentState data structure and its functionality.

Author: Champion-Designer-32 (Wolf Specialist)
Version: 1.0.0
"""

import sys
from pathlib import Path

import pytest

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from phoenix_control.src.core.agent_state import AgentState
from phoenix_control.src.utils.data_structures import NamingStyle, SpiritType


class TestAgentState:
    """Test cases for AgentState class."""

    def test_agent_state_creation(self):
        """Test agent state creation with valid data."""
        agent_state = AgentState(
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

        # Test basic properties
        assert agent_state.agent_id == "test-agent-001"
        assert agent_state.name == "Test-Agent-42"
        assert agent_state.spirit == SpiritType.FOX
        assert agent_state.style == NamingStyle.FOUNDATION
        assert agent_state.generation == 42
        assert agent_state.specialization == "Testing and Quality Assurance"

    def test_agent_state_traits(self):
        """Test agent state traits."""
        agent_state = AgentState(
            agent_id="test-agent-001",
            name="Test-Agent-42",
            spirit=SpiritType.FOX,
            style=NamingStyle.FOUNDATION,
            generation=42,
            specialization="Testing",
            traits={"dominance": 0.7, "independence": 0.8, "patience": 0.9},
            abilities={},
            performance_history=[],
            knowledge_base={},
        )

        # Test trait structure
        assert isinstance(agent_state.traits, dict)
        assert len(agent_state.traits) == 3

        # Test specific traits
        assert agent_state.traits["dominance"] == 0.7
        assert agent_state.traits["independence"] == 0.8
        assert agent_state.traits["patience"] == 0.9

    def test_agent_state_abilities(self):
        """Test agent state abilities."""
        agent_state = AgentState(
            agent_id="test-agent-001",
            name="Test-Agent-42",
            spirit=SpiritType.FOX,
            style=NamingStyle.FOUNDATION,
            generation=42,
            specialization="Testing",
            traits={},
            abilities={"strategist": 0.9, "hunter": 0.7, "teacher": 0.8},
            performance_history=[],
            knowledge_base={},
        )

        # Test ability structure
        assert isinstance(agent_state.abilities, dict)
        assert len(agent_state.abilities) == 3

        # Test specific abilities
        assert agent_state.abilities["strategist"] == 0.9
        assert agent_state.abilities["hunter"] == 0.7
        assert agent_state.abilities["teacher"] == 0.8

    def test_agent_state_knowledge_base(self):
        """Test agent state knowledge base."""
        agent_state = AgentState(
            agent_id="test-agent-001",
            name="Test-Agent-42",
            spirit=SpiritType.FOX,
            style=NamingStyle.FOUNDATION,
            generation=42,
            specialization="Testing",
            traits={},
            abilities={},
            performance_history=[],
            knowledge_base={"testing": 0.9, "quality": 0.8, "automation": 0.7},
        )

        # Test knowledge base structure
        assert isinstance(agent_state.knowledge_base, dict)
        assert len(agent_state.knowledge_base) == 3

        # Test specific knowledge areas
        assert agent_state.knowledge_base["testing"] == 0.9
        assert agent_state.knowledge_base["quality"] == 0.8
        assert agent_state.knowledge_base["automation"] == 0.7

    def test_agent_state_performance_history(self):
        """Test agent state performance history."""
        performance_history = [
            {
                "timestamp": "2025-01-15T10:30:00Z",
                "action": "test_action",
                "success": True,
                "details": "Test performance entry",
            },
            {
                "timestamp": "2025-01-15T11:00:00Z",
                "action": "another_action",
                "success": False,
                "details": "Another test performance entry",
            },
        ]

        agent_state = AgentState(
            agent_id="test-agent-001",
            name="Test-Agent-42",
            spirit=SpiritType.FOX,
            style=NamingStyle.FOUNDATION,
            generation=42,
            specialization="Testing",
            traits={},
            abilities={},
            performance_history=performance_history,
            knowledge_base={},
        )

        # Test performance history structure
        assert isinstance(agent_state.performance_history, list)
        assert len(agent_state.performance_history) == 2

        # Test specific performance entries
        assert agent_state.performance_history[0]["action"] == "test_action"
        assert agent_state.performance_history[0]["success"] is True
        assert agent_state.performance_history[1]["action"] == "another_action"
        assert agent_state.performance_history[1]["success"] is False

    def test_agent_state_serialization(self):
        """Test agent state serialization."""
        agent_state = AgentState(
            agent_id="test-agent-001",
            name="Test-Agent-42",
            spirit=SpiritType.FOX,
            style=NamingStyle.FOUNDATION,
            generation=42,
            specialization="Testing",
            traits={"dominance": 0.7},
            abilities={"strategist": 0.9},
            performance_history=[],
            knowledge_base={"testing": 0.9},
        )

        # Test serialization to dict
        agent_dict = agent_state.to_dict()

        assert isinstance(agent_dict, dict)
        assert agent_dict["agent_id"] == "test-agent-001"
        assert agent_dict["name"] == "Test-Agent-42"
        assert agent_dict["spirit"] == SpiritType.FOX.value
        assert agent_dict["style"] == NamingStyle.FOUNDATION.value
        assert agent_dict["generation"] == 42
        assert agent_dict["specialization"] == "Testing"
        assert agent_dict["traits"] == {"dominance": 0.7}
        assert agent_dict["abilities"] == {"strategist": 0.9}
        assert agent_dict["performance_history"] == []
        assert agent_dict["knowledge_base"] == {"testing": 0.9}

    def test_agent_state_deserialization(self):
        """Test agent state deserialization."""
        agent_state = AgentState(
            agent_id="test-agent-001",
            name="Test-Agent-42",
            spirit=SpiritType.FOX,
            style=NamingStyle.FOUNDATION,
            generation=42,
            specialization="Testing",
            traits={"dominance": 0.7},
            abilities={"strategist": 0.9},
            performance_history=[],
            knowledge_base={"testing": 0.9},
        )

        # Serialize to dict
        agent_dict = agent_state.to_dict()

        # Create new agent state from dict
        new_agent_state = AgentState.from_dict(agent_dict)

        # Verify deserialization
        assert new_agent_state.agent_id == agent_state.agent_id
        assert new_agent_state.name == agent_state.name
        assert new_agent_state.spirit == agent_state.spirit
        assert new_agent_state.style == agent_state.style
        assert new_agent_state.generation == agent_state.generation
        assert new_agent_state.specialization == agent_state.specialization
        assert new_agent_state.traits == agent_state.traits
        assert new_agent_state.abilities == agent_state.abilities
        assert new_agent_state.performance_history == agent_state.performance_history
        assert new_agent_state.knowledge_base == agent_state.knowledge_base

    def test_agent_state_validation(self):
        """Test agent state validation."""
        # Test valid agent state
        valid_agent_state = AgentState(
            agent_id="test-agent-001",
            name="Test-Agent-42",
            spirit=SpiritType.FOX,
            style=NamingStyle.FOUNDATION,
            generation=42,
            specialization="Testing",
            traits={"dominance": 0.7},
            abilities={"strategist": 0.9},
            performance_history=[],
            knowledge_base={"testing": 0.9},
        )

        # Test validation
        assert valid_agent_state.validate() is True

        # Test invalid agent state (empty agent_id)
        invalid_agent_state = AgentState(
            agent_id="",
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

        # Test validation failure
        assert invalid_agent_state.validate() is False

    def test_agent_state_equality(self):
        """Test agent state equality comparison."""
        agent_state1 = AgentState(
            agent_id="test-agent-001",
            name="Test-Agent-42",
            spirit=SpiritType.FOX,
            style=NamingStyle.FOUNDATION,
            generation=42,
            specialization="Testing",
            traits={"dominance": 0.7},
            abilities={"strategist": 0.9},
            performance_history=[],
            knowledge_base={"testing": 0.9},
        )

        agent_state2 = AgentState(
            agent_id="test-agent-001",
            name="Test-Agent-42",
            spirit=SpiritType.FOX,
            style=NamingStyle.FOUNDATION,
            generation=42,
            specialization="Testing",
            traits={"dominance": 0.7},
            abilities={"strategist": 0.9},
            performance_history=[],
            knowledge_base={"testing": 0.9},
        )

        # Test equality
        assert agent_state1 == agent_state2

        # Test inequality
        agent_state3 = AgentState(
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

        assert agent_state1 != agent_state3


if __name__ == "__main__":
    pytest.main([__file__])
