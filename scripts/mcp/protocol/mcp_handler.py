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
from tools.file_search_tools import FileSearchTools
from tools.image_viewer_tools import ImageViewerTools
from tools.linting_tools import LintingTools
from tools.mermaid_tools import MermaidTools
from tools.semantic_file_search_tools import SemanticFileSearchTools
from tools.utility_tools import UtilityTools
from tools.version_vscode_tools import VersionVSCodeTools
from tools.vscode_tasks_tools import VSCodeTasksTools

from .tool_router import ToolRouter

logger = logging.getLogger(__name__)


class MCPHandler:
    """Handles MCP protocol requests and responses."""

    def __init__(
        self,
        agent_tools: AgentTools,
        utility_tools: UtilityTools,
        linting_tools: LintingTools,
        version_vscode_tools: VersionVSCodeTools,
        file_search_tools: FileSearchTools,
        semantic_file_search_tools: SemanticFileSearchTools,
        image_viewer_tools: ImageViewerTools,
        mermaid_tools: MermaidTools,
        vscode_tasks_tools: VSCodeTasksTools,
    ):
        self.tools = get_tool_definitions()
        self.tool_router = ToolRouter(
            agent_tools,
            utility_tools,
            linting_tools,
            version_vscode_tools,
            file_search_tools,
            semantic_file_search_tools,
            image_viewer_tools,
            mermaid_tools,
            vscode_tasks_tools,
        )

    def handle_initialize(self, request_id: Any) -> dict[str, Any]:
        """Handle MCP initialization request."""
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {"tools": {}},
                "serverInfo": {
                    "name": "reynard-linting-server",
                    "version": "2.0.0",
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

    async def handle_tool_call(
        self, tool_name: str, arguments: dict[str, Any], request_id: Any
    ) -> dict[str, Any]:
        """Handle tool call request."""
        try:
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
