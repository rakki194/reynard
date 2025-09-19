#!/usr/bin/env python3
"""
MCP Protocol Handler
====================

Handles MCP protocol requests and responses with modular tool registry.
Follows the 140-line axiom and modular architecture principles.
"""

import logging
from typing import Any, Optional

from middleware.auth_middleware import mcp_auth_middleware
from tools.config_definitions import get_config_tool_definitions
from tools.definitions import get_tool_definitions

from .tool_registry import ToolRegistry
from .tool_router import ToolRouter

logger = logging.getLogger(__name__)


class MCPHandler:
    """Handles MCP protocol requests and responses with modular tool registry."""

    def __init__(self, tool_registry: ToolRegistry) -> None:
        self.tool_registry = tool_registry

        # Initialize tool router with registry
        self.tool_router = ToolRouter(tool_registry)

    def handle_initialize(self, request_id: Any) -> dict[str, Any]:
        """Handle MCP initialization request."""
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {
                        "listChanged": True
                    }
                },
                "serverInfo": {
                    "name": "reynard-linting-server",
                    "version": "2.0.0",
                },
            },
        }

    def handle_tools_list(self, request_id: Any) -> dict[str, Any]:
        """Handle tools list request - only return enabled tools."""
        # Get all tool definitions
        all_tools = get_tool_definitions()
        config_tools = get_config_tool_definitions()

        # Combine all tools
        combined_tools = {**all_tools, **config_tools}

        # Filter to only enabled tools
        enabled_tools = {}
        for tool_name, tool_def in combined_tools.items():
            if self.tool_registry.is_tool_enabled(tool_name):
                enabled_tools[tool_name] = tool_def

        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {"tools": list(enabled_tools.values())},
        }

    async def handle_tool_call(
        self,
        tool_name: str,
        arguments: dict[str, Any],
        request_id: Any,
        request: Optional[dict] = None,
    ) -> dict[str, Any]:
        """Handle tool call request with authentication."""
        try:
            # Authenticate request if authentication is required
            if request and self._requires_auth(tool_name):
                token_payload = mcp_auth_middleware.authenticate_request(request)
                if not token_payload:
                    return mcp_auth_middleware.create_error_response(
                        "Authentication required", request_id
                    )

                # Authorize tool access
                if not mcp_auth_middleware.authorize_tool_access(
                    token_payload, tool_name
                ):
                    return mcp_auth_middleware.create_error_response(
                        f"Access denied for tool '{tool_name}'", request_id
                    )

            # Check if tool is enabled
            if not self.tool_registry.is_tool_enabled(tool_name):
                return {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "error": {
                        "code": -32601,
                        "message": f"Tool '{tool_name}' is disabled",
                    },
                }

            result = await self.tool_router.route_tool_call(tool_name, arguments)
        except ValueError as e:
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {"code": -32601, "message": str(e)},
            }
        else:
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "result": result,
            }

    def handle_notification(self, method: str) -> dict[str, Any] | None:
        """Handle notification (no response needed)."""
        if method in ["notifications/initialized", "notifications/cancelled"]:
            return None
        return None

    def handle_unknown_method(self, method: str, request_id: Any) -> dict[str, Any]:
        """Handle unknown method."""
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "error": {"code": -32601, "message": f"Unknown method: {method}"},
        }

    def handle_error(self, error: Exception, request_id: Any) -> dict[str, Any]:
        """Handle internal errors."""
        logger.exception("Error handling request: %s", error)
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "error": {"code": -32603, "message": f"Internal error: {error!s}"},
        }

    def _requires_auth(self, tool_name: str) -> bool:
        """Check if a tool requires authentication."""
        # Tool management tools require authentication
        management_tools = {
            "get_tool_configs",
            "get_tool_status",
            "enable_tool",
            "disable_tool",
            "toggle_tool",
            "get_tools_by_category",
            "update_tool_config",
            "reload_config",
        }
        return tool_name in management_tools
