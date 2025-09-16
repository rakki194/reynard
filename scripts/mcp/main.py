#!/usr/bin/env python3
"""
MCP Reynard Linting Server - Main Entry Point
==============================================

A modular Model Context Protocol (MCP) server that provides comprehensive
linting, formatting, validation, and security tools for the Reynard ecosystem.

This enhanced version includes agent naming plus all project quality tools.
"""

import asyncio
import json
import sys
from typing import Any

from protocol.mcp_handler import MCPHandler
from services.agent_manager import AgentNameManager
from tools.agent_tools import AgentTools
from tools.bm25_search_tools import BM25SearchTools
from tools.ecs_agent_tools import ECSAgentTools
from tools.enhanced_bm25_search_tools import EnhancedBM25SearchTools
from tools.file_search_tools import FileSearchTools
from tools.image_viewer_tools import ImageViewerTools
from tools.linting_tools import LintingTools
from tools.mermaid_tools import MermaidTools
from tools.monolith_detection_tools import MonolithDetectionTools
from tools.playwright_tools import PlaywrightTools
from tools.semantic_file_search_tools import SemanticFileSearchTools
from tools.utility_tools import UtilityTools
from tools.version_vscode_tools import VersionVSCodeTools
from tools.vscode_tasks_tools import VSCodeTasksTools
from utils.logging_config import setup_logging

logger = setup_logging()


class MCPServer:
    """MCP Server orchestrator following FastAPI patterns."""

    def __init__(self) -> None:
        # Initialize services
        self.agent_manager = AgentNameManager()

        # Initialize tool handlers
        self.agent_tools = AgentTools(self.agent_manager)
        self.bm25_search_tools = BM25SearchTools()
        self.enhanced_bm25_search_tools = EnhancedBM25SearchTools()
        self.utility_tools = UtilityTools()
        self.linting_tools = LintingTools()
        self.version_vscode_tools = VersionVSCodeTools()
        self.file_search_tools = FileSearchTools()
        self.semantic_file_search_tools = SemanticFileSearchTools()
        self.image_viewer_tools = ImageViewerTools()
        self.mermaid_tools = MermaidTools()
        self.monolith_detection_tools = MonolithDetectionTools()
        self.playwright_tools = PlaywrightTools()
        self.vscode_tasks_tools = VSCodeTasksTools()
        self.ecs_agent_tools = ECSAgentTools()

        # Initialize MCP protocol handler
        self.mcp_handler = MCPHandler(
            self.agent_tools,
            self.bm25_search_tools,
            self.enhanced_bm25_search_tools,
            self.utility_tools,
            self.linting_tools,
            self.version_vscode_tools,
            self.file_search_tools,
            self.semantic_file_search_tools,
            self.image_viewer_tools,
            self.mermaid_tools,
            self.monolith_detection_tools,
            self.playwright_tools,
            self.vscode_tasks_tools,
            self.ecs_agent_tools,
        )

    async def handle_request(self, request: dict[str, Any]) -> dict[str, Any] | None:
        """Handle incoming MCP requests with ECS time nudging."""
        try:
            method = request.get("method")
            params = request.get("params", {})
            request_id = request.get("id")

            # Route requests to appropriate handlers
            if method == "initialize":
                init_result: dict[str, Any] = self.mcp_handler.handle_initialize(
                    request_id
                )
                return init_result

            if method == "tools/list":
                list_result: dict[str, Any] = self.mcp_handler.handle_tools_list(
                    request_id
                )
                return list_result

            if method == "tools/call":
                tool_name = params.get("name")
                arguments = params.get("arguments", {})
                call_result: dict[str, Any] = await self.mcp_handler.handle_tool_call(
                    tool_name, arguments, request_id
                )

                # Nudge ECS time forward for every MCP action
                self.agent_manager.nudge_time(0.05)  # Small nudge for each action

                return call_result

            if method and method.startswith("notifications/"):
                notification_result: dict[str, Any] | None = (
                    self.mcp_handler.handle_notification(method)
                )
                return notification_result

            unknown_result: dict[str, Any] = self.mcp_handler.handle_unknown_method(
                method or "unknown", request_id
            )
            return unknown_result

        except Exception as e:
            error_result: dict[str, Any] = self.mcp_handler.handle_error(
                e, request.get("id")
            )
            return error_result

    async def run(self, show_banner: bool = False) -> None:
        """Run the MCP server."""
        if show_banner:
            try:
                from startup_banner import print_startup_banner

                print_startup_banner()
            except ImportError:
                logger.info("Banner module not available, continuing without banner")

        logger.info("Starting MCP Reynard Linting Server...")

        # Read from stdin and write to stdout (MCP protocol)
        while True:
            try:
                line = await asyncio.get_event_loop().run_in_executor(
                    None, sys.stdin.readline
                )
                if not line:
                    break

                request = json.loads(line.strip())
                response = await self.handle_request(request)

                # Only send response if it's not None (notifications don't need responses)
                if response is not None:
                    logger.debug("Sending response: %s", json.dumps(response))
                    sys.stdout.write(json.dumps(response) + "\n")
                    sys.stdout.flush()

            except json.JSONDecodeError:
                logger.exception("Invalid JSON received")
            except Exception:
                logger.exception("Unexpected error")


def main() -> None:
    """Main entry point."""
    # Check for banner flag
    show_banner = "--banner" in sys.argv or "-b" in sys.argv

    server = MCPServer()

    try:
        asyncio.run(server.run(show_banner=show_banner))
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception:
        logger.exception("Server error")
        sys.exit(1)


if __name__ == "__main__":
    main()
