#!/usr/bin/env python3
"""
Simple working tests for MCP server components.
"""

from unittest.mock import MagicMock, patch

from protocol.mcp_handler import MCPHandler


class TestSimpleMCPHandler:
    """Simple test cases for MCPHandler."""

    def test_handle_initialize_simple(self) -> None:
        """Test MCP initialization request handling."""
        # Create a simple mock handler
        handler = MCPHandler(
            MagicMock(),  # agent_tools
            MagicMock(),  # utility_tools
            MagicMock(),  # linting_tools
            MagicMock(),  # version_vscode_tools
            MagicMock(),  # file_search_tools
            MagicMock(),  # semantic_file_search_tools
            MagicMock(),  # image_viewer_tools
            MagicMock(),  # mermaid_tools
            MagicMock(),  # vscode_tasks_tools
        )

        request_id = 1
        response = handler.handle_initialize(request_id)

        assert response["jsonrpc"] == "2.0"
        assert response["id"] == request_id
        assert "result" in response
        assert response["result"]["protocolVersion"] == "2024-11-05"
        assert response["result"]["serverInfo"]["name"] == "reynard-linting-server"
        assert response["result"]["serverInfo"]["version"] == "2.0.0"

    def test_handle_tools_list_simple(self) -> None:
        """Test tools list request handling."""
        # Create a simple mock handler
        handler = MCPHandler(
            MagicMock(),  # agent_tools
            MagicMock(),  # utility_tools
            MagicMock(),  # linting_tools
            MagicMock(),  # version_vscode_tools
            MagicMock(),  # file_search_tools
            MagicMock(),  # semantic_file_search_tools
            MagicMock(),  # image_viewer_tools
            MagicMock(),  # mermaid_tools
            MagicMock(),  # vscode_tasks_tools
        )

        request_id = 2
        response = handler.handle_tools_list(request_id)

        assert response["jsonrpc"] == "2.0"
        assert response["id"] == request_id
        assert "result" in response
        assert "tools" in response["result"]
        assert isinstance(response["result"]["tools"], list)

    def test_handle_unknown_method_simple(self) -> None:
        """Test unknown method handling."""
        # Create a simple mock handler
        handler = MCPHandler(
            MagicMock(),  # agent_tools
            MagicMock(),  # utility_tools
            MagicMock(),  # linting_tools
            MagicMock(),  # version_vscode_tools
            MagicMock(),  # file_search_tools
            MagicMock(),  # semantic_file_search_tools
            MagicMock(),  # image_viewer_tools
            MagicMock(),  # mermaid_tools
            MagicMock(),  # vscode_tasks_tools
        )

        request_id = 3
        response = handler.handle_unknown_method("unknown_method", request_id)

        assert response["jsonrpc"] == "2.0"
        assert response["id"] == request_id
        assert "error" in response
        assert response["error"]["code"] == -32601
        assert "Unknown method: unknown_method" in response["error"]["message"]

    def test_handle_notification_simple(self) -> None:
        """Test notification handling."""
        # Create a simple mock handler
        handler = MCPHandler(
            MagicMock(),  # agent_tools
            MagicMock(),  # utility_tools
            MagicMock(),  # linting_tools
            MagicMock(),  # version_vscode_tools
            MagicMock(),  # file_search_tools
            MagicMock(),  # semantic_file_search_tools
            MagicMock(),  # image_viewer_tools
            MagicMock(),  # mermaid_tools
            MagicMock(),  # vscode_tasks_tools
        )

        # Test initialized notification
        response = handler.handle_notification("notifications/initialized")
        assert response is None

        # Test cancelled notification
        response = handler.handle_notification("notifications/cancelled")
        assert response is None

        # Test unknown notification
        response = handler.handle_notification("notifications/unknown")
        assert response is None

    def test_handle_error_simple(self) -> None:
        """Test error handling."""
        # Create a simple mock handler
        handler = MCPHandler(
            MagicMock(),  # agent_tools
            MagicMock(),  # utility_tools
            MagicMock(),  # linting_tools
            MagicMock(),  # version_vscode_tools
            MagicMock(),  # file_search_tools
            MagicMock(),  # semantic_file_search_tools
            MagicMock(),  # image_viewer_tools
            MagicMock(),  # mermaid_tools
            MagicMock(),  # vscode_tasks_tools
        )

        request_id = 4
        test_error = Exception("Test error")

        with patch("protocol.mcp_handler.logger") as mock_logger:
            response = handler.handle_error(test_error, request_id)

        assert response["jsonrpc"] == "2.0"
        assert response["id"] == request_id
        assert "error" in response
        assert response["error"]["code"] == -32603
        assert "Internal error: Test error" in response["error"]["message"]
        mock_logger.exception.assert_called_once()
