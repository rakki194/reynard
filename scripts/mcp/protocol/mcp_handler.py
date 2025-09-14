#!/usr/bin/env python3
"""
MCP Protocol Handler
====================

Handles MCP protocol requests and responses.
Follows the 100-line axiom and modular architecture principles.
"""

import logging
from typing import Any

from tools.agent_tools import AgentTools
from tools.definitions import get_tool_definitions
from tools.utility_tools import UtilityTools

logger = logging.getLogger(__name__)


class MCPHandler:
    """Handles MCP protocol requests and responses."""

    def __init__(self, agent_tools: AgentTools, utility_tools: UtilityTools):
        self.agent_tools = agent_tools
        self.utility_tools = utility_tools
        self.tools = get_tool_definitions()

    def handle_initialize(self, request_id: Any) -> dict[str, Any]:
        """Handle MCP initialization request."""
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {"tools": {}},
                "serverInfo": {
                    "name": "reynard-agent-namer",
                    "version": "1.1.0",
                },
            },
        }

    def handle_tools_list(self, request_id: Any) -> dict[str, Any]:
        """Handle tools list request."""
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {"tools": list(self.tools.values())},
        }

    def handle_tool_call(
        self, tool_name: str, arguments: dict[str, Any], request_id: Any
    ) -> dict[str, Any]:
        """Handle tool call request."""
        # Agent-related tools
        if tool_name == "generate_agent_name":
            result = self.agent_tools.generate_agent_name(arguments)
        elif tool_name == "assign_agent_name":
            result = self.agent_tools.assign_agent_name(arguments)
        elif tool_name == "get_agent_name":
            result = self.agent_tools.get_agent_name(arguments)
        elif tool_name == "list_agent_names":
            result = self.agent_tools.list_agent_names(arguments)
        # Utility tools
        elif tool_name == "get_current_time":
            result = self.utility_tools.get_current_time(arguments)
        elif tool_name == "get_current_location":
            result = self.utility_tools.get_current_location(arguments)
        else:
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {"code": -32601, "message": f"Unknown tool: {tool_name}"},
            }

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
