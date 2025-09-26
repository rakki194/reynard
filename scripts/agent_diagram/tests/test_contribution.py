"""Tests for the AgentContribution data model."""

import pytest

from ..core.contribution import AgentContribution


class TestAgentContribution:
    """Test cases for AgentContribution class."""

    def test_valid_contribution(self):
        """Test creating a valid contribution."""
        contribution = AgentContribution(
            agent_name="Test-Agent-123",
            title="Test Contribution",
            description="This is a test contribution",
            category="Testing",
        )

        assert contribution.agent_name == "Test-Agent-123"
        assert contribution.title == "Test Contribution"
        assert contribution.description == "This is a test contribution"
        assert contribution.category == "Testing"

    def test_empty_agent_name_raises_error(self):
        """Test that empty agent name raises ValueError."""
        with pytest.raises(ValueError, match="Agent name cannot be empty"):
            AgentContribution(
                agent_name="",
                title="Test Title",
                description="Test description",
            )

    def test_empty_title_raises_error(self):
        """Test that empty title raises ValueError."""
        with pytest.raises(ValueError, match="Title cannot be empty"):
            AgentContribution(
                agent_name="Test-Agent-123",
                title="",
                description="Test description",
            )

    def test_empty_description_raises_error(self):
        """Test that empty description raises ValueError."""
        with pytest.raises(ValueError, match="Description cannot be empty"):
            AgentContribution(
                agent_name="Test-Agent-123",
                title="Test Title",
                description="",
            )

    def test_to_dict(self):
        """Test converting contribution to dictionary."""
        contribution = AgentContribution(
            agent_name="Test-Agent-123",
            title="Test Contribution",
            description="This is a test contribution",
            category="Testing",
        )

        expected = {
            "agent_name": "Test-Agent-123",
            "title": "Test Contribution",
            "description": "This is a test contribution",
            "category": "Testing",
        }

        assert contribution.to_dict() == expected

    def test_from_dict(self):
        """Test creating contribution from dictionary."""
        data = {
            "agent_name": "Test-Agent-123",
            "title": "Test Contribution",
            "description": "This is a test contribution",
            "category": "Testing",
        }

        contribution = AgentContribution.from_dict(data)

        assert contribution.agent_name == "Test-Agent-123"
        assert contribution.title == "Test Contribution"
        assert contribution.description == "This is a test contribution"
        assert contribution.category == "Testing"

    def test_from_dict_without_category(self):
        """Test creating contribution from dictionary without category."""
        data = {
            "agent_name": "Test-Agent-123",
            "title": "Test Contribution",
            "description": "This is a test contribution",
        }

        contribution = AgentContribution.from_dict(data)

        assert contribution.agent_name == "Test-Agent-123"
        assert contribution.title == "Test Contribution"
        assert contribution.description == "This is a test contribution"
        assert contribution.category == ""
