#!/usr/bin/env python3
"""
Unit tests for Tool Router.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest
from protocol.tool_router import ToolRouter


class TestToolRouter:
    """Test cases for ToolRouter."""

    @pytest.mark.asyncio
    async def test_route_agent_tool_generate_name(self, mock_tool_router: ToolRouter):
        """Test routing agent tool generate_agent_name."""
        mock_result = {
            "content": [{"type": "text", "text": "Generated name: Test-Fox-42"}]
        }
        mock_tool_router.agent_tools.generate_agent_name = MagicMock(
            return_value=mock_result
        )

        result = await mock_tool_router._route_agent_tool(
            "generate_agent_name", {"spirit": "fox", "style": "foundation"}
        )

        assert result == mock_result
        mock_tool_router.agent_tools.generate_agent_name.assert_called_once_with(
            {"spirit": "fox", "style": "foundation"}
        )

    @pytest.mark.asyncio
    async def test_route_agent_tool_assign_name(self, mock_tool_router: ToolRouter):
        """Test routing agent tool assign_agent_name."""
        mock_result = {
            "content": [
                {
                    "type": "text",
                    "text": "Assigned name 'Test-Fox-42' to agent 'test-agent': True",
                }
            ]
        }
        mock_tool_router.agent_tools.assign_agent_name = MagicMock(
            return_value=mock_result
        )

        result = await mock_tool_router._route_agent_tool(
            "assign_agent_name", {"agent_id": "test-agent", "name": "Test-Fox-42"}
        )

        assert result == mock_result
        mock_tool_router.agent_tools.assign_agent_name.assert_called_once_with(
            {"agent_id": "test-agent", "name": "Test-Fox-42"}
        )

    @pytest.mark.asyncio
    async def test_route_agent_tool_get_name(self, mock_tool_router: ToolRouter):
        """Test routing agent tool get_agent_name."""
        mock_result = {
            "content": [
                {"type": "text", "text": "Agent 'test-agent' name: Test-Fox-42"}
            ]
        }
        mock_tool_router.agent_tools.get_agent_name = MagicMock(
            return_value=mock_result
        )

        result = await mock_tool_router._route_agent_tool(
            "get_agent_name", {"agent_id": "test-agent"}
        )

        assert result == mock_result
        mock_tool_router.agent_tools.get_agent_name.assert_called_once_with(
            {"agent_id": "test-agent"}
        )

    @pytest.mark.asyncio
    async def test_route_agent_tool_list_names(self, mock_tool_router: ToolRouter):
        """Test routing agent tool list_agent_names."""
        mock_result = {
            "content": [
                {
                    "type": "text",
                    "text": "Assigned agent names:\ntest-agent: Test-Fox-42",
                }
            ]
        }
        mock_tool_router.agent_tools.list_agent_names = MagicMock(
            return_value=mock_result
        )

        result = await mock_tool_router._route_agent_tool("list_agent_names", {})

        assert result == mock_result
        mock_tool_router.agent_tools.list_agent_names.assert_called_once()

    @pytest.mark.asyncio
    async def test_route_agent_tool_roll_spirit(self, mock_tool_router: ToolRouter):
        """Test routing agent tool roll_agent_spirit."""
        mock_result = {"content": [{"type": "text", "text": "Rolled spirit: fox"}]}
        mock_tool_router.agent_tools.roll_agent_spirit = MagicMock(
            return_value=mock_result
        )

        result = await mock_tool_router._route_agent_tool(
            "roll_agent_spirit", {"weighted": True}
        )

        assert result == mock_result
        mock_tool_router.agent_tools.roll_agent_spirit.assert_called_once_with(
            {"weighted": True}
        )

    @pytest.mark.asyncio
    async def test_route_agent_tool_startup_sequence(
        self, mock_tool_router: ToolRouter
    ):
        """Test routing agent tool agent_startup_sequence."""
        mock_result = {"content": [{"type": "text", "text": "Agent startup complete"}]}
        mock_tool_router.agent_tools.agent_startup_sequence = AsyncMock(
            return_value=mock_result
        )

        result = await mock_tool_router._route_agent_tool(
            "agent_startup_sequence", {"preferred_style": "foundation"}
        )

        assert result == mock_result
        mock_tool_router.agent_tools.agent_startup_sequence.assert_called_once_with(
            {"preferred_style": "foundation"}
        )

    @pytest.mark.asyncio
    async def test_route_agent_tool_unknown(self, mock_tool_router: ToolRouter):
        """Test routing unknown agent tool."""
        with pytest.raises(ValueError, match="Unknown agent tool: unknown_tool"):
            await mock_tool_router._route_agent_tool("unknown_tool", {})

    def test_route_utility_tool_get_current_time(self, mock_tool_router: ToolRouter):
        """Test routing utility tool get_current_time."""
        mock_result = {
            "content": [{"type": "text", "text": "Current time: 2024-01-01T12:00:00Z"}]
        }
        mock_tool_router.utility_tools.get_current_time = MagicMock(
            return_value=mock_result
        )

        result = mock_tool_router._route_utility_tool("get_current_time", {})

        assert result == mock_result
        mock_tool_router.utility_tools.get_current_time.assert_called_once_with({})

    def test_route_utility_tool_get_current_location(
        self, mock_tool_router: ToolRouter
    ):
        """Test routing utility tool get_current_location."""
        mock_result = {
            "content": [
                {"type": "text", "text": "Current location: Frankfurt, Germany"}
            ]
        }
        mock_tool_router.utility_tools.get_current_location = MagicMock(
            return_value=mock_result
        )

        result = mock_tool_router._route_utility_tool("get_current_location", {})

        assert result == mock_result
        mock_tool_router.utility_tools.get_current_location.assert_called_once_with({})

    def test_route_utility_tool_send_notification(self, mock_tool_router: ToolRouter):
        """Test routing utility tool send_desktop_notification."""
        mock_result = {"content": [{"type": "text", "text": "Notification sent"}]}
        mock_tool_router.utility_tools.send_desktop_notification = MagicMock(
            return_value=mock_result
        )

        result = mock_tool_router._route_utility_tool(
            "send_desktop_notification", {"message": "Test notification"}
        )

        assert result == mock_result
        mock_tool_router.utility_tools.send_desktop_notification.assert_called_once_with(
            {"message": "Test notification"}
        )

    def test_route_utility_tool_unknown(self, mock_tool_router: ToolRouter):
        """Test routing unknown utility tool."""
        with pytest.raises(ValueError, match="Unknown utility tool: unknown_tool"):
            mock_tool_router._route_utility_tool("unknown_tool", {})

    @pytest.mark.asyncio
    async def test_route_tool_call_agent_tool(self, mock_tool_router: ToolRouter):
        """Test routing tool call to agent tool."""
        mock_result = {"content": [{"type": "text", "text": "Agent tool result"}]}
        mock_tool_router._route_agent_tool = AsyncMock(return_value=mock_result)

        result = await mock_tool_router.route_tool_call(
            "generate_agent_name", {"spirit": "fox"}
        )

        assert result == mock_result
        mock_tool_router._route_agent_tool.assert_called_once_with(
            "generate_agent_name", {"spirit": "fox"}
        )

    @pytest.mark.asyncio
    async def test_route_tool_call_utility_tool(self, mock_tool_router: ToolRouter):
        """Test routing tool call to utility tool."""
        mock_result = {"content": [{"type": "text", "text": "Utility tool result"}]}
        mock_tool_router._route_utility_tool = MagicMock(return_value=mock_result)

        result = await mock_tool_router.route_tool_call("get_current_time", {})

        assert result == mock_result
        mock_tool_router._route_utility_tool.assert_called_once_with(
            "get_current_time", {}
        )

    @pytest.mark.asyncio
    async def test_route_tool_call_unknown_tool(self, mock_tool_router: ToolRouter):
        """Test routing unknown tool call."""
        with pytest.raises(ValueError, match="Unknown tool: unknown_tool"):
            await mock_tool_router.route_tool_call("unknown_tool", {})
