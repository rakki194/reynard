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
import time
from typing import Any, Optional

# Load backend environment configuration
from load_backend_env import load_backend_env

load_backend_env()

from protocol.mcp_handler import MCPHandler
from protocol.tool_discovery import ToolDiscovery

# Import local modules
# pylint: disable=wrong-import-position
from protocol.tool_registry import get_tool_registry
from services.backend_agent_manager import BackendAgentManager
from services.postgresql_tool_config_service import ToolConfigService
from utils.logging_config import setup_logging

# pylint: enable=wrong-import-position

# Optional imports
# pylint: disable=wrong-import-position
try:
    from startup_banner import print_startup_banner
except ImportError:
    print_startup_banner = None
# pylint: enable=wrong-import-position

logger = setup_logging()


class MCPServer:
    """Enhanced MCP Server with automatic tool discovery and registration."""

    def __init__(self) -> None:
        logger.debug("🕐 Starting MCPServer.__init__")
        start_time = time.time()

        # Initialize core services
        logger.debug("🕐 Getting tool registry...")
        registry_start = time.time()
        self.tool_registry = get_tool_registry()
        registry_elapsed = time.time() - registry_start
        logger.debug("✅ Tool registry obtained in %.3fs", registry_elapsed)

        logger.debug("🕐 Initializing tool config service...")
        config_start = time.time()
        self.tool_config_service = ToolConfigService(tool_registry=self.tool_registry)
        config_elapsed = time.time() - config_start
        logger.debug("✅ Tool config service initialized in %.3fs", config_elapsed)

        logger.debug("🕐 Initializing tool discovery...")
        discovery_start = time.time()
        self.tool_discovery = ToolDiscovery(self.tool_registry)
        discovery_elapsed = time.time() - discovery_start
        logger.debug("✅ Tool discovery initialized in %.3fs", discovery_elapsed)

        self.agent_manager: Optional[Any] = None
        self.mcp_handler: Optional[MCPHandler] = None
        self._tools_initialized: bool = False

        total_elapsed = time.time() - start_time
        logger.debug("✅ MCPServer.__init__ completed in %.3fs", total_elapsed)

    def _lazy_init_tools(self) -> None:
        """Initialize tool handlers with automatic discovery."""
        logger.debug("🕐 Starting _lazy_init_tools")
        start_time = time.time()

        if self._tools_initialized:
            logger.debug("✅ Tools already initialized, skipping")
            return

        logger.info("Initializing tool handlers with automatic discovery...")

        # Initialize the MCP handler
        self.mcp_handler = MCPHandler(self.tool_registry)

        # Initialize agent manager
        try:
            self.agent_manager = BackendAgentManager()
        except Exception:  # noqa: BLE001  # pylint: disable=broad-exception-caught
            logger.warning("Backend agent manager not available")

        # Auto-discover and import tools from the tools directory
        logger.debug("🕐 Starting tool discovery...")
        logger.debug(
            f"🔍 Current tool registry has {len(self.tool_registry.list_all_tools())} tools before discovery"
        )
        discovery_start = time.time()
        try:
            discovered_count = self.tool_discovery.discover_and_import_tools("tools")
            discovery_elapsed = time.time() - discovery_start
            logger.info(
                "Auto-discovered %d tools in %.3fs", discovered_count, discovery_elapsed
            )
            logger.debug(
                f"🔍 Tool registry now has {len(self.tool_registry.list_all_tools())} tools after discovery"
            )
        except Exception as e:  # noqa: BLE001  # pylint: disable=broad-exception-caught
            discovery_elapsed = time.time() - discovery_start
            logger.error("Tool discovery failed after %.3fs: %s", discovery_elapsed, e)
            logger.info("Continuing without tool discovery...")
            discovered_count = 0

        # Auto-sync all discovered tools with configuration services
        self.tool_config_service.auto_sync_all_tools()
        logger.info("Auto-synced all tools with configuration services")

        self._tools_initialized = True
        total_tools = len(self.tool_registry.list_all_tools())
        total_elapsed = time.time() - start_time
        logger.info(
            "✅ Initialized %d tools with automatic discovery in %.3fs",
            total_tools,
            total_elapsed,
        )

    def _ensure_tools_initialized(self) -> None:
        """Ensure tools are initialized (lazy loading)."""
        logger.debug(
            f"🔍 _ensure_tools_initialized called - _tools_initialized: {self._tools_initialized}"
        )
        if not self._tools_initialized:
            logger.info("🚀 Starting lazy initialization of tools...")
            self._lazy_init_tools()
        else:
            logger.debug("✅ Tools already initialized, skipping lazy init")

    def _validate_mcp_handler(self, request_id: str) -> dict[str, Any] | None:
        """Validate that MCP handler is initialized."""
        if self.mcp_handler is None:
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {
                    "code": -32603,
                    "message": "Internal error: MCP handler not initialized",
                },
            }
        return None

    async def _route_request(
        self,
        method: str,
        params: dict[str, Any],
        request_id: str,
        request: dict[str, Any],
    ) -> dict[str, Any] | None:
        """Route the request to the appropriate handler."""
        if method == "initialize":
            return self.mcp_handler.handle_initialize(request_id)

        if method == "tools/list":
            return self.mcp_handler.handle_tools_list(request_id)

        if method == "tools/call":
            tool_name = params.get("name")
            arguments = params.get("arguments", {})
            logger.debug(f"🔍 Main handler calling MCP handler for tool: {tool_name}")
            call_result = await self.mcp_handler.handle_tool_call(
                tool_name, arguments, request_id, request
            )
            logger.debug(f"🔍 MCP handler returned: {call_result}")

            # Nudge ECS time forward for every MCP action (if agent manager is available)
            if self.agent_manager:
                self.agent_manager.nudge_time(0.05)  # Small nudge for each action

            return call_result

        if method and method.startswith("notifications/"):
            return self.mcp_handler.handle_notification(method)

        return self.mcp_handler.handle_unknown_method(method or "unknown", request_id)

    def _handle_error(self, error: Exception, request_id: str) -> dict[str, Any]:
        """Handle errors with appropriate error response."""
        if self.mcp_handler is not None:
            return self.mcp_handler.handle_error(error, request_id)
        else:
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {"code": -32603, "message": f"Internal error: {str(error)}"},
            }

    async def handle_request(self, request: dict[str, Any]) -> dict[str, Any] | None:
        """Handle incoming MCP requests with automatic tool discovery."""
        try:
            method = request.get("method")
            params = request.get("params", {})
            request_id = request.get("id")

            # Initialize tools on first request (lazy loading)
            logger.debug(
                f"🔍 Handling request: {method} - calling _ensure_tools_initialized"
            )
            self._ensure_tools_initialized()

            # Ensure mcp_handler is initialized
            validation_error = self._validate_mcp_handler(request_id)
            if validation_error:
                return validation_error

            # Route requests to appropriate handlers
            return await self._route_request(method, params, request_id, request)

        except Exception as e:  # noqa: BLE001  # pylint: disable=broad-exception-caught
            return self._handle_error(e, request.get("id"))

    async def run(self, show_banner: bool = False) -> None:
        """Run the MCP server."""
        if show_banner:
            if print_startup_banner is not None:
                print_startup_banner()
            else:
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
            except Exception:  # noqa: BLE001  # pylint: disable=broad-exception-caught
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
    except Exception:  # noqa: BLE001  # pylint: disable=broad-exception-caught
        logger.exception("Server error")
        sys.exit(1)


if __name__ == "__main__":
    main()
