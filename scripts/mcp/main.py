#!/usr/bin/env python3
"""
MCP Agent Namer Server - Main Entry Point
==========================================

A modular Model Context Protocol (MCP) server that provides tools for agents
to generate and assign themselves custom names using the Reynard robot name generator.

This refactored version follows the 100-line axiom and modular architecture principles.
"""

import asyncio
import json
import sys
from typing import Any

from protocol.mcp_handler import MCPHandler
from services.agent_manager import AgentNameManager
from tools.agent_tools import AgentTools
from tools.utility_tools import UtilityTools
from utils.logging_config import setup_logging

logger = setup_logging()


class MCPServer:
    """MCP Server orchestrator following FastAPI patterns."""

    def __init__(self):
        # Initialize services
        self.agent_manager = AgentNameManager()

        # Initialize tool handlers
        self.agent_tools = AgentTools(self.agent_manager)
        self.utility_tools = UtilityTools()

        # Initialize MCP protocol handler
        self.mcp_handler = MCPHandler(self.agent_tools, self.utility_tools)

    async def handle_request(self, request: dict[str, Any]) -> dict[str, Any]:
        """Handle incoming MCP requests."""
        try:
            method = request.get("method")
            params = request.get("params", {})
            request_id = request.get("id")

            # Route requests to appropriate handlers
            if method == "initialize":
                return self.mcp_handler.handle_initialize(request_id)

            if method == "tools/list":
                return self.mcp_handler.handle_tools_list(request_id)

            if method == "tools/call":
                tool_name = params.get("name")
                arguments = params.get("arguments", {})
                return self.mcp_handler.handle_tool_call(
                    tool_name, arguments, request_id
                )

            if method.startswith("notifications/"):
                return self.mcp_handler.handle_notification(method)

            return self.mcp_handler.handle_unknown_method(method, request_id)

        except Exception as e:
            return self.mcp_handler.handle_error(e, request.get("id"))

    async def run(self):
        """Run the MCP server."""
        logger.info("Starting MCP Agent Namer Server...")

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


def main():
    """Main entry point."""
    server = MCPServer()

    try:
        asyncio.run(server.run())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception:
        logger.exception("Server error")
        sys.exit(1)


if __name__ == "__main__":
    main()
