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
from protocol.tool_registry import ToolRegistry, ToolExecutionType
from agent_naming import AgentNameManager
from tools.agent_tools import AgentTools
from tools.bm25_search_tools import BM25SearchTools
from tools.config_tools import ConfigTools
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
    """MCP Server orchestrator with modular tool system."""

    def __init__(self) -> None:
        # Initialize services
        self.agent_manager = AgentNameManager()
        
        # Initialize tool registry with configuration management
        self.tool_registry = ToolRegistry()

        # Initialize tool handlers
        self.ecs_agent_tools = ECSAgentTools()
        self.agent_tools = AgentTools(self.agent_manager, self.ecs_agent_tools)
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
        self.config_tools = ConfigTools(self.tool_registry)

        # Register all tools with the registry
        self._register_all_tools()

        # Initialize MCP protocol handler with tool registry
        self.mcp_handler = MCPHandler(self.tool_registry)

    def _register_all_tools(self) -> None:
        """Register all tools with the tool registry."""
        # Agent tools
        self.tool_registry.register_tool(
            "generate_agent_name", 
            self.agent_tools.generate_agent_name, 
            ToolExecutionType.SYNC, 
            "agent"
        )
        self.tool_registry.register_tool(
            "assign_agent_name", 
            self.agent_tools.assign_agent_name, 
            ToolExecutionType.SYNC, 
            "agent"
        )
        self.tool_registry.register_tool(
            "get_agent_name", 
            self.agent_tools.get_agent_name, 
            ToolExecutionType.SYNC, 
            "agent"
        )
        self.tool_registry.register_tool(
            "list_agent_names", 
            self.agent_tools.list_agent_names, 
            ToolExecutionType.SYNC, 
            "agent"
        )
        self.tool_registry.register_tool(
            "roll_agent_spirit", 
            self.agent_tools.roll_agent_spirit, 
            ToolExecutionType.SYNC, 
            "agent"
        )
        self.tool_registry.register_tool(
            "agent_startup_sequence", 
            self.agent_tools.agent_startup_sequence, 
            ToolExecutionType.SYNC, 
            "agent"
        )
        self.tool_registry.register_tool(
            "get_agent_persona", 
            self.agent_tools.get_agent_persona, 
            ToolExecutionType.SYNC, 
            "agent"
        )
        self.tool_registry.register_tool(
            "get_lora_config", 
            self.agent_tools.get_lora_config, 
            ToolExecutionType.SYNC, 
            "agent"
        )
        
        # Utility tools
        self.tool_registry.register_tool(
            "get_current_time", 
            self.utility_tools.get_current_time, 
            ToolExecutionType.SYNC, 
            "utility"
        )
        self.tool_registry.register_tool(
            "get_current_location", 
            self.utility_tools.get_current_location, 
            ToolExecutionType.SYNC, 
            "utility"
        )
        self.tool_registry.register_tool(
            "send_desktop_notification", 
            self.utility_tools.send_desktop_notification, 
            ToolExecutionType.SYNC, 
            "utility"
        )
        self.tool_registry.register_tool(
            "restart_mcp_server", 
            self.utility_tools.restart_mcp_server, 
            ToolExecutionType.SYNC, 
            "utility"
        )
        
        # ECS tools
        self.tool_registry.register_tool(
            "create_ecs_agent", 
            self.ecs_agent_tools.create_ecs_agent, 
            ToolExecutionType.SYNC, 
            "ecs"
        )
        self.tool_registry.register_tool(
            "get_ecs_agent_status", 
            self.ecs_agent_tools.get_ecs_agent_status, 
            ToolExecutionType.SYNC, 
            "ecs"
        )
        self.tool_registry.register_tool(
            "get_ecs_agent_positions", 
            self.ecs_agent_tools.get_ecs_agent_positions, 
            ToolExecutionType.SYNC, 
            "ecs"
        )
        self.tool_registry.register_tool(
            "get_simulation_status", 
            self.ecs_agent_tools.get_simulation_status, 
            ToolExecutionType.SYNC, 
            "ecs"
        )
        self.tool_registry.register_tool(
            "accelerate_time", 
            self.ecs_agent_tools.accelerate_time, 
            ToolExecutionType.SYNC, 
            "ecs"
        )
        self.tool_registry.register_tool(
            "nudge_time", 
            self.ecs_agent_tools.nudge_time, 
            ToolExecutionType.SYNC, 
            "ecs"
        )
        
        # Configuration tools
        self.tool_registry.register_tool(
            "get_tool_configs", 
            self.config_tools.get_tool_configs, 
            ToolExecutionType.ASYNC, 
            "utility"
        )
        self.tool_registry.register_tool(
            "enable_tool", 
            self.config_tools.enable_tool, 
            ToolExecutionType.ASYNC, 
            "utility"
        )
        self.tool_registry.register_tool(
            "disable_tool", 
            self.config_tools.disable_tool, 
            ToolExecutionType.ASYNC, 
            "utility"
        )
        self.tool_registry.register_tool(
            "toggle_tool", 
            self.config_tools.toggle_tool, 
            ToolExecutionType.ASYNC, 
            "utility"
        )
        self.tool_registry.register_tool(
            "get_tool_status", 
            self.config_tools.get_tool_status, 
            ToolExecutionType.ASYNC, 
            "utility"
        )
        self.tool_registry.register_tool(
            "reload_config", 
            self.config_tools.reload_config, 
            ToolExecutionType.ASYNC, 
            "utility"
        )
        
        # Register other tool categories (simplified for brevity)
        # In a full implementation, you would register all tools from each category
        
        logger.info(f"Registered {len(self.tool_registry.list_all_tools())} tools with registry")

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
