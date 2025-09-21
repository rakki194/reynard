#!/usr/bin/env python3
"""
Test suite for Success-Advisor-8 agent.

Tests the Success-Advisor-8 agent reconstruction, state management,
and core functionality.

Author: Champion-Designer-32 (Wolf Specialist)
Version: 1.0.0
"""

import sys
from pathlib import Path

import pytest

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from phoenix_control.src.core.success_advisor import SuccessAdvisor8
from phoenix_control.src.utils.data_structures import NamingStyle, SpiritType


class TestSuccessAdvisor8:
    """Test cases for Success-Advisor-8 agent."""

    def test_agent_initialization(self):
        """Test agent initialization and basic properties."""
        agent = SuccessAdvisor8()

        # Test basic properties
        assert agent.agent_id is not None
        assert agent.name == "Champion-Designer-32"
        assert agent.spirit == SpiritType.WOLF
        assert agent.style == NamingStyle.FOUNDATION
        assert agent.generation == 32
        assert agent.specialization == "Release Management and Quality Assurance"

    def test_agent_traits(self):
        """Test agent traits configuration."""
        agent = SuccessAdvisor8()

        # Test trait structure
        assert isinstance(agent.traits, dict)
        assert len(agent.traits) > 0

        # Test specific traits
        assert "dominance" in agent.traits
        assert "independence" in agent.traits
        assert "patience" in agent.traits
        assert "aggression" in agent.traits
        assert "charisma" in agent.traits
        assert "creativity" in agent.traits

        # Test trait values are in valid range
        for trait, value in agent.traits.items():
            assert 0.0 <= value <= 1.0

    def test_agent_abilities(self):
        """Test agent abilities configuration."""
        agent = SuccessAdvisor8()

        # Test ability structure
        assert isinstance(agent.abilities, dict)
        assert len(agent.abilities) > 0

        # Test specific abilities
        assert "strategist" in agent.abilities
        assert "hunter" in agent.abilities
        assert "teacher" in agent.abilities
        assert "artist" in agent.abilities
        assert "healer" in agent.abilities
        assert "inventor" in agent.abilities

        # Test ability values are in valid range
        for ability, value in agent.abilities.items():
            assert 0.0 <= value <= 1.0

    def test_agent_knowledge_base(self):
        """Test agent knowledge base configuration."""
        agent = SuccessAdvisor8()

        # Test knowledge base structure
        assert isinstance(agent.knowledge_base, dict)
        assert len(agent.knowledge_base) > 0

        # Test specific knowledge areas
        assert "release_management" in agent.knowledge_base
        assert "quality_assurance" in agent.knowledge_base
        assert "git_workflow" in agent.knowledge_base
        assert "version_control" in agent.knowledge_base

        # Test knowledge values are in valid range
        for knowledge, value in agent.knowledge_base.items():
            assert 0.0 <= value <= 1.0

    def test_agent_performance_history(self):
        """Test agent performance history."""
        agent = SuccessAdvisor8()

        # Test performance history structure
        assert isinstance(agent.performance_history, list)

        # Test adding performance entry
        initial_count = len(agent.performance_history)
        agent.performance_history.append(
            {
                "timestamp": "2025-01-15T10:30:00Z",
                "action": "test_action",
                "success": True,
                "details": "Test performance entry",
            }
        )

        assert len(agent.performance_history) == initial_count + 1

    def test_agent_identity(self):
        """Test agent identity consistency."""
        agent = SuccessAdvisor8()

        # Test identity consistency
        assert agent.agent_id == "success-advisor-8"
        assert agent.name == "Champion-Designer-32"
        assert agent.spirit == SpiritType.WOLF
        assert agent.style == NamingStyle.FOUNDATION
        assert agent.generation == 32

    def test_agent_specialization(self):
        """Test agent specialization and expertise."""
        agent = SuccessAdvisor8()

        # Test specialization
        assert agent.specialization == "Release Management and Quality Assurance"

        # Test expertise areas
        assert "release_management" in agent.knowledge_base
        assert "quality_assurance" in agent.knowledge_base
        assert "git_workflow" in agent.knowledge_base
        assert "version_control" in agent.knowledge_base

    def test_agent_state_consistency(self):
        """Test agent state consistency across operations."""
        agent = SuccessAdvisor8()

        # Store initial state
        initial_traits = agent.traits.copy()
        initial_abilities = agent.abilities.copy()
        initial_knowledge = agent.knowledge_base.copy()

        # Perform operations
        agent.performance_history.append(
            {
                "timestamp": "2025-01-15T10:30:00Z",
                "action": "test_operation",
                "success": True,
                "details": "Test operation",
            }
        )

        # Verify state consistency
        assert agent.traits == initial_traits
        assert agent.abilities == initial_abilities
        assert agent.knowledge_base == initial_knowledge
        assert len(agent.performance_history) > 0

    def test_agent_serialization(self):
        """Test agent state serialization."""
        agent = SuccessAdvisor8()

        # Test serialization to dict
        agent_dict = agent.to_dict()

        assert isinstance(agent_dict, dict)
        assert agent_dict["agent_id"] == agent.agent_id
        assert agent_dict["name"] == agent.name
        assert agent_dict["spirit"] == agent.spirit.value
        assert agent_dict["style"] == agent.style.value
        assert agent_dict["generation"] == agent.generation
        assert agent_dict["specialization"] == agent.specialization
        assert agent_dict["traits"] == agent.traits
        assert agent_dict["abilities"] == agent.abilities
        assert agent_dict["knowledge_base"] == agent.knowledge_base
        assert agent_dict["performance_history"] == agent.performance_history

    def test_agent_deserialization(self):
        """Test agent state deserialization."""
        agent = SuccessAdvisor8()

        # Serialize to dict
        agent_dict = agent.to_dict()

        # Create new agent from dict
        new_agent = SuccessAdvisor8.from_dict(agent_dict)

        # Verify deserialization
        assert new_agent.agent_id == agent.agent_id
        assert new_agent.name == agent.name
        assert new_agent.spirit == agent.spirit
        assert new_agent.style == agent.style
        assert new_agent.generation == agent.generation
        assert new_agent.specialization == agent.specialization
        assert new_agent.traits == agent.traits
        assert new_agent.abilities == agent.abilities
        assert new_agent.knowledge_base == agent.knowledge_base
        assert new_agent.performance_history == agent.performance_history


if __name__ == "__main__":
    pytest.main([__file__])
