#!/usr/bin/env python3
"""
Unit tests for MCP Handler.
"""

from unittest.mock import MagicMock, patch

import pytest
from protocol.mcp_handler import MCPHandler


class TestMCPHandler:
    """Test cases for MCPHandler."""

    def test_handle_initialize(self, mock_mcp_handler: MCPHandler):
        """Test MCP initialization request handling."""
        request_id = 1
        response = mock_mcp_handler.handle_initialize(request_id)

        assert response["jsonrpc"] == "2.0"
        assert response["id"] == request_id
        assert "result" in response
        assert response["result"]["protocolVersion"] == "2024-11-05"
        assert response["result"]["serverInfo"]["name"] == "reynard-linting-server"
        assert response["result"]["serverInfo"]["version"] == "2.0.0"

    def test_handle_tools_list(self, mock_mcp_handler: MCPHandler):
        """Test tools list request handling."""
        request_id = 2
        response = mock_mcp_handler.handle_tools_list(request_id)

        assert response["jsonrpc"] == "2.0"
        assert response["id"] == request_id
        assert "result" in response
        assert "tools" in response["result"]
        assert isinstance(response["result"]["tools"], list)

    @pytest.mark.asyncio
    async def test_handle_tool_call_success(self, mock_mcp_handler: MCPHandler):
        """Test successful tool call handling."""
        # Mock the tool router to return a successful result
        mock_result = {"content": [{"type": "text", "text": "Test result"}]}
        mock_mcp_handler.tool_router.route_tool_call = MagicMock(
            return_value=mock_result
        )

        request_id = 3
        response = await mock_mcp_handler.handle_tool_call(
            "test_tool", {"arg1": "value1"}, request_id
        )

        assert response["jsonrpc"] == "2.0"
        assert response["id"] == request_id
        assert "result" in response
        assert response["result"] == mock_result

    @pytest.mark.asyncio
    async def test_handle_tool_call_error(self, mock_mcp_handler: MCPHandler):
        """Test tool call error handling."""
        # Mock the tool router to raise a ValueError
        mock_mcp_handler.tool_router.route_tool_call = MagicMock(
            side_effect=ValueError("Unknown tool")
        )

        request_id = 4
        response = await mock_mcp_handler.handle_tool_call(
            "unknown_tool", {}, request_id
        )

        assert response["jsonrpc"] == "2.0"
        assert response["id"] == request_id
        assert "error" in response
        assert response["error"]["code"] == -32601
        assert "Unknown tool" in response["error"]["message"]

    def test_handle_notification(self, mock_mcp_handler: MCPHandler):
        """Test notification handling."""
        # Test initialized notification
        response = mock_mcp_handler.handle_notification("notifications/initialized")
        assert response is None

        # Test cancelled notification
        response = mock_mcp_handler.handle_notification("notifications/cancelled")
        assert response is None

        # Test unknown notification
        response = mock_mcp_handler.handle_notification("notifications/unknown")
        assert response is None

    def test_handle_unknown_method(self, mock_mcp_handler: MCPHandler):
        """Test unknown method handling."""
        request_id = 5
        response = mock_mcp_handler.handle_unknown_method("unknown_method", request_id)

        assert response["jsonrpc"] == "2.0"
        assert response["id"] == request_id
        assert "error" in response
        assert response["error"]["code"] == -32601
        assert "Unknown method: unknown_method" in response["error"]["message"]

    def test_handle_error(self, mock_mcp_handler: MCPHandler):
        """Test error handling."""
        request_id = 6
        test_error = Exception("Test error")

        with patch("protocol.mcp_handler.logger") as mock_logger:
            response = mock_mcp_handler.handle_error(test_error, request_id)

        assert response["jsonrpc"] == "2.0"
        assert response["id"] == request_id
        assert "error" in response
        assert response["error"]["code"] == -32603
        assert "Internal error: Test error" in response["error"]["message"]
        mock_logger.exception.assert_called_once()
