#!/usr/bin/env python3
"""
Integration tests for MCP Server.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from main import MCPServer


class TestMCPServerIntegration:
    """Integration tests for MCPServer."""

    @pytest.fixture
    def mcp_server(self, temp_dir):
        """Create MCP server instance for testing."""
        with patch("main.AgentNameManager") as mock_agent_manager_class:
            mock_agent_manager = MagicMock()
            mock_agent_manager_class.return_value = mock_agent_manager

            server = MCPServer()
            return server

    @pytest.mark.asyncio
    async def test_handle_initialize_request(self, mcp_server: MCPServer):
        """Test handling initialize request."""
        request = {"jsonrpc": "2.0", "id": 1, "method": "initialize"}

        response = await mcp_server.handle_request(request)

        assert response is not None
        assert response["jsonrpc"] == "2.0"
        assert response["id"] == 1
        assert "result" in response
        assert response["result"]["protocolVersion"] == "2024-11-05"
        assert response["result"]["serverInfo"]["name"] == "reynard-linting-server"

    @pytest.mark.asyncio
    async def test_handle_tools_list_request(self, mcp_server: MCPServer):
        """Test handling tools list request."""
        request = {"jsonrpc": "2.0", "id": 2, "method": "tools/list"}

        response = await mcp_server.handle_request(request)

        assert response is not None
        assert response["jsonrpc"] == "2.0"
        assert response["id"] == 2
        assert "result" in response
        assert "tools" in response["result"]
        assert isinstance(response["result"]["tools"], list)

    @pytest.mark.asyncio
    async def test_handle_tool_call_request(self, mcp_server: MCPServer):
        """Test handling tool call request."""
        # Mock the tool call response
        mock_response = {
            "content": [{"type": "text", "text": "Generated name: Test-Fox-42"}]
        }
        mcp_server.mcp_handler.handle_tool_call = AsyncMock(
            return_value={"jsonrpc": "2.0", "id": 3, "result": mock_response}
        )

        request = {
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tools/call",
            "params": {
                "name": "generate_agent_name",
                "arguments": {"spirit": "fox", "style": "foundation"},
            },
        }

        response = await mcp_server.handle_request(request)

        assert response is not None
        assert response["jsonrpc"] == "2.0"
        assert response["id"] == 3
        assert "result" in response
        assert response["result"] == mock_response

    @pytest.mark.asyncio
    async def test_handle_notification_request(self, mcp_server: MCPServer):
        """Test handling notification request."""
        request = {"jsonrpc": "2.0", "method": "notifications/initialized"}

        response = await mcp_server.handle_request(request)

        # Notifications don't require responses
        assert response is None

    @pytest.mark.asyncio
    async def test_handle_unknown_method_request(self, mcp_server: MCPServer):
        """Test handling unknown method request."""
        request = {"jsonrpc": "2.0", "id": 4, "method": "unknown/method"}

        response = await mcp_server.handle_request(request)

        assert response is not None
        assert response["jsonrpc"] == "2.0"
        assert response["id"] == 4
        assert "error" in response
        assert response["error"]["code"] == -32601
        assert "Unknown method: unknown/method" in response["error"]["message"]

    @pytest.mark.asyncio
    async def test_handle_request_with_exception(self, mcp_server: MCPServer):
        """Test handling request that raises an exception."""
        # Mock the MCP handler to raise an exception
        mcp_server.mcp_handler.handle_initialize = MagicMock(
            side_effect=Exception("Test error")
        )

        request = {"jsonrpc": "2.0", "id": 5, "method": "initialize"}

        response = await mcp_server.handle_request(request)

        assert response is not None
        assert response["jsonrpc"] == "2.0"
        assert response["id"] == 5
        assert "error" in response
        assert response["error"]["code"] == -32603
        assert "Internal error: Test error" in response["error"]["message"]

    @pytest.mark.asyncio
    async def test_handle_request_invalid_json(self, mcp_server: MCPServer):
        """Test handling request with invalid JSON structure."""
        request = {
            "jsonrpc": "2.0",
            "id": 6,
            # Missing method
        }

        response = await mcp_server.handle_request(request)

        # Should handle gracefully and return unknown method error
        assert response is not None
        assert "error" in response

    @pytest.mark.asyncio
    async def test_agent_tool_integration(self, mcp_server: MCPServer, temp_dir):
        """Test integration of agent tools through the full request flow."""
        # Mock the agent manager to return a real response
        mock_agent_manager = mcp_server.agent_manager
        mock_agent_manager.generate_name.return_value = "Test-Fox-42"

        request = {
            "jsonrpc": "2.0",
            "id": 7,
            "method": "tools/call",
            "params": {
                "name": "generate_agent_name",
                "arguments": {"spirit": "fox", "style": "foundation"},
            },
        }

        response = await mcp_server.handle_request(request)

        assert response is not None
        assert response["jsonrpc"] == "2.0"
        assert response["id"] == 7
        assert "result" in response
        assert "content" in response["result"]
        assert len(response["result"]["content"]) == 1
        assert response["result"]["content"][0]["type"] == "text"
        assert "Generated name: Test-Fox-42" in response["result"]["content"][0]["text"]

    @pytest.mark.asyncio
    async def test_utility_tool_integration(self, mcp_server: MCPServer):
        """Test integration of utility tools through the full request flow."""
        # Mock the utility tools to return a real response
        mock_utility_tools = mcp_server.utility_tools
        mock_utility_tools.get_current_time.return_value = {
            "content": [{"type": "text", "text": "Current time: 2024-01-01T12:00:00Z"}]
        }

        request = {
            "jsonrpc": "2.0",
            "id": 8,
            "method": "tools/call",
            "params": {"name": "get_current_time", "arguments": {}},
        }

        response = await mcp_server.handle_request(request)

        assert response is not None
        assert response["jsonrpc"] == "2.0"
        assert response["id"] == 8
        assert "result" in response
        assert "content" in response["result"]
        assert len(response["result"]["content"]) == 1
        assert response["result"]["content"][0]["type"] == "text"
        assert "Current time:" in response["result"]["content"][0]["text"]

    @pytest.mark.asyncio
    async def test_tool_call_with_missing_arguments(self, mcp_server: MCPServer):
        """Test tool call with missing arguments."""
        request = {
            "jsonrpc": "2.0",
            "id": 9,
            "method": "tools/call",
            "params": {
                "name": "generate_agent_name"
                # Missing arguments
            },
        }

        response = await mcp_server.handle_request(request)

        # Should still work with empty arguments
        assert response is not None
        assert response["jsonrpc"] == "2.0"
        assert response["id"] == 9

    @pytest.mark.asyncio
    async def test_tool_call_with_unknown_tool(self, mcp_server: MCPServer):
        """Test tool call with unknown tool name."""
        request = {
            "jsonrpc": "2.0",
            "id": 10,
            "method": "tools/call",
            "params": {"name": "unknown_tool", "arguments": {}},
        }

        response = await mcp_server.handle_request(request)

        assert response is not None
        assert response["jsonrpc"] == "2.0"
        assert response["id"] == 10
        assert "error" in response
        assert response["error"]["code"] == -32601
        assert "Unknown tool: unknown_tool" in response["error"]["message"]
