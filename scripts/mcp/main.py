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
from pathlib import Path
from typing import Any

# Add libraries directory to Python path
services_path = Path(__file__).parent.parent.parent / "services"
agent_naming_path = services_path / "agent-naming"
if str(agent_naming_path) not in sys.path:
    sys.path.insert(0, str(agent_naming_path))

# Lazy imports to reduce startup time
from services.tool_config_service import ToolConfigService
from utils.logging_config import setup_logging

logger = setup_logging()


class MCPServer:
    """MCP Server orchestrator with modular tool system and lazy loading."""

    def __init__(self) -> None:
        # Initialize core services first (fast)
        self.agent_manager = None
        self.tool_config_service = ToolConfigService()
        self.tool_registry = None  # Will be initialized lazily
        self.mcp_handler = None  # Will be initialized lazily

        # Lazy-loaded tool handlers (loaded only when needed)
        self._tool_handlers = {}
        self._tools_initialized = False

    def _lazy_init_tools(self) -> None:
        """Initialize tool handlers only when first needed."""
        if self._tools_initialized:
            return

        logger.info("Initializing tool handlers...")

        # Import heavy modules (these are the slow imports)
        from protocol.tool_registry import ToolExecutionType, ToolRegistry
        from protocol.mcp_handler import MCPHandler
        
        # Store ToolExecutionType as class attribute for use in _register_all_tools
        self.ToolExecutionType = ToolExecutionType
        
        # Initialize tool registry and MCP handler
        self.tool_registry = ToolRegistry(tool_config_service=self.tool_config_service)
        self.mcp_handler = MCPHandler(self.tool_registry)

        # Import tool modules only when needed
        from tools import (
            get_agent_tools,
            get_config_tools,
            get_ecs_agent_tools,
            get_image_viewer_tools,
            get_linting_tools,
            get_mermaid_tools,
            get_monolith_detection_tools,
            get_search_tools,
            get_secrets_tools,
            get_utility_tools,
            get_version_vscode_tools,
            get_vscode_tasks_tools,
        )
        from tools.git_automation_tools import GitAutomationTools
        from tools.playwright_tools import PlaywrightTools
        from tools.search.enhanced_search_tools import EnhancedSearchTools
        from tools.tool_management_tools import ToolManagementTools
        from reynard_agent_naming.agent_naming import AgentNameManager

        # Initialize agent manager
        self.agent_manager = AgentNameManager()

        # Initialize tool handlers
        self._tool_handlers = {
            "ecs_agent_tools": get_ecs_agent_tools()(),
            "agent_tools": get_agent_tools()(
                self.agent_manager, get_ecs_agent_tools()()
            ),
            "search_tools": get_search_tools()(),
            "enhanced_search_tools": EnhancedSearchTools(),
            "utility_tools": get_utility_tools()(),
            "linting_tools": get_linting_tools()(),
            "version_vscode_tools": get_version_vscode_tools()(),
            "image_viewer_tools": get_image_viewer_tools()(),
            "mermaid_tools": get_mermaid_tools()(),
            "monolith_detection_tools": get_monolith_detection_tools()(),
            "secrets_tools": get_secrets_tools()(),
            "playwright_tools": PlaywrightTools(),
            "vscode_tasks_tools": get_vscode_tasks_tools()(),
            "config_tools": get_config_tools()(self.tool_registry),
            "tool_management_tools": ToolManagementTools(self.tool_registry),
            "git_automation_tools": GitAutomationTools(),
        }

        # Register all tools with the registry
        self._register_all_tools()
        self._tools_initialized = True

        logger.info(f"Initialized {len(self.tool_registry.list_all_tools())} tools")

    def _register_all_tools(self) -> None:
        """Register all tools with the tool registry."""
        # Agent tools
        self.tool_registry.register_tool(
            "generate_agent_name",
            self._tool_handlers["agent_tools"].generate_agent_name,
            self.ToolExecutionType.SYNC,
            "agent",
        )
        self.tool_registry.register_tool(
            "assign_agent_name",
            self._tool_handlers["agent_tools"].assign_agent_name,
            self.ToolExecutionType.SYNC,
            "agent",
        )
        self.tool_registry.register_tool(
            "get_agent_name",
            self._tool_handlers["agent_tools"].get_agent_name,
            self.ToolExecutionType.SYNC,
            "agent",
        )
        self.tool_registry.register_tool(
            "list_agent_names",
            self._tool_handlers["agent_tools"].list_agent_names,
            self.ToolExecutionType.SYNC,
            "agent",
        )
        self.tool_registry.register_tool(
            "roll_agent_spirit",
            self._tool_handlers["agent_tools"].roll_agent_spirit,
            self.ToolExecutionType.SYNC,
            "agent",
        )
        self.tool_registry.register_tool(
            "agent_startup_sequence",
            self._tool_handlers["agent_tools"].agent_startup_sequence,
            self.ToolExecutionType.ASYNC,
            "agent",
        )
        self.tool_registry.register_tool(
            "get_agent_persona",
            self._tool_handlers["agent_tools"].get_agent_persona,
            self.ToolExecutionType.SYNC,
            "agent",
        )
        self.tool_registry.register_tool(
            "get_lora_config",
            self._tool_handlers["agent_tools"].get_lora_config,
            self.ToolExecutionType.SYNC,
            "agent",
        )

        # Utility tools
        self.tool_registry.register_tool(
            "get_current_time",
            self._tool_handlers["utility_tools"].get_current_time,
            self.ToolExecutionType.SYNC,
            "utility",
        )
        self.tool_registry.register_tool(
            "get_current_location",
            self._tool_handlers["utility_tools"].get_current_location,
            self.ToolExecutionType.SYNC,
            "utility",
        )
        self.tool_registry.register_tool(
            "send_desktop_notification",
            self._tool_handlers["utility_tools"].send_desktop_notification,
            self.ToolExecutionType.SYNC,
            "utility",
        )

        # ECS tools
        self.tool_registry.register_tool(
            "create_ecs_agent",
            self._tool_handlers["ecs_agent_tools"].create_ecs_agent,
            self.ToolExecutionType.SYNC,
            "ecs",
        )
        self.tool_registry.register_tool(
            "get_ecs_agent_status",
            self._tool_handlers["ecs_agent_tools"].get_ecs_agent_status,
            self.ToolExecutionType.SYNC,
            "ecs",
        )
        self.tool_registry.register_tool(
            "get_ecs_agent_positions",
            self._tool_handlers["ecs_agent_tools"].get_ecs_agent_positions,
            self.ToolExecutionType.SYNC,
            "ecs",
        )
        self.tool_registry.register_tool(
            "get_simulation_status",
            self._tool_handlers["ecs_agent_tools"].get_simulation_status,
            self.ToolExecutionType.SYNC,
            "ecs",
        )
        self.tool_registry.register_tool(
            "accelerate_time",
            self._tool_handlers["ecs_agent_tools"].accelerate_time,
            self.ToolExecutionType.SYNC,
            "ecs",
        )
        self.tool_registry.register_tool(
            "nudge_time",
            self._tool_handlers["ecs_agent_tools"].nudge_time,
            self.ToolExecutionType.SYNC,
            "ecs",
        )

        # Configuration tools
        self.tool_registry.register_tool(
            "get_tool_configs",
            self._tool_handlers["config_tools"].get_tool_configs,
            self.ToolExecutionType.ASYNC,
            "utility",
        )
        self.tool_registry.register_tool(
            "enable_tool",
            self._tool_handlers["config_tools"].enable_tool,
            self.ToolExecutionType.ASYNC,
            "utility",
        )
        self.tool_registry.register_tool(
            "disable_tool",
            self._tool_handlers["config_tools"].disable_tool,
            self.ToolExecutionType.ASYNC,
            "utility",
        )
        self.tool_registry.register_tool(
            "toggle_tool",
            self._tool_handlers["config_tools"].toggle_tool,
            self.ToolExecutionType.ASYNC,
            "utility",
        )
        self.tool_registry.register_tool(
            "get_tool_status",
            self._tool_handlers["config_tools"].get_tool_status,
            self.ToolExecutionType.ASYNC,
            "utility",
        )
        self.tool_registry.register_tool(
            "reload_config",
            self._tool_handlers["config_tools"].reload_config,
            self.ToolExecutionType.ASYNC,
            "utility",
        )

        # Register tool management tools
        self.tool_registry.register_tool(
            "get_tool_configs",
            self._tool_handlers["tool_management_tools"].get_tool_configs,
            self.ToolExecutionType.SYNC,
            "utility",
        )
        self.tool_registry.register_tool(
            "get_tool_status",
            self._tool_handlers["tool_management_tools"].get_tool_status,
            self.ToolExecutionType.SYNC,
            "utility",
        )
        self.tool_registry.register_tool(
            "enable_tool",
            self._tool_handlers["tool_management_tools"].enable_tool,
            self.ToolExecutionType.SYNC,
            "utility",
        )
        self.tool_registry.register_tool(
            "disable_tool",
            self._tool_handlers["tool_management_tools"].disable_tool,
            self.ToolExecutionType.SYNC,
            "utility",
        )
        self.tool_registry.register_tool(
            "toggle_tool",
            self._tool_handlers["tool_management_tools"].toggle_tool,
            self.ToolExecutionType.SYNC,
            "utility",
        )
        self.tool_registry.register_tool(
            "get_tools_by_category",
            self._tool_handlers["tool_management_tools"].get_tools_by_category,
            self.ToolExecutionType.SYNC,
            "utility",
        )
        self.tool_registry.register_tool(
            "update_tool_config",
            self._tool_handlers["tool_management_tools"].update_tool_config,
            self.ToolExecutionType.SYNC,
            "utility",
        )

        # Register linting tools
        self.tool_registry.register_tool(
            "lint_frontend",
            self._tool_handlers["linting_tools"].lint_frontend,
            self.ToolExecutionType.ASYNC,
            "linting",
        )
        self.tool_registry.register_tool(
            "lint_python",
            self._tool_handlers["linting_tools"].lint_python,
            self.ToolExecutionType.ASYNC,
            "linting",
        )
        self.tool_registry.register_tool(
            "lint_markdown",
            self._tool_handlers["linting_tools"].lint_markdown,
            self.ToolExecutionType.ASYNC,
            "linting",
        )
        self.tool_registry.register_tool(
            "run_all_linting",
            self._tool_handlers["linting_tools"].run_all_linting,
            self.ToolExecutionType.ASYNC,
            "linting",
        )

        # Register formatting tools
        self.tool_registry.register_tool(
            "format_frontend",
            self._tool_handlers["linting_tools"].format_frontend,
            self.ToolExecutionType.ASYNC,
            "formatting",
        )
        self.tool_registry.register_tool(
            "format_python",
            self._tool_handlers["linting_tools"].format_python,
            self.ToolExecutionType.ASYNC,
            "formatting",
        )

        # Register unified search tools
        self.tool_registry.register_tool(
            "search_content",
            self._tool_handlers["search_tools"].search_content,
            self.ToolExecutionType.SYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "search_enhanced",
            self._tool_handlers["search_tools"].search_enhanced,
            self.ToolExecutionType.SYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "search_files",
            self._tool_handlers["search_tools"].search_files,
            self.ToolExecutionType.ASYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "list_files",
            self._tool_handlers["search_tools"].list_files,
            self.ToolExecutionType.ASYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "search_content",
            self._tool_handlers["search_tools"].search_content,
            self.ToolExecutionType.ASYNC,
            "search",
        )
        self.tool_registry.register_tool(
                    "search_code_patterns",
            self._tool_handlers["search_tools"].search_code_patterns,
            self.ToolExecutionType.ASYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "semantic_search",
            self._tool_handlers["search_tools"].semantic_search,
            self.ToolExecutionType.ASYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "hybrid_search",
            self._tool_handlers["search_tools"].hybrid_search,
            self.ToolExecutionType.ASYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "search_enhanced",
            self._tool_handlers["search_tools"].search_enhanced,
            self.ToolExecutionType.ASYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "get_query_suggestions",
            self._tool_handlers["search_tools"].get_query_suggestions,
            self.ToolExecutionType.ASYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "get_search_analytics",
            self._tool_handlers["search_tools"].get_search_analytics,
            self.ToolExecutionType.ASYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "clear_search_cache",
            self._tool_handlers["search_tools"].clear_search_cache,
            self.ToolExecutionType.ASYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "reindex_project",
            self._tool_handlers["search_tools"].reindex_project,
            self.ToolExecutionType.ASYNC,
            "search",
        )

        # Register search tools
        self.tool_registry.register_tool(
            "search_smart",
            self._tool_handlers["search_tools"].search_smart,
            self.ToolExecutionType.ASYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "index_codebase_new",
            self._tool_handlers["search_tools"].index_codebase,
            self.ToolExecutionType.ASYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "get_search_stats_new",
            self._tool_handlers["search_tools"].get_search_stats_new,
            self.ToolExecutionType.ASYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "get_query_suggestions_new",
            self._tool_handlers["search_tools"].get_query_suggestions_new,
            self.ToolExecutionType.ASYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "search_health_check",
            self._tool_handlers["search_tools"].search_health_check,
            self.ToolExecutionType.ASYNC,
            "search",
        )

        # Register enhanced search tools
        self.tool_registry.register_tool(
            "natural_language_search",
            self._tool_handlers["enhanced_search_tools"].natural_language_search,
            self.ToolExecutionType.ASYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "intelligent_search",
            self._tool_handlers["enhanced_search_tools"].intelligent_search,
            self.ToolExecutionType.ASYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "contextual_search",
            self._tool_handlers["enhanced_search_tools"].contextual_search,
            self.ToolExecutionType.ASYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "analyze_query",
            self._tool_handlers["enhanced_search_tools"].analyze_query,
            self.ToolExecutionType.ASYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "get_intelligent_suggestions",
            self._tool_handlers["enhanced_search_tools"].get_intelligent_suggestions,
            self.ToolExecutionType.ASYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "search_with_examples",
            self._tool_handlers["enhanced_search_tools"].search_with_examples,
            self.ToolExecutionType.ASYNC,
            "search",
        )
        self.tool_registry.register_tool(
            "enhanced_search_health_check",
            self._tool_handlers["enhanced_search_tools"].enhanced_search_health_check,
            self.ToolExecutionType.ASYNC,
            "search",
        )

        # Register visualization tools
        self.tool_registry.register_tool(
            "validate_mermaid_diagram",
            self._tool_handlers["mermaid_tools"].validate_mermaid_diagram,
            self.ToolExecutionType.SYNC,
            "visualization",
        )
        self.tool_registry.register_tool(
            "render_mermaid_to_svg",
            self._tool_handlers["mermaid_tools"].render_mermaid_to_svg,
            self.ToolExecutionType.SYNC,
            "visualization",
        )
        self.tool_registry.register_tool(
            "open_image",
            self._tool_handlers["image_viewer_tools"].open_image,
            self.ToolExecutionType.SYNC,
            "visualization",
        )

        # Register security tools
        self.tool_registry.register_tool(
            "scan_security",
            self._tool_handlers["linting_tools"].scan_security,
            self.ToolExecutionType.ASYNC,
            "security",
        )
        self.tool_registry.register_tool(
            "scan_security_fast",
            self._tool_handlers["linting_tools"].scan_security_fast,
            self.ToolExecutionType.ASYNC,
            "security",
        )

        # Register version tools
        self.tool_registry.register_tool(
            "get_versions",
            self._tool_handlers["version_vscode_tools"].get_versions,
            self.ToolExecutionType.SYNC,
            "version",
        )
        self.tool_registry.register_tool(
            "get_python_version",
            self._tool_handlers["version_vscode_tools"].get_python_version,
            self.ToolExecutionType.SYNC,
            "version",
        )

        # Register VS Code tools
        self.tool_registry.register_tool(
            "get_vscode_active_file",
            self._tool_handlers["version_vscode_tools"].get_vscode_active_file,
            self.ToolExecutionType.SYNC,
            "vscode",
        )
        self.tool_registry.register_tool(
            "discover_vscode_tasks",
            self._tool_handlers["vscode_tasks_tools"].discover_tasks,
            self.ToolExecutionType.SYNC,
            "vscode",
        )

        # Register Playwright tools
        self.tool_registry.register_tool(
            "playwright_screenshot",
            self._tool_handlers["playwright_tools"].take_webpage_screenshot,
            self.ToolExecutionType.SYNC,
            "playwright",
        )
        self.tool_registry.register_tool(
            "playwright_navigate",
            self._tool_handlers["playwright_tools"].scrape_webpage_content,
            self.ToolExecutionType.SYNC,
            "playwright",
        )

        # Register monolith detection tools
        self.tool_registry.register_tool(
            "detect_monoliths",
            self._tool_handlers["monolith_detection_tools"]._detect_monoliths,
            self.ToolExecutionType.SYNC,
            "monolith",
        )
        self.tool_registry.register_tool(
            "analyze_file_complexity",
            self._tool_handlers["monolith_detection_tools"]._analyze_file_complexity,
            self.ToolExecutionType.SYNC,
            "monolith",
        )

        # Register Git automation tools
        self.tool_registry.register_tool(
            "detect_junk_files",
            self._tool_handlers["git_automation_tools"].detect_junk_files,
            self.ToolExecutionType.ASYNC,
            "git",
        )
        self.tool_registry.register_tool(
            "analyze_git_changes",
            self._tool_handlers["git_automation_tools"].analyze_changes,
            self.ToolExecutionType.ASYNC,
            "git",
        )
        self.tool_registry.register_tool(
            "generate_commit_message",
            self._tool_handlers["git_automation_tools"].generate_commit_message,
            self.ToolExecutionType.ASYNC,
            "git",
        )
        self.tool_registry.register_tool(
            "manage_changelog",
            self._tool_handlers["git_automation_tools"].manage_changelog,
            self.ToolExecutionType.ASYNC,
            "git",
        )
        self.tool_registry.register_tool(
            "manage_version",
            self._tool_handlers["git_automation_tools"].manage_version,
            self.ToolExecutionType.ASYNC,
            "git",
        )
        self.tool_registry.register_tool(
            "execute_git_workflow",
            self._tool_handlers["git_automation_tools"].execute_workflow,
            self.ToolExecutionType.ASYNC,
            "git",
        )
        self.tool_registry.register_tool(
            "quick_git_workflow",
            self._tool_handlers["git_automation_tools"].quick_workflow,
            self.ToolExecutionType.ASYNC,
            "git",
        )
        self.tool_registry.register_tool(
            "get_git_workflow_status",
            self._tool_handlers["git_automation_tools"].get_workflow_status,
            self.ToolExecutionType.ASYNC,
            "git",
        )

        # Register secrets management tools
        self.tool_registry.register_tool(
            "get_secret",
            self._tool_handlers["secrets_tools"].get_secret,
            self.ToolExecutionType.SYNC,
            "secrets",
        )
        self.tool_registry.register_tool(
            "list_available_secrets",
            self._tool_handlers["secrets_tools"].list_available_secrets,
            self.ToolExecutionType.SYNC,
            "secrets",
        )
        self.tool_registry.register_tool(
            "validate_secret",
            self._tool_handlers["secrets_tools"].validate_secret,
            self.ToolExecutionType.SYNC,
            "secrets",
        )

        logger.info(
            f"Registered {len(self.tool_registry.list_all_tools())} tools with registry"
        )

    async def handle_request(self, request: dict[str, Any]) -> dict[str, Any] | None:
        """Handle incoming MCP requests with lazy tool initialization."""
        try:
            method = request.get("method")
            params = request.get("params", {})
            request_id = request.get("id")

            # Initialize tools on first request (lazy loading)
            if not self._tools_initialized:
                self._lazy_init_tools()

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
