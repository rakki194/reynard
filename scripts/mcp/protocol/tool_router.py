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

from .tool_config import (
    AGENT_TOOLS,
    BM25_SEARCH_TOOLS,
    ECS_AGENT_TOOLS,
    ENHANCED_BM25_SEARCH_TOOLS,
    ENHANCED_TOOLS,
    FILE_SEARCH_TOOLS,
    IMAGE_VIEWER_TOOLS,
    LINTING_TOOLS,
    MERMAID_TOOLS,
    MONOLITH_DETECTION_TOOLS,
    PLAYWRIGHT_TOOLS,
    SEMANTIC_FILE_SEARCH_TOOLS,
    TOOL_EXECUTION_TYPES,
    UTILITY_TOOLS,
    VSCODE_TASKS_TOOLS,
)
from .tool_handlers import (
    AgentToolHandler,
    ECSAgentToolHandler,
    LintingToolHandler,
    MermaidToolHandler,
    UtilityToolHandler,
)
from .tool_registry import ToolExecutionType, ToolRegistry


class ToolRouter:
    """Routes tool calls to appropriate handlers using modular architecture."""

    def __init__(
        self,
        agent_tools: AgentTools,
        bm25_search_tools: BM25SearchTools,
        enhanced_bm25_search_tools: EnhancedBM25SearchTools,
        utility_tools: UtilityTools,
        linting_tools: LintingTools,
        version_vscode_tools: VersionVSCodeTools,
        file_search_tools: FileSearchTools,
        semantic_file_search_tools: SemanticFileSearchTools,
        image_viewer_tools: ImageViewerTools,
        mermaid_tools: MermaidTools,
        monolith_detection_tools: MonolithDetectionTools,
        playwright_tools: PlaywrightTools,
        vscode_tasks_tools: VSCodeTasksTools,
        ecs_agent_tools: ECSAgentTools,
    ):
        self.agent_tools = agent_tools
        self.bm25_search_tools = bm25_search_tools
        self.enhanced_bm25_search_tools = enhanced_bm25_search_tools
        self.utility_tools = utility_tools
        self.linting_tools = linting_tools
        self.version_vscode_tools = version_vscode_tools
        self.monolith_detection_tools = monolith_detection_tools
        self.file_search_tools = file_search_tools
        self.semantic_file_search_tools = semantic_file_search_tools
        self.image_viewer_tools = image_viewer_tools
        self.mermaid_tools = mermaid_tools
        self.playwright_tools = playwright_tools
        self.vscode_tasks_tools = vscode_tasks_tools
        self.ecs_agent_tools = ecs_agent_tools

        # Initialize tool registry
        self.registry = ToolRegistry()
        self._register_all_tools()

    def _register_all_tools(self) -> None:
        """Register all tools with the registry."""
        # Register agent tools individually
        agent_handler = self._get_agent_handler()
        for tool_name in AGENT_TOOLS:
            # Get the specific method for each tool
            method = getattr(agent_handler.agent_tools, tool_name, None)
            if method is not None:
                # Create a wrapper that matches the expected signature
                def create_wrapper(original_method):
                    def wrapper(tool_name, arguments):
                        return original_method(arguments)

                    return wrapper

                wrapped_method = create_wrapper(method)
                self.registry.register_tool(
                    tool_name,
                    wrapped_method,
                    TOOL_EXECUTION_TYPES[tool_name],
                    "agent",
                )

        # Register other tool categories
        self._register_tool_category(BM25_SEARCH_TOOLS, "bm25_search")
        self._register_tool_category(ENHANCED_BM25_SEARCH_TOOLS, "enhanced_bm25_search")
        self._register_tool_category(UTILITY_TOOLS, "utility")
        self._register_tool_category(LINTING_TOOLS, "linting")
        self._register_tool_category(ENHANCED_TOOLS, "enhanced")
        self._register_tool_category(FILE_SEARCH_TOOLS, "file_search")
        self._register_tool_category(SEMANTIC_FILE_SEARCH_TOOLS, "semantic_search")
        self._register_tool_category(IMAGE_VIEWER_TOOLS, "image_viewer")
        self._register_tool_category(MERMAID_TOOLS, "mermaid")
        self._register_tool_category(PLAYWRIGHT_TOOLS, "playwright")
        self._register_tool_category(MONOLITH_DETECTION_TOOLS, "monolith_detection")
        self._register_tool_category(VSCODE_TASKS_TOOLS, "vscode_tasks")
        self._register_tool_category(ECS_AGENT_TOOLS, "ecs_agent")

    def _register_tool_category(self, tools: set, category: str) -> None:
        """Register a category of tools."""
        handler = self._get_category_handler(category)
        for tool_name in tools:
            if hasattr(handler, "handle_tool"):
                method = handler.handle_tool
            elif hasattr(handler, "call_tool"):
                method = handler.call_tool
            else:
                method = getattr(handler, tool_name, None)
                if method is None:
                    continue

            self.registry.register_tool(
                tool_name,
                method,
                TOOL_EXECUTION_TYPES[tool_name],
                category,
            )

    def _get_agent_handler(self) -> AgentToolHandler:
        """Get agent tool handler."""
        return AgentToolHandler(self.agent_tools)

    def _get_category_handler(self, category: str) -> Any:
        """Get handler for a tool category."""
        handler_map = {
            "utility": UtilityToolHandler(self.utility_tools),
            "linting": LintingToolHandler(self.linting_tools),
            "mermaid": MermaidToolHandler(self.mermaid_tools),
            "playwright": self.playwright_tools,
            "ecs_agent": ECSAgentToolHandler(self.ecs_agent_tools),
        }
        return handler_map.get(category, self._get_generic_handler(category))

    def _get_generic_handler(self, category: str) -> Any:
        """Get generic handler for tool categories."""
        tool_service_map = {
            "bm25_search": self.bm25_search_tools,
            "enhanced_bm25_search": self.enhanced_bm25_search_tools,
            "enhanced": self.version_vscode_tools,
            "file_search": self.file_search_tools,
            "semantic_search": self.semantic_file_search_tools,
            "image_viewer": self.image_viewer_tools,
            "mermaid": self.mermaid_tools,
            "monolith_detection": self.monolith_detection_tools,
            "vscode_tasks": self.vscode_tasks_tools,
        }
        return tool_service_map.get(category)

    async def route_tool_call(
        self, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Route tool call to appropriate handler using registry."""
        handler_info = self.registry.get_handler(tool_name)

        # Handle different execution types
        if handler_info.execution_type == ToolExecutionType.ASYNC:
            result = await handler_info.handler_method(tool_name, arguments)
        else:
            result = handler_info.handler_method(tool_name, arguments)

        # Ensure result is a dictionary
        if not isinstance(result, dict):
            raise TypeError(f"Tool {tool_name} returned {type(result)}, expected dict")

        return result
