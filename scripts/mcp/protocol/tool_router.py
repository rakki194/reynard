#!/usr/bin/env python3
"""
Tool Router
===========

Routes MCP tool calls to appropriate handlers.
Follows the 100-line axiom and modular architecture principles.
"""

import sys
from pathlib import Path
from typing import Any

# Add the MCP scripts directory to Python path for imports
mcp_dir = Path(__file__).parent.parent
if str(mcp_dir) not in sys.path:
    sys.path.insert(0, str(mcp_dir))

from tools.agent_tools import AgentTools
from tools.file_search_tools import FileSearchTools
from tools.image_viewer_tools import ImageViewerTools
from tools.linting_tools import LintingTools
from tools.mermaid_tools import MermaidTools
from tools.semantic_file_search_tools import SemanticFileSearchTools
from tools.utility_tools import UtilityTools
from tools.version_vscode_tools import VersionVSCodeTools
from tools.vscode_tasks_tools import VSCodeTasksTools


class ToolRouter:
    """Routes tool calls to appropriate handlers."""

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
        self.agent_tools = agent_tools
        self.utility_tools = utility_tools
        self.linting_tools = linting_tools
        self.version_vscode_tools = version_vscode_tools
        self.file_search_tools = file_search_tools
        self.semantic_file_search_tools = semantic_file_search_tools
        self.image_viewer_tools = image_viewer_tools
        self.mermaid_tools = mermaid_tools
        self.vscode_tasks_tools = vscode_tasks_tools

        # Define tool routing map
        self.agent_tool_names = {
            "generate_agent_name",
            "assign_agent_name",
            "get_agent_name",
            "list_agent_names",
            "roll_agent_spirit",
            "agent_startup_sequence",
        }

        self.utility_tool_names = {
            "get_current_time",
            "get_current_location",
            "send_desktop_notification",
        }

        self.linting_tool_names = {
            "lint_frontend",
            "format_frontend",
            "lint_python",
            "format_python",
            "lint_markdown",
            "validate_comprehensive",
            "scan_security",
            "run_all_linting",
        }

        self.enhanced_tool_names = {
            "get_versions",
            "get_python_version",
            "get_node_version",
            "get_typescript_version",
            "get_vscode_active_file",
            "get_vscode_workspace_info",
            "get_vscode_extensions",
            "scan_security_fast",
            "scan_security_full",
        }

        self.file_search_tool_names = {
            "search_files",
            "list_files",
            "search_code_patterns",
        }

        self.semantic_file_search_tool_names = {
            "semantic_search",
            "hybrid_search",
            "embed_text",
            "index_documents",
            "get_search_stats",
        }

        self.image_viewer_tool_names = {
            "open_image",
            "search_images",
            "get_image_info",
        }

        self.mermaid_tool_names = {
            "validate_mermaid_diagram",
            "render_mermaid_to_svg",
            "render_mermaid_to_png",
            "get_mermaid_diagram_stats",
            "test_mermaid_render",
        }

        self.vscode_tasks_tool_names = {
            "discover_vscode_tasks",
            "validate_vscode_task",
            "execute_vscode_task",
            "get_vscode_task_info",
        }

    async def route_tool_call(
        self, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Route tool call to appropriate handler."""

        # Agent tools
        if tool_name in self.agent_tool_names:
            return await self._route_agent_tool(tool_name, arguments)

        # Utility tools
        if tool_name in self.utility_tool_names:
            return self._route_utility_tool(tool_name, arguments)

        # Linting tools (async)
        if tool_name in self.linting_tool_names:
            return await self._route_linting_tool(tool_name, arguments)

        # Enhanced tools (mixed sync/async)
        if tool_name in self.enhanced_tool_names:
            return await self._route_enhanced_tool(tool_name, arguments)

        # File search tools (async)
        if tool_name in self.file_search_tool_names:
            return await self._route_file_search_tool(tool_name, arguments)

        # Semantic file search tools (async)
        if tool_name in self.semantic_file_search_tool_names:
            return await self._route_semantic_file_search_tool(tool_name, arguments)

        # Image viewer tools (async)
        if tool_name in self.image_viewer_tool_names:
            return await self._route_image_viewer_tool(tool_name, arguments)

        # Mermaid tools (sync)
        if tool_name in self.mermaid_tool_names:
            return self._route_mermaid_tool(tool_name, arguments)

        # VS Code tasks tools (sync)
        if tool_name in self.vscode_tasks_tool_names:
            return self._route_vscode_tasks_tool(tool_name, arguments)

        raise ValueError(f"Unknown tool: {tool_name}")

    async def _route_agent_tool(
        self, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Route agent tool calls."""
        if tool_name == "generate_agent_name":
            result: dict[str, Any] = self.agent_tools.generate_agent_name(arguments)
            return result
        if tool_name == "assign_agent_name":
            result: dict[str, Any] = self.agent_tools.assign_agent_name(arguments)
            return result
        if tool_name == "get_agent_name":
            result: dict[str, Any] = self.agent_tools.get_agent_name(arguments)
            return result
        if tool_name == "list_agent_names":
            result: dict[str, Any] = self.agent_tools.list_agent_names()
            return result
        if tool_name == "roll_agent_spirit":
            result: dict[str, Any] = self.agent_tools.roll_agent_spirit(arguments)
            return result
        if tool_name == "agent_startup_sequence":
            result: dict[str, Any] = await self.agent_tools.agent_startup_sequence(
                arguments
            )
            return result
        raise ValueError(f"Unknown agent tool: {tool_name}")

    def _route_utility_tool(
        self, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Route utility tool calls."""
        if tool_name == "get_current_time":
            return self.utility_tools.get_current_time(arguments)
        if tool_name == "get_current_location":
            return self.utility_tools.get_current_location(arguments)
        if tool_name == "send_desktop_notification":
            return self.utility_tools.send_desktop_notification(arguments)
        raise ValueError(f"Unknown utility tool: {tool_name}")

    async def _route_linting_tool(
        self, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Route linting tool calls (async)."""
        if tool_name == "lint_frontend":
            return await self.linting_tools.lint_frontend(arguments)
        if tool_name == "format_frontend":
            return await self.linting_tools.format_frontend(arguments)
        if tool_name == "lint_python":
            return await self.linting_tools.lint_python(arguments)
        if tool_name == "format_python":
            return await self.linting_tools.format_python(arguments)
        if tool_name == "lint_markdown":
            return await self.linting_tools.lint_markdown(arguments)
        if tool_name == "validate_comprehensive":
            return await self.linting_tools.validate_comprehensive(arguments)
        if tool_name == "scan_security":
            return await self.linting_tools.scan_security(arguments)
        if tool_name == "run_all_linting":
            return await self.linting_tools.run_all_linting(arguments)
        raise ValueError(f"Unknown linting tool: {tool_name}")

    async def _route_enhanced_tool(
        self, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Route enhanced tool calls (mixed sync/async)."""
        # Version tools (async)
        if tool_name == "get_versions":
            return await self.version_vscode_tools.get_versions(arguments)
        if tool_name == "get_python_version":
            return await self.version_vscode_tools.get_python_version(arguments)
        if tool_name == "get_node_version":
            return await self.version_vscode_tools.get_node_version(arguments)
        if tool_name == "get_typescript_version":
            return await self.version_vscode_tools.get_typescript_version(arguments)

        # VS Code tools (sync)
        if tool_name == "get_vscode_active_file":
            return self.version_vscode_tools.get_vscode_active_file(arguments)
        if tool_name == "get_vscode_workspace_info":
            return self.version_vscode_tools.get_vscode_workspace_info(arguments)
        if tool_name == "get_vscode_extensions":
            return self.version_vscode_tools.get_vscode_extensions(arguments)

        # Security tools (async)
        if tool_name == "scan_security_fast":
            return await self.version_vscode_tools.scan_security_fast(arguments)
        if tool_name == "scan_security_full":
            return await self.version_vscode_tools.scan_security_full(arguments)

        raise ValueError(f"Unknown enhanced tool: {tool_name}")

    async def _route_file_search_tool(
        self, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Route file search tool calls (async)."""
        if tool_name == "search_files":
            return await self.file_search_tools.search_files(arguments)
        if tool_name == "list_files":
            return await self.file_search_tools.list_files(arguments)
        if tool_name == "search_code_patterns":
            return await self.file_search_tools.search_code_patterns(arguments)
        raise ValueError(f"Unknown file search tool: {tool_name}")

    async def _route_semantic_file_search_tool(
        self, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Route semantic file search tool calls (async)."""
        if tool_name == "semantic_search":
            return await self.semantic_file_search_tools.semantic_search(arguments)
        if tool_name == "hybrid_search":
            return await self.semantic_file_search_tools.hybrid_search(arguments)
        if tool_name == "embed_text":
            return await self.semantic_file_search_tools.embed_text(arguments)
        if tool_name == "index_documents":
            return await self.semantic_file_search_tools.index_documents(arguments)
        if tool_name == "get_search_stats":
            return await self.semantic_file_search_tools.get_search_stats(arguments)
        raise ValueError(f"Unknown semantic file search tool: {tool_name}")

    async def _route_image_viewer_tool(
        self, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Route image viewer tool calls (async)."""
        if tool_name == "open_image":
            return await self.image_viewer_tools.open_image(arguments)
        if tool_name == "search_images":
            return await self.image_viewer_tools.search_images(arguments)
        if tool_name == "get_image_info":
            return await self.image_viewer_tools.get_image_info(arguments)
        raise ValueError(f"Unknown image viewer tool: {tool_name}")

    def _route_mermaid_tool(
        self, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Route mermaid tool calls (sync)."""
        if tool_name == "validate_mermaid_diagram":
            return self.mermaid_tools.validate_mermaid_diagram(arguments)
        if tool_name == "render_mermaid_to_svg":
            return self.mermaid_tools.render_mermaid_to_svg(arguments)
        if tool_name == "render_mermaid_to_png":
            return self.mermaid_tools.render_mermaid_to_png(arguments)
        if tool_name == "get_mermaid_diagram_stats":
            return self.mermaid_tools.get_mermaid_diagram_stats(arguments)
        if tool_name == "test_mermaid_render":
            return self.mermaid_tools.test_mermaid_render(arguments)
        raise ValueError(f"Unknown mermaid tool: {tool_name}")

    def _route_vscode_tasks_tool(
        self, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Route VS Code tasks tool calls (sync)."""
        if tool_name == "discover_vscode_tasks":
            return self.vscode_tasks_tools.discover_tasks(arguments)
        if tool_name == "validate_vscode_task":
            return self.vscode_tasks_tools.validate_task(arguments)
        if tool_name == "execute_vscode_task":
            return self.vscode_tasks_tools.execute_task(arguments)
        if tool_name == "get_vscode_task_info":
            return self.vscode_tasks_tools.get_task_info(arguments)
        raise ValueError(f"Unknown VS Code tasks tool: {tool_name}")
