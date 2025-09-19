#!/usr/bin/env python3
"""
MCP Reynard Server - New Registration System
============================================

Enhanced MCP server using the new tool registration system that reduces
8-step manual registration to a single decorator-based step.

This is the legendary replacement for the complex manual registration system.
"""

import asyncio
import json
import sys
from pathlib import Path
from typing import Any

# Add libraries directory to Python path
services_path = Path(__file__).parent.parent.parent / "services"
agent_naming_path = services_path / "agent-naming"
if str(agent_naming_path) not in sys.path:
    sys.path.insert(0, str(agent_naming_path))

# Import the new registration system
from protocol.tool_registry import tool_registry, ToolExecutionType
from protocol.tool_discovery import ToolDiscovery
from services.tool_config_service import ToolConfigService
from utils.logging_config import setup_logging

logger = setup_logging()


class MCPServer:
    """Enhanced MCP Server with automatic tool discovery and registration."""

    def __init__(self) -> None:
        # Initialize core services
        self.tool_config_service = ToolConfigService(tool_registry=tool_registry)
        self.tool_discovery = ToolDiscovery(tool_registry)
        self.agent_manager = None
        self.mcp_handler = None
        self._tools_initialized = False

    def _lazy_init_tools(self) -> None:
        """Initialize tool handlers with automatic discovery."""
        if self._tools_initialized:
            return

        logger.info("Initializing tool handlers with automatic discovery...")

        # Import the MCP handler
        from protocol.mcp_handler import MCPHandler
        self.mcp_handler = MCPHandler(tool_registry)

        # Initialize agent manager
        try:
            from reynard_agent_naming.agent_naming import AgentNameManager
            self.agent_manager = AgentNameManager()
        except ImportError:
            logger.warning("Agent naming service not available")

        # Auto-discover and import tools from the tools directory
        discovered_count = self.tool_discovery.discover_and_import_tools("tools")
        logger.info(f"Auto-discovered {discovered_count} tools")

        # Auto-sync all discovered tools with configuration services
        self.tool_config_service.auto_sync_all_tools()
        logger.info("Auto-synced all tools with configuration services")

        self._tools_initialized = True
        total_tools = len(tool_registry.list_all_tools())
        logger.info(f"Initialized {total_tools} tools with automatic discovery")

    async def handle_request(self, request: dict[str, Any]) -> dict[str, Any] | None:
        """Handle incoming MCP requests with automatic tool discovery."""
        try:
            method = request.get("method")
            params = request.get("params", {})
            request_id = request.get("id")

            # Initialize tools on first request (lazy loading)
            if not self._tools_initialized:
                self._lazy_init_tools()

            # Route requests to appropriate handlers
            if method == "initialize":
                init_result: dict[str, Any] = self.mcp_handler.handle_initialize(request_id)
                return init_result

            if method == "tools/list":
                list_result: dict[str, Any] = self.mcp_handler.handle_tools_list(request_id)
                return list_result

            if method == "tools/call":
                tool_name = params.get("name")
                arguments = params.get("arguments", {})
                call_result: dict[str, Any] = await self.mcp_handler.handle_tool_call(
                    tool_name, arguments, request_id, request
                )

                # Nudge ECS time forward for every MCP action (if agent manager is available)
                if self.agent_manager:
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
            error_result: dict[str, Any] = self.mcp_handler.handle_error(e, request.get("id"))
            return error_result

    async def run(self, show_banner: bool = False) -> None:
        """Run the MCP server."""
        if show_banner:
            try:
                from startup_banner import print_startup_banner
                print_startup_banner()
            except ImportError:
                logger.info("Banner module not available, continuing without banner")

        logger.info("Starting MCP Reynard Server with automatic tool discovery...")

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
