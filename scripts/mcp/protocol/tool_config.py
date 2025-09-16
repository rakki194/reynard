#!/usr/bin/env python3
"""
Tool Configuration
==================

Configuration definitions for MCP tool routing.
Follows the 100-line axiom and modular architecture principles.
"""

from typing import Dict, Set

from .tool_registry import ToolExecutionType

# Tool category definitions
AGENT_TOOLS: set[str] = {
    "generate_agent_name",
    "assign_agent_name",
    "get_agent_name",
    "list_agent_names",
    "roll_agent_spirit",
    "agent_startup_sequence",
    "get_agent_persona",
    "get_lora_config",
    "get_simulation_status",
    "accelerate_time",
    "nudge_time",
}

BM25_SEARCH_TOOLS: set[str] = {
    "search_needle_in_haystack",
}

ENHANCED_BM25_SEARCH_TOOLS: set[str] = {
    "search_enhanced",
    "get_query_suggestions",
    "get_search_analytics",
    "clear_search_cache",
    "reindex_project",
    "search_by_file_type",
    "search_in_directory",
}

UTILITY_TOOLS: set[str] = {
    "get_current_time",
    "get_current_location",
    "send_desktop_notification",
}

LINTING_TOOLS: set[str] = {
    "lint_frontend",
    "format_frontend",
    "lint_python",
    "format_python",
    "lint_markdown",
    "validate_comprehensive",
    "scan_security",
    "run_all_linting",
}

ENHANCED_TOOLS: set[str] = {
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

FILE_SEARCH_TOOLS: set[str] = {
    "search_files",
    "list_files",
    "search_code_patterns",
}

SEMANTIC_FILE_SEARCH_TOOLS: set[str] = {
    "semantic_search",
    "hybrid_search",
    "embed_text",
    "index_documents",
    "get_search_stats",
}

IMAGE_VIEWER_TOOLS: set[str] = {
    "open_image",
    "search_images",
    "get_image_info",
}

MERMAID_TOOLS: set[str] = {
    "validate_mermaid_diagram",
    "render_mermaid_to_svg",
    "render_mermaid_to_png",
    "get_mermaid_diagram_stats",
    "test_mermaid_render",
}

PLAYWRIGHT_TOOLS: set[str] = {
    "take_webpage_screenshot",
    "scrape_webpage_content",
    "render_html_to_image",
    "extract_svg_from_html",
    "test_playwright_connection",
}

MONOLITH_DETECTION_TOOLS: set[str] = {
    "detect_monoliths",
    "analyze_file_complexity",
    "get_code_metrics_summary",
}

VSCODE_TASKS_TOOLS: set[str] = {
    "discover_vscode_tasks",
    "validate_vscode_task",
    "execute_vscode_task",
    "get_vscode_task_info",
}

ECS_AGENT_TOOLS: set[str] = {
    "create_ecs_agent",
    "create_ecs_offspring",
    "enable_automatic_reproduction",
    "get_ecs_agent_status",
    "get_ecs_agent_positions",
    "find_ecs_compatible_mates",
    "analyze_ecs_compatibility",
    "get_ecs_lineage",
    "update_ecs_world",
    "search_agents_by_proximity",
    "search_agents_by_region",
    "get_agent_movement_path",
    "get_spatial_analytics",
}

# Tool execution type mapping
TOOL_EXECUTION_TYPES: dict[str, ToolExecutionType] = {
    # Async tools
    **{tool: ToolExecutionType.ASYNC for tool in AGENT_TOOLS if tool in ["agent_startup_sequence"]},
    **dict.fromkeys(LINTING_TOOLS, ToolExecutionType.ASYNC),
    **{
        tool: ToolExecutionType.ASYNC
        for tool in ENHANCED_TOOLS
        if tool
        in [
            "get_versions",
            "get_python_version",
            "get_node_version",
            "get_typescript_version",
            "scan_security_fast",
            "scan_security_full",
        ]
    },
    **dict.fromkeys(FILE_SEARCH_TOOLS, ToolExecutionType.ASYNC),
    **dict.fromkeys(SEMANTIC_FILE_SEARCH_TOOLS, ToolExecutionType.ASYNC),
    **dict.fromkeys(IMAGE_VIEWER_TOOLS, ToolExecutionType.ASYNC),
    **dict.fromkeys(PLAYWRIGHT_TOOLS, ToolExecutionType.SYNC),
    # Sync tools
    **{tool: ToolExecutionType.SYNC for tool in AGENT_TOOLS if tool != "agent_startup_sequence"},
    **dict.fromkeys(BM25_SEARCH_TOOLS, ToolExecutionType.SYNC),
    **dict.fromkeys(ENHANCED_BM25_SEARCH_TOOLS, ToolExecutionType.SYNC),
    **dict.fromkeys(UTILITY_TOOLS, ToolExecutionType.SYNC),
    **{
        tool: ToolExecutionType.SYNC
        for tool in ENHANCED_TOOLS
        if tool
        not in [
            "get_versions",
            "get_python_version",
            "get_node_version",
            "get_typescript_version",
            "scan_security_fast",
            "scan_security_full",
        ]
    },
    **dict.fromkeys(MERMAID_TOOLS, ToolExecutionType.SYNC),
    **dict.fromkeys(MONOLITH_DETECTION_TOOLS, ToolExecutionType.SYNC),
    **dict.fromkeys(VSCODE_TASKS_TOOLS, ToolExecutionType.SYNC),
    **dict.fromkeys(ECS_AGENT_TOOLS, ToolExecutionType.SYNC),
}
