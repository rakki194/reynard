#!/usr/bin/env python3
"""
Unit tests for Agent Tools.
"""

import pytest

from tools.agent_tools import AgentTools


class TestAgentTools:
    """Test cases for AgentTools."""

    def test_generate_agent_name(self, mock_agent_tools: AgentTools):
        """Test agent name generation."""
        # Mock the agent manager
        mock_agent_tools.agent_manager.generate_name.return_value = "Test-Fox-42"

        result = mock_agent_tools.generate_agent_name(
            {"spirit": "fox", "style": "foundation"}
        )

        assert "content" in result
        assert len(result["content"]) == 1
        assert result["content"][0]["type"] == "text"
        assert "Generated name: Test-Fox-42" in result["content"][0]["text"]
        mock_agent_tools.agent_manager.generate_name.assert_called_once_with(
            "fox", "foundation"
        )

    def test_assign_agent_name(self, mock_agent_tools: AgentTools):
        """Test agent name assignment."""
        # Mock the agent manager
        mock_agent_tools.agent_manager.assign_name.return_value = True

        result = mock_agent_tools.assign_agent_name(
            {"agent_id": "test-agent", "name": "Test-Fox-42"}
        )

        assert "content" in result
        assert len(result["content"]) == 1
        assert result["content"][0]["type"] == "text"
        assert (
            "Assigned name 'Test-Fox-42' to agent 'test-agent': True"
            in result["content"][0]["text"]
        )
        mock_agent_tools.agent_manager.assign_name.assert_called_once_with(
            "test-agent", "Test-Fox-42"
        )

    def test_get_agent_name(self, mock_agent_tools: AgentTools):
        """Test getting agent name."""
        # Mock the agent manager
        mock_agent_tools.agent_manager.get_name.return_value = "Test-Fox-42"

        result = mock_agent_tools.get_agent_name({"agent_id": "test-agent"})

        assert "content" in result
        assert len(result["content"]) == 1
        assert result["content"][0]["type"] == "text"
        assert "Agent 'test-agent' name: Test-Fox-42" in result["content"][0]["text"]
        mock_agent_tools.agent_manager.get_name.assert_called_once_with("test-agent")

    def test_get_agent_name_none(self, mock_agent_tools: AgentTools):
        """Test getting agent name when no name is assigned."""
        # Mock the agent manager to return None
        mock_agent_tools.agent_manager.get_name.return_value = None

        result = mock_agent_tools.get_agent_name({"agent_id": "test-agent"})

        assert "content" in result
        assert len(result["content"]) == 1
        assert result["content"][0]["type"] == "text"
        assert (
            "Agent 'test-agent' name: No name assigned" in result["content"][0]["text"]
        )

    def test_list_agent_names(self, mock_agent_tools: AgentTools):
        """Test listing agent names."""
        # Mock the agent manager
        mock_agent_tools.agent_manager.list_agents.return_value = {
            "test-agent-1": "Test-Fox-42",
            "test-agent-2": "Test-Wolf-43",
        }

        result = mock_agent_tools.list_agent_names()

        assert "content" in result
        assert len(result["content"]) == 1
        assert result["content"][0]["type"] == "text"
        text = result["content"][0]["text"]
        assert "Assigned agent names:" in text
        assert "test-agent-1: Test-Fox-42" in text
        assert "test-agent-2: Test-Wolf-43" in text
        mock_agent_tools.agent_manager.list_agents.assert_called_once()

    def test_list_agent_names_empty(self, mock_agent_tools: AgentTools):
        """Test listing agent names when no agents are assigned."""
        # Mock the agent manager to return empty dict
        mock_agent_tools.agent_manager.list_agents.return_value = {}

        result = mock_agent_tools.list_agent_names()

        assert "content" in result
        assert len(result["content"]) == 1
        assert result["content"][0]["type"] == "text"
        assert (
            "Assigned agent names:\nNo agents assigned" in result["content"][0]["text"]
        )

    def test_roll_agent_spirit_weighted(self, mock_agent_tools: AgentTools):
        """Test rolling agent spirit with weighted distribution."""
        result = mock_agent_tools.roll_agent_spirit({"weighted": True})

        assert "content" in result
        assert len(result["content"]) == 1
        assert result["content"][0]["type"] == "text"
        text = result["content"][0]["text"]
        assert "Rolled spirit:" in text
        assert text.split(": ")[1] in ["fox", "otter", "wolf"]

    def test_roll_agent_spirit_unweighted(self, mock_agent_tools: AgentTools):
        """Test rolling agent spirit with equal distribution."""
        result = mock_agent_tools.roll_agent_spirit({"weighted": False})

        assert "content" in result
        assert len(result["content"]) == 1
        assert result["content"][0]["type"] == "text"
        text = result["content"][0]["text"]
        assert "Rolled spirit:" in text
        assert text.split(": ")[1] in ["fox", "otter", "wolf"]

    def test_roll_agent_spirit_default_weighted(self, mock_agent_tools: AgentTools):
        """Test rolling agent spirit with default weighted distribution."""
        result = mock_agent_tools.roll_agent_spirit({})

        assert "content" in result
        assert len(result["content"]) == 1
        assert result["content"][0]["type"] == "text"
        text = result["content"][0]["text"]
        assert "Rolled spirit:" in text
        assert text.split(": ")[1] in ["fox", "otter", "wolf"]

    @pytest.mark.asyncio
    async def test_agent_startup_sequence(self, mock_agent_tools: AgentTools):
        """Test agent startup sequence."""
        # Mock the version service
        mock_agent_tools.version_service.get_versions.return_value = {
            "python": "3.13.7",
            "node": "v24.7.0",
            "typescript": "5.9.2",
        }

        # Mock the agent manager methods
        mock_agent_tools.agent_manager.roll_spirit.return_value = "fox"
        mock_agent_tools.agent_manager.generate_name.return_value = "Test-Fox-42"
        mock_agent_tools.agent_manager.assign_name.return_value = True

        result = await mock_agent_tools.agent_startup_sequence(
            {"agent_id": "test-agent", "preferred_style": "foundation"}
        )

        assert "content" in result
        assert len(result["content"]) == 1
        assert result["content"][0]["type"] == "text"
        text = result["content"][0]["text"]
        assert "Agent Startup Complete!" in text
        assert "Test-Fox-42" in text
        assert "fox" in text.lower()

    @pytest.mark.asyncio
    async def test_agent_startup_sequence_defaults(self, mock_agent_tools: AgentTools):
        """Test agent startup sequence with default parameters."""
        # Mock the version service
        mock_agent_tools.version_service.get_versions.return_value = {
            "python": "3.13.7",
            "node": "v24.7.0",
            "typescript": "5.9.2",
        }

        # Mock the agent manager methods
        mock_agent_tools.agent_manager.roll_spirit.return_value = "otter"
        mock_agent_tools.agent_manager.generate_name.return_value = "Test-Otter-42"
        mock_agent_tools.agent_manager.assign_name.return_value = True

        result = await mock_agent_tools.agent_startup_sequence({})

        assert "content" in result
        assert len(result["content"]) == 1
        assert result["content"][0]["type"] == "text"
        text = result["content"][0]["text"]
        assert "Agent Startup Complete!" in text
        assert "Test-Otter-42" in text
        assert "otter" in text.lower()
